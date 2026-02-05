# DO NOT MODIFY - Managed by better-auth frontend

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "user"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    email_verified: Mapped[bool] = mapped_column("email_verified", Boolean, nullable=False)
    image: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        "created_at", DateTime(timezone=True), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        "updated_at", DateTime(timezone=True), nullable=False
    )
    # Admin plugin fields
    role: Mapped[str | None] = mapped_column("role", String, nullable=True, default="user")
    banned: Mapped[bool] = mapped_column("banned", Boolean, nullable=False, default=False)
    ban_reason: Mapped[str | None] = mapped_column("ban_reason", String, nullable=True)
    ban_expires: Mapped[datetime | None] = mapped_column(
        "ban_expires", DateTime(timezone=True), nullable=True
    )
    # Stripe plugin field
    stripe_customer_id: Mapped[str | None] = mapped_column(
        "stripe_customer_id", String, nullable=True
    )

    sessions: Mapped[list["Session"]] = relationship("Session", back_populates="user")
    accounts: Mapped[list["Account"]] = relationship("Account", back_populates="user")
    items: Mapped[list["Item"]] = relationship("Item", back_populates="owner")


class Session(Base):
    __tablename__ = "session"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    expires_at: Mapped[datetime] = mapped_column(
        "expires_at", DateTime(timezone=True), nullable=False
    )
    token: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    created_at: Mapped[datetime] = mapped_column(
        "created_at", DateTime(timezone=True), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        "updated_at", DateTime(timezone=True), nullable=False
    )
    ip_address: Mapped[str | None] = mapped_column("ip_address", String, nullable=True)
    user_agent: Mapped[str | None] = mapped_column("user_agent", String, nullable=True)
    user_id: Mapped[str] = mapped_column(
        "user_id", String, ForeignKey("user.id", ondelete="CASCADE"), nullable=False
    )
    impersonated_by: Mapped[str | None] = mapped_column("impersonated_by", String, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="sessions")


class Account(Base):
    __tablename__ = "account"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    account_id: Mapped[str] = mapped_column("account_id", String, nullable=False)
    provider_id: Mapped[str] = mapped_column("provider_id", String, nullable=False)
    user_id: Mapped[str] = mapped_column(
        "user_id", String, ForeignKey("user.id", ondelete="CASCADE"), nullable=False
    )
    access_token: Mapped[str | None] = mapped_column("access_token", Text, nullable=True)
    refresh_token: Mapped[str | None] = mapped_column("refresh_token", Text, nullable=True)
    id_token: Mapped[str | None] = mapped_column("id_token", Text, nullable=True)
    access_token_expires_at: Mapped[datetime | None] = mapped_column(
        "access_token_expires_at", DateTime(timezone=True), nullable=True
    )
    refresh_token_expires_at: Mapped[datetime | None] = mapped_column(
        "refresh_token_expires_at", DateTime(timezone=True), nullable=True
    )
    scope: Mapped[str | None] = mapped_column(Text, nullable=True)
    password: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        "created_at", DateTime(timezone=True), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        "updated_at", DateTime(timezone=True), nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="accounts")


class Verification(Base):
    __tablename__ = "verification"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    identifier: Mapped[str] = mapped_column(String, nullable=False)
    value: Mapped[str] = mapped_column(String, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(
        "expires_at", DateTime(timezone=True), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        "created_at", DateTime(timezone=True), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        "updated_at", DateTime(timezone=True), nullable=False
    )
