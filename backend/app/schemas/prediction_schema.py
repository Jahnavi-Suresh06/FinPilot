from marshmallow import fields

from app.extensions import ma


class ExpensePredictionSchema(ma.Schema):
    """Shape of GET /api/ai/predict-expense."""

    has_enough_data = fields.Boolean()
    predicted_amount = fields.Float(allow_none=True)
    trend_direction = fields.String(allow_none=True)
    monthly_change = fields.Float(allow_none=True)
    months_used = fields.Integer()
    confidence = fields.String(allow_none=True)
    minimum_months_required = fields.Integer()


expense_prediction_schema = ExpensePredictionSchema()
