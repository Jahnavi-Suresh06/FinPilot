from marshmallow import fields

from app.extensions import ma


class InsightSchema(ma.Schema):
    severity = fields.String()
    title = fields.String()
    message = fields.String()
    category_name = fields.String(allow_none=True)


class InsightsResponseSchema(ma.Schema):
    insights = fields.List(fields.Nested(InsightSchema))
    generated_at = fields.String()


insights_response_schema = InsightsResponseSchema()
