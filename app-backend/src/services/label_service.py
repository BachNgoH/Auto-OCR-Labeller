from sqlalchemy.orm import Session
from typing import List
import os
import json
import shutil
from tempfile import mkdtemp
from ..interfaces.label_interface import ILabelRepository
from ..models.label import Label
from ..services.project_service import ProjectService

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

    def create_text_only_label(self, label_data: dict) -> Label:
        # Delete existing text-only label if it exists
        existing_label = self.db.query(Label).filter(
            Label.image_id == label_data['image_id']
        ).first()
        if existing_label:
            self.db.delete(existing_label)
            self.db.commit()
        
        return self.create_label(label_data)

    def clean_image_labels(self, image_id: int) -> int:
        deleted = self.db.query(Label).filter(Label.image_id == image_id).delete()
        self.db.commit()
        return deleted

    def export_project_dataset(self, project_id: int) -> tuple[str, str]:
        # Create temporary directory for export
        export_dir = mkdtemp()
        images_dir = os.path.join(export_dir, "images")
        labels_dir = os.path.join(export_dir, "labels")
        os.makedirs(images_dir)
        os.makedirs(labels_dir)

        # Get all images and their labels
        project_service = ProjectService(self.db)
        images = project_service.get_project_images(project_id)

        # Create a single labels file for text-only projects
        text_only_labels_file = os.path.join(labels_dir, 'labels.txt')
        text_only_file = None

        for image in images:
            # Copy image to export directory
            image_filename = os.path.basename(image.file_path)
            shutil.copy2(image.file_path, os.path.join(images_dir, image_filename))

            # Get labels for image
            labels = self.get_image_labels(image.id)

            project_type = self._get_project_type(labels)
            if project_type == "text_only":
                # Open the labels file in append mode if not already open
                if text_only_file is None:
                    text_only_file = open(text_only_labels_file, 'w', encoding='utf-8')
                
                # Export text-only labels
                text_only_labels = []
                for label in labels:
                    if label.x is None and label.y is None and label.width is None and label.height is None:
                        text_only_labels.append(label.text)
                
                # Write to single file
                text_only_file.write(f"{image_filename}\t" + "\t".join(text_only_labels) + "\n")
            else:
                # Export regular labels
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

        # Close the text-only labels file if it was opened
        if text_only_file is not None:
            text_only_file.close()

        # Create zip file
        shutil.make_archive(export_dir, 'zip', export_dir)
        zip_path = f"{export_dir}.zip"

        # Clean up the temporary directory
        shutil.rmtree(export_dir)

        return zip_path, f'project_{project_id}_dataset.zip' 
    
    def _get_project_type(self, labels: List[Label]) -> str:
        for label in labels:
            if label.x is None and label.y is None and label.width is None and label.height is None:
                return "text_only"
        return "regular"