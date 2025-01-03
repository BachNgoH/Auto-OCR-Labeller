from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..schemas import project as schemas
from ..models import project as models

router = APIRouter(prefix="/api/projects", tags=["projects"])

@router.post("/", response_model=schemas.Project)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    db_project = models.Project(**project.dict())
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/{project_id}", response_model=schemas.Project)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.get("/{project_id}/images", response_model=List[schemas.Image])
def get_project_images(project_id: int, db: Session = Depends(get_db)):
    images = db.query(models.Image).filter(models.Image.project_id == project_id).all()
    return images

@router.post("/{project_id}/images/upload")
async def upload_images(
    project_id: int,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    uploaded_images = []
    for file in files:
        # Save file to disk
        file_path = f"uploads/{file.filename}"
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Create image record
        db_image = models.Image(
            project_id=project_id,
            filename=file.filename,
            file_path=file_path
        )
        db.add(db_image)
        db.commit()
        db.refresh(db_image)
        uploaded_images.append(db_image)
    
    return {"uploaded": len(uploaded_images)}