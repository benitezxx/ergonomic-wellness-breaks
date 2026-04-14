from sqlalchemy import Column, BigInteger, String, Integer, Float, Text, ForeignKey, JSON, TIMESTAMP
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "user"

    id = Column(BigInteger, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    password_hash = Column(Text)
    created_at = Column(TIMESTAMP)

    sesiones = relationship("SesionEntrenamiento", back_populates="usuario")
    rostros = relationship("UserFace", back_populates="usuario")


class Ejercicio(Base):
    __tablename__ = "ejercicios"

    id = Column(BigInteger, primary_key=True, index=True)
    nombre = Column(String(100))
    descripcion = Column(Text)
    created_at = Column(TIMESTAMP)

    sesiones = relationship("SesionEntrenamiento", back_populates="ejercicio")


class SesionEntrenamiento(Base):
    __tablename__ = "sesion_entrenamiento"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("user.id"))
    ejercicios_id = Column(BigInteger, ForeignKey("ejercicios.id"))

    started_at = Column(TIMESTAMP)
    ended_at = Column(TIMESTAMP)
    total_reps = Column(Integer)
    duracion_segundos = Column(Integer)

    usuario = relationship("User", back_populates="sesiones")
    ejercicio = relationship("Ejercicio", back_populates="sesiones")
    repeticiones = relationship("Repeticion", back_populates="sesion")


class Repeticion(Base):
    __tablename__ = "repeticiones"

    id = Column(BigInteger, primary_key=True, index=True)
    session_id = Column(BigInteger, ForeignKey("sesion_entrenamiento.id"))

    rep_number = Column(Integer)
    quality_score = Column(Float)
    min_angle = Column(Float)
    max_angle = Column(Float)

    sesion = relationship("SesionEntrenamiento", back_populates="repeticiones")


class UserFace(Base):
    __tablename__ = "user_faces"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("user.id"))

    image_path = Column(String(255))
    embedding = Column(JSON)
    created_at = Column(TIMESTAMP)

    usuario = relationship("User", back_populates="rostros")