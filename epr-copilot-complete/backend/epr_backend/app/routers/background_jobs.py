from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from ..database import get_db
from ..auth import get_current_user
from ..services.background_jobs import (
    generate_report,
    process_bulk_import,
    generate_invoice_pdf,
    health_check
)
from ..services.scheduler import task_scheduler
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/background", tags=["background_jobs"])


class ReportGenerationRequest(BaseModel):
    report_type: str
    period: str
    parameters: Dict[str, Any] = {}


class BulkImportRequest(BaseModel):
    file_path: str
    import_type: str = "products"


class ScheduledJobRequest(BaseModel):
    job_id: str
    function_name: str
    run_date: datetime
    parameters: Dict[str, Any] = {}


@router.post("/generate-report")
async def queue_report_generation(
    request: ReportGenerationRequest,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Queue a report generation task."""

    try:
        task = generate_report.delay(
            company_id=current_user.id,  # In production, use current_user.company_id
            report_data={
                "type": request.report_type,
                "period": request.period,
                "parameters": request.parameters,
                "user_id": current_user.id
            }
        )

        return {
            "message": "Report generation queued successfully",
            "task_id": task.id,
            "status": "queued",
            "estimated_completion": "2-5 minutes"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to queue report generation: {str(e)}")


@router.post("/bulk-import")
async def queue_bulk_import(
    request: BulkImportRequest,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Queue a bulk import processing task."""

    try:
        task = process_bulk_import.delay(
            file_path=request.file_path,
            company_id=current_user.id,  # In production, use current_user.company_id
            user_id=current_user.id
        )

        return {
            "message": "Bulk import queued successfully",
            "task_id": task.id,
            "status": "queued",
            "estimated_completion": "3-10 minutes"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to queue bulk import: {str(e)}")


@router.post("/generate-invoice")
async def queue_invoice_generation(
    payment_id: str,
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Queue an invoice PDF generation task."""

    try:
        task = generate_invoice_pdf.delay(
            payment_id=payment_id,
            invoice_data={
                "company_id": current_user.id,  # In production, use current_user.company_id
                "user_id": current_user.id,
                "generated_by": current_user.email
            }
        )

        return {
            "message": "Invoice generation queued successfully",
            "task_id": task.id,
            "status": "queued",
            "estimated_completion": "1-2 minutes"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to queue invoice generation: {str(e)}")


@router.get("/task-status/{task_id}")
async def get_task_status(
    task_id: str,
    current_user=Depends(get_current_user)
):
    """Get the status of a background task."""

    try:
        from ..services.background_jobs import celery_app

        task = celery_app.AsyncResult(task_id)

        if task.state == 'PENDING':
            response = {
                "task_id": task_id,
                "status": "pending",
                "message": "Task is waiting to be processed"
            }
        elif task.state == 'PROGRESS':
            response = {
                "task_id": task_id,
                "status": "in_progress",
                "message": "Task is currently being processed",
                "progress": task.info.get('progress', 0) if task.info else 0
            }
        elif task.state == 'SUCCESS':
            response = {
                "task_id": task_id,
                "status": "completed",
                "message": "Task completed successfully",
                "result": task.result
            }
        else:
            response = {
                "task_id": task_id,
                "status": "failed",
                "message": "Task failed",
                "error": str(task.info) if task.info else "Unknown error"
            }

        return response

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get task status: {str(e)}")


@router.get("/scheduled-jobs")
async def get_scheduled_jobs(
    current_user=Depends(get_current_user)
):
    """Get all scheduled jobs."""

    try:
        jobs = task_scheduler.get_jobs()

        job_list = []
        for job in jobs:
            job_list.append({
                "id": job.id,
                "name": job.name or job.func.__name__,
                "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None,
                "trigger": str(job.trigger),
                "misfire_grace_time": job.misfire_grace_time,
                "max_instances": job.max_instances
            })

        return {
            "scheduled_jobs": job_list,
            "total_jobs": len(job_list)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get scheduled jobs: {str(e)}")


@router.post("/schedule-job")
async def schedule_one_time_job(
    request: ScheduledJobRequest,
    current_user=Depends(get_current_user)
):
    """Schedule a one-time job."""

    try:
        function_map = {
            "generate_report": generate_report,
            "process_bulk_import": process_bulk_import,
            "generate_invoice_pdf": generate_invoice_pdf,
            "health_check": health_check
        }

        if request.function_name not in function_map:
            raise HTTPException(
                status_code=400,
                detail="Invalid function name")

        func = function_map[request.function_name]

        task_scheduler.add_one_time_job(
            func=func,
            run_date=request.run_date,
            job_id=request.job_id,
            kwargs=request.parameters
        )

        return {
            "message": "Job scheduled successfully",
            "job_id": request.job_id,
            "run_date": request.run_date.isoformat(),
            "function": request.function_name
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to schedule job: {str(e)}")


@router.delete("/scheduled-jobs/{job_id}")
async def cancel_scheduled_job(
    job_id: str,
    current_user=Depends(get_current_user)
):
    """Cancel a scheduled job."""

    try:
        task_scheduler.remove_job(job_id)

        return {
            "message": "Job cancelled successfully",
            "job_id": job_id
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to cancel job: {str(e)}")


@router.post("/health-check")
async def run_health_check(
    background_tasks: BackgroundTasks,
    current_user=Depends(get_current_user)
):
    """Run a health check task."""

    try:
        task = health_check.delay()

        return {
            "message": "Health check queued successfully",
            "task_id": task.id,
            "status": "queued"
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to run health check: {str(e)}")
