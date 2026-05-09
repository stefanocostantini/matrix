from sqlalchemy import Column, Integer, String, Boolean, Enum
import enum
from .database import Base

class Quadrant(enum.Enum):
    URGENT_IMPORTANT = "urgent_important"
    NOT_URGENT_IMPORTANT = "not_urgent_important"
    URGENT_NOT_IMPORTANT = "urgent_not_important"
    NOT_URGENT_NOT_IMPORTANT = "not_urgent_not_important"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, nullable=True)
    quadrant = Column(String, default=Quadrant.NOT_URGENT_NOT_IMPORTANT.value)
    completed = Column(Boolean, default=False)
