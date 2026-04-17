MIN_VALID_FRAMES = 3

def update_state(state, validation):
    current_state = state["current_state"]
    rep_count = state["rep_count"]
    valid_frames = state["valid_frames"]

    if validation["is_valid"]:
        valid_frames += 1
    else:
        valid_frames = 0

    rep_completed = False

    # Transición hacia abajo
    if validation["position"] == "DOWN" and current_state == "UP":
        current_state = "DOWN"

    # Transición hacia arriba = repetición completa
    if validation["position"] == "UP" and current_state == "DOWN":
        if valid_frames >= MIN_VALID_FRAMES:
            rep_count += 1
            rep_completed = True
        current_state = "UP"

    return {
        "current_state": current_state,
        "rep_count": rep_count,
        "valid_frames": valid_frames,
        "rep_completed": rep_completed
    }