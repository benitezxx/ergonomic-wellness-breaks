from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from datetime import datetime

# DB
from backend.database import SessionLocal
from backend.models import User, Ejercicio, SesionEntrenamiento, Repeticion

# Schemas
from backend.schemas import UserCreate, SesionStart, SessionEnd

# Redis (estado de repeticiones)
from backend.redis_client import get_session, set_session

# Servicios (tu lógica)
from backend.services.angle_service import calculate_angle
from backend.services.squat import validate_squat
from backend.services.state_machine import update_state

app = FastAPI()


# =========================
# DB DEPENDENCY
# =========================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================
# ROOT
# =========================
@app.get("/")
def root():
    return {"message": "Backend funcionando correctamente 🚀"}


# =========================
# USER
# =========================
@app.post("/user")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = User(
        nombre=user.nombre,
        password_hash=user.password_hash,
        created_at=datetime.now()
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# =========================
# EJERCICIOS
# =========================
@app.get("/ejercicios")
def get_ejercicios(db: Session = Depends(get_db)):
    ejercicios = db.query(Ejercicio).all()
    return ejercicios


# =========================
# INICIAR SESIÓN
# =========================
@app.post("/sesion_entrenamiento/start")
def start_session(data: SesionStart, db: Session = Depends(get_db)):

    session = SesionEntrenamiento(
        user_id=data.user_id,
        ejercicios_id=data.ejercicios_id,
        started_at=datetime.now(),
        total_reps=0
    )

    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "message": "Sesión iniciada",
        "session_id": session.id
    }


# =========================
# FINALIZAR SESIÓN
# =========================
@app.post("/sesion_entrenamiento/end")
def end_session(data: SessionEnd, db: Session = Depends(get_db)):

    session = db.query(SesionEntrenamiento).filter(
        SesionEntrenamiento.id == data.session_id
    ).first()

    if not session:
        return {"error": "Sesión no encontrada"}

    session.ended_at = datetime.now()

    duracion = session.ended_at - session.started_at
    session.duracion_segundos = int(duracion.total_seconds())

    db.commit()

    return {
        "message": "Sesión finalizada",
        "duracion_segundos": session.duracion_segundos,
        "total_reps": session.total_reps
    }


# =========================
# PROCESAR FRAME (IA)
# =========================
@app.post("/pose/frame")
def process_frame(data: dict, db: Session = Depends(get_db)):

    user_id = data.get("user_id")
    landmarks = data.get("landmarks", [])

    if not user_id or not landmarks:
        return {"error": "Datos incompletos"}

    # Estado en Redis
    state = get_session(user_id)

    if not state:
        state = {
            "current_state": "UP",
            "rep_count": 0,
            "valid_frames": 0
        }

    # Convertir landmarks
    lm_dict = {lm["name"]: lm for lm in landmarks}

    # Validación básica
    if not all(k in lm_dict for k in ["hip", "knee", "ankle"]):
        return {"error": "Faltan puntos clave"}

    knee_angle = calculate_angle(
        lm_dict["hip"],
        lm_dict["knee"],
        lm_dict["ankle"]
    )

    validation = validate_squat({"knee": knee_angle})

    updated_state = update_state(state, validation)

    set_session(user_id, updated_state)

    # Si se completó una repetición
    if updated_state.get("rep_completed"):

        session = db.query(SesionEntrenamiento).filter_by(
            user_id=user_id
        ).order_by(SesionEntrenamiento.id.desc()).first()

        if session:
            repetition = Repeticion(
                session_id=session.id,
                rep_number=updated_state["rep_count"],
                quality_score=1.0
            )

            session.total_reps = updated_state["rep_count"]

            db.add(repetition)
            db.commit()

    return {
        "rep_count": updated_state["rep_count"],
        "state": updated_state["current_state"],
        "knee_angle": knee_angle
    }