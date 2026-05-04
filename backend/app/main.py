from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database import engine, Base
from app.routers import projects, blog, contact, testimonials, impact, admin

# Create tables
Base.metadata.create_all(bind=engine)

# Determine the absolute path to the backend directory
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOADS_DIR = os.path.join(BACKEND_DIR, "uploads")

# Create upload directories
os.makedirs(os.path.join(UPLOADS_DIR, "projects"), exist_ok=True)
os.makedirs(os.path.join(UPLOADS_DIR, "blogs"), exist_ok=True)

print(f"[STARTUP] Backend dir: {BACKEND_DIR}")
print(f"[STARTUP] Uploads dir: {UPLOADS_DIR}")
print(f"[STARTUP] Projects dir exists: {os.path.exists(os.path.join(UPLOADS_DIR, 'projects'))}")
print(f"[STARTUP] Blogs dir exists: {os.path.exists(os.path.join(UPLOADS_DIR, 'blogs'))}")

app = FastAPI(
    title="TEGO API",
    description="Turkana Eco-Green Organization API",
    version="1.0.0"
)

# CORS - allow all for testing, restrict in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded images
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Include routers
app.include_router(projects.router)
app.include_router(blog.router)
app.include_router(contact.router)
app.include_router(testimonials.router)
app.include_router(impact.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {"message": "Welcome to TEGO API", "status": "active", "docs": "/docs"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}