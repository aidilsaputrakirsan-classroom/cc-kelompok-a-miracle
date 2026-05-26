"""Pydantic schemas for TraceIt Donation Service."""
from pydantic import BaseModel
from typing import Optional


class ItemCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    total_donor: Optional[int] = 0


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    total_donor: Optional[int] = None


class ItemResponse(BaseModel):
    id: int
    name: str
    description: str
    total_donor: int
    owner_id: int

    class Config:
        from_attributes = True


class ItemListResponse(BaseModel):
    total: int
    items: list[ItemResponse]


class ItemStatsResponse(BaseModel):
    total_items: int
    total_value: float
    termurah: float | None
    termahal: float | None