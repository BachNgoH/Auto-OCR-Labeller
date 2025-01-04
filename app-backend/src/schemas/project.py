from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from .base import TimeStampSchema

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase, TimeStampSchema):
    id: int

    class Config:
        from_attributes = True

class ImageBase(BaseModel):
    filename: str
    file_path: str
    project_id: int

class ImageCreate(ImageBase):
    pass

class Image(ImageBase, TimeStampSchema):
    id: int

    class Config:
        from_attributes = True 