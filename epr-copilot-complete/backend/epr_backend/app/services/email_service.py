import os
from typing import List, Optional
import logging
from jinja2 import Template
from ..core.simulation import SimulationResult
from ..core.config import NotificationConfig

if os.getenv("ENABLE_EMAIL_SERVICES", "false").lower() == "true":
    from sendgrid import SendGridAPIClient
    from sendgrid.helpers.mail import Mail, Email, To, Content
else:
    SendGridAPIClient = None
    Mail = Email = To = Content = None

logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self):
        self.api_key = os.getenv("SENDGRID_API_KEY")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@epr-copilot.com")
        self.client = None

        if self.api_key and SendGridAPIClient is not None:
            self.client = SendGridAPIClient(api_key=self.api_key)
        else:
            logger.warning(
                "SendGrid API key not configured. Email sending will be simulated.")

    async def send_email(
        self,
        to_emails: List[str],
        subject: str,
        html_content: str,
        plain_content: Optional[str] = None
    ) -> SimulationResult:
        """Send an email using SendGrid."""

        if not self.client:
            logger.info(
                f"Email simulation - To: {to_emails}, Subject: {subject}")
            return SimulationResult.simulated_success(f"Email to {', '.join(to_emails)}")

        try:
            from_email = Email(self.from_email)
            to_list = [To(email) for email in to_emails]

            mail = Mail(
                from_email=from_email,
                to_emails=to_list,
                subject=subject,
                html_content=Content("text/html", html_content)
            )

            if plain_content:
                mail.add_content(Content("text/plain", plain_content))

            response = self.client.send(mail)
            logger.info(
                f"Email sent successfully. Status code: {response.status_code}")
            return SimulationResult.actual_success() if response.status_code < 400 else SimulationResult.actual_failure(f"SendGrid error: {response.status_code}")

        except Exception as e:
            logger.error(f"Failed to send email: {str(e)}")
            return SimulationResult.actual_failure(str(e))

    async def send_invitation_email(
        self,
        to_email: str,
        inviter_name: str,
        organization_name: str,
        invitation_link: str
    ) -> SimulationResult:
        """Send team invitation email."""

        subject = f"You're invited to join {organization_name} on EPR Co-Pilot"

        html_template = """
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                <h2 style="color: #2563eb;">You're Invited to EPR Co-Pilot</h2>
                <p>Hi there,</p>
                <p><strong>{{ inviter_name }}</strong> has invited you to join <strong>{{ organization_name }}</strong> on EPR Co-Pilot.</p>
                <p>EPR Co-Pilot helps organizations automate their Extended Producer Responsibility compliance reporting.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{ invitation_link }}"
                       style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Accept Invitation
                    </a>
                </div>
                <p style="color: #6b7280; font-size: 14px;">
                    If you have any questions, please contact our support team.
                </p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #9ca3af; font-size: 12px;">
                    This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
                </p>
            </div>
        </body>
        </html>
        """

        template = Template(html_template)
        html_content = template.render(
            inviter_name=inviter_name,
            organization_name=organization_name,
            invitation_link=invitation_link
        )

        return await self.send_email([to_email], subject, html_content)

    async def send_deadline_reminder(
        self,
        to_email: str,
        user_name: str,
        deadline_type: str,
        due_date: str,
        days_remaining: int
    ) -> SimulationResult:
        """Send compliance deadline reminder email."""

        subject = f"Reminder: {deadline_type} due in {days_remaining} days"
        dashboard_url = NotificationConfig.get_dashboard_url()

        html_template = """
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <h2 style="color: #92400e;">Compliance Deadline Reminder</h2>
                <p>Hi {{ user_name }},</p>
                <p>This is a reminder that your <strong>{{ deadline_type }}</strong> is due in <strong>{{ days_remaining }} days</strong>.</p>
                <p><strong>Due Date:</strong> {{ due_date }}</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{ dashboard_url }}"
                       style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        View Reports Dashboard
                    </a>
                </div>
                <p style="color: #92400e;">
                    Don't wait until the last minute! Log in to EPR Co-Pilot to complete your submission.
                </p>
            </div>
        </body>
        </html>
        """

        template = Template(html_template)
        html_content = template.render(
            user_name=user_name,
            deadline_type=deadline_type,
            due_date=due_date,
            days_remaining=days_remaining,
            dashboard_url=dashboard_url
        )

        return await self.send_email([to_email], subject, html_content)

    async def send_report_notification(
        self,
        to_email: str,
        user_name: str,
        report_type: str,
        status: str,
        report_link: str
    ) -> SimulationResult:
        """Send report status notification email."""

        subject = f"Report {status}: {report_type}"

        status_colors = {
            "submitted": "#10b981",
            "approved": "#059669",
            "rejected": "#ef4444",
            "needs_review": "#f59e0b"
        }

        color = status_colors.get(status, "#6b7280")

        html_template = """
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                <h2 style="color: {{ color }};">Report Status Update</h2>
                <p>Hi {{ user_name }},</p>
                <p>Your <strong>{{ report_type }}</strong> has been <strong>{{ status }}</strong>.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{ report_link }}"
                       style="background-color: {{ color }}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        View Report Details
                    </a>
                </div>
                <p style="color: #6b7280;">
                    Log in to EPR Co-Pilot to see more details and take any necessary actions.
                </p>
            </div>
        </body>
        </html>
        """

        template = Template(html_template)
        html_content = template.render(
            user_name=user_name,
            report_type=report_type,
            status=status,
            color=color,
            report_link=report_link
        )

        return await self.send_email([to_email], subject, html_content)


email_service = EmailService()
