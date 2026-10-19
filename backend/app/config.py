import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings:
    APP_NAME: str = os.getenv("APP_NAME", "UzhavarNanban")
    APP_ENV: str = os.getenv("APP_ENV", "development")
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./uzhavarnanban.db")
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "uzhavar_nanban_secret_jwt_key_2026_natrampalli")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    # Uploads
    UPLOAD_DIR: Path = BASE_DIR / os.getenv("UPLOAD_DIR", "uploads")
    
    # AI & Sandbox
    AI_VISION_API_KEY: str = os.getenv("AI_VISION_API_KEY", "")
    AI_SIMULATED_MODE: bool = os.getenv("AI_SIMULATED_MODE", "True").lower() == "true"
    PAYMENT_GATEWAY_KEY: str = os.getenv("PAYMENT_GATEWAY_KEY", "rzp_test_uzhavar_demo")
    PAYMENT_GATEWAY_SECRET: str = os.getenv("PAYMENT_GATEWAY_SECRET", "rzp_test_secret_demo")
    PAYMENT_SANDBOX_MODE: bool = os.getenv("PAYMENT_SANDBOX_MODE", "True").lower() == "true"

settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
