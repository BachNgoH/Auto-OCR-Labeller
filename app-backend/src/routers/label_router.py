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
from src.services.project_service import ProjectService

router = APIRouter(prefix="/api/labels", tags=["labels"])

@router.post("", response_model=schemas.Label)
def create_label(label: schemas.LabelCreate, db: Session = Depends(get_db)):
    # Check if this is a text-only label (no coordinates)
    is_text_only = all(v is None for v in [label.x, label.y, label.width, label.height])
    
    if is_text_only:
        print("Text-only label detected")
        # For text-only labels, delete any existing label for this image
        existing_label = db.query(models.Label).filter(
            models.Label.image_id == label.image_id
        ).first()
        print(existing_label)
        if existing_label:
            db.delete(existing_label)
            db.commit()
    
    # Create new label
    db_label = models.Label(**label.dict())
    db.add(db_label)
    db.commit()
    db.refresh(db_label)
    return db_label

@router.get("/image/{image_id}", response_model=List[schemas.Label])
def get_image_labels(image_id: int, db: Session = Depends(get_db)):
    labels = db.query(models.Label).filter(models.Label.image_id == image_id).all()
    print(labels)
    return labels

@router.put("/{label_id}", response_model=schemas.Label)
def update_label(
    label_id: int,
    label_update: schemas.LabelUpdate,
    db: Session = Depends(get_db)
):
    db_label = db.query(models.Label).filter(models.Label.id == label_id).first()
    if not db_label:
        raise HTTPException(status_code=404, detail="Label not found")
    
    for key, value in label_update.dict(exclude_unset=True).items():
        setattr(db_label, key, value)
    
    db.commit()
    db.refresh(db_label)
    return db_label

@router.delete("/{label_id}")
def delete_label(label_id: int, db: Session = Depends(get_db)):
    db_label = db.query(models.Label).filter(models.Label.id == label_id).first()
    if not db_label:
        raise HTTPException(status_code=404, detail="Label not found")
    
    db.delete(db_label)
    db.commit()
    return {"status": "success"}

@router.delete("/image/{image_id}", response_model=dict)
def clean_image_labels(image_id: int, db: Session = Depends(get_db)):
    """Delete all labels for a specific image"""
    deleted = db.query(models.Label).filter(models.Label.image_id == image_id).delete()
    db.commit()
    return {"status": "success", "deleted_count": deleted}

@router.get("/project/{project_id}/export")
def export_project_dataset(project_id: int, db: Session = Depends(get_db)):
    """Export project dataset in PaddleOCR format"""
    # Create temporary directory for export
    export_dir = mkdtemp()
    images_dir = os.path.join(export_dir, "images")
    labels_dir = os.path.join(export_dir, "labels")
    os.makedirs(images_dir)
    os.makedirs(labels_dir)

    # Get all images and their labels
    project_service = ProjectService(db)
    images = project_service.get_project_images(project_id)

    for image in images:
        # Copy image to export directory
        image_filename = os.path.basename(image.file_path)
        shutil.copy2(image.file_path, os.path.join(images_dir, image_filename))

        # Get labels for image
        labels = db.query(models.Label).filter(models.Label.image_id == image.id).all()
        
        # Create PaddleOCR format label
        label_data = {
            "transcription": "",
            "points": [],
            "difficult": False,
            "direction": 0
        }
        
        paddle_labels = []
        for label in labels:
            label_data = {
                "transcription": label.text,
                "points": [
                    [label.x, label.y],
                    [label.x + label.width, label.y],
                    [label.x + label.width, label.y + label.height],
                    [label.x, label.y + label.height]
                ],
                "difficult": False,
                "direction": 0
            }
            paddle_labels.append(label_data)

        # Save label file
        label_filename = os.path.splitext(image_filename)[0] + '.txt'
        with open(os.path.join(labels_dir, label_filename), 'w', encoding='utf-8') as f:
            json.dump(paddle_labels, f, ensure_ascii=False, indent=2)

    # Create zip file
    shutil.make_archive(export_dir, 'zip', export_dir)
    zip_path = f"{export_dir}.zip"

    # Clean up the temporary directory
    shutil.rmtree(export_dir)

    # Return the zip file
    return FileResponse(
        zip_path,
        media_type='application/zip',
        filename=f'project_{project_id}_dataset.zip',
        background=shutil.rmtree(zip_path, ignore_errors=True)
    )