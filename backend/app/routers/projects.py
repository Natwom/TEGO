import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/api/projects", tags=["projects"])

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BACKEND_DIR, "uploads", "projects")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

print(f"[PROJECTS] Upload dir: {UPLOAD_DIR}")
print(f"[PROJECTS] Upload dir exists: {os.path.exists(UPLOAD_DIR)}")


def save_image(file: UploadFile, folder: str) -> Optional[str]:
    if not file or not file.filename:
        print("[PROJECTS] No file provided")
        return None
    
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail=f"Invalid image format '{ext}'. Use jpg, png, gif, or webp.")
    
    unique = f"{uuid.uuid4()}{ext}"
    path = os.path.join(folder, unique)
    
    print(f"[PROJECTS] Saving image to: {path}")
    
    try:
        contents = file.file.read()
        with open(path, "wb") as f:
            f.write(contents)
        print(f"[PROJECTS] Image saved successfully: {unique}")
        return f"https://tego-api.onrender.com/uploads/projects/{unique}"
    except Exception as e:
        print(f"[PROJECTS] ERROR saving image: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")


@router.get("/", response_model=List[schemas.ProjectResponse])
def get_projects(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    projects = db.query(models.Project).offset(skip).limit(limit).all()
    return projects


@router.get("/{project_id}", response_model=schemas.ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("/", response_model=schemas.ProjectResponse)
def create_project(
    title: str = Form(...),
    slug: str = Form(...),
    summary: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    status: Optional[str] = Form("ongoing"),
    location: Optional[str] = Form(None),
    beneficiaries: Optional[int] = Form(0),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    print(f"[PROJECTS] Creating project: title={title}, slug={slug}")
    
    try:
        image_url = save_image(image, UPLOAD_DIR)
        print(f"[PROJECTS] image_url={image_url}")
    except Exception as e:
        print(f"[PROJECTS] Image save failed: {e}")
        raise
    
    db_project = models.Project(
        title=title,
        slug=slug,
        summary=summary,
        description=description,
        category=category,
        status=status,
        location=location,
        beneficiaries=beneficiaries,
        image_url=image_url
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    print(f"[PROJECTS] Project created: id={db_project.id}")
    return db_project


@router.put("/{project_id}", response_model=schemas.ProjectResponse)
def update_project(
    project_id: int,
    title: str = Form(...),
    slug: str = Form(...),
    summary: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    status: Optional[str] = Form("ongoing"),
    location: Optional[str] = Form(None),
    beneficiaries: Optional[int] = Form(0),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    print(f"[PROJECTS] Updating project {project_id}")
    
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db_project.title = title
    db_project.slug = slug
    db_project.summary = summary
    db_project.description = description
    db_project.category = category
    db_project.status = status
    db_project.location = location
    db_project.beneficiaries = beneficiaries
    
    if image:
        try:
            db_project.image_url = save_image(image, UPLOAD_DIR)
        except Exception as e:
            print(f"[PROJECTS] Image update failed: {e}")
            raise
    
    db.commit()
    db.refresh(db_project)
    print(f"[PROJECTS] Project updated: id={db_project.id}")
    return db_project


@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(db_project)
    db.commit()
    return {"message": "Project deleted successfully"}