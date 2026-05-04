from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# User schemas
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Project schemas
class ProjectBase(BaseModel):
    title: str
    slug: str
    summary: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    status: Optional[str] = "ongoing"
    location: Optional[str] = None
    beneficiaries: Optional[int] = 0

class ProjectCreate(ProjectBase):
    pass

class ProjectResponse(ProjectBase):
    id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Blog schemas
class BlogPostBase(BaseModel):
    title: str
    slug: str
    excerpt: Optional[str] = None
    content: Optional[str] = None
    author: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    is_published: Optional[bool] = True

class BlogPostCreate(BlogPostBase):
    pass

class BlogPostResponse(BlogPostBase):
    id: int
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Contact schemas
class ContactMessageBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str

class ContactMessageCreate(ContactMessageBase):
    pass

class ContactMessageResponse(ContactMessageBase):
    id: int
    is_read: bool
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Testimonial schemas
class TestimonialBase(BaseModel):
    name: str
    role: Optional[str] = None
    content: str
    image_url: Optional[str] = None
    is_active: Optional[bool] = True

class TestimonialCreate(TestimonialBase):
    pass

class TestimonialResponse(TestimonialBase):
    id: int
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Impact schemas
class ImpactMetricBase(BaseModel):
    label: str
    value: str
    icon: Optional[str] = None
    display_order: Optional[int] = 0
    is_active: Optional[bool] = True

class ImpactMetricCreate(ImpactMetricBase):
    pass

class ImpactMetricResponse(ImpactMetricBase):
    id: int
    
    class Config:
        from_attributes = True