from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from src.database.database import get_db
from src.schemas import project as schemas
from src.models import project as models
from src.services.project_service import ProjectService

router = APIRouter(prefix="/api/projects", tags=["projects"])

@router.get("", response_model=List[schemas.Project])
def get_projects(db: Session = Depends(get_db)):
    project_service = ProjectService(db)
    return project_service.get_projects()

@router.post("", response_model=schemas.Project)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(get_db)):
    project_service = ProjectService(db)
    return project_service.create_project(project.dict())

@router.get("/{project_id}", response_model=schemas.Project)
def get_project(project_id: int, db: Session = Depends(get_db)):
    project_service = ProjectService(db)
    return project_service.get_project(project_id)

@router.get("/{project_id}/images", response_model=List[schemas.Image])
def get_project_images(project_id: int, db: Session = Depends(get_db)):
    project_service = ProjectService(db)
    return project_service.get_project_images(project_id)

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