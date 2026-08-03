"""
Expense prediction using simple linear regression over a user's
monthly expense history. This module is deliberately kept independent
of Flask — it takes plain data in, returns plain data out — so it can
be tested or reused without spinning up the whole web app.
"""

from datetime import date

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

# We require at least this many distinct months of expense history
# before attempting a prediction. Fewer than this, and a "trend" is
# not statistically meaningful — we'd just be drawing a line through
# noise and presenting it as insight, which is dishonest.
MINIMUM_MONTHS_REQUIRED = 3


def predict_next_month_expense(monthly_totals):
    """
    Takes a chronologically ordered list of monthly expense totals,
    e.g. [32000.0, 35000.0, 31000.0, 38000.0] (oldest to newest),
    and returns a prediction for the next month.

    Returns a dict:
        {
            "has_enough_data": bool,
            "predicted_amount": float | None,
            "trend_direction": "increasing" | "decreasing" | "stable" | None,
            "monthly_change": float | None,
            "months_used": int,
            "confidence": "low" | "medium" | "high" | None,
        }
    """
    months_used = len(monthly_totals)

    if months_used < MINIMUM_MONTHS_REQUIRED:
        return {
            "has_enough_data": False,
            "predicted_amount": None,
            "trend_direction": None,
            "monthly_change": None,
            "months_used": months_used,
            "confidence": None,
        }

    # Build a simple DataFrame: X is just "month index" (0, 1, 2, ...),
    # y is the actual expense total for that month. Linear regression
    # looks for the best-fit line y = m*X + b through these points.
    df = pd.DataFrame({
        "month_index": np.arange(months_used).reshape(-1),
        "total": monthly_totals,
    })

    # scikit-learn expects X as a 2D array (rows = samples, columns =
    # features) even when there's only one feature — hence the extra
    # dimension via [[...]] / reshape(-1, 1).
    X = df[["month_index"]].values
    y = df["total"].values

    model = LinearRegression()
    model.fit(X, y)

    # Predict for the NEXT month index, i.e. one past our last known month.
    next_month_index = np.array([[months_used]])
    predicted = model.predict(next_month_index)[0]

    # Never predict a negative expense total — mathematically the line
    # could dip below zero if spending was sharply decreasing, but a
    # negative expense prediction is nonsensical and would look like a bug.
    predicted = max(0, predicted)

    # model.coef_[0] is the slope 'm' — how much the trend line rises
    # (or falls) per month. This alone gives us a genuinely useful,
    # explainable number to show the user, independent of the prediction.
    monthly_change = float(model.coef_[0])

    if abs(monthly_change) < (sum(monthly_totals) / months_used) * 0.02:
        # Change is less than 2% of the average monthly spend — treat
        # as "stable" rather than reporting noise as a meaningful trend.
        trend_direction = "stable"
    elif monthly_change > 0:
        trend_direction = "increasing"
    else:
        trend_direction = "decreasing"

    # Confidence is a simple, honest heuristic based on how much history
    # we actually have — NOT based on any statistical goodness-of-fit
    # measure, which would be more sophisticated but also easier to
    # misrepresent to a non-technical user. More months = more confidence,
    # in three simple, clearly-defined bands.
    if months_used >= 6:
        confidence = "high"
    elif months_used >= 4:
        confidence = "medium"
    else:
        confidence = "low"

    return {
        "has_enough_data": True,
        "predicted_amount": round(float(predicted), 2),
        "trend_direction": trend_direction,
        "monthly_change": round(monthly_change, 2),
        "months_used": months_used,
        "confidence": confidence,
    }
