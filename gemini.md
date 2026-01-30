# Gemini CLI Project Configuration: CexPrice

This document provides context for the CexPrice project to help the Gemini CLI understand the project's structure, technologies, and operational commands.

## 1. About This Project

CexPrice is a full-stack web application designed to track product prices from the retailer CeX (Complete Entertainment Exchange). It features a Python/Flask backend that serves a REST API and a React single-page application (SPA) frontend.

- **Backend**: Provides API endpoints for user authentication, product browsing/searching, sales management, and administrative tasks like refreshing product data from CeX.
- **Frontend**: A modern UI for users to log in, browse products by category, search for specific items, manage sales, and view their profiles.

## 2. Tech Stack

### Backend
- **Language**: Python
- **Framework**: Flask
- **Database**: Flask-SQLAlchemy with SQLite (Context impl `SQLiteImpl`)
- **Migrations**: Alembic (`flask db ...`)
- **Authentication**: Flask-Login
- **External Integration**: `requests` to fetch data from CeX Web/WebSocket APIs.

### Frontend
- **Framework**: React
- **Build Tool**: Vite
- **Routing**: React Router (`react-router-dom`)
- **UI Library**: Material-UI (`@mui/material`)
- **Data Fetching**: TanStack Query (`@tanstack/react-query`)
- **Package Manager**: npm

## 3. Data Models (`backend/app/models/`)

The database schema is managed via SQLAlchemy. Key models include:

-   **Product**: The core item catalog.
    -   `id`, `name`, `category_id`
    -   `image_path`: Stores filename or URL. `get_url()` handles resolution to local or remote.
    -   **Pricing Fields**:
        -   `cash_price`: The cash value CeX offers to buy the item for.
        -   `voucher_price`: The voucher value CeX offers to buy the item for.
        -   `sale_price`: The price CeX sells the item for.
-   **CexProduct**: Link table mapping a local `Product` to a CeX `cex_id` (objectID).
-   **Category / ProductLine / SuperCat**: Hierarchical organization (Super Category -> Product Line -> Category -> Product).
-   **Sale / SaleItem**: Records transaction history (Buy/Sell) and line items.
-   **User**: Application users (Auth).

## 4. CeX Data Integration (`backend/app/services/cex/refresh_cex.py`)

The application periodically syncs data from CeX's public APIs using the `RefreshCex` service.

-   **Sources**:
    -   Category/Hierarchy data: `https://wss2.cex.{country}.webuy.io/v3`
    -   Product data: `https://search.webuy.io/1/indexes/*/queries` (Algolia API)
-   **Data Mapping**:
    -   CeX `cashPrice` -> Product `cash_price`
    -   CeX `exchangePrice` -> Product `voucher_price`
    -   CeX `sellPrice` -> Product `sale_price`
    -   CeX `boxName` -> Product `name`
    -   CeX `imageUrls` -> Product `image_path`

## 5. API Endpoints

The frontend communicates with the backend via a REST API. The Vite development server proxies requests from `/api` to the Flask backend running on `http://127.0.0.1:5000`.

### Key Routes (`/api/...`)
-   **Authentication**:
    -   `POST /login`, `POST /register`, `POST /logout`
    -   `GET /me` (Current user session)
-   **Products**:
    -   `GET /products` (List with filters)
    -   `GET /products/search?q={query}`
    -   `GET /navigation` (Full category tree)
-   **Sales**:
    -   `POST /sales` (Create a new sale transaction)
    -   `GET /sales` (List sales history)
    -   `GET /sales/<id>` (Get sale details)
-   **Admin**:
    -   `POST /cex-refresh` (Trigger background refresh)
    -   `GET /admin` (Dashboard stats)

## 6. Development Workflow

### Backend
1.  **Navigate**: `cd backend`
2.  **Environment**: `source venv/bin/activate` (or appropriate shell command)
3.  **Run Server**: `flask run` (Defaults to port 5000)
4.  **Database Migrations**:
    -   Make changes to `models/*.py`
    -   `export FLASK_APP=cexprice.py`
    -   Generate migration: `flask db migrate -m "Description of change"`
    -   Apply migration: `flask db upgrade`

### Frontend
1.  **Navigate**: `cd frontend`
2.  **Install**: `npm install`
3.  **Run Server**: `npm run dev` (Defaults to port 3000, proxies to backend)