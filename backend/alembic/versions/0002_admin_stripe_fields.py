"""add admin and stripe plugin fields

Revision ID: 0002_admin_stripe
Revises: 0001_initial
Create Date: 2026-02-04 22:45:00

"""

from alembic import op
import sqlalchemy as sa


revision = "0002_admin_stripe"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # NOTE: All these fields are now managed by Drizzle (frontend) via better-auth plugins.
    # Drizzle schema includes: user.role, user.banned, user.banReason, user.banExpires,
    # user.stripeCustomerId, session.impersonatedBy, and subscription table.
    # This migration is kept as a no-op for migration history compatibility.
    pass


def downgrade() -> None:
    # No-op: Fields managed by Drizzle
    pass
