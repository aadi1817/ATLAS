"""
Budget Estimator Service
Provides rough budget validation and sanity checks on LLM-generated budgets.
"""
from typing import Optional
from app.schemas.trip import BudgetBreakdown


# Very rough per-person-per-day estimates in INR for common destinations
DESTINATION_COST_HINTS = {
    "goa": {"budget": 2000, "mid_range": 4000, "luxury": 10000},
    "bali": {"budget": 2500, "mid_range": 5000, "luxury": 15000},
    "manali": {"budget": 1500, "mid_range": 3000, "luxury": 8000},
    "jaipur": {"budget": 1500, "mid_range": 3000, "luxury": 8000},
    "tokyo": {"budget": 5000, "mid_range": 9000, "luxury": 20000},
    "bangkok": {"budget": 2000, "mid_range": 4500, "luxury": 12000},
    "kerala": {"budget": 2000, "mid_range": 4000, "luxury": 10000},
    "ladakh": {"budget": 2500, "mid_range": 5000, "luxury": 12000},
    "paris": {"budget": 8000, "mid_range": 15000, "luxury": 35000},
    "london": {"budget": 9000, "mid_range": 18000, "luxury": 40000},
}


def validate_budget(
    budget: BudgetBreakdown,
    destination: str,
    duration_days: int,
    travelers: int,
    accommodation_pref: str = "mid_range",
) -> BudgetBreakdown:
    """
    Sanity-check the LLM-generated budget.
    If the total is wildly off, log a warning but still return it
    (we trust the LLM's context more than our rough table).
    """
    dest_lower = destination.lower()
    hint = None
    for key, costs in DESTINATION_COST_HINTS.items():
        if key in dest_lower:
            hint = costs
            break

    if hint:
        pref_key = accommodation_pref if accommodation_pref in hint else "mid_range"
        rough_per_person_per_day = hint[pref_key]
        rough_total = rough_per_person_per_day * duration_days * travelers

        # If LLM total is more than 5x our rough estimate, add a note
        if budget.total > rough_total * 5:
            budget.note = "Note: Budget seems high — please verify with actual prices."
        elif budget.total < rough_total * 0.2:
            budget.note = "Note: Budget seems low — actual costs may be higher."

    return budget


def get_budget_breakdown_from_user(
    total_budget: int,
    duration_days: int,
    travelers: int,
    currency: str = "INR",
) -> BudgetBreakdown:
    """
    If LLM doesn't provide a breakdown, generate a reasonable split.
    Standard travel budget allocation: 40% accommodation, 25% food,
    20% transport, 10% activities, 5% misc.
    """
    accommodation = int(total_budget * 0.40)
    food = int(total_budget * 0.25)
    transport = int(total_budget * 0.20)
    activities = int(total_budget * 0.10)
    misc = total_budget - accommodation - food - transport - activities

    return BudgetBreakdown(
        accommodation=accommodation,
        food=food,
        transport=transport,
        activities=activities,
        miscellaneous=misc,
        total=total_budget,
        currency=currency,
        note="AI-generated estimates only — not live prices",
    )
