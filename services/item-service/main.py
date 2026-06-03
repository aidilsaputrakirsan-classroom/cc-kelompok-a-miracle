"""
TraceIt Donation Service — Handles donor record management.
Berkomunikasi dengan Auth Service untuk verifikasi token.
"""
import os
from fastapi import FastAPI, Depends, HTTPException, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from models import Item
from schemas import ItemCreate, ItemUpdate, ItemResponse, ItemListResponse, ItemStatsResponse
from auth_client import verify_token_with_auth_service

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TraceIt Donation Service",
    description="TraceIt microservice — CRUD donor records with auth via Auth Service",
    version="2.0.0",
)

# CORS
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================
# ENDPOINTS
# =====================

from auth_client import auth_circuit  # Import circuit breaker instance


async def get_stats_user(authorization: str = Header(default=None)) -> dict | None:
    """
    Return user for stats when auth is available; allow None on degraded mode.
    """
    if auth_circuit.get_status()["state"] == "OPEN":
        return None
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing authorization header")
    return await verify_token_with_auth_service(authorization)

@app.get("/health")
def health_check():
    cb_status = auth_circuit.get_status()
    overall = "healthy" if cb_status["state"] == "CLOSED" else "degraded"

    return {
        "status": overall,
        "service": "item-service",
        "version": "2.1.0",
        "dependencies": {
            "auth-service": cb_status,
        },
    }


@app.post("/items", response_model=ItemResponse, status_code=201)
async def create_item(
    item_data: ItemCreate,
    user: dict = Depends(verify_token_with_auth_service),
    db: Session = Depends(get_db),
):
    """Buat data donor baru — requires authentication."""
    item = Item(
        **item_data.model_dump(),
        owner_id=user["user_id"],
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.get("/items", response_model=ItemListResponse)
async def get_items(
    search: str = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    user: dict = Depends(verify_token_with_auth_service),
    db: Session = Depends(get_db),
):
    """Ambil daftar data donor milik user yang login."""
    query = db.query(Item).filter(Item.owner_id == user["user_id"])
    if search:
        query = query.filter(Item.name.ilike(f"%{search}%"))
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return ItemListResponse(total=total, items=items)


@app.get("/items/public", response_model=ItemListResponse)
async def get_public_items(
    search: str = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """Ambil daftar data donor publik tanpa auth."""
    query = db.query(Item)
    if search:
        query = query.filter(Item.name.ilike(f"%{search}%"))
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return ItemListResponse(total=total, items=items)


@app.get("/items/stats", response_model=ItemStatsResponse)
async def get_item_stats(
    user: dict | None = Depends(get_stats_user),
    db: Session = Depends(get_db),
):
    """Ringkasan statistik data donor (degraded mode bila auth down)."""
    if user is None:
        query = db.query(Item)
    else:
        query = db.query(Item).filter(Item.owner_id == user["user_id"])
    total_items = query.count()

    if total_items == 0:
        return ItemStatsResponse(
            total_items=0,
            total_value=0.0,
            termurah=None,
            termahal=None,
        )

    items = query.all()
    totals = [item.total_donor for item in items]
    total_value = sum(totals)

    return ItemStatsResponse(
        total_items=total_items,
        total_value=total_value,
        termurah=min(totals),
        termahal=max(totals),
    )


@app.get("/items/{item_id}", response_model=ItemResponse)
async def get_item(
    item_id: int,
    user: dict = Depends(verify_token_with_auth_service),
    db: Session = Depends(get_db),
):
    """Ambil data donor by ID."""
    item = db.query(Item).filter(
        Item.id == item_id, Item.owner_id == user["user_id"]
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@app.put("/items/{item_id}", response_model=ItemResponse)
async def update_item(
    item_id: int,
    update_data: ItemUpdate,
    user: dict = Depends(verify_token_with_auth_service),
    db: Session = Depends(get_db),
):
    """Update data donor."""
    item = db.query(Item).filter(
        Item.id == item_id, Item.owner_id == user["user_id"]
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@app.delete("/items/{item_id}", status_code=204)
async def delete_item(
    item_id: int,
    user: dict = Depends(verify_token_with_auth_service),
    db: Session = Depends(get_db),
):
    """Hapus data donor."""
    item = db.query(Item).filter(
        Item.id == item_id, Item.owner_id == user["user_id"]
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()