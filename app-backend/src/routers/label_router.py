import os
import json
import shutil
from fastapi.responses import FileResponse
from tempfile import mkdtemp
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from src.database.database import get_db
from src.schemas import label as schemas
from src.models import label as models
from src.services.label_service import LabelService

router = APIRouter(prefix="/api/labels", tags=["labels"])

@router.post("", response_model=schemas.Label)
def create_label(label: schemas.LabelCreate, db: Session = Depends(get_db)):
    service = LabelService(db)
    # Check if this is a text-only label (no coordinates)
    is_text_only = all(v is None for v in [label.x, label.y, label.width, label.height])
    
    if is_text_only:
        return service.create_text_only_label(label.dict())
    return service.create_label(label.dict())

@router.get("/image/{image_id}", response_model=List[schemas.Label])
def get_image_labels(image_id: int, db: Session = Depends(get_db)):
    service = LabelService(db)
    return service.get_image_labels(image_id)

@router.put("/{label_id}", response_model=schemas.Label)
def update_label(label_id: int, label_update: schemas.LabelUpdate, db: Session = Depends(get_db)):
    service = LabelService(db)
    updated_label = service.update_label(label_id, label_update.dict(exclude_unset=True))
    if not updated_label:
        raise HTTPException(status_code=404, detail="Label not found")
    return updated_label

@router.delete("/{label_id}")
def delete_label(label_id: int, db: Session = Depends(get_db)):
    service = LabelService(db)
    if not service.delete_label(label_id):
        raise HTTPException(status_code=404, detail="Label not found")
    return {"status": "success"}

@router.delete("/image/{image_id}", response_model=dict)
def clean_image_labels(image_id: int, db: Session = Depends(get_db)):
    service = LabelService(db)
    deleted = service.clean_image_labels(image_id)
    return {"status": "success", "deleted_count": deleted}

@router.get("/project/{project_id}/export")
def export_project_dataset(project_id: int, db: Session = Depends(get_db)):
    service = LabelService(db)
    zip_path, filename = service.export_project_dataset(project_id)
    return FileResponse(
        zip_path,
        media_type='application/zip',
        filename=filename,
        background=shutil.rmtree(zip_path, ignore_errors=True)
    )