from abc import ABC, abstractmethod
from typing import List
from ..models.label import Label

class ILabelRepository(ABC):
    @abstractmethod
    def create_label(self, label_data: dict) -> Label:
        pass
    
    @abstractmethod
    def get_image_labels(self, image_id: int) -> List[Label]:
        pass
    
    @abstractmethod
    def update_label(self, label_id: int, label_data: dict) -> Label:
        pass
    
    @abstractmethod
    def delete_label(self, label_id: int) -> bool:
        pass 