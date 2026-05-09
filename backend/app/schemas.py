from pydantic import BaseModel
from typing import Optional
from .models import Quadrant

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    quadrant: str = Quadrant.NOT_URGENT_NOT_IMPORTANT.value
    completed: bool = False

class TaskCreate(TaskBase):
    pass

class Task(TaskBase):
    id: int

    class Config:
        orm_mode = True
        from_attributes = True
