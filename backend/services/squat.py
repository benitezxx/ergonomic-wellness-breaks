def validate_squat(angles):
    knee_angle = angles["knee"]

    if knee_angle > 160:
        position = "UP"
    elif knee_angle < 90:
        position = "DOWN"
    else:
        position = "TRANSITION"

    return {
        "position": position,
        "is_valid": True
    }