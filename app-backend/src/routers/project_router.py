from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List, Literal
from src.database.database import get_db
from src.schemas import project as schemas
from src.models import project as models
from src.services.project_service import ProjectService
from src.services.text_recognition_service import TextRecognitionService
from src.services.label_service import LabelService

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

@router.post("/{project_id}/images/{image_id}/detect-text")
async def detect_text(
    project_id: int,
    image_id: int,
    engine: Literal["easyocr", "paddle"] = "easyocr",
    db: Session = Depends(get_db)
):
    project_service = ProjectService(db)
    image = project_service.get_image(image_id)
    if not image or image.project_id != project_id:
        raise HTTPException(status_code=404, detail="Image not found in project")

    # Process image and create labels
    text_recognition = TextRecognitionService(engine=engine)
    detected_labels = text_recognition.process_image(image.file_path)
    
    # Save labels
    label_service = LabelService(db)
    created_labels = []
    for label_data in detected_labels:
        label_data['image_id'] = image_id
        created_labels.append(label_service.create_label(label_data))
    
    return created_labels

@router.delete("/{project_id}/labels", response_model=dict)
def clean_project_labels(project_id: int, db: Session = Depends(get_db)):
    """Delete all labels for a specific project"""
    # Get all images in the project
    project_service = ProjectService(db)
    images = project_service.get_project_images(project_id)
    
    # Delete all labels for each image
    deleted_count = 0
    for image in images:
        deleted = db.query(models.Label).filter(models.Label.image_id == image.id).delete()
        deleted_count += deleted
    
    db.commit()
    return {"status": "success", "deleted_count": deleted_count}