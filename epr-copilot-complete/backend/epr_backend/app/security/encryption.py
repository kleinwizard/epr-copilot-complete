import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import logging

logger = logging.getLogger(__name__)


class DataEncryption:
    """Handle data encryption and decryption for sensitive information."""

    def __init__(self):
        self.encryption_key = self._get_or_create_key()
        self.cipher_suite = Fernet(self.encryption_key)

    def _get_or_create_key(self) -> bytes:
        """Get encryption key from environment or generate a new one."""
        key_env = os.getenv("ENCRYPTION_KEY")

        if key_env:
            try:
                return base64.urlsafe_b64decode(key_env.encode())
            except Exception as e:
                logger.warning(f"Invalid encryption key in environment: {e}")

        password = os.getenv("SECRET_KEY", "default-secret-key").encode()
        salt = os.getenv("ENCRYPTION_SALT", "default-salt").encode()

        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(password))

        logger.info("Generated new encryption key from SECRET_KEY")
        return key

    def encrypt_string(self, plaintext: str) -> str:
        """Encrypt a string and return base64 encoded result."""
        try:
            encrypted_bytes = self.cipher_suite.encrypt(plaintext.encode())
            return base64.urlsafe_b64encode(encrypted_bytes).decode()
        except Exception as e:
            logger.error(f"Encryption failed: {e}")
            raise

    def decrypt_string(self, encrypted_text: str) -> str:
        """Decrypt a base64 encoded encrypted string."""
        try:
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_text.encode())
            decrypted_bytes = self.cipher_suite.decrypt(encrypted_bytes)
            return decrypted_bytes.decode()
        except Exception as e:
            logger.error(f"Decryption failed: {e}")
            raise

    def encrypt_dict(self, data: dict) -> str:
        """Encrypt a dictionary as JSON string."""
        import json
        json_string = json.dumps(data, sort_keys=True)
        return self.encrypt_string(json_string)

    def decrypt_dict(self, encrypted_text: str) -> dict:
        """Decrypt an encrypted dictionary."""
        import json
        json_string = self.decrypt_string(encrypted_text)
        return json.loads(json_string)


class CredentialManager:
    """Manage encrypted storage of sensitive credentials."""

    def __init__(self):
        self.encryption = DataEncryption()

    def store_api_key(self, service_name: str, api_key: str) -> str:
        """Store an API key securely and return encrypted version."""
        try:
            encrypted_key = self.encryption.encrypt_string(api_key)
            logger.info(f"API key stored securely for service: {service_name}")
            return encrypted_key
        except Exception as e:
            logger.error(f"Failed to store API key for {service_name}: {e}")
            raise

    def retrieve_api_key(self, encrypted_key: str) -> str:
        """Retrieve and decrypt an API key."""
        try:
            return self.encryption.decrypt_string(encrypted_key)
        except Exception as e:
            logger.error(f"Failed to retrieve API key: {e}")
            raise

    def store_database_credentials(self, credentials: dict) -> str:
        """Store database credentials securely."""
        try:
            encrypted_creds = self.encryption.encrypt_dict(credentials)
            logger.info("Database credentials stored securely")
            return encrypted_creds
        except Exception as e:
            logger.error(f"Failed to store database credentials: {e}")
            raise

    def retrieve_database_credentials(self, encrypted_creds: str) -> dict:
        """Retrieve and decrypt database credentials."""
        try:
            return self.encryption.decrypt_dict(encrypted_creds)
        except Exception as e:
            logger.error(f"Failed to retrieve database credentials: {e}")
            raise


data_encryption = DataEncryption()
credential_manager = CredentialManager()


def encrypt_sensitive_data(data: str) -> str:
    """Utility function to encrypt sensitive data."""
    return data_encryption.encrypt_string(data)


def decrypt_sensitive_data(encrypted_data: str) -> str:
    """Utility function to decrypt sensitive data."""
    return data_encryption.decrypt_string(encrypted_data)


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    return pwd_context.verify(plain_password, hashed_password)
