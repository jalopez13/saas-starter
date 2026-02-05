from fastapi import APIRouter, Depends

from app.api.deps import get_current_user_cached
from app.db.models.auth import User
from app.schemas.auth import UserResponse

router = APIRouter(tags=["auth"])


@router.get("/users/me", response_model=UserResponse)
async def get_current_user_endpoint(user: User = Depends(get_current_user_cached)) -> User:
    """Return the current authenticated user."""
    return user
