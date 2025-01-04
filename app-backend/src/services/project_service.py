from sqlalchemy.orm import Session
from typing import List
from src.interfaces.project_interface import IProjectRepository
from src.models.project import Project, Image

class ProjectService(IProjectRepository):
    def __init__(self, db: Session):
        self.db = db
    
    def create_project(self, project_data: dict) -> Project:
        db_project = Project(**project_data)
        self.db.add(db_project)
        self.db.commit()
        self.db.refresh(db_project)
        return db_project
    
    def get_project(self, project_id: int) -> Project:
        return self.db.query(Project).filter(Project.id == project_id).first()
    
    def get_project_images(self, project_id: int) -> List[Image]:
        return self.db.query(Image).filter(Image.project_id == project_id).all()
    
    def save_image(self, image_data: dict) -> Image:
        db_image = Image(**image_data)
        self.db.add(db_image)
        self.db.commit()
        self.db.refresh(db_image)
        return db_image 
    
    def get_projects(self):
        return self.db.query(Project).all() 