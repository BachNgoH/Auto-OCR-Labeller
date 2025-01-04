from abc import ABC, abstractmethod
from typing import List
from ..models.project import Project, Image

class IProjectRepository(ABC):
    @abstractmethod
    def create_project(self, project_data: dict) -> Project:
        pass
    
    @abstractmethod
    def get_project(self, project_id: int) -> Project:
        pass
    
    @abstractmethod
    def get_project_images(self, project_id: int) -> List[Image]:
        pass
    
    @abstractmethod
    def save_image(self, image_data: dict) -> Image:
        pass 