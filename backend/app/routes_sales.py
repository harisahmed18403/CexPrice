import random
from flask import request, jsonify
from datetime import datetime, timezone, timedelta
from app import app, db
from app.models import Sale, SaleItem, Product, ProductVariant, Category
from flask_login import login_required
from sqlalchemy import desc, func

@app.route("/api/sales", methods=["POST"])
@login_required
def create_sale():
    data = request.json
    
    # Basic validation
    if not data or 'items' not in data or not data['items']:
        return jsonify({"error": "Missing items in sale"}), 400
        
    transaction_type = data.get('type', 'sell') # default to sell
    customer = data.get('customer', {})
    
    sale = Sale(
        transaction_type=transaction_type,
        customer_name=customer.get('name'),
        customer_email=customer.get('email'),
        customer_phone=customer.get('phone'),
        total_amount=0 # Will calculate
    )
    
    running_total = 0
    
    for item_data in data['items']:
        qty = int(item_data.get('quantity', 1))
        price = float(item_data.get('price', 0))
        total_line_price = qty * price
        running_total += total_line_price
        
        product_id = item_data.get('product_id')
        custom_name = item_data.get('custom_name')
        
        if not product_id and not custom_name:
            continue # Skip invalid items
            
        sale_item = SaleItem(
            variant_id=product_id, # Frontend still sends it as product_id
            custom_product_name=custom_name,
            quantity=qty,
            price_per_unit=price,
            total_price=total_line_price
        )
        sale.items.append(sale_item)
        
    sale.total_amount = running_total
    
    db.session.add(sale)
    db.session.commit()
    
    return jsonify({"success": True, "sale_id": sale.id, "message": "Sale created successfully"})

@app.route("/api/sales", methods=["GET"])
@login_required
def get_sales():
    # Optional filters
    limit = request.args.get('limit', 50, type=int)
    offset = request.args.get('offset', 0, type=int)
    
    # Query sales, ordered by newest first
    query = Sale.query.order_by(desc(Sale.created_at))
    total = query.count()
    sales = query.limit(limit).offset(offset).all()
    
    return jsonify({
        "items": [s.to_dict() for s in sales],
        "total": total
    })

@app.route("/api/sales/<int:sale_id>", methods=["GET"])
@login_required
def get_sale_detail(sale_id):
    sale = db.session.get(Sale, sale_id)
    if not sale:
        return jsonify({"error": "Sale not found"}), 404
        
    return jsonify(sale.to_dict())

@app.route("/api/dashboard/stats", methods=["GET"])
@login_required
def get_daily_stats():
    # Calculate start of today in UTC
    now = datetime.now(timezone.utc)
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Query sales created today
    todays_sales = Sale.query.filter(Sale.created_at >= start_of_day).all()
    
    total_sales = sum(float(s.total_amount) for s in todays_sales)
    sale_count = len(todays_sales)
    
    return jsonify({
        "date": now.isoformat(),
        "total_sales": total_sales,
        "sale_count": sale_count
    })

@app.route("/api/sales/fake-data", methods=["POST"])
@login_required
def populate_fake_sales():
    count = request.json.get('count', 50)
    days_back = request.json.get('days_back', 30)
    
    variants = ProductVariant.query.limit(20).all()
    if not variants:
        return jsonify({"error": "No product variants available to create sales"}), 400
        
    for _ in range(count):
        # Random date within range
        days = random.randint(0, days_back)
        hours = random.randint(0, 23)
        minutes = random.randint(0, 59)
        created_at = datetime.now(timezone.utc) - timedelta(days=days, hours=hours, minutes=minutes)
        
        transaction_type = random.choice(['buy', 'sell'])
        
        sale = Sale(
            transaction_type=transaction_type,
            customer_name=f"Fake Customer {random.randint(100, 999)}",
            created_at=created_at,
            total_amount=0
        )
        
        running_total = 0
        num_items = random.randint(1, 4)
        for _ in range(num_items):
            var = random.choice(variants)
            qty = random.randint(1, 2)
            price = float(var.sale_price if transaction_type == 'buy' else var.cash_price)
            if price == 0: price = random.uniform(10, 500)
            
            total_item_price = qty * price
            running_total += total_item_price
            
            item = SaleItem(
                variant_id=var.id,
                quantity=qty,
                price_per_unit=price,
                total_price=total_item_price
            )
            sale.items.append(item)
            
        sale.total_amount = running_total
        db.session.add(sale)
        
    db.session.commit()
    return jsonify({"success": True, "message": f"Generated {count} fake sales"})

@app.route("/api/sales/clear-all", methods=["DELETE"])
@login_required
def clear_all_sales():
    SaleItem.query.delete()
    Sale.query.delete()
    db.session.commit()
    return jsonify({"success": True, "message": "All sales data cleared"})

@app.route("/api/reports/sales", methods=["GET"])
@login_required
def get_sales_report():
    granularity = request.args.get('granularity', 'daily') # daily, weekly, monthly, yearly
    
    # Simple aggregation logic
    if granularity == 'daily':
        date_format = '%Y-%m-%d'
    elif granularity == 'weekly':
        date_format = '%Y-W%W'
    elif granularity == 'monthly':
        date_format = '%Y-%m'
    else: # yearly
        date_format = '%Y'
        
    results = db.session.query(
        func.strftime(date_format, Sale.created_at).label('period'),
        func.sum(Sale.total_amount).label('total_revenue'),
        func.count(Sale.id).label('transaction_count')
    ).group_by('period').order_by('period').all()
    
    return jsonify([{
        'period': r.period,
        'revenue': float(r.total_revenue),
        'count': r.transaction_count
    } for r in results])
