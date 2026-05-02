import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("MONGO_DB")
COLLECTION_NAME = os.getenv("MONGO_COLLECTION")
ADMIN_API_KEY = os.getenv("ADMIN_API_KEY")


def get_atlas_collection():
    """Devuelve la colección configurada en MongoDB Atlas o `None` si falta configuración."""
    if not (MONGO_URI and DB_NAME and COLLECTION_NAME):
        return None

    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
        return client, client[DB_NAME][COLLECTION_NAME]
    except Exception:
        return None

def get_profile_from_atlas():
    """Devuelve el documento del perfil desde MongoDB Atlas."""
    atlas = get_atlas_collection()
    if not atlas:
        return None

    client, collection = atlas
    try:
        doc = collection.find_one({})
    except Exception:
        client.close()
        return None
    finally:
        client.close()

    if not doc:
        return None

    if "_id" in doc:
        doc["_id"] = str(doc["_id"])

    return doc


def replace_profile_in_atlas(profile_data: dict) -> dict | None:
    """Reemplaza el documento del perfil en MongoDB Atlas y devuelve el documento guardado."""
    atlas = get_atlas_collection()
    if not atlas:
        return None

    client, collection = atlas
    try:
        profile_id = profile_data.get("id")
        if not profile_id:
            return None

        result = collection.replace_one({"id": profile_id}, profile_data, upsert=False)
        if result.matched_count == 0:
            return None

        updated_doc = collection.find_one({"id": profile_id})
        if updated_doc and "_id" in updated_doc:
            updated_doc["_id"] = str(updated_doc["_id"])
        return updated_doc
    except Exception:
        return None
    finally:
        client.close()
