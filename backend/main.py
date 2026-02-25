from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Cloud App API",
    description="API untuk mata kuliah Komputasi Awan",
    version="0.1.0"
)

# CORS - agar frontend bisa akses API ini
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Untuk development saja
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Hello from Cloud App API!",
        "status": "running",
        "version": "0.1.0"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/team")
def team_info():
    return {
        "team": "Miracle",
        "members": [
            # TODO: 
            {"name": "Debora Intania Subekti", "nim": "10231029", "role": "Lead Backend"},
            {"name": "Avhilla Catton Andalucia", "nim": "10231021", "role": "Lead Container"},
            {"name": "Betran", "nim": "10231023", "role": "Lead QA & Docs"},
            {"name": "Chelsy Olivia", "nim": "10231025", "role": "Lead CI/CD & Deploy"},
            {"name": "Yosan Pratiwi", "nim": "10231091", "role": "Lead Frontend"},
        ]
    }