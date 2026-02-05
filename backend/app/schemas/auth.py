from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserResponse(BaseModel):
    id: str = Field(description="User ID")
    email: str = Field(description="User email")
    name: str = Field(description="User display name")
    email_verified: bool = Field(alias="emailVerified", description="Email verification status")
    image: str | None = Field(default=None, description="Profile image URL")
    created_at: datetime = Field(alias="createdAt", description="Creation timestamp")
    updated_at: datetime = Field(alias="updatedAt", description="Last update timestamp")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class SessionResponse(BaseModel):
    id: str = Field(description="Session ID")
    user_id: str = Field(alias="userId", description="User ID")
    expires_at: datetime = Field(alias="expiresAt", description="Session expiration time")
    ip_address: str | None = Field(alias="ipAddress", description="IP address")
    user_agent: str | None = Field(alias="userAgent", description="User agent")
    created_at: datetime = Field(alias="createdAt", description="Creation timestamp")
    updated_at: datetime = Field(alias="updatedAt", description="Last update timestamp")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class UserSession(BaseModel):
    user: UserResponse
    session: SessionResponse
