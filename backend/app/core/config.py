from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/saas_starter"
    redis_url: str = "redis://localhost:6379/0"
    better_auth_secret: str = "your-secret-key-here"
    better_auth_url: str = "http://localhost:3000"
    app_env: str = "development"
    debug: bool = True
    secret_key: str = "your-app-secret-key"
    frontend_url: str = "http://localhost:5173"
    rate_limit_requests: int = 100
    rate_limit_window: int = 60
    max_request_size: int = 10 * 1024 * 1024

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)


settings = Settings()
