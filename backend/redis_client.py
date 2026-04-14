import redis
import json

# Conexión a Redis local
redis_client = redis.Redis(host="localhost", port=6379, decode_responses=True)


def get_session(user_id):
    data = redis_client.get(user_id)
    return json.loads(data) if data else None


def set_session(user_id, state):
    redis_client.set(user_id, json.dumps(state))