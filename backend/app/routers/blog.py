import os
import uuid
import cloudinary
import cloudinary.uploader
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app import models, schemas

# Configure Cloudinary
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True
)

router = APIRouter(prefix="/api/blog", tags=["blog"])

ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp"}


def save_image(file: UploadFile) -> Optional[str]:
    if not file or not file.filename:
        print("[BLOG] No file provided")
        return None
    
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXT:
        raise HTTPException(status_code=400, detail=f"Invalid image format '{ext}'. Use jpg, png, gif, or webp.")
    
    print(f"[BLOG] Uploading to Cloudinary: {file.filename}")
    
    try:
        result = cloudinary.uploader.upload(file.file, folder="tego/blogs")
        print(f"[BLOG] Cloudinary upload success: {result['secure_url']}")
        return result["secure_url"]
    except Exception as e:
        print(f"[BLOG] ERROR uploading to Cloudinary: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")


@router.get("/", response_model=List[schemas.BlogPostResponse])
def get_posts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    posts = db.query(models.BlogPost).filter(models.BlogPost.is_published == True).order_by(models.BlogPost.created_at.desc()).offset(skip).limit(limit).all()
    return posts


@router.get("/{post_id}", response_model=schemas.BlogPostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(models.BlogPost).filter(models.BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.post("/", response_model=schemas.BlogPostResponse)
def create_post(
    title: str = Form(...),
    slug: str = Form(...),
    excerpt: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    author: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    is_published: Optional[bool] = Form(True),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    print(f"[BLOG] Creating post: title={title}, slug={slug}")
    
    try:
        image_url = save_image(image)
        print(f"[BLOG] image_url={image_url}")
    except Exception as e:
        print(f"[BLOG] Image save failed: {e}")
        raise
    
    db_post = models.BlogPost(
        title=title,
        slug=slug,
        excerpt=excerpt,
        content=content,
        author=author,
        category=category,
        is_published=is_published,
        image_url=image_url
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)
    print(f"[BLOG] Post created: id={db_post.id}")
    return db_post


@router.put("/{post_id}", response_model=schemas.BlogPostResponse)
def update_post(
    post_id: int,
    title: str = Form(...),
    slug: str = Form(...),
    excerpt: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    author: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    is_published: Optional[bool] = Form(True),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    print(f"[BLOG] Updating post {post_id}")
    
    db_post = db.query(models.BlogPost).filter(models.BlogPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    db_post.title = title
    db_post.slug = slug
    db_post.excerpt = excerpt
    db_post.content = content
    db_post.author = author
    db_post.category = category
    db_post.is_published = is_published
    
    if image:
        try:
            db_post.image_url = save_image(image)
        except Exception as e:
            print(f"[BLOG] Image update failed: {e}")
            raise
    
    db.commit()
    db.refresh(db_post)
    print(f"[BLOG] Post updated: id={db_post.id}")
    return db_post


@router.delete("/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db)):
    db_post = db.query(models.BlogPost).filter(models.BlogPost.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(db_post)
    db.commit()
    return {"message": "Post deleted successfully"}