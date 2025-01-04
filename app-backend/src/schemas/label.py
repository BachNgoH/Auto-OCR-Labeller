from pydantic import BaseModel

class LabelBase(BaseModel):
    text: str | None = None
    image_id: int
    x: float
    y: float
    width: float
    height: float

class LabelCreate(LabelBase):
    pass

class Label(LabelBase):
    id: int

    class Config:
        orm_mode = True

class LabelUpdate(BaseModel):
    text: str | None = None
    x: float | None = None
    y: float | None = None
    width: float | None = None
    height: float | None = None 