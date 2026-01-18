from flask import Flask, request, jsonify, Blueprint
from app import app, db
from app.models import User, SuperCat, ProductLine, Category, Product
from flask_login import current_user, login_user, logout_user, login_required
import sqlalchemy as sa
from sqlalchemy import func
from datetime import datetime, timezone
from app.services import RefreshCex

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
    refreshCex = RefreshCex()
    # refreshCex.refreshSuperCats()
    # refreshCex.refreshProductLines()
    # refreshCex.refreshCategories()
    refreshCex.refreshProducts()
    return jsonify({"success": True, "message": "CEX products refreshed"})

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

    query = Product.query

    # 1. Filter by Category (Direct Relationship)
    if cat_id:
        query = query.filter(Product.category_id == cat_id)

    # 2. Filter by Product Line (Requires Join to Category)
    if line_id:
        # We check if Category is already joined; if not, join it
        query = query.join(Category).filter(Category.product_line_id == line_id)

    # 3. Filter by Super Category (Requires Join to Category AND ProductLine)
    if super_id:
        # If we didn't join Category in the previous step, we must join it now
        if not line_id:
            query = query.join(Category)
        
        query = query.join(ProductLine).filter(ProductLine.super_cat_id == super_id)

    products = query.all()
    
    # Debugging
    print(f"Filters -> Super: {super_id}, Line: {line_id}, Cat: {cat_id}")
    print(f"SQL Generated: {str(query)}")
    
    return jsonify([p.to_dict() for p in products])

@app.route('/api/navigation', methods=['GET'])
@login_required
def get_navigation():
    supers = SuperCat.query.all()
    tree = []
    
    for s in supers:
        lines = []
        for line in s.product_lines:
            cats = [{'id': c.id, 'name': c.name} for c in line.categories]
            lines.append({
                'id': line.id,
                'name': line.name,
                'categories': cats
            })
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
    
    if not query_text:
        return jsonify([])

    words = [word for word in query_text.split(' ') if word]
    query = Product.query

    for word in words:
        query = query.filter(Product.name.ilike(f'%{word}%'))

    # SORTING LOGIC:
    # We order by the length of the name. 
    # If I search "Apple", "Apple" (length 5) comes before "Apple iPhone 15 Case" (length 21).
    search_results = query.order_by(func.length(Product.name).asc()).limit(20).all()

    return jsonify([p.to_dict() for p in search_results])
