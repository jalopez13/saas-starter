from datetime import datetime

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache import get_redis
from app.db.models.auth import Session, User
from app.db.session import get_db
from app.services.cache_service import SessionCache


def get_session_token(request: Request) -> str:
    token = request.cookies.get("better-auth.session_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return token


async def validate_session(db: AsyncSession, token: str) -> User:
    result = await db.execute(
        select(Session).where(
            Session.token == token,
            Session.expires_at > datetime.utcnow(),
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session"
        )

    result = await db.execute(select(User).where(User.id == session.user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user


async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)) -> User:
    token = get_session_token(request)
    return await validate_session(db, token)


async def get_current_user_cached(
    request: Request,
    db: AsyncSession = Depends(get_db),
    redis=Depends(get_redis),
) -> User:
    token = get_session_token(request)
    cache = SessionCache(redis)
    cached_user_id = await cache.get_user_id(token)
    if cached_user_id:
        result = await db.execute(select(User).where(User.id == cached_user_id))
        user = result.scalar_one_or_none()
        if user:
            return user
        await cache.delete(token)

    result = await db.execute(
        select(Session).where(
            Session.token == token,
            Session.expires_at > datetime.utcnow(),
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired session"
        )

    result = await db.execute(select(User).where(User.id == session.user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    ttl_seconds = int((session.expires_at - datetime.utcnow()).total_seconds())
    if ttl_seconds > 0:
        await cache.set_user_id(token, user.id, ttl=ttl_seconds)

    return user
