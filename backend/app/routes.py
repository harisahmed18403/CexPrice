from flask import Flask, request, jsonify, Blueprint
from app import app, db
from app.models import User, SuperCat, ProductLine, Category, Product, ProductVariant
from flask_login import current_user, login_user, logout_user, login_required
import sqlalchemy as sa
from sqlalchemy import func
from datetime import datetime, timezone
from app.services import RefreshCex
from app.status_store import refresh_status # Import status global
import threading

from flask_cors import CORS
CORS(app, supports_credentials=True)

@app.before_request
def before_request():
    if current_user.is_authenticated:
        current_user.last_seen = datetime.now(timezone.utc)
        db.session.commit()

# -----------------------
# Auth endpoints
# -----------------------
@app.route("/api/register", methods=["POST"])
def register():
    if current_user.is_authenticated:
        return jsonify({"error": "Already logged in"}), 400

    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Missing fields"}), 400

    existing_user = db.session.scalar(sa.select(User).where(User.username == username))
    if existing_user:
        return jsonify({"error": "Username already exists"}), 400

    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({"success": True, "message": "User registered"})

@app.route("/api/login", methods=["POST"])
def login():
    if current_user.is_authenticated:
        return jsonify({"error": "Already logged in"}), 400

    data = request.json
    username = data.get("username")
    password = data.get("password")
    remember_me = data.get("remember_me", False)

    user = db.session.scalar(sa.select(User).where(User.username == username))
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid username or password"}), 401

    login_user(user, remember=remember_me)
    return jsonify({"success": True, "username": user.username})

@app.route("/api/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"success": True})

@app.route("/api/me", methods=["GET"])
@login_required
def me():
    return jsonify({
        "username": current_user.username,
        "email": current_user.email,
        "about_me": getattr(current_user, "about_me", "")
    })

# -----------------------
# User endpoints
# -----------------------
@app.route("/api/user/<username>", methods=["GET"])
@login_required
def get_user(username):
    user = db.first_or_404(sa.select(User).where(User.username == username))
    posts = [
        {"author": user.username, "body": "Test post #1"},
        {"author": user.username, "body": "Test post #2"}
    ]
    return jsonify({
        "username": user.username,
        "email": user.email,
        "posts": posts
    })

@app.route("/api/profile", methods=["PUT", "GET"])
@login_required
def edit_profile():
    if request.method == "PUT":
        data = request.json
        username = data.get("username")
        about_me = data.get("about_me", "")
        if username:
            current_user.username = username
        current_user.about_me = about_me
        db.session.commit()
        return jsonify({"success": True})
    else:
        return jsonify({
            "username": current_user.username,
            "about_me": getattr(current_user, "about_me", "")
        })

# -----------------------
# Admin / CEX endpoints
# -----------------------
@app.route("/api/cex-refresh", methods=["POST"])
@login_required
def cex_refresh():
    if refresh_status["is_running"]:
        return jsonify({"success": False, "message": "Refresh already in progress"})

    data = request.get_json(silent=True) or {}
    category_ids = data.get('category_ids', [])
    product_line_ids = data.get('product_line_ids', [])
    
    # Define worker function
    def run_worker(app_obj, cat_ids, pl_ids):
        # We must push the app context manually in the thread
        with app_obj.app_context():
            refresher = RefreshCex()
            refresher.refreshProducts(category_ids=cat_ids, product_line_ids=pl_ids)

    # Start thread
    # app is the real Flask application object, ensuring the thread has access to config, db, etc.
    thread = threading.Thread(target=run_worker, args=(app, category_ids, product_line_ids))
    thread.start()
    
    return jsonify({"success": True, "message": "CEX products refresh started in background"})

@app.route("/api/cex-refresh/stop", methods=["POST"])
@login_required
def stop_refresh():
    try:
        if refresh_status["is_running"]:
            refresh_status["is_running"] = False
            refresh_status["logs"].append("Stop requested by user...")
            return jsonify({"success": True, "message": "Stopping refresh..."})
        else:
            return jsonify({"success": True, "message": "No refresh running"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route("/api/cex-refresh/status", methods=["GET"])
@login_required
def cex_refresh_status():
    return jsonify(refresh_status)

@app.route("/api/admin", methods=["GET"])
@login_required
def admin_info():
    return jsonify({"message": "Admin panel access", "username": current_user.username})

@app.route('/api/products', methods=['GET'])
@login_required
def get_products():
    super_id = request.args.get('super_category_id', type=int)
    line_id = request.args.get('product_line_id', type=int)
    cat_id = request.args.get('category_id', type=int)
    
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 24, type=int)
    
    sort_by = request.args.get('sort_by', 'name', type=str)
    order = request.args.get('order', 'asc', type=str)
    search_query = request.args.get('search', '', type=str)

    # We want to return Products (Master), but grouped/sorted by Variant data
    # Create a subquery for the minimum cash_price per product to show "Starting from"
    from sqlalchemy import min
    price_subquery = db.session.query(
        ProductVariant.product_id,
        func.min(ProductVariant.cash_price).label('min_price')
    ).group_by(ProductVariant.product_id).subquery()

    query = db.session.query(Product).outerjoin(price_subquery, Product.id == price_subquery.c.product_id)

    # 1. Filters
    if cat_id:
        query = query.filter(Product.category_id == cat_id)
    if line_id or super_id:
        query = query.join(Category).join(Category.product_lines)
        if line_id:
            query = query.filter(ProductLine.id == line_id)
        if super_id:
            query = query.filter(ProductLine.super_cat_id == super_id)
        
    # 2. Search
    if search_query:
        words = [word for word in search_query.split(' ') if word]
        for word in words:
            query = query.filter(Product.name.ilike(f'%{word}%'))

    # 3. Sorting
    if sort_by == 'price':
        sort_col = price_subquery.c.min_price
    else:
        sort_col = Product.name
        
    if order == 'desc':
        query = query.order_by(sort_col.desc())
    else:
        query = query.order_by(sort_col.asc())

    # 4. Pagination
    pagination = query.paginate(page=page, per_page=limit, error_out=False)
    
    return jsonify({
        'items': [p.to_dict() for p in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'page': page,
        'has_next': pagination.has_next,
        'has_prev': pagination.has_prev
    })

@app.route('/api/categories/toggle', methods=['POST'])
@login_required
def toggle_category():
    data = request.json
    cat_id = data.get('id')
    if not cat_id:
        return jsonify({"error": "Missing category id"}), 400
        
    cat = db.session.get(Category, cat_id)
    if not cat:
        return jsonify({"error": "Category not found"}), 404
        
    cat.is_active = not cat.is_active
    db.session.commit()
    return jsonify({"success": True, "id": cat.id, "is_active": cat.is_active})

@app.route('/api/navigation', methods=['GET'])
@login_required
def get_navigation():
    include_inactive = request.args.get('include_inactive', 'false') == 'true'
    supers = SuperCat.query.all()
    tree = []
    
    for s in supers:
        lines = []
        for line in s.product_lines:
            if include_inactive:
                cats = [{'id': c.id, 'name': c.name, 'is_active': c.is_active} for c in line.categories]
            else:
                cats = [{'id': c.id, 'name': c.name} for c in line.categories if c.is_active]
            
            if cats: # Only add lines that have active categories (or all if include_inactive)
                lines.append({
                    'id': line.id,
                    'name': line.name,
                    'categories': cats
                })
        
        if lines:
            tree.append({
                'id': s.id,
                'name': s.name,
                'product_lines': lines
            })
        
    return jsonify(tree)

@app.route('/api/products/search', methods=['GET'])
@login_required
def search_products():
    query_text = request.args.get('q', '', type=str)
    # If variant=true, search in variants instead of master products (useful for Sales)
    search_variants = request.args.get('variant', 'false') == 'true'
    
    if not query_text:
        return jsonify([])

    words = [word for word in query_text.split(' ') if word]
    
    if search_variants:
        query = ProductVariant.query
    else:
        query = Product.query

    for word in words:
        if search_variants:
            query = query.filter(ProductVariant.name.ilike(f'%{word}%'))
        else:
            query = query.filter(Product.name.ilike(f'%{word}%'))

    if search_variants:
        search_results = query.order_by(func.length(ProductVariant.name).asc()).limit(20).all()
    else:
        search_results = query.order_by(func.length(Product.name).asc()).limit(20).all()

    return jsonify([p.to_dict() for p in search_results])