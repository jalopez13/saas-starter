import pytest

from app.db.models.auth import Session, User
from app.db.models.subscription import Subscription


class TestUserModel:
    def test_user_has_role_attribute(self):
        assert hasattr(User, "role")

    def test_user_has_banned_attribute(self):
        assert hasattr(User, "banned")

    def test_user_has_ban_reason_attribute(self):
        assert hasattr(User, "ban_reason")

    def test_user_has_ban_expires_attribute(self):
        assert hasattr(User, "ban_expires")

    def test_user_has_stripe_customer_id_attribute(self):
        assert hasattr(User, "stripe_customer_id")


class TestSessionModel:
    def test_session_has_impersonated_by_attribute(self):
        assert hasattr(Session, "impersonated_by")


class TestSubscriptionModel:
    def test_subscription_model_exists(self):
        assert Subscription is not None

    def test_subscription_has_plan_attribute(self):
        assert hasattr(Subscription, "plan")

    def test_subscription_has_status_attribute(self):
        assert hasattr(Subscription, "status")

    def test_subscription_has_stripe_subscription_id_attribute(self):
        assert hasattr(Subscription, "stripe_subscription_id")

    def test_subscription_has_trial_start_attribute(self):
        assert hasattr(Subscription, "trial_start")

    def test_subscription_has_trial_end_attribute(self):
        assert hasattr(Subscription, "trial_end")
