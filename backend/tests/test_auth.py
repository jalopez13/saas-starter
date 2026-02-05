from datetime import datetime, timedelta

import pytest

from app.db.models.auth import Session, User


@pytest.mark.asyncio
async def test_get_current_user_valid_session(client, db_session, auth_user):
    client.cookies.set("better-auth.session_token", "valid-token")
    response = await client.get("/api/v1/users/me")

    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_get_current_user_invalid_session(client):
    client.cookies.set("better-auth.session_token", "invalid-token")
    response = await client.get("/api/v1/users/me")

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user_no_cookie(client):
    response = await client.get("/api/v1/users/me")

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_current_user_expired_session(client, db_session):
    now = datetime.utcnow()
    user = User(
        id="expired-user",
        email="expired@example.com",
        name="Expired",
        email_verified=True,
        created_at=now,
        updated_at=now,
    )
    session = Session(
        id="expired-session",
        token="expired-token",
        user_id=user.id,
        expires_at=now - timedelta(minutes=5),
        created_at=now,
        updated_at=now,
    )
    db_session.add_all([user, session])
    await db_session.commit()

    client.cookies.set("better-auth.session_token", "expired-token")
    response = await client.get("/api/v1/users/me")

    assert response.status_code == 401
