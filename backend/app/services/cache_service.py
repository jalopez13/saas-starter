import hashlib

from redis.asyncio import Redis


class SessionCache:
    def __init__(self, redis: Redis) -> None:
        self.redis = redis

    async def get_user_id(self, token: str) -> str | None:
        key = f"session:{self._hash(token)}"
        return await self.redis.get(key)

    async def set_user_id(self, token: str, user_id: str, ttl: int = 300) -> None:
        key = f"session:{self._hash(token)}"
        await self.redis.setex(key, ttl, user_id)

    async def delete(self, token: str) -> None:
        key = f"session:{self._hash(token)}"
        await self.redis.delete(key)

    def _hash(self, token: str) -> str:
        return hashlib.sha256(token.encode()).hexdigest()[:16]
