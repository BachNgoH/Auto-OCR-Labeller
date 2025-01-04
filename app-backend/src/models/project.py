from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base, TimeStampMixin

class Project(Base, TimeStampMixin):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    
    # Relationships
    images = relationship("Image", back_populates="project", cascade="all, delete-orphan")

class Image(Base, TimeStampMixin):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    
    # Relationships
    project = relationship("Project", back_populates="images")
    labels = relationship("Label", back_populates="image", cascade="all, delete-orphan") 