import os
from typing import List, Dict, Optional
import logging
from ..core.simulation import SimulationResult

if os.getenv("ENABLE_PUSH_SERVICES", "false").lower() == "true":
    from firebase_admin import credentials, messaging, initialize_app
else:
    credentials = messaging = initialize_app = None

logger = logging.getLogger(__name__)


class PushNotificationService:
    def __init__(self):
        self.firebase_credentials_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
        self.app = None

        if (self.firebase_credentials_path and os.path.exists(self.firebase_credentials_path) 
            and credentials is not None and initialize_app is not None):
            try:
                cred = credentials.Certificate(self.firebase_credentials_path)
                self.app = initialize_app(cred)
                logger.info("Firebase Admin SDK initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Firebase: {str(e)}")
        else:
            logger.warning(
                "Firebase credentials not configured. Push notifications will be simulated.")

    async def send_push_notification(
        self,
        device_tokens: List[str],
        title: str,
        body: str,
        data: Optional[Dict[str, str]] = None
    ) -> SimulationResult:
        """Send a push notification to multiple devices."""

        if not self.app:
            logger.info(
                f"Push notification simulation - Title: {title}, Body: {body}, Tokens: {len(device_tokens)}")
            return SimulationResult.simulated_success(f"Push notification to {len(device_tokens)} devices")

        try:
            message = messaging.MulticastMessage(
                notification=messaging.Notification(
                    title=title,
                    body=body
                ),
                data=data or {},
                tokens=device_tokens
            )

            response = messaging.send_multicast(message)
            logger.info(
                f"Push notification sent. Success: {response.success_count}, Failure: {response.failure_count}")

            if response.failure_count > 0:
                for idx, resp in enumerate(response.responses):
                    if not resp.success:
                        logger.error(
                            f"Failed to send to token {device_tokens[idx]}: {resp.exception}")

            return SimulationResult.actual_success() if response.success_count > 0 else SimulationResult.actual_failure("All notifications failed")

        except Exception as e:
            logger.error(f"Failed to send push notification: {str(e)}")
            return SimulationResult.actual_failure(str(e))

    async def send_deadline_notification(
        self,
        device_tokens: List[str],
        deadline_type: str,
        days_remaining: int
    ) -> SimulationResult:
        """Send a deadline reminder push notification."""

        if days_remaining <= 1:
            title = "🚨 Urgent: Deadline Tomorrow"
        elif days_remaining <= 3:
            title = "⚠️ Important: Deadline Approaching"
        else:
            title = "📅 Reminder: Upcoming Deadline"

        body = f"Your {deadline_type} is due in {days_remaining} day{'s' if days_remaining != 1 else ''}. Tap to complete your submission."

        data = {
            "type": "deadline_reminder",
            "deadline_type": deadline_type,
            "days_remaining": str(days_remaining),
            "action": "open_reports"
        }

        return await self.send_push_notification(device_tokens, title, body, data)

    async def send_report_status_notification(
        self,
        device_tokens: List[str],
        report_type: str,
        status: str,
        report_id: str
    ) -> SimulationResult:
        """Send a report status update push notification."""

        status_emojis = {
            "submitted": "📤",
            "approved": "✅",
            "rejected": "❌",
            "needs_review": "👀"
        }

        emoji = status_emojis.get(status, "📋")
        title = f"{emoji} Report {status.title()}"
        body = f"Your {report_type} has been {status}. Tap for details."

        data = {
            "type": "report_status",
            "report_type": report_type,
            "status": status,
            "report_id": report_id,
            "action": "open_report"
        }

        return await self.send_push_notification(device_tokens, title, body, data)

    async def send_system_alert(
        self,
        device_tokens: List[str],
        alert_type: str,
        message: str
    ) -> SimulationResult:
        """Send a system alert push notification."""

        title = f"🚨 System Alert: {alert_type}"
        body = message

        data = {
            "type": "system_alert",
            "alert_type": alert_type,
            "action": "open_dashboard"
        }

        return await self.send_push_notification(device_tokens, title, body, data)

    async def send_welcome_notification(
        self,
        device_tokens: List[str],
        user_name: str
    ) -> SimulationResult:
        """Send a welcome push notification to new users."""

        title = "Welcome to EPR Co-Pilot! 🎉"
        body = f"Hi {user_name}! Your account is ready. Tap to start managing your compliance reporting."

        data = {
            "type": "welcome",
            "action": "open_onboarding"
        }

        return await self.send_push_notification(device_tokens, title, body, data)


push_notification_service = PushNotificationService()
