from datetime import datetime
import os
import logging

logger = logging.getLogger(__name__)


class TaskScheduler:
    def __init__(self):
        self.scheduler = None
        self.enabled = os.getenv("ENABLE_SCHEDULER", "false").lower() == "true"
        
        if not self.enabled:
            logger.info("Scheduler disabled via ENABLE_SCHEDULER environment variable")
            return
            
        try:
            from apscheduler.schedulers.asyncio import AsyncIOScheduler
            from apscheduler.jobstores.redis import RedisJobStore
            from apscheduler.executors.pool import ThreadPoolExecutor
            
            jobstores = {
                'default': RedisJobStore(
                    host=os.getenv("REDIS_HOST", "localhost"),
                    port=int(os.getenv("REDIS_PORT", "6379")),
                    db=1
                )
            }

            executors = {
                'default': ThreadPoolExecutor(20),
            }

            job_defaults = {
                'coalesce': False,
                'max_instances': 3
            }

            self.scheduler = AsyncIOScheduler(
                jobstores=jobstores,
                executors=executors,
                job_defaults=job_defaults,
                timezone='UTC'
            )
            logger.info("Scheduler initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize scheduler: {str(e)}")
            self.scheduler = None
            self.enabled = False

    def start(self):
        """Start the scheduler and add all scheduled jobs."""
        if not self.enabled or self.scheduler is None:
            logger.info("Scheduler start skipped - scheduler disabled or not initialized")
            return
            
        try:
            self.scheduler.start()
            self._add_scheduled_jobs()
            logger.info("Task scheduler started successfully")
        except Exception as e:
            logger.error(f"Failed to start task scheduler: {str(e)}")
            raise

    def stop(self):
        """Stop the scheduler."""
        if not self.enabled or self.scheduler is None:
            logger.info("Scheduler stop skipped - scheduler disabled or not initialized")
            return
            
        try:
            self.scheduler.shutdown()
            logger.info("Task scheduler stopped")
        except Exception as e:
            logger.error(f"Error stopping scheduler: {str(e)}")

    def _add_scheduled_jobs(self):
        """Add all scheduled jobs to the scheduler."""
        if not self.enabled or self.scheduler is None:
            return

        from .background_jobs import send_deadline_reminders, sync_regulatory_data, health_check

        self.scheduler.add_job(
            send_deadline_reminders,
            'cron',
            hour=9,
            minute=0,
            id='daily_deadline_reminders',
            replace_existing=True,
            misfire_grace_time=3600  # 1 hour grace period
        )

        self.scheduler.add_job(
            sync_regulatory_data,
            'cron',
            day_of_week='mon',
            hour=2,
            minute=0,
            id='weekly_regulatory_sync',
            replace_existing=True,
            misfire_grace_time=7200  # 2 hour grace period
        )

        self.scheduler.add_job(
            health_check,
            'interval',
            minutes=5,
            id='health_check',
            replace_existing=True
        )

        self.scheduler.add_job(
            self._send_monthly_report_reminders,
            'cron',
            day=1,
            hour=8,
            minute=0,
            id='monthly_report_reminders',
            replace_existing=True
        )

        quarterly_dates = [
            (3, 16),  # March 16 for Q1
            (6, 15),  # June 15 for Q2
            (9, 15),  # September 15 for Q3
            (12, 16)  # December 16 for Q4
        ]

        for month, day in quarterly_dates:
            self.scheduler.add_job(
                self._send_quarterly_deadline_alerts,
                'cron',
                month=month,
                day=day,
                hour=10,
                minute=0,
                id=f'quarterly_alert_q{(month - 1) // 3 + 1}',
                replace_existing=True
            )

        logger.info("All scheduled jobs added successfully")

    async def _send_monthly_report_reminders(self):
        """Send monthly report generation reminders."""
        logger.info("Sending monthly report reminders")
        pass

    async def _send_quarterly_deadline_alerts(self):
        """Send quarterly deadline alerts."""
        logger.info("Sending quarterly deadline alerts")
        pass

    def add_one_time_job(
            self,
            func,
            run_date: datetime,
            job_id: str,
            **kwargs):
        """Add a one-time job to be executed at a specific time."""
        if not self.enabled or self.scheduler is None:
            logger.warning(f"Cannot add job '{job_id}' - scheduler disabled")
            return
            
        try:
            self.scheduler.add_job(
                func,
                'date',
                run_date=run_date,
                id=job_id,
                replace_existing=True,
                **kwargs
            )
            logger.info(f"One-time job '{job_id}' scheduled for {run_date}")
        except Exception as e:
            logger.error(
                f"Failed to schedule one-time job '{job_id}': {str(e)}")
            raise

    def remove_job(self, job_id: str):
        """Remove a scheduled job."""
        if not self.enabled or self.scheduler is None:
            logger.warning(f"Cannot remove job '{job_id}' - scheduler disabled")
            return
            
        try:
            self.scheduler.remove_job(job_id)
            logger.info(f"Job '{job_id}' removed from scheduler")
        except Exception as e:
            logger.error(f"Failed to remove job '{job_id}': {str(e)}")

    def get_jobs(self):
        """Get all scheduled jobs."""
        if not self.enabled or self.scheduler is None:
            return []
        return self.scheduler.get_jobs()

    def pause_job(self, job_id: str):
        """Pause a scheduled job."""
        if not self.enabled or self.scheduler is None:
            logger.warning(f"Cannot pause job '{job_id}' - scheduler disabled")
            return
            
        try:
            self.scheduler.pause_job(job_id)
            logger.info(f"Job '{job_id}' paused")
        except Exception as e:
            logger.error(f"Failed to pause job '{job_id}': {str(e)}")

    def resume_job(self, job_id: str):
        """Resume a paused job."""
        if not self.enabled or self.scheduler is None:
            logger.warning(f"Cannot resume job '{job_id}' - scheduler disabled")
            return
            
        try:
            self.scheduler.resume_job(job_id)
            logger.info(f"Job '{job_id}' resumed")
        except Exception as e:
            logger.error(f"Failed to resume job '{job_id}': {str(e)}")


task_scheduler = TaskScheduler()
