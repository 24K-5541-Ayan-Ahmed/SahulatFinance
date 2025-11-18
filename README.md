# 🏦 AI-Enhanced Microfinance Loan Management System (MLMS)

A complete, fully functioning microfinance loan management application built for hackathons. This system helps microfinance institutions replace manual processes with an AI-driven digital solution for client onboarding, loan management, and repayment tracking.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Database Schema](#database-schema)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)

## ✨ Features

### Module 1: Client Onboarding & Risk Profiling
- ✅ Register new clients with complete details (Name, CNIC, phone, address, income, etc.)
- 🤖 **AI-powered risk scoring** - Automatically calculates risk score (0-100) for each client
- 📊 Risk categorization (Low/Medium/High) based on multiple factors:
  - Monthly income
  - Employment status
  - Existing loans
  - Credit history
  - Loan-to-income ratio

### Module 2: Loan Application & Smart Schedule Generation
- 💰 Create new loans for registered clients
- 🤖 **AI-powered loan recommendations** - Get intelligent suggestions for:
  - Optimal interest rates based on risk profile
  - Recommended loan duration
  - Approval recommendations
- 📅 **Automatic repayment schedule generation** - Creates monthly installments automatically
- 📊 Support for multiple loan types: Business, Personal, Agriculture, Education

### Module 3: Repayment Tracking & Default Alerts
- ✅ Mark installments as paid/unpaid
- ⚠️ **AI-powered default alerts** - Intelligent detection of:
  - Multiple missed payments
  - Poor payment history patterns
  - Recent payment issues
- 📈 Default probability calculation
- 🎯 Actionable recommendations for each alert
- 📊 Real-time payment progress tracking

### Module 4: Dashboard & Analytics
- 📊 Comprehensive dashboard with key metrics:
  - Total clients and risk distribution
  - Total, active, and completed loans
  - Financial statistics (disbursed, collected, collection rate)
  - Overdue installment alerts
- 📈 **Interactive charts**:
  - Client risk distribution (Pie chart)
  - Loan status distribution (Bar chart)
  - Loan type distribution (Bar chart)

## 🛠 Technology Stack

| Component | Technology | Why? |
|-----------|-----------|------|
| **Frontend** | React.js + Vite | Fast, modern UI framework |
| **Backend** | Python + FastAPI | High-performance async API framework |
| **Database** | SQLite | Serverless, zero-cost, perfect for prototypes |
| **AI/ML** | Scikit-learn + Rule-based logic | Lightweight ML for risk scoring |
| **Charts** | Recharts | Beautiful, responsive charts for React |
| **API Communication** | Axios | Simple HTTP client for API calls |

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    (React.js Frontend - Port 3000)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Dashboard   │  │   Client     │  │    Loan      │         │
│  │  Analytics   │  │  Onboarding  │  │ Application  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                 │
│         └──────────────────┼──────────────────┘                │
│                            │                                    │
│                     Axios HTTP Requests                         │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API LAYER                            │
│                 (FastAPI - Port 8000)                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  RESTful API Endpoints                                   │  │
│  │  • POST /api/clients/        - Register client          │  │
│  │  • GET  /api/clients/        - Get all clients          │  │
│  │  • POST /api/loans/          - Create loan              │  │
│  │  • POST /api/loans/suggest   - Get AI suggestions       │  │
│  │  • GET  /api/loans/{id}/installments - Get schedule     │  │
│  │  • PUT  /api/installments/{id}/pay - Mark paid          │  │
│  │  • GET  /api/loans/{id}/alerts - Get AI alerts          │  │
│  │  • GET  /api/dashboard/stats - Get dashboard stats      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
│         ┌──────────────────┼──────────────────┐                │
│         ▼                  ▼                  ▼                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   AI/ML      │  │  Database    │  │   Business   │        │
│  │   Module     │  │   Layer      │  │    Logic     │        │
│  │              │  │  (SQLAlchemy)│  │              │        │
│  │• Risk Scorer │  │              │  │• Validation  │        │
│  │• Alert System│  │              │  │• Calculation │        │
│  └──────────────┘  └──────┬───────┘  └──────────────┘        │
│                            │                                    │
└────────────────────────────┼────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                               │
│                  (SQLite - mlms_database.db)                    │
│  ┌────────────┐      ┌────────────┐      ┌────────────┐       │
│  │  clients   │◄─────┤   loans    │◄─────┤installments│       │
│  │            │ 1:N  │            │ 1:N  │            │       │
│  │• id        │      │• id        │      │• id        │       │
│  │• name      │      │• client_id │      │• loan_id   │       │
│  │• cnic      │      │• amount    │      │• amount    │       │
│  │• risk_score│      │• type      │      │• due_date  │       │
│  │• risk_level│      │• status    │      │• paid      │       │
│  └────────────┘      └────────────┘      └────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Action**: User interacts with React frontend (e.g., registers a client)
2. **API Request**: Frontend sends HTTP request via Axios to FastAPI backend
3. **AI Processing**: Backend invokes AI models for risk scoring or alerts
4. **Database Operation**: SQLAlchemy ORM performs CRUD operations on SQLite
5. **Response**: Backend returns JSON response to frontend
6. **UI Update**: React updates the interface with new data

## 📊 Database Schema

### Table: `clients`
Stores client information and AI-calculated risk profiles.

```sql
CREATE TABLE clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR NOT NULL,
    cnic VARCHAR UNIQUE NOT NULL,
    phone VARCHAR NOT NULL,
    address VARCHAR NOT NULL,
    monthly_income FLOAT NOT NULL,
    employment_status VARCHAR NOT NULL,  -- Employed, Self-Employed, Unemployed
    existing_loans INTEGER DEFAULT 0,
    credit_history VARCHAR NOT NULL,     -- Good, Average, Poor
    risk_score FLOAT,                    -- AI-calculated: 0-100
    risk_level VARCHAR,                  -- AI-categorized: Low, Medium, High
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Table: `loans`
Stores loan information and terms.

```sql
CREATE TABLE loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    loan_amount FLOAT NOT NULL,
    loan_type VARCHAR NOT NULL,          -- Business, Personal, Agriculture, Education
    interest_rate FLOAT NOT NULL,        -- Annual percentage
    duration_months INTEGER NOT NULL,
    monthly_installment FLOAT NOT NULL,  -- Auto-calculated
    start_date DATETIME NOT NULL,
    status VARCHAR DEFAULT 'Active',     -- Active, Completed, Defaulted
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id)
);
```

### Table: `installments`
Stores repayment schedule and payment tracking.

```sql
CREATE TABLE installments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    loan_id INTEGER NOT NULL,
    installment_number INTEGER NOT NULL,
    due_date DATETIME NOT NULL,
    amount FLOAT NOT NULL,
    paid BOOLEAN DEFAULT FALSE,
    paid_date DATETIME,
    is_overdue BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE
);
```

### Relationships
- **One-to-Many**: `clients` → `loans` (One client can have multiple loans)
- **One-to-Many**: `loans` → `installments` (One loan has multiple installments)

## 🚀 Installation & Setup

### Prerequisites
- **Python 3.8+** installed ([Download Python](https://www.python.org/downloads/))
- **Node.js 16+** and npm installed ([Download Node.js](https://nodejs.org/))
- Basic command line knowledge

### Step 1: Clone or Download the Project

```bash
# If you have the project folder, navigate to it
cd path/to/Hackathon
```

### Step 2: Backend Setup (FastAPI)

1. **Navigate to backend folder**:
```bash
cd backend
```

2. **Create a virtual environment** (recommended):
```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. **Install Python dependencies**:
```bash
pip install -r requirements.txt
```

4. **Verify installation**:
```bash
pip list
```

You should see packages like `fastapi`, `uvicorn`, `sqlalchemy`, `scikit-learn`, etc.

### Step 3: Frontend Setup (React)

1. **Open a NEW terminal/command prompt** (keep backend terminal open)

2. **Navigate to frontend folder**:
```bash
cd path/to/Hackathon/frontend
```

3. **Install Node.js dependencies**:
```bash
npm install
```

This will install React, Vite, Axios, Recharts, and other dependencies.

## ▶️ Running the Application

You need to run **both backend and frontend** simultaneously in separate terminals.

### Terminal 1: Start Backend Server

```bash
# Make sure you're in the backend folder with venv activated
cd backend
# Activate venv if not already active
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate

# Start FastAPI server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

✅ **Backend running at**: `http://localhost:8000`
- API documentation: `http://localhost:8000/docs` (Swagger UI)
- Database file `mlms_database.db` will be auto-created in the backend folder

### Terminal 2: Start Frontend Server

```bash
# In a NEW terminal, navigate to frontend folder
cd frontend

# Start React development server
npm run dev
```

✅ **Frontend running at**: `http://localhost:3000`

### Access the Application

Open your browser and visit:
```
http://localhost:3000
```

You should see the **AI-Enhanced Microfinance Loan Management System** dashboard! 🎉

## 📖 API Documentation

Once the backend is running, you can access interactive API documentation at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

#### Client Management
- `POST /api/clients/` - Register new client (with AI risk scoring)
- `GET /api/clients/` - Get all clients
- `GET /api/clients/{id}` - Get specific client

#### Loan Management
- `POST /api/loans/` - Create new loan (auto-generates schedule)
- `POST /api/loans/suggest` - Get AI-powered loan recommendations
- `GET /api/loans/` - Get all loans
- `GET /api/loans/{id}` - Get specific loan
- `GET /api/clients/{id}/loans` - Get all loans for a client

#### Repayment Tracking
- `GET /api/loans/{id}/installments` - Get loan repayment schedule
- `PUT /api/installments/{id}/pay` - Mark installment as paid
- `PUT /api/installments/update-overdue` - Update overdue status

#### Alerts & Analytics
- `GET /api/loans/{id}/alerts` - Get AI-powered default alerts for loan
- `GET /api/alerts/all` - Get all active alerts
- `GET /api/dashboard/stats` - Get comprehensive dashboard statistics

## 🎯 Usage Guide

### 1. Register a Client
1. Click **"Client Onboarding"** tab
2. Click **"+ Register New Client"**
3. Fill in client details:
   - Name, CNIC, Phone, Address
   - Monthly Income, Employment Status
   - Number of existing loans, Credit History
4. Click **"Register & Calculate Risk Score"**
5. ✅ AI automatically calculates and displays risk score and level!

### 2. Create a Loan
1. Click **"Loan Application"** tab
2. Click **"+ Create New Loan"**
3. Select a registered client
4. Enter loan amount
5. Click **"Get AI-Powered Loan Suggestions"** to see recommendations
6. Review AI suggestions and adjust terms if needed
7. Click **"Create Loan & Generate Schedule"**
8. ✅ Loan created with automatic monthly repayment schedule!

### 3. Track Repayments
1. Click **"Repayment Tracking"** tab
2. Select a loan from the dropdown
3. View:
   - Loan summary with payment progress
   - AI-powered default risk alerts
   - Complete installment schedule
4. Click **"Mark as Paid"** on installments as payments are received
5. ✅ System automatically updates loan status and alerts!

### 4. Monitor Dashboard
1. Click **"Dashboard"** tab
2. View:
   - Total clients, loans, and financial statistics
   - Active alerts for overdue payments
   - Interactive charts for risk and loan distribution
3. ✅ Get a complete overview of your microfinance operations!

## 🤖 AI Features Explained

### Risk Scoring Algorithm
The AI risk scorer evaluates clients on multiple factors:

**Factors & Weights**:
- Monthly Income (25%): Higher income = Lower risk
- Employment Status (20%): Employed < Self-Employed < Unemployed
- Existing Loans (20%): Fewer existing loans = Lower risk
- Credit History (25%): Good < Average < Poor
- Loan-to-Income Ratio (10%): Lower ratio = Lower risk

**Risk Score**: 0-100 (Higher = More risky)
- **0-30**: Low Risk (Green)
- **31-60**: Medium Risk (Orange)
- **61-100**: High Risk (Red)

### Loan Recommendation Engine
Based on risk profile, the AI suggests:
- **Interest Rate**: 12-24% annual (varies by risk)
- **Loan Duration**: 12-36 months (higher risk = shorter term)
- **Approval**: Automatic recommendation (Approve/Review Required)

### Default Alert System
AI monitors payment patterns and generates alerts:
- **Multiple Missed Payments**: High severity, requires immediate action
- **Poor Payment History**: Analyzes overall payment rate
- **Recent Payment Issues**: Detects recent payment pattern changes
- **Default Probability**: 0-100% calculated risk of default

Each alert includes:
- Severity level (Low/Medium/High)
- Clear message describing the issue
- Actionable recommendation for loan officers

## 🔧 Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError` when running backend
```bash
# Solution: Ensure virtual environment is activated and dependencies installed
cd backend
# Activate venv
pip install -r requirements.txt
```

**Problem**: Port 8000 already in use
```bash
# Solution: Use a different port
uvicorn main:app --reload --port 8001
# Update frontend/vite.config.js proxy target to http://localhost:8001
```

**Problem**: Database errors
```bash
# Solution: Delete database and let it recreate
cd backend
rm mlms_database.db
# Restart backend server
```

### Frontend Issues

**Problem**: `npm: command not found`
```bash
# Solution: Install Node.js from https://nodejs.org/
```

**Problem**: Port 3000 already in use
```bash
# Solution: Vite will automatically suggest another port (e.g., 3001)
# Or kill the process using port 3000
```

**Problem**: API connection errors (Network Error)
```bash
# Solution: Ensure backend is running on port 8000
# Check browser console for error details
# Verify CORS is properly configured
```

## 📁 Project Structure

```
Hackathon/
│
├── backend/
│   ├── main.py                 # FastAPI application & endpoints
│   ├── database.py             # SQLAlchemy models & database setup
│   ├── ai_models.py            # AI risk scoring & alert system
│   ├── requirements.txt        # Python dependencies
│   └── mlms_database.db        # SQLite database (auto-created)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx           # Dashboard with charts
│   │   │   ├── ClientOnboarding.jsx    # Client registration
│   │   │   ├── LoanApplication.jsx     # Loan creation
│   │   │   └── RepaymentTracker.jsx    # Payment tracking
│   │   ├── App.jsx             # Main React component
│   │   ├── api.js              # API service layer
│   │   ├── main.jsx            # React entry point
│   │   └── index.css           # Global styles
│   ├── index.html              # HTML template
│   ├── vite.config.js          # Vite configuration
│   └── package.json            # Node.js dependencies
│
└── README.md                   # This file
```

## 🎨 Design Highlights

- **Modern Gradient UI**: Purple-themed gradient design
- **Responsive Layout**: Works on desktop and mobile
- **Interactive Charts**: Real-time data visualization
- **Intuitive Navigation**: Tab-based navigation between modules
- **Color-coded Badges**: Quick visual indicators for risk and status
- **Loading States**: Clear feedback during API operations
- **Empty States**: Helpful messages when no data exists
- **Alert System**: Prominent warnings for overdue payments

## 🚀 Future Enhancements

- User authentication and role-based access control
- SMS/Email notifications for payment reminders
- Advanced ML models (Random Forest, Neural Networks)
- Multi-currency support
- Export reports to PDF/Excel
- Mobile app (React Native)
- Cloud deployment (AWS, Azure, or Heroku)

## 👥 Contributors

This project was built as a hackathon prototype for the AI-Enhanced Microfinance Loan Management System challenge.

## 📄 License

This project is open-source and available for educational and hackathon purposes.

## 🆘 Support

For issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review API documentation at `http://localhost:8000/docs`
3. Check browser console for frontend errors
4. Check terminal for backend errors

---

**Built with ❤️ for Hackathons**

Happy Coding! 🎉

