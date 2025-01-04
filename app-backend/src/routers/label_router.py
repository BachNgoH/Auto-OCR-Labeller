from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from src.database.database import get_db
from src.schemas import label as schemas
from src.models import label as models

router = APIRouter(prefix="/api/labels", tags=["labels"])

@router.post("/", response_model=schemas.Label)
def create_label(label: schemas.LabelCreate, db: Session = Depends(get_db)):
    db_label = models.Label(**label.dict())
    db.add(db_label)
    db.commit()
    db.refresh(db_label)
    return db_label

@router.get("/image/{image_id}", response_model=List[schemas.Label])
def get_image_labels(image_id: int, db: Session = Depends(get_db)):
    labels = db.query(models.Label).filter(models.Label.image_id == image_id).all()
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