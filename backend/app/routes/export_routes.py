import csv
import io
from datetime import date

from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from app.extensions import db
from app.models.transaction import Transaction
from app.models.category import Category
from sqlalchemy import func, extract

export_bp = Blueprint("export", __name__, url_prefix="/api/export")


def _get_filtered_transactions(user_id):
    """
    Reuses the same filter conventions as transaction_routes.py's
    GET /api/transactions (type, category_id, start_date, end_date),
    but without pagination — an export should include everything
    matching the filter, not just one page of it.
    """
    query = Transaction.query.filter_by(user_id=user_id)

    type_filter = request.args.get("type")
    if type_filter in ("income", "expense"):
        query = query.filter_by(type=type_filter)

    category_id = request.args.get("category_id", type=int)
    if category_id:
        query = query.filter_by(category_id=category_id)

    start_date = request.args.get("start_date")
    if start_date:
        query = query.filter(Transaction.date >=
                             date.fromisoformat(start_date))

    end_date = request.args.get("end_date")
    if end_date:
        query = query.filter(Transaction.date <= date.fromisoformat(end_date))

    return query.order_by(Transaction.date.desc()).all()


@export_bp.route("/transactions/csv", methods=["GET"])
@jwt_required()
def export_transactions_csv():
    """
    Streams the user's (filtered) transactions as a downloadable CSV file.
    """
    user_id = get_jwt_identity()
    transactions = _get_filtered_transactions(user_id)

    # io.StringIO gives us an in-memory, file-like text buffer — we can
    # write CSV rows into it exactly like writing to a real file on disk,
    # without ever touching the filesystem. This matters on a server:
    # writing temp files to disk introduces cleanup concerns and doesn't
    # work cleanly on some hosting platforms with read-only filesystems.
    buffer = io.StringIO()
    writer = csv.writer(buffer)

    writer.writerow(["Date", "Type", "Category", "Amount (INR)", "Note"])

    for t in transactions:
        writer.writerow([
            t.date.isoformat(),
            t.type.capitalize(),
            t.category.name if t.category else "Unknown",
            f"{t.amount:.2f}",
            t.note or "",
        ])

    # send_file expects bytes, but csv.writer wrote to a text buffer —
    # encode it, then wrap in a BytesIO for send_file to serve.
    byte_buffer = io.BytesIO(buffer.getvalue().encode("utf-8"))
    byte_buffer.seek(0)

    filename = f"finpilot_transactions_{date.today().isoformat()}.csv"

    return send_file(
        byte_buffer,
        mimetype="text/csv",
        as_attachment=True,
        download_name=filename,
    )


@export_bp.route("/report/pdf", methods=["GET"])
@jwt_required()
def export_monthly_report_pdf():
    """
    Generates a formatted PDF report for a given month/year: a summary
    section (totals, net balance) followed by a full transaction table.
    Defaults to the current month if not specified.
    """
    user_id = get_jwt_identity()

    month = request.args.get("month", type=int, default=date.today().month)
    year = request.args.get("year", type=int, default=date.today().year)

    transactions = (
        Transaction.query.filter(
            Transaction.user_id == user_id,
            extract("month", Transaction.date) 
            extract("year", Transaction.date)
        )
        .order_by(Transaction.date.asc())
        .all()
    )

    totals = {"income": 0, "expense": 0}
    for t in transactions:
        totals[t.type] += float(t.amount)
    net_balance = totals["income"] - totals["expense"]

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            topMargin=20 * mm, bottomMargin=20 * mm)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "TitleStyle", parent=styles["Heading1"], fontSize=18, spaceAfter=4)
    subtitle_style = ParagraphStyle(
        "SubtitleStyle", parent=styles["Normal"], textColor=colors.grey, spaceAfter=16)

    import calendar
    month_name = calendar.month_name[month]

    elements = [
        Paragraph("FinPilot Financial Report", title_style),
        Paragraph(f"{month_name} {year}", subtitle_style),
    ]

    # Summary table
    summary_data = [
        ["Total Income", f"Rs. {totals['income']:,.2f}"],
        ["Total Expenses", f"Rs. {totals['expense']:,.2f}"],
        ["Net Balance", f"Rs. {net_balance:,.2f}"],
    ]
    summary_table = Table(summary_data, colWidths=[100 * mm, 60 * mm])
    summary_table.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("LINEBELOW", (0, -1), (-1, -1), 1, colors.HexColor("#e5e7eb")),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 16 * mm))

    # Transaction table
    elements.append(Paragraph("Transactions", styles["Heading2"]))
    elements.append(Spacer(1, 4 * mm))

    table_data = [["Date", "Type", "Category", "Amount (INR)", "Note"]]
    for t in transactions:
        table_data.append([
            t.date.strftime("%d %b %Y"),
            t.type.capitalize(),
            t.category.name if t.category else "Unknown",
            f"{t.amount:,.2f}",
            (t.note or "")[:40],
        ])

    if len(table_data) == 1:
        elements.append(
            Paragraph("No transactions recorded for this period.", styles["Normal"]))
    else:
        tx_table = Table(table_data, colWidths=[
                         25 * mm, 20 * mm, 35 * mm, 30 * mm, 50 * mm], repeatRows=1)
        tx_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4f46e5")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#e5e7eb")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1),
             [colors.white, colors.HexColor("#f9fafb")]),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ]))
        elements.append(tx_table)

    doc.build(elements)
    buffer.seek(0)

    filename = f"finpilot_report_{year}_{month:02d}.pdf"

    return send_file(
        buffer,
        mimetype="application/pdf",
        as_attachment=True,
        download_name=filename,
    )
