from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ItemBase(BaseModel):
    name: str = Field(description="Item name")
    description: str | None = Field(default=None, description="Optional item description")


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    is_active: bool | None = None


class ItemResponse(ItemBase):
    id: str = Field(description="Item ID")
    owner_id: str = Field(description="Owner user ID")
    is_active: bool = Field(description="Whether the item is active")
    created_at: datetime = Field(description="Creation timestamp")
    updated_at: datetime = Field(description="Last update timestamp")

    model_config = ConfigDict(from_attributes=True)
