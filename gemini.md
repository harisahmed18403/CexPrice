# Gemini CLI Project Configuration: CexPrice

This document provides context for the CexPrice project to help the Gemini CLI understand the project's structure, technologies, and operational commands.

## 1. About This Project

CexPrice is a full-stack web application designed to track product prices from the retailer CeX (Complete Entertainment Exchange). It features a Python/Flask backend that serves a REST API and a React single-page application (SPA) frontend.

- **Backend**: Provides API endpoints for user authentication, product browsing/searching, and administrative tasks like refreshing product data from CeX.
- **Frontend**: A modern UI for users to log in, browse products by category, search for specific items, and view their profiles.

## 2. Tech Stack

### Backend
- **Language**: Python
- **Framework**: Flask
- **Database**: Flask-SQLAlchemy (likely with SQLite, PostgreSQL, or MySQL)
- **Migrations**: Alembic
- **Authentication**: Flask-Login

### Frontend
- **Framework**: React
- **Build Tool**: Vite
- **Routing**: React Router (`react-router-dom`)
- **UI Library**: Material-UI (`@mui/material`)
- **Data Fetching**: TanStack Query (`@tanstack/react-query`)
- **Package Manager**: npm

## 3. Project Structure

```
/
├── backend/
│   ├── app/                # Main Flask application package
│   │   ├── routes.py       # API endpoint definitions
│   │   ├── models/         # SQLAlchemy DB models
│   │   └── services/cex/   # Business logic for CeX data
│   ├── migrations/         # Alembic database migrations
│   └── cexprice.py         # Flask application entry point
│
└── frontend/
    ├── src/                # React source code
    │   ├── pages/          # Top-level page components
    │   ├── components/     # Reusable UI components
    │   ├── features/       # Feature-sliced logic (auth, products)
    │   └── routes/         # React Router configuration
    ├── vite.config.js      # Vite configuration (incl. proxy)
    └── package.json        # Frontend dependencies and scripts
```

## 4. Getting Started

### Backend Setup
1.  Navigate to the `backend` directory: `cd backend`
2.  Activate the Python virtual environment (path may vary): `source venv/bin/activate`
3.  Set the Flask app environment variable: `export FLASK_APP=cexprice.py`
4.  Run the development server (defaults to port 5000): `flask run`

### Frontend Setup
1.  Navigate to the `frontend` directory: `cd frontend`
2.  Install dependencies: `npm install`
3.  Run the development server (defaults to port 3000): `npm run dev`

## 5. API Endpoints

The frontend communicates with the backend via a REST API. The Vite development server proxies requests from `/api` to the Flask backend running on `http://127.0.0.1:5000`.

### Key Routes (`/api/...`)
- **Authentication**:
  - `POST /login`
  - `POST /register`
  - `POST /logout`
  - `GET /me` (Get current user)
- **Products**:
  - `GET /products` (Filter by category, etc.)
  - `GET /products/search?q={query}`
  - `GET /navigation` (Get category tree)
- **Admin**:
  - `POST /cex-refresh` (Triggers a data refresh from CeX)
  - `GET /admin`
- **User**:
  - `GET /user/{username}`
  - `PUT /profile`
