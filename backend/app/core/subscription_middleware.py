from datetime import UTC, datetime
from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.models.auth import User
from app.db.models.subscription import Subscription
from app.db.session import get_db


async def get_active_subscription(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Subscription | None:
    """Get the user's active subscription if it exists."""
    result = await db.execute(
        select(Subscription)
        .where(Subscription.reference_id == current_user.id)
        .where(Subscription.status.in_(["active", "trialing"]))
        .where((Subscription.period_end > datetime.now(UTC)) | (Subscription.period_end.is_(None)))
    )
    return result.scalar_one_or_none()


async def require_subscription(
    subscription: Annotated[Subscription | None, Depends(get_active_subscription)],
) -> Subscription:
    """Require an active subscription for premium endpoints."""
    if subscription is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Active subscription required to access this resource",
        )
    return subscription


async def require_pro_subscription(
    subscription: Annotated[Subscription, Depends(require_subscription)],
) -> Subscription:
    """Require specifically a Pro subscription."""
    if subscription.plan != "pro":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Pro subscription required to access this resource",
        )
    return subscription
