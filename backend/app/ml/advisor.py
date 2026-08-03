"""
Rule-based financial insight engine. Reads a user's budgets, transactions,
and category data, and produces a ranked list of plain-language insights.

Deliberately rule-based rather than LLM-based: every insight here is
directly traceable to a specific number computed from the user's real
data, which matters a lot for trust in a finance application. See the
Phase 13 discussion for the full reasoning behind this choice.
"""

SEVERITY_ORDER = {"critical": 0, "warning": 1, "info": 2}


def _insight(severity, title, message, category_name=None):
    return {
        "severity": severity,
        "title": title,
        "message": message,
        "category_name": category_name,
    }


def build_budget_insights(budgets):
    """
    budgets: list of dicts, each like
        {"category_name": "Dining", "limit_amount": 5000, "spent": 4800, "percent_used": 96.0}
    Flags budgets that are over, nearly over, or well under control.
    """
    insights = []

    for b in budgets:
        pct = b["percent_used"]
        name = b["category_name"]

        if pct >= 100:
            over_by = b["spent"] - b["limit_amount"]
            insights.append(_insight(
                "critical",
                f"Over budget: {name}",
                f"You've exceeded your {name} budget by ₹{over_by:,.2f} this month.",
                name,
            ))
        elif pct >= 85:
            insights.append(_insight(
                "warning",
                f"Approaching limit: {name}",
                f"You've used {pct:.0f}% of your {name} budget for this month.",
                name,
            ))
        elif pct <= 30 and pct > 0:
            insights.append(_insight(
                "info",
                f"On track: {name}",
                f"You've only used {pct:.0f}% of your {name} budget so far — well within limit.",
                name,
            ))

    return insights


def build_trend_insights(category_month_changes):
    """
    category_month_changes: list of dicts, each like
        {"category_name": "Shopping", "current": 8000, "previous": 4000}
    Flags categories with a large month-over-month jump.
    """
    insights = []

    for c in category_month_changes:
        prev = c["previous"]
        curr = c["current"]
        name = c["category_name"]

        if prev == 0:
            continue  # no baseline to compare against — skip rather than show a meaningless "infinite% increase"

        change_pct = ((curr - prev) / prev) * 100

        if change_pct >= 50:
            insights.append(_insight(
                "warning",
                f"Spending spike: {name}",
                f"Your {name} spending is up {change_pct:.0f}% compared to last month "
                f"(₹{prev:,.2f} → ₹{curr:,.2f}).",
                name,
            ))
        elif change_pct <= -50:
            insights.append(_insight(
                "info",
                f"Spending drop: {name}",
                f"Your {name} spending is down {abs(change_pct):.0f}% compared to last month. Nice work.",
                name,
            ))

    return insights


def build_concentration_insight(category_totals, total_expenses):
    """
    category_totals: list of dicts like {"category_name": "Rent", "total": 15000}
    Flags if one category dominates overall spending — useful for
    identifying where a budget would have the most impact.
    """
    if not category_totals or total_expenses <= 0:
        return []

    top = max(category_totals, key=lambda c: c["total"])
    share = (top["total"] / total_expenses) * 100

    if share >= 40:
        return [_insight(
            "info",
            f"{top['category_name']} is your biggest expense",
            f"{top['category_name']} makes up {share:.0f}% of your total spending. "
            f"Setting a budget here could have the biggest impact.",
            top["category_name"],
        )]

    return []


def build_savings_rate_insight(total_income, total_expenses):
    """
    Flags overall financial health based on how much of income is
    actually being retained, not spent.
    """
    if total_income <= 0:
        return []

    savings_rate = ((total_income - total_expenses) / total_income) * 100

    if savings_rate < 0:
        return [_insight(
            "critical",
            "Spending more than you earn",
            f"Your expenses currently exceed your income by ₹{abs(total_income - total_expenses):,.2f}.",
        )]
    elif savings_rate < 10:
        return [_insight(
            "warning",
            "Low savings rate",
            f"You're saving about {savings_rate:.0f}% of your income. "
            f"Financial experts commonly suggest aiming for 20% or more.",
        )]
    elif savings_rate >= 30:
        return [_insight(
            "info",
            "Strong savings rate",
            f"You're saving about {savings_rate:.0f}% of your income — well above average. Keep it up.",
        )]

    return []


def generate_insights(budgets, category_month_changes, category_totals, total_income, total_expenses, max_insights=6):
    """
    Combines every rule above into one ranked, capped list.
    Ranking: critical insights first, then warnings, then info —
    within the same severity, insertion order is preserved (each
    builder function already produces its most relevant results first).
    """
    all_insights = (
        build_budget_insights(budgets)
        + build_savings_rate_insight(total_income, total_expenses)
        + build_trend_insights(category_month_changes)
        + build_concentration_insight(category_totals, total_expenses)
    )

    all_insights.sort(key=lambda i: SEVERITY_ORDER[i["severity"]])

    return all_insights[:max_insights]