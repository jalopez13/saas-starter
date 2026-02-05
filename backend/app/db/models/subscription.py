from datetime import datetime

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Subscription(Base):
    __tablename__ = "subscription"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    plan: Mapped[str] = mapped_column(String, nullable=False)
    reference_id: Mapped[str] = mapped_column("reference_id", String, nullable=False)
    stripe_customer_id: Mapped[str | None] = mapped_column(
        "stripe_customer_id", String, nullable=True
    )
    stripe_subscription_id: Mapped[str | None] = mapped_column(
        "stripe_subscription_id", String, nullable=True
    )
    status: Mapped[str] = mapped_column(String, nullable=False)
    period_start: Mapped[datetime | None] = mapped_column(
        "period_start", DateTime(timezone=True), nullable=True
    )
    period_end: Mapped[datetime | None] = mapped_column(
        "period_end", DateTime(timezone=True), nullable=True
    )
    cancel_at_period_end: Mapped[bool] = mapped_column(
        "cancel_at_period_end", Boolean, nullable=False, default=False
    )
    seats: Mapped[int | None] = mapped_column(Integer, nullable=True)
    trial_start: Mapped[datetime | None] = mapped_column(
        "trial_start", DateTime(timezone=True), nullable=True
    )
    trial_end: Mapped[datetime | None] = mapped_column(
        "trial_end", DateTime(timezone=True), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        "created_at", DateTime(timezone=True), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        "updated_at", DateTime(timezone=True), nullable=False
    )
