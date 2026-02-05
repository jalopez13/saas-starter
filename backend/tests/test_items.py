from datetime import datetime

import pytest

from app.db.models.auth import User
from app.db.models.item import Item


@pytest.mark.asyncio
async def test_create_item(client, auth_user):
    client.cookies.set("better-auth.session_token", "valid-token")
    response = await client.post(
        "/api/v1/items/",
        json={"name": "Test Item", "description": "Test description"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Item"
    assert data["owner_id"] == auth_user.id


@pytest.mark.asyncio
async def test_list_items(client, auth_user, db_session):
    items = [
        Item(name=f"Item {index}", owner_id=auth_user.id, created_at=datetime.utcnow())
        for index in range(5)
    ]
    db_session.add_all(items)
    await db_session.commit()

    client.cookies.set("better-auth.session_token", "valid-token")
    response = await client.get("/api/v1/items/")

    assert response.status_code == 200
    assert len(response.json()) == 5


@pytest.mark.asyncio
async def test_get_item_not_owner(client, auth_user, db_session):
    now = datetime.utcnow()
    other_user = User(
        id="other-user",
        email="other@example.com",
        name="Other",
        email_verified=True,
        created_at=now,
        updated_at=now,
    )
    item = Item(name="Private Item", owner_id=other_user.id)
    db_session.add_all([other_user, item])
    await db_session.commit()

    client.cookies.set("better-auth.session_token", "valid-token")
    response = await client.get(f"/api/v1/items/{item.id}")

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_item(client, auth_user, db_session):
    item = Item(name="Original", owner_id=auth_user.id)
    db_session.add(item)
    await db_session.commit()

    client.cookies.set("better-auth.session_token", "valid-token")
    response = await client.patch(
        f"/api/v1/items/{item.id}",
        json={"name": "Updated"},
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Updated"


@pytest.mark.asyncio
async def test_delete_item(client, auth_user, db_session):
    item = Item(name="To Delete", owner_id=auth_user.id)
    db_session.add(item)
    await db_session.commit()

    client.cookies.set("better-auth.session_token", "valid-token")
    response = await client.delete(f"/api/v1/items/{item.id}")

    assert response.status_code == 204

    response = await client.get(f"/api/v1/items/{item.id}")
    assert response.status_code == 404
