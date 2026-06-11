"""
TraceLT Shared Library — health endpoint untuk Railway deployment.
Folder ini berisi utility code (logging, metrics) yang digunakan bersama
oleh auth-service dan item-service.
"""
from fastapi import FastAPI

app = FastAPI(title="TraceLT Shared", version="1.0.0")


@app.get("/health")
def health():
    return {"status": "healthy", "service": "shared-lib"}
