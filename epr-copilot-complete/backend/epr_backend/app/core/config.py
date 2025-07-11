import os


class NotificationConfig:
    @staticmethod
    def get_app_base_url() -> str:
        return os.getenv("APP_BASE_URL", "https://app.epr-copilot.com")
    
    @staticmethod
    def get_invitation_url(token: str, email: str) -> str:
        base_url = NotificationConfig.get_app_base_url()
        return f"{base_url}/invite?token={token}&email={email}"
    
    @staticmethod
    def get_report_url(report_id: str) -> str:
        base_url = NotificationConfig.get_app_base_url()
        return f"{base_url}/reports/{report_id}"
    
    @staticmethod
    def get_dashboard_url() -> str:
        base_url = NotificationConfig.get_app_base_url()
        return f"{base_url}/reports"
