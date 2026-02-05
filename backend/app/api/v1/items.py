from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_cached
from app.core.config import settings
from app.core.limiter import limiter
from app.core.subscription_middleware import require_subscription
from app.db.models.auth import User
from app.db.models.item import Item
from app.db.models.subscription import Subscription
from app.db.session import get_db
from app.schemas.item import ItemCreate, ItemResponse, ItemUpdate

router = APIRouter(prefix="/items", tags=["items"])

rate_limit = f"{settings.rate_limit_requests}/{settings.rate_limit_window} second"


@router.get("/", response_model=list[ItemResponse])
@limiter.limit(rate_limit)
async def list_items(
    request: Request,
    _subscription: Annotated[Subscription, Depends(require_subscription)],
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user_cached),
    skip: int = Query(0, description="Number of items to skip"),
    limit: int = Query(100, description="Maximum items to return", le=1000),
) -> list[Item]:
    """
    List all items for the current authenticated user.

    Returns a paginated list of items owned by the current user.
    """
    result = await db.execute(
        select(Item).where(Item.owner_id == user.id).offset(skip).limit(limit)
    )
    return list(result.scalars().all())


@router.post("/", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(rate_limit)
async def create_item(
    request: Request,
    item: ItemCreate,
    _subscription: Annotated[Subscription, Depends(require_subscription)],
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user_cached),
) -> Item:
    """Create a new item for the current user."""
    db_item = Item(**item.model_dump(), owner_id=user.id)
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item


@router.get("/{item_id}", response_model=ItemResponse)
async def get_item(
    item_id: str,
    _subscription: Annotated[Subscription, Depends(require_subscription)],
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user_cached),
) -> Item:
    """Fetch a single item owned by the current user."""
    result = await db.execute(select(Item).where(Item.id == item_id, Item.owner_id == user.id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
    return item


@router.patch("/{item_id}", response_model=ItemResponse)
async def update_item(
    item_id: str,
    item_update: ItemUpdate,
    _subscription: Annotated[Subscription, Depends(require_subscription)],
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user_cached),
) -> Item:
    """Update an item owned by the current user."""
    result = await db.execute(select(Item).where(Item.id == item_id, Item.owner_id == user.id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    update_data = item_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)

    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(
    item_id: str,
    _subscription: Annotated[Subscription, Depends(require_subscription)],
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user_cached),
) -> Response:
    """Delete an item owned by the current user."""
    result = await db.execute(select(Item).where(Item.id == item_id, Item.owner_id == user.id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")

    await db.delete(item)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
