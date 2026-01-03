from flask import Flask, request, jsonify
from app import app, db
from app.models import User
from flask_login import current_user, login_user, logout_user, login_required
import sqlalchemy as sa
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
