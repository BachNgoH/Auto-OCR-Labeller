from pydantic import BaseModel
from datetime import datetime

class TimeStampSchema(BaseModel):
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 