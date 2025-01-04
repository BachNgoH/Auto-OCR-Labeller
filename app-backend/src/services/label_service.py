from sqlalchemy.orm import Session
from typing import List
from ..interfaces.label_interface import ILabelRepository
from ..models.label import Label

class LabelService(ILabelRepository):
    def __init__(self, db: Session):
        self.db = db
    
    def create_label(self, label_data: dict) -> Label:
        db_label = Label(**label_data)
        self.db.add(db_label)
        self.db.commit()
        self.db.refresh(db_label)
        return db_label
    
    def get_image_labels(self, image_id: int) -> List[Label]:
        return self.db.query(Label).filter(Label.image_id == image_id).all()
    
    def update_label(self, label_id: int, label_data: dict) -> Label:
        db_label = self.db.query(Label).filter(Label.id == label_id).first()
        if db_label:
            for key, value in label_data.items():
                setattr(db_label, key, value)
            self.db.commit()
            self.db.refresh(db_label)
        return db_label
    
    def delete_label(self, label_id: int) -> bool:
        db_label = self.db.query(Label).filter(Label.id == label_id).first()
        if db_label:
            self.db.delete(db_label)
            self.db.commit()
            return True
        return False 