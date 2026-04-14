from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class SesionStart(BaseModel):
    user_id: int
    ejercicios_id: int

class UserCreate(BaseModel):
    nombre: str
    password_hash: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True




class EjercicioResponse(BaseModel):
    id: int
    nombre: str
    descripcion: Optional[str]

    class Config:
        from_attributes = True



class SesionCreate(BaseModel):
    user_id: int
    ejercicios_id: int


class SesionResponse(BaseModel):
    id: int
    user_id: int
    ejercicios_id: int
    started_at: Optional[datetime]
    ended_at: Optional[datetime]
    total_reps: Optional[int]
    duracion_segundos: Optional[int]

    class Config:
        from_attributes = True

class SessionEnd(BaseModel):
    session_id: int



class RepeticionCreate(BaseModel):
    session_id: int
    rep_number: int
    quality_score: Optional[float] = None
    min_angle: Optional[float] = None
    max_angle: Optional[float] = None


class RepeticionResponse(BaseModel):
    id: int
    session_id: int
    rep_number: int
    quality_score: Optional[float]

    class Config:
        from_attributes = True


class PoseFrame(BaseModel):
    session_id: int
    rep_detected: bool


# ======================
# USER FACES
# ======================

class FaceRegister(BaseModel):
    user_id: int
    image_path: str
    embedding: List[float]


class FaceResponse(BaseModel):
    id: int
    user_id: int
    image_path: str

    class Config:
        from_attributes = True