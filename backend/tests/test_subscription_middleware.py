from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi import HTTPException

from app.core.subscription_middleware import (
    get_active_subscription,
    require_pro_subscription,
    require_subscription,
)


class TestGetActiveSubscription:
    @pytest.mark.asyncio
    async def test_returns_none_when_no_subscription(self):
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        mock_user = MagicMock()
        mock_user.id = "user-123"

        result = await get_active_subscription(mock_db, mock_user)
        assert result is None

    @pytest.mark.asyncio
    async def test_returns_subscription_when_active(self):
        mock_sub = MagicMock()
        mock_sub.status = "active"

        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_sub
        mock_db.execute.return_value = mock_result

        mock_user = MagicMock()
        mock_user.id = "user-123"

        result = await get_active_subscription(mock_db, mock_user)
        assert result == mock_sub


class TestRequireSubscription:
    @pytest.mark.asyncio
    async def test_raises_403_when_no_subscription(self):
        with pytest.raises(HTTPException) as exc_info:
            await require_subscription(None)
        assert exc_info.value.status_code == 403
        assert "subscription" in exc_info.value.detail.lower()

    @pytest.mark.asyncio
    async def test_returns_subscription_when_active(self):
        mock_sub = MagicMock()
        mock_sub.status = "active"
        result = await require_subscription(mock_sub)
        assert result == mock_sub


class TestRequireProSubscription:
    @pytest.mark.asyncio
    async def test_raises_403_when_not_pro(self):
        mock_sub = MagicMock()
        mock_sub.plan = "starter"
        with pytest.raises(HTTPException) as exc_info:
            await require_pro_subscription(mock_sub)
        assert exc_info.value.status_code == 403
        assert "pro" in exc_info.value.detail.lower()

    @pytest.mark.asyncio
    async def test_returns_subscription_when_pro(self):
        mock_sub = MagicMock()
        mock_sub.plan = "pro"
        result = await require_pro_subscription(mock_sub)
        assert result == mock_sub
