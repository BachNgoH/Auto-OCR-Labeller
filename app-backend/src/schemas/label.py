from pydantic import BaseModel
from typing import List

class LabelBase(BaseModel):
    text: str | None = None
    image_id: int
    x: float
    y: float
    width: float
    height: float

class LabelCreate(BaseModel):
    image_id: int
    x: float
    y: float
    width: float
    height: float
    text: str

class Label(LabelCreate):
    id: int

    class Config:
        orm_mode = True

class LabelUpdate(BaseModel):
    text: str | None = None
    x: float | None = None
    y: float | None = None
    width: float | None = None
    height: float | None = None 