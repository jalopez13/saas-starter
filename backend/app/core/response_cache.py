import json
from functools import wraps
from typing import Any, Awaitable, Callable, TypeVar

from app.core.cache import get_redis

ResponseT = TypeVar("ResponseT")


def cache_response(
    key: str, ttl: int = 60
) -> Callable[[Callable[..., Awaitable[ResponseT]]], Callable[..., Awaitable[ResponseT]]]:
    def decorator(func: Callable[..., Awaitable[ResponseT]]) -> Callable[..., Awaitable[ResponseT]]:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> ResponseT:
            redis = await get_redis()
            cached = await redis.get(key)
            if cached:
                return json.loads(cached)

            response = await func(*args, **kwargs)
            await redis.setex(key, ttl, json.dumps(response))
            return response

        return wrapper

    return decorator
