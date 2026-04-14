import numpy as np

def calculate_angle(a, b, c):
    """
    Calcula el ángulo formado por tres puntos:
    a (hip), b (knee), c (ankle)
    """

    a = np.array([a["x"], a["y"]])
    b = np.array([b["x"], b["y"]])
    c = np.array([c["x"], c["y"]])

    ba = a - b
    bc = c - b

    cosine = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc))
    angle = np.degrees(np.arccos(cosine))

    return angle