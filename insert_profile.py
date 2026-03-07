import json
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("MONGO_DB")]
collection = db[os.getenv("MONGO_COLLECTION")]

with open("data/mirel_profile.json", "r", encoding="utf-8") as f:
    data = json.load(f)

collection.delete_many({})  # limpiar colección
collection.insert_one(data)

print("Perfil insertado correctamente en Atlas.")
