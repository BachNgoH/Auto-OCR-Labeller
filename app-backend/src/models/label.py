from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base, TimeStampMixin

class Label(Base, TimeStampMixin):
    __tablename__ = "labels"

    id = Column(Integer, primary_key=True, index=True)
    image_id = Column(Integer, ForeignKey("images.id"))
    x = Column(Float, nullable=True)
    y = Column(Float, nullable=True)
    width = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    text = Column(String)
    
    # Relationships
    image = relationship("Image", back_populates="labels") 