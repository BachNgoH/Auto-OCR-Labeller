from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base, TimeStampMixin

class Label(Base, TimeStampMixin):
    __tablename__ = "labels"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    image_id = Column(Integer, ForeignKey("images.id"))
    x = Column(Float)
    y = Column(Float)
    width = Column(Float)
    height = Column(Float)
    
    # Relationships
    image = relationship("Image", back_populates="labels") 