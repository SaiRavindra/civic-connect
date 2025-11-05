from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from pymongo import MongoClient
import joblib, os
import pandas as pd
from config import MONGO_URI, DB_NAME, COLLECTION, COUNT_MODEL_PATH, ZONE_MODEL_PATH, META_PATH, MODEL_DIR, ZONE_THRESHOLDS
from data_fetch import fetch_complaints, make_daily_agg
from features import build_features_for_window
from datetime import datetime

app = FastAPI()
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
col = db[COLLECTION]

# Load models if exist
def load_models():
    meta = joblib.load(META_PATH) if os.path.exists(META_PATH) else None
    reg = joblib.load(COUNT_MODEL_PATH) if os.path.exists(COUNT_MODEL_PATH) else None
    clf = joblib.load(ZONE_MODEL_PATH) if os.path.exists(ZONE_MODEL_PATH) else None
    return reg, clf, meta

reg_model, clf_model, meta = load_models()

@app.post("/train")
def train(background_tasks: BackgroundTasks):
    """
    Trigger training in background. For demo: runs train_backtest.py (imported).
    """
    def _train_job():
        # import locally to avoid circular import
        import subprocess, sys
        subprocess.run([sys.executable, "train_backtest.py"], cwd=os.getcwd())
        # reload models
        reg_model, clf_model, meta = load_models()

    background_tasks.add_task(_train_job)
    return {"status": "training started"}

@app.get("/top-complaints")
def top_complaints(location: str = None, top_n: int = 5):
    match = {}
    if location:
        match['location'] = location
    pipeline = [
        {"$match": match},
        {"$group": {"_id": {"location": "$location", "issueType": "$issueType"}, "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$group": {"_id": "$_id.location", "topIssues": {"$push": {"issueType": "$_id.issueType", "count": "$count"}}}},
        {"$project": {"location": "$_id", "topIssues": {"$slice": ["$topIssues", top_n]}, "_id": 0}}
    ]
    results = list(col.aggregate(pipeline))
    return results

@app.get("/predict-counts")
def predict_counts(location: str = None):
    reg, clf, meta_local = load_models()
    if reg is None or meta_local is None:
        raise HTTPException(status_code=400, detail="Models not trained yet. Call /train first.")
    df_raw = fetch_complaints(since_days=365)
    if location:
        df_raw = df_raw[df_raw['location'] == location]
    df_daily = make_daily_agg(df_raw)
    if df_daily.empty:
        return []
    # prepare latest feature for each ward-location using now as ref_date
    features = []
    wards = df_daily[['ward','location']].drop_duplicates()
    ref_date = df_raw['submittedAt'].max().floor('D')
    for _, r in wards.iterrows():
        ward = r['ward']; loc = r['location']
        feat, _, _ = build_features_for_window(df_daily, ward, loc, ref_date, lookback_days=30, horizon_days=30)
        features.append(feat)
    feat_df = pd.DataFrame(features).fillna(0)
    # add issue-type percentage features (replicate logic used in training)
    # For speed, naive compute here:
    issue_types = df_raw['issueType'].unique().tolist()
    for it in issue_types:
        colname = f'issue_{it}'
        feat_df[colname] = 0.0
    for idx, row in feat_df.iterrows():
        ward=row['ward']; loc=row['location']; ref = row['ref_date']
        start = ref - pd.Timedelta(days=30)
        mask = (df_raw['submittedAt'].dt.floor('D') > start) & (df_raw['submittedAt'].dt.floor('D') <= ref) & (df_raw['ward']==ward) & (df_raw['location']==loc)
        sub = df_raw.loc[mask]
        total = len(sub)
        for it in issue_types:
            feat_df.at[idx, f'issue_{it}'] = (sub['issueType']==it).sum() / (total + 1e-6)

    X = feat_df[meta_local['feature_cols']].fillna(0).values
    preds = reg.predict(X)
    feat_df['predicted_count_next_30d'] = preds
    return feat_df[['ward','location','predicted_count_next_30d']].to_dict(orient='records')

# @app.get("/predict-zones")
# def predict_zones(location: str = None):
#     reg, clf, meta_local = load_models()
#     if clf is None or meta_local is None:
#         raise HTTPException(status_code=400, detail="Models not trained yet. Call /train first.")
#     df_raw = fetch_complaints(since_days=365)
#     if location:
#         df_raw = df_raw[df_raw['location'] == location]
#     df_daily = make_daily_agg(df_raw)
#     if df_daily.empty:
#         return []
#     features = []
#     wards = df_daily[['ward','location']].drop_duplicates()
#     ref_date = df_raw['submittedAt'].max().floor('D')
#     for _, r in wards.iterrows():
#         ward = r['ward']; loc = r['location']
#         feat, _, _ = build_features_for_window(df_daily, ward, loc, ref_date, lookback_days=30, horizon_days=30)
#         features.append(feat)
#     feat_df = pd.DataFrame(features).fillna(0)
#     issue_types = df_raw['issueType'].unique().tolist()
#     for it in issue_types:
#         colname = f'issue_{it}'
#         feat_df[colname] = 0.0
#     for idx, row in feat_df.iterrows():
#         ward=row['ward']; loc=row['location']; ref = row['ref_date']
#         start = ref - pd.Timedelta(days=30)
#         mask = (df_raw['submittedAt'].dt.floor('D') > start) & (df_raw['submittedAt'].dt.floor('D') <= ref) & (df_raw['ward']==ward) & (df_raw['location']==loc)
#         sub = df_raw.loc[mask]
#         total = len(sub)
#         for it in issue_types:
#             feat_df.at[idx, f'issue_{it}'] = (sub['issueType']==it).sum() / (total + 1e-6)

#     X = feat_df[meta_local['feature_cols']].fillna(0).values
#     y_pred = clf.predict(X)
#     inv_map = {int(k): v for k, v in meta_local['label_mapping'].items()}
#     feat_df['predicted_zone'] = [inv_map[int(x)] for x in y_pred]
#     # For convenience also return predicted numeric severity via regression surrogate if reg available:
#     if reg:
#         feat_df['predicted_avg_severity_next_30d'] = feat_df['avg_severity'] * 1.05
#     else:
#         feat_df['predicted_avg_severity_next_30d'] = feat_df['avg_severity']
#     return feat_df[['ward','location','predicted_zone','predicted_avg_severity_next_30d']].to_dict(orient='records')

@app.get("/predict-zones")
def predict_zones(location: str = None):
    reg, clf, meta_local = load_models()
    if clf is None or meta_local is None:
        raise HTTPException(status_code=400, detail="Models not trained yet. Call /train first.")

    df_raw = fetch_complaints(since_days=365)
    if location:
        df_raw = df_raw[df_raw['location'] == location]
    df_daily = make_daily_agg(df_raw)
    if df_daily.empty:
        return []

    features = []
    wards = df_daily[['ward','location']].drop_duplicates()
    ref_date = df_raw['submittedAt'].max().floor('D')

    for _, r in wards.iterrows():
        ward = r['ward']; loc = r['location']
        feat, _, _ = build_features_for_window(df_daily, ward, loc, ref_date, lookback_days=30, horizon_days=30)
        features.append(feat)

    feat_df = pd.DataFrame(features).fillna(0)

    # 🔹 Include issue-type features like in training
    issue_types = df_raw['issueType'].unique().tolist()
    for it in issue_types:
        colname = f'issue_{it}'
        feat_df[colname] = 0.0
    for idx, row in feat_df.iterrows():
        ward=row['ward']; loc=row['location']; ref = row['ref_date']
        start = ref - pd.Timedelta(days=30)
        mask = (
            (df_raw['submittedAt'].dt.floor('D') > start)
            & (df_raw['submittedAt'].dt.floor('D') <= ref)
            & (df_raw['ward']==ward)
            & (df_raw['location']==loc)
        )
        sub = df_raw.loc[mask]
        total = len(sub)
        for it in issue_types:
            feat_df.at[idx, f'issue_{it}'] = (sub['issueType']==it).sum() / (total + 1e-6)

    # Run classifier model
    X = feat_df[meta_local['feature_cols']].fillna(0).values
    y_pred = clf.predict(X)
    inv_map = {int(k): v for k, v in meta_local['label_mapping'].items()}

    feat_df['predicted_zone'] = [inv_map[int(x)] for x in y_pred]
    feat_df['predicted_avg_severity_next_30d'] = feat_df['avg_severity'] * 1.05

    # 🔧 FIX HERE — enforce proper zone color thresholds
    def assign_zone(sev):
        if sev >= ZONE_THRESHOLDS["red"]:
            return "Red"
        elif sev >= ZONE_THRESHOLDS["yellow"]:
            return "Yellow"
        else:
            return "Blue"

    # Apply manual override based on severity thresholds
    feat_df['predicted_zone'] = feat_df['predicted_avg_severity_next_30d'].apply(assign_zone)

    # ✅ Return results
    return feat_df[['ward','location','predicted_zone','predicted_avg_severity_next_30d']].to_dict(orient='records')


# --------------------------------------
# 🔹 Top Complaint by Ward (Real Data)
# --------------------------------------
@app.get("/top-complaints-by-ward")
def top_complaints_by_ward(location: str = None):
    """
    Returns top complaint type in each ward (based on count)
    Example: [{"ward": "Ward 1", "topIssue": "Garbage", "count": 45}, ...]
    """
    match = {}
    if location:
        match["location"] = location

    pipeline = [
        {"$match": match},
        {"$group": {
            "_id": {"ward": "$ward", "issueType": "$issueType"},
            "count": {"$sum": 1}
        }},
        {"$sort": {"count": -1}},
        {"$group": {
            "_id": "$_id.ward",
            "topIssue": {"$first": "$_id.issueType"},
            "count": {"$first": "$count"}
        }},
        {"$project": {
            "_id": 0,
            "ward": "$_id",
            "topIssue": 1,
            "count": 1
        }}
    ]

    results = list(col.aggregate(pipeline))
    return results
