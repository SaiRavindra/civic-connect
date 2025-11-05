from pymongo import MongoClient
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from config import MONGO_URI, DB_NAME, COLLECTION

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
col = db[COLLECTION]

def fetch_complaints(since_days=None):
    """
    Returns pandas DataFrame of complaints.
    If since_days provided, fetch only last since_days.
    """
    print("Connecting to MongoDB:", MONGO_URI, DB_NAME, COLLECTION)

    query = {}
    if since_days is not None:
        since = datetime.utcnow() - timedelta(days=since_days)
        query["submittedAt"] = {"$gte": since}
    cursor = col.find(query)
    df = pd.DataFrame(list(cursor))
    if df.empty:
        return df
    df['submittedAt'] = pd.to_datetime(df['submittedAt'])
    df['severity'] = pd.to_numeric(df['severity'], errors='coerce').fillna(1)
    df['status'] = df['status'].fillna('Pending')
    # normalize fields
    df['ward'] = df['ward'].astype(str)
    df['location'] = df['location'].astype(str)
    df['issueType'] = df['issueType'].astype(str)
    return df

def make_daily_agg(df):
    """
    Return daily-aggregated DataFrame with columns:
    date, ward, location, daily_count, daily_avg_severity, daily_unresolved_count
    """
    if df.empty:
        return pd.DataFrame()
    df['date'] = df['submittedAt'].dt.floor('D')
    group = df.groupby(['ward', 'location', 'date']).agg(
        daily_count=('severity', 'count'),
        daily_avg_severity=('severity', 'mean'),
        daily_unresolved_count=('status', lambda s: (s == 'Pending').sum())
    ).reset_index()
    return group
