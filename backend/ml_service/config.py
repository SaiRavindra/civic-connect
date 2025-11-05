import os
from dotenv import load_dotenv
load_dotenv()
print("✅ ENV loaded:", os.getenv("MONGO_URI"), os.getenv("DB_NAME"))

MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")
DB_NAME = os.getenv("DB_NAME", "civicconnect")
COLLECTION = os.getenv("COLLECTION", "complaints")

MODEL_DIR = os.getenv("MODEL_DIR", "./models")
COUNT_MODEL_PATH = os.path.join(MODEL_DIR, "count_regressor.joblib")
ZONE_MODEL_PATH = os.path.join(MODEL_DIR, "zone_classifier.joblib")
META_PATH = os.path.join(MODEL_DIR, "meta.joblib")

ZONE_THRESHOLDS = {
    "red": float(os.getenv("ZONE_RED", 6.0)),
    "yellow": float(os.getenv("ZONE_YELLOW", 3.0)),
}
