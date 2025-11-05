import os
import joblib
import numpy as np
import pandas as pd
from tqdm import tqdm
from datetime import timedelta
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import mean_absolute_error, mean_squared_error, accuracy_score, f1_score
from data_fetch import fetch_complaints, make_daily_agg
from features import build_features_for_window
from config import MODEL_DIR, COUNT_MODEL_PATH, ZONE_MODEL_PATH, META_PATH, ZONE_THRESHOLDS

os.makedirs(MODEL_DIR, exist_ok=True)

from data_fetch import fetch_complaints
print("🔍 Testing DB connection...")
df = fetch_complaints()
print("Total complaints found:", len(df))
print(df.head())


def create_rolling_dataset(df_daily, lookback_days=30, horizon_days=30, step_days=7):
    """
    Iterate over wards & locations, produce dataset rows using sliding windows.
    """
    rows = []
    wards_locs = df_daily[['ward','location']].drop_duplicates()
    min_date = df_daily['date'].min()
    max_date = df_daily['date'].max()

    for _, r in wards_locs.iterrows():
        ward = r['ward']; location = r['location']
        # start ref_date at min_date + lookback, end at max_date - horizon
        ref_date = min_date + pd.Timedelta(days=lookback_days)
        last_ref = max_date - pd.Timedelta(days=horizon_days)
        while ref_date <= last_ref:
            feat, tgt_count, tgt_avg_sev = build_features_for_window(df_daily, ward, location, ref_date, lookback_days, horizon_days)
            feat_row = feat.copy()
            feat_row['target_count'] = tgt_count
            feat_row['target_avg_sev'] = tgt_avg_sev
            rows.append(feat_row)
            ref_date += pd.Timedelta(days=step_days)
    return pd.DataFrame(rows)

def add_issue_type_features(df_raw, df_feat, lookback_days=30):
    """
    Add issueType percentage features by recomputing on raw df for each (ward,location,ref_date).
    """
    df_raw['date'] = df_raw['submittedAt'].dt.floor('D')
    issue_types = df_raw['issueType'].unique().tolist()

    def issue_pct_for_row(row):
        ward = row['ward']; location = row['location']; ref = row['ref_date']
        start = ref - pd.Timedelta(days=lookback_days)
        mask = (df_raw['date'] > start) & (df_raw['date'] <= ref) & (df_raw['ward']==ward) & (df_raw['location']==location)
        sub = df_raw.loc[mask]
        total = len(sub)
        d = {}
        for it in issue_types:
            d[f'issue_{it}'] = (sub['issueType'] == it).sum() / (total + 1e-6)
        return pd.Series(d)

    issue_df = df_feat.apply(issue_pct_for_row, axis=1)
    return pd.concat([df_feat.reset_index(drop=True), issue_df.reset_index(drop=True)], axis=1)

def zone_from_severity(avg_sev, thresholds=ZONE_THRESHOLDS):
    if avg_sev >= thresholds['red']:
        return 'Red'
    if avg_sev >= thresholds['yellow']:
        return 'Yellow'
    return 'Blue'

def train_and_evaluate(df_raw, lookback_days=30, horizon_days=30, step_days=7):
    df_daily = make_daily_agg(df_raw)
    if df_daily.empty:
        print("No daily data.")
        return
    dataset = create_rolling_dataset(df_daily, lookback_days, horizon_days, step_days)
    dataset = add_issue_type_features(df_raw, dataset, lookback_days)

    # drop rows with no history (total_complaints==0 and no issue signal)
    dataset = dataset[~(dataset['total_complaints']==0)]

    # Prepare targets
    dataset['zone'] = dataset['target_avg_sev'].apply(lambda s: zone_from_severity(s))
    # features cols
    feature_cols = [c for c in dataset.columns if c not in ['ward','location','ref_date','target_count','target_avg_sev','zone']]

    X = dataset[feature_cols].fillna(0).values
    y_reg = dataset['target_count'].values
    y_clf = dataset['zone'].astype('category').cat.codes.values
    label_mapping = dict(enumerate(dataset['zone'].astype('category').cat.categories))

    # split (simple): use last 20% by ref_date as test (time-based split)
    dataset_sorted = dataset.sort_values('ref_date').reset_index(drop=True)
    split_idx = int(len(dataset_sorted) * 0.8)
    X_train = dataset_sorted.loc[:split_idx-1, feature_cols].fillna(0).values
    y_reg_train = dataset_sorted.loc[:split_idx-1, 'target_count'].values
    y_clf_train = dataset_sorted.loc[:split_idx-1, 'zone'].astype('category').cat.codes.values

    X_test = dataset_sorted.loc[split_idx:, feature_cols].fillna(0).values
    y_reg_test = dataset_sorted.loc[split_idx:, 'target_count'].values
    y_clf_test = dataset_sorted.loc[split_idx:, 'zone'].astype('category').cat.codes.values

    # Train regression
    reg = LinearRegression()
    reg.fit(X_train, y_reg_train)
    preds_reg = reg.predict(X_test)
    mae = mean_absolute_error(y_reg_test, preds_reg)
    rmse = np.sqrt(mean_squared_error(y_reg_test, preds_reg))
    print(f"Regression MAE: {mae:.3f}  RMSE: {rmse:.3f}")

    # Train classifier
    clf = RandomForestClassifier(n_estimators=150, random_state=42)
    clf.fit(X_train, y_clf_train)
    preds_clf = clf.predict(X_test)
    acc = accuracy_score(y_clf_test, preds_clf)
    f1 = f1_score(y_clf_test, preds_clf, average='weighted')
    print(f"Classifier Accuracy: {acc:.3f}  F1-weighted: {f1:.3f}")

    # Save models and metadata
    joblib.dump(reg, COUNT_MODEL_PATH)
    joblib.dump(clf, ZONE_MODEL_PATH)
    joblib.dump({'label_mapping': label_mapping, 'feature_cols': feature_cols}, META_PATH)
    print("Saved models to", MODEL_DIR)

if __name__ == "__main__":
    print("Fetching raw complaints (last 365 days)...")
    df = fetch_complaints(since_days=365)
    if df.empty:
        print("No complaints found.")
        exit(1)
    train_and_evaluate(df, lookback_days=30, horizon_days=30, step_days=7)
