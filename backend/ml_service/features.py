import pandas as pd
import numpy as np

def build_features_for_window(daily_df, ward, location, ref_date, lookback_days=30, horizon_days=30):
    """
    Build features for one (ward,location,ref_date) using daily_df aggregated by date.
    Features are computed from (ref_date - lookback_days, ref_date)
    Target is summed counts in (ref_date, ref_date + horizon_days]
    """
    start = ref_date - pd.Timedelta(days=lookback_days)
    end_target = ref_date + pd.Timedelta(days=horizon_days)

    # Filter daily rows
    mask_hist = (daily_df['date'] > start) & (daily_df['date'] <= ref_date) & (daily_df['ward'] == ward) & (daily_df['location'] == location)
    hist = daily_df.loc[mask_hist]

    mask_target = (daily_df['date'] > ref_date) & (daily_df['date'] <= end_target) & (daily_df['ward'] == ward) & (daily_df['location'] == location)
    targ = daily_df.loc[mask_target]

    # Basic features
    total_complaints = hist['daily_count'].sum()
    avg_severity = hist['daily_avg_severity'].mean() if not hist.empty else 0.0
    unresolved = hist['daily_unresolved_count'].sum()
    pct_unresolved = unresolved / (total_complaints + 1e-6)

    # Growth rate between early and late half of the period
    hist_sorted = hist.sort_values('date')
    half = len(hist_sorted) // 2
    first_sum = hist_sorted.head(half)['daily_count'].sum() if half > 0 else total_complaints
    last_sum = hist_sorted.tail(len(hist_sorted)-half)['daily_count'].sum() if len(hist_sorted)-half > 0 else total_complaints
    growth_rate = (last_sum - first_sum) / (first_sum + 1e-6)

    features = {
        'ward': ward,
        'location': location,
        'ref_date': ref_date,
        'total_complaints': total_complaints,
        'avg_severity': avg_severity,
        'pct_unresolved': pct_unresolved,
        'growth_rate': growth_rate
    }

    # Target (next-period values)
    target_count = targ['daily_count'].sum()
    target_avg_severity = targ['daily_avg_severity'].mean() if not targ.empty else 0.0

    return features, target_count, target_avg_severity
