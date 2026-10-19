import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.seed_data import seed_database
from app.routers import auth, disease, dealer, products, orders, payments, crops, machinery, advisory

# Initialize database schema
Base.metadata.create_all(bind=engine)

# Run seed data on startup
db = SessionLocal()
try:
    seed_database(db)
finally:
    db.close()

app = FastAPI(
    title="UzhavarNanban API 🌱",
    description="AI-Powered Agricultural Marketplace & Multi-Dealer Recommendation System for Natrampalli Block, Tirupattur District, Tamil Nadu",
    version="1.0.0"
)

# CORS configuration for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploaded disease images and documents
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(disease.router)
app.include_router(dealer.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(crops.router)
app.include_router(machinery.router)
app.include_router(advisory.router)

@app.get("/")
def root():
    return {
        "app": "UzhavarNanban 🌱",
        "tagline": "Connect Farmers. Reduce Costs. Grow Together.",
        "location": "Natrampalli Block, Tirupattur District, Tamil Nadu",
        "status": "online",
        "documentation": "/docs",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
