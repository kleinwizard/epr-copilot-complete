import os
import logging
from ..core.simulation import SimulationResult

if os.getenv("ENABLE_SMS_SERVICES", "false").lower() == "true":
    from twilio.rest import Client
else:
    Client = None

logger = logging.getLogger(__name__)


class SMSService:
    def __init__(self):
        self.account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        self.auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        self.from_number = os.getenv("TWILIO_FROM_NUMBER")
        self.client = None

        if self.account_sid and self.auth_token and Client is not None:
            self.client = Client(self.account_sid, self.auth_token)
        else:
            logger.warning(
                "Twilio credentials not configured. SMS sending will be simulated.")

    async def send_sms(
        self,
        to_number: str,
        message: str
    ) -> SimulationResult:
        """Send an SMS message using Twilio."""

        if not self.client or not self.from_number:
            logger.info(
                f"SMS simulation - To: {to_number}, Message: {message}")
            return SimulationResult.simulated_success(f"SMS to {to_number}")

        try:
            message = self.client.messages.create(
                body=message,
                from_=self.from_number,
                to=to_number
            )
            logger.info(f"SMS sent successfully. SID: {message.sid}")
            return SimulationResult.actual_success()

        except Exception as e:
            logger.error(f"Failed to send SMS: {str(e)}")
            return SimulationResult.actual_failure(str(e))

    async def send_critical_alert(
        self,
        to_number: str,
        alert_type: str,
        details: str
    ) -> SimulationResult:
        """Send a critical alert SMS."""

        message = f"🚨 CRITICAL ALERT: {alert_type}\n\n{details}\n\nLog in to EPR Co-Pilot immediately to address this issue."

        return await self.send_sms(to_number, message)

    async def send_deadline_alert(
        self,
        to_number: str,
        deadline_type: str,
        days_remaining: int
    ) -> SimulationResult:
        """Send a deadline alert SMS."""

        if days_remaining <= 1:
            urgency = "🚨 URGENT"
        elif days_remaining <= 3:
            urgency = "⚠️ IMPORTANT"
        else:
            urgency = "📅 REMINDER"

        message = f"{urgency}: Your {deadline_type} is due in {days_remaining} day{'s' if days_remaining != 1 else ''}. Complete your submission at EPR Co-Pilot."

        return await self.send_sms(to_number, message)

    async def send_submission_confirmation(
        self,
        to_number: str,
        report_type: str,
        submission_id: str
    ) -> SimulationResult:
        """Send a submission confirmation SMS."""

        message = f"✅ SUCCESS: Your {report_type} has been submitted successfully. Confirmation ID: {submission_id}. Check EPR Co-Pilot for details."

        return await self.send_sms(to_number, message)


sms_service = SMSService()
