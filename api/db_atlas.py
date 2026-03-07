import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("MONGO_DB")
COLLECTION_NAME = os.getenv("MONGO_COLLECTION")

def get_profile_from_atlas():
    """Devuelve el documento del perfil desde MongoDB Atlas."""
    if not (MONGO_URI and DB_NAME and COLLECTION_NAME):
        return None

    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
        collection = client[DB_NAME][COLLECTION_NAME]
        doc = collection.find_one({})
    except Exception:
        return None

    if not doc:
        return None

    if "_id" in doc:
        doc["_id"] = str(doc["_id"])

    return doc
