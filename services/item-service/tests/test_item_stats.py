import os
import sys

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

BASE_DIR = os.path.dirname(os.path.dirname(__file__))
sys.path.append(BASE_DIR)

from auth_client import verify_token_with_auth_service
from database import Base, get_db
from main import app, get_stats_user
from models import Item

USER_ID = 1


async def _override_auth():
    return {"user_id": USER_ID, "email": "user@example.com", "name": "User"}


engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


def _override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = _override_get_db
app.dependency_overrides[get_stats_user] = _override_auth

client = TestClient(app)


def _clear_items():
    db = TestingSessionLocal()
    try:
        db.query(Item).delete()
        db.commit()
    finally:
        db.close()


def test_get_item_stats_returns_expected_values():
    _clear_items()
    db = TestingSessionLocal()
    try:
        db.add_all(
            [
                Item(name="A", description="", total_donor=2, owner_id=1),
                Item(name="B", description="", total_donor=1, owner_id=1),
                Item(name="C", description="", total_donor=3, owner_id=2),
            ]
        )
        db.commit()
    finally:
        db.close()

    response = client.get("/items/stats", headers={"Authorization": "Bearer test"})

    assert response.status_code == 200
    assert response.json() == {
        "total_items": 2,
        "total_value": 3.0,
        "termurah": 1.0,
        "termahal": 2.0,
    }


def test_get_item_stats_empty_items():
    global USER_ID
    _clear_items()
    USER_ID = 99

    response = client.get("/items/stats", headers={"Authorization": "Bearer test"})

    assert response.status_code == 200
    assert response.json() == {
        "total_items": 0,
        "total_value": 0.0,
        "termurah": None,
        "termahal": None,
    }

    USER_ID = 1
