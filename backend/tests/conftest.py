from datetime import datetime, timedelta

import pytest_asyncio
from httpx import AsyncClient
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from testcontainers.postgres import PostgresContainer
from testcontainers.redis import RedisContainer

from app.core.cache import get_redis
from app.db.base import Base
from app.db.models.auth import Session, User
from app.db.session import get_db
from main import app


@pytest_asyncio.fixture(scope="session")
def postgres_container() -> PostgresContainer:
    with PostgresContainer("postgres:17-alpine") as postgres:
        yield postgres


@pytest_asyncio.fixture(scope="session")
def redis_container() -> RedisContainer:
    with RedisContainer("redis:7-alpine") as redis:
        yield redis


@pytest_asyncio.fixture(scope="session")
async def async_engine(postgres_container: PostgresContainer):
    url = postgres_container.get_connection_url().replace("postgresql://", "postgresql+asyncpg://")
    engine = create_async_engine(url)
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture
async def db_session(async_engine) -> AsyncSession:
    session_factory = async_sessionmaker(async_engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture(scope="session")
async def redis_client(redis_container: RedisContainer) -> Redis:
    host = redis_container.get_container_host_ip()
    port = redis_container.get_exposed_port(6379)
    redis = Redis.from_url(f"redis://{host}:{port}/0", decode_responses=True)
    yield redis
    await redis.flushall()
    await redis.close()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession, redis_client: Redis) -> AsyncClient:
    async def override_get_db():
        yield db_session

    async def override_get_redis():
        return redis_client

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_redis] = override_get_redis

    async with AsyncClient(app=app, base_url="http://test") as http_client:
        yield http_client

    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def auth_user(db_session: AsyncSession) -> User:
    now = datetime.utcnow()
    user = User(
        id="test-user",
        email="test@example.com",
        name="Test User",
        email_verified=True,
        created_at=now,
        updated_at=now,
    )
    session = Session(
        id="test-session",
        token="valid-token",
        user_id=user.id,
        expires_at=now + timedelta(hours=1),
        created_at=now,
        updated_at=now,
    )
    db_session.add_all([user, session])
    await db_session.commit()
    return user
