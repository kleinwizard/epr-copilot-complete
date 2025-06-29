from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import os
import uuid
import csv
import io
from datetime import datetime
import boto3
from botocore.exceptions import ClientError
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/files", tags=["files"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "/tmp/uploads")
AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET")
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", "10485760"))  # 10MB default

os.makedirs(UPLOAD_DIR, exist_ok=True)

s3_client = None
try:
    if AWS_S3_BUCKET:
        s3_client = boto3.client('s3')
except Exception:
    pass  # Fall back to local storage


def upload_to_s3(file_content: bytes, filename: str, content_type: str) -> str:
    """Upload file to S3 and return the URL."""
    if not s3_client or not AWS_S3_BUCKET:
        raise HTTPException(status_code=500, detail="S3 not configured")

    try:
        s3_client.put_object(
            Bucket=AWS_S3_BUCKET,
            Key=filename,
            Body=file_content,
            ContentType=content_type
        )
        return f"https://{AWS_S3_BUCKET}.s3.amazonaws.com/{filename}"
    except ClientError as e:
        raise HTTPException(
            status_code=500,
            detail=f"S3 upload failed: {str(e)}")


def validate_file(file: UploadFile) -> None:
    """Validate file type and size."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    allowed_extensions = {
        '.csv',
        '.xlsx',
        '.xls',
        '.pdf',
        '.png',
        '.jpg',
        '.jpeg'}
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file_extension} not allowed. Allowed types: {', '.join(allowed_extensions)}")


def parse_csv_content(content: str) -> Dict[str, Any]:
    """Parse CSV content and return structured data."""
    try:
        csv_reader = csv.DictReader(io.StringIO(content))
        rows = list(csv_reader)

        required_columns = {'name', 'sku'}
        if rows and not required_columns.issubset(set(rows[0].keys())):
            missing_columns = required_columns - set(rows[0].keys())
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {', '.join(missing_columns)}")

        return {
            "total_rows": len(rows),
            "columns": list(rows[0].keys()) if rows else [],
            "preview": rows[:5],  # First 5 rows for preview
            "valid_rows": len([row for row in rows if row.get('name') and row.get('sku')]),
            "error_rows": len([row for row in rows if not (row.get('name') and row.get('sku'))])
        }
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"CSV parsing error: {str(e)}")


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a file to the server with cloud storage support."""

    validate_file(file)

    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413, detail=f"File size exceeds {MAX_FILE_SIZE // (1024 * 1024)}MB limit")

    file_id = str(uuid.uuid4())
    file_extension = os.path.splitext(
        file.filename)[1] if file.filename else ""
    filename = f"{file_id}{file_extension}"

    # Try to upload to S3 first, fall back to local storage
    file_url = f"/files/{file_id}"
    try:
        if s3_client and AWS_S3_BUCKET:
            file_url = upload_to_s3(
                file_content,
                filename,
                file.content_type or "application/octet-stream")
        else:
            file_path = os.path.join(UPLOAD_DIR, filename)
            with open(file_path, "wb") as f:
                f.write(file_content)
    except Exception:
        # If S3 fails, fall back to local storage
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as f:
            f.write(file_content)
        file_url = f"/files/{file_id}"

    return {
        "id": file_id,
        "name": file.filename,
        "size": len(file_content),
        "url": file_url,
        "uploadedAt": datetime.utcnow().isoformat(),
        "content_type": file.content_type
    }


@router.get("/{file_id}")
async def get_file(
    file_id: str,
    current_user=Depends(get_current_user)
):
    """Get file metadata."""
    return {
        "id": file_id,
        "status": "uploaded",
        "url": f"/files/{file_id}"
    }


@router.post("/process-csv")
async def process_csv(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Process a CSV file for bulk import with enhanced validation."""

    if not file.filename or not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are supported")

    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413, detail=f"File size exceeds {MAX_FILE_SIZE // (1024 * 1024)}MB limit")

    try:
        csv_content = file_content.decode('utf-8')
        parsed_data = parse_csv_content(csv_content)

        return {
            "file_id": str(
                uuid.uuid4()),
            "filename": file.filename,
            "total_rows": parsed_data["total_rows"],
            "processed_rows": parsed_data["valid_rows"],
            "error_rows": parsed_data["error_rows"],
            "status": "completed" if parsed_data["error_rows"] == 0 else "completed_with_errors",
            "columns": parsed_data["columns"],
            "preview": parsed_data["preview"]}
    except UnicodeDecodeError:
        raise HTTPException(
            status_code=400,
            detail="File encoding not supported. Please use UTF-8 encoded CSV files.")
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"CSV processing failed: {str(e)}")
