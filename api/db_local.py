import json
from pathlib import Path

def load_local_profile():
    json_path = Path(__file__).resolve().parents[1] / "data" / "mirel_profile.json"
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)
