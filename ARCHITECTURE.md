# 🏗️ System Architecture Documentation

## AI-Enhanced Microfinance Loan Management System (MLMS)

This document provides a detailed technical description of the system architecture, data flow, and component interactions.

---

## 1. High-Level Architecture Overview

The MLMS follows a modern **three-tier architecture**:

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION TIER                            │
│              React.js Single Page Application                   │
│                    (Port 3000 - Vite Dev Server)                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP/REST API (JSON)
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    APPLICATION TIER                             │
│                  FastAPI Backend Server                         │
│                    (Port 8000 - Uvicorn)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  • RESTful API Endpoints                                 │  │
│  │  • Business Logic Layer                                  │  │
│  │  • AI/ML Integration                                     │  │
│  │  • Request Validation (Pydantic)                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ SQLAlchemy ORM
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                     DATA TIER                                   │
│                  SQLite Database                                │
│                (mlms_database.db - File-based)                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Component Architecture

### 2.1 Frontend Architecture (Presentation Tier)

**Technology**: React.js 18 with Vite build tool

```
Frontend Structure:
┌─────────────────────────────────────────────────────────┐
│                       App.jsx                           │
│              (Main Application Container)               │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │           Navigation Component                    │ │
│  │        (Tab-based routing state)                  │ │
│  └───────────────────────────────────────────────────┘ │
│                         │                               │
│         ┌───────────────┼───────────────┐              │
│         │               │               │              │
│    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐         │
│    │Dashboard│    │ Client  │    │  Loan   │         │
│    │.jsx     │    │Onboard  │    │  App    │         │
│    │         │    │ing.jsx  │    │  .jsx   │         │
│    └────┬────┘    └────┬────┘    └────┬────┘         │
│         │              │              │              │
│         └──────────────┼──────────────┘              │
│                        │                             │
│                   ┌────▼────┐                        │
│                   │ api.js  │                        │
│                   │ (Axios) │                        │
│                   └─────────┘                        │
└─────────────────────────────────────────────────────────┘
```

**Key Features**:
- **Component-Based**: Modular React components for each feature
- **State Management**: React Hooks (useState, useEffect) for local state
- **API Layer**: Centralized API service (api.js) using Axios
- **Styling**: CSS with modern gradient designs
- **Charts**: Recharts library for data visualization
- **Responsive**: Mobile-friendly responsive design

**Component Responsibilities**:

| Component | Responsibility |
|-----------|----------------|
| `App.jsx` | Main container, navigation state management |
| `Dashboard.jsx` | Display analytics, charts, and key metrics |
| `ClientOnboarding.jsx` | Client registration form and list |
| `LoanApplication.jsx` | Loan creation, AI suggestions display |
| `RepaymentTracker.jsx` | Installment tracking, payment marking |
| `api.js` | Centralized API calls to backend |

---

### 2.2 Backend Architecture (Application Tier)

**Technology**: Python FastAPI with Uvicorn ASGI server

```
Backend Structure:
┌──────────────────────────────────────────────────────────┐
│                      main.py                             │
│               (FastAPI Application)                      │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │            API Endpoint Layer                      │ │
│  │  • Client Management Endpoints                     │ │
│  │  • Loan Management Endpoints                       │ │
│  │  • Repayment Tracking Endpoints                    │ │
│  │  • Dashboard Analytics Endpoints                   │ │
│  └────────────┬───────────────────────┬───────────────┘ │
│               │                       │                  │
│      ┌────────▼────────┐     ┌───────▼──────────┐      │
│      │  ai_models.py   │     │  database.py     │      │
│      │                 │     │                  │      │
│      │• RiskScorer     │     │• SQLAlchemy     │      │
│      │• AlertSystem    │     │  Models         │      │
│      │• ML Logic       │     │• ORM Setup      │      │
│      └─────────────────┘     └───────┬──────────┘      │
│                                       │                  │
└───────────────────────────────────────┼──────────────────┘
                                        │
                                        ▼
                              SQLite Database
```

**Key Components**:

#### main.py - API Endpoints
- **Framework**: FastAPI (async support, automatic OpenAPI docs)
- **Middleware**: CORS configuration for frontend communication
- **Validation**: Pydantic models for request/response validation
- **Error Handling**: HTTP exceptions with meaningful messages

**Endpoint Categories**:
1. **Client Management** (`/api/clients/*`)
2. **Loan Management** (`/api/loans/*`)
3. **Repayment Tracking** (`/api/installments/*`)
4. **Analytics & Alerts** (`/api/dashboard/*`, `/api/alerts/*`)

#### database.py - Data Layer
- **ORM**: SQLAlchemy 2.0 declarative style
- **Models**: Client, Loan, Installment
- **Relationships**: Defined with foreign keys and cascading deletes
- **Session Management**: Context manager for database sessions
- **Auto-Initialization**: Tables created on application startup

#### ai_models.py - AI/ML Layer
Two main classes:

**1. RiskScorer Class**:
```python
Functionality:
├── calculate_risk_score(client_data, loan_amount)
│   ├── Evaluates 5 weighted factors
│   ├── Returns risk_score (0-100) and risk_level (Low/Medium/High)
│   └── Used during client registration
│
└── suggest_loan_terms(client_data, loan_amount)
    ├── Calculates recommended interest rate
    ├── Determines optimal loan duration
    ├── Provides approval recommendation
    └── Used for AI-powered loan suggestions
```

**2. DefaultAlertSystem Class**:
```python
Functionality:
├── check_default_risk(loan_data, installments_data)
│   ├── Analyzes payment patterns
│   ├── Detects multiple missed payments
│   ├── Evaluates overall payment rate
│   └── Returns list of alerts with recommendations
│
└── calculate_default_probability(loan_data, risk_score, overdue)
    ├── Combines multiple risk factors
    ├── Returns probability percentage (0-100%)
    └── Used for default risk assessment
```

---

### 2.3 Database Architecture (Data Tier)

**Technology**: SQLite (file-based, serverless)

**Schema Design**:

```
┌──────────────┐
│   clients    │
├──────────────┤
│ id (PK)      │◄─────┐
│ name         │      │
│ cnic (UNIQUE)│      │
│ phone        │      │
│ address      │      │
│ monthly_income│     │
│ employment_  │      │ 1:N Relationship
│   status     │      │ (One client, many loans)
│ existing_loans│     │
│ credit_history│     │
│ risk_score   │      │
│ risk_level   │      │
│ created_at   │      │
└──────────────┘      │
                      │
                ┌─────┴──────┐
                │   loans    │
                ├────────────┤
                │ id (PK)    │◄─────┐
                │ client_id  │      │
                │   (FK)     │      │
                │ loan_amount│      │
                │ loan_type  │      │
                │ interest_rate│    │ 1:N Relationship
                │ duration_  │      │ (One loan, many installments)
                │   months   │      │
                │ monthly_   │      │
                │ installment│      │
                │ start_date │      │
                │ status     │      │
                │ created_at │      │
                └────────────┘      │
                                    │
                          ┌─────────┴────┐
                          │installments  │
                          ├──────────────┤
                          │ id (PK)      │
                          │ loan_id (FK) │
                          │ installment_ │
                          │   number     │
                          │ due_date     │
                          │ amount       │
                          │ paid         │
                          │ paid_date    │
                          │ is_overdue   │
                          └──────────────┘
```

**Relationship Rules**:
- **Cascade Delete**: When a loan is deleted, all its installments are automatically deleted
- **Foreign Key Constraints**: Enforced at database level
- **Unique Constraints**: CNIC must be unique for clients

---

## 3. Data Flow Diagrams

### 3.1 Client Registration Flow

```
User Action                 Frontend              Backend                AI Module            Database
     │                          │                    │                      │                    │
     ├──[Fill Form]─────────────►                    │                      │                    │
     │                          │                    │                      │                    │
     ├──[Click Submit]──────────►                    │                      │                    │
     │                          │                    │                      │                    │
     │                          ├─[POST /clients/]──►                       │                    │
     │                          │                    │                      │                    │
     │                          │                    ├─[calculate_risk()]──►                     │
     │                          │                    │                      │                    │
     │                          │                    │                      ├─[return score]────►│
     │                          │                    │                      │                    │
     │                          │                    ├─[INSERT client]──────────────────────────►│
     │                          │                    │                      │                    │
     │                          │                    │                      │            [Store with
     │                          │                    │                      │             risk score]
     │                          │                    │                      │                    │
     │                          │◄──[Client + Risk]──┤                      │                    │
     │                          │    [Score Response]│                      │                    │
     │                          │                    │                      │                    │
     │◄──[Display Success]──────┤                    │                      │                    │
     │   [Show Risk Level]      │                    │                      │                    │
```

### 3.2 Loan Creation with AI Suggestions Flow

```
User Action                 Frontend              Backend                AI Module            Database
     │                          │                    │                      │                    │
     ├──[Select Client]─────────►                    │                      │                    │
     ├──[Enter Amount]──────────►                    │                      │                    │
     │                          │                    │                      │                    │
     ├──[Click "Get AI          │                    │                      │                    │
     │   Suggestions"]───────────►                   │                      │                    │
     │                          │                    │                      │                    │
     │                          ├─[POST /loans/      │                      │                    │
     │                          │  suggest]─────────►                       │                    │
     │                          │                    │                      │                    │
     │                          │                    ├─[suggest_loan_terms]►                     │
     │                          │                    │                      │                    │
     │                          │                    │                      ├─[Calculate optimal │
     │                          │                    │                      │  interest, duration]│
     │                          │                    │                      │                    │
     │                          │◄──[AI Suggestions]─┤◄─────────────────────┤                    │
     │                          │   [Interest: 18%]  │                      │                    │
     │                          │   [Duration: 24m]  │                      │                    │
     │                          │                    │                      │                    │
     │◄──[Display Suggestions]──┤                    │                      │                    │
     │   [Auto-fill form]       │                    │                      │                    │
     │                          │                    │                      │                    │
     ├──[Review & Submit]───────►                    │                      │                    │
     │                          │                    │                      │                    │
     │                          ├─[POST /loans/]─────►                      │                    │
     │                          │                    │                      │                    │
     │                          │                    ├─[Calculate           │                    │
     │                          │                    │  installment]        │                    │
     │                          │                    │                      │                    │
     │                          │                    ├─[INSERT loan]────────────────────────────►│
     │                          │                    │                      │                    │
     │                          │                    ├─[Generate 24         │                    │
     │                          │                    │  installments]────────────────────────────►│
     │                          │                    │                      │                    │
     │                          │◄──[Loan Created]───┤                      │                    │
     │                          │   [With Schedule]  │                      │                    │
     │                          │                    │                      │                    │
     │◄──[Display Success]──────┤                    │                      │                    │
```

### 3.3 Default Alert Generation Flow

```
User Action                 Frontend              Backend                AI Module            Database
     │                          │                    │                      │                    │
     ├──[Select Loan]───────────►                    │                      │                    │
     │                          │                    │                      │                    │
     │                          ├─[GET /loans/{id}/  │                      │                    │
     │                          │  alerts]──────────►                       │                    │
     │                          │                    │                      │                    │
     │                          │                    ├─[SELECT loan,        │                    │
     │                          │                    │  installments]───────────────────────────►│
     │                          │                    │                      │                    │
     │                          │                    │◄─────────────────────────────────────────┤
     │                          │                    │                      │                    │
     │                          │                    ├─[check_default_risk]►                     │
     │                          │                    │                      │                    │
     │                          │                    │                      ├─[Analyze payment   │
     │                          │                    │                      │  patterns]         │
     │                          │                    │                      │                    │
     │                          │                    │                      ├─[Count overdue]    │
     │                          │                    │                      │                    │
     │                          │                    │                      ├─[Calculate default │
     │                          │                    │                      │  probability]      │
     │                          │                    │                      │                    │
     │                          │                    │                      ├─[Generate alerts   │
     │                          │                    │                      │  with              │
     │                          │                    │                      │  recommendations]  │
     │                          │                    │                      │                    │
     │                          │◄──[Alerts Array]───┤◄─────────────────────┤                    │
     │                          │   [Default: 65%]   │                      │                    │
     │                          │   [Recommendations]│                      │                    │
     │                          │                    │                      │                    │
     │◄──[Display Alerts]───────┤                    │                      │                    │
     │   [Show Warnings]        │                    │                      │                    │
     │   [Action Items]         │                    │                      │                    │
```

---

## 4. Technology Justification

### Why FastAPI?
- **Performance**: Async support, faster than Flask/Django
- **Auto Documentation**: Swagger UI generated automatically
- **Type Safety**: Pydantic validation prevents errors
- **Modern**: Built on Python 3.8+ type hints

### Why SQLite?
- **Zero Setup**: No installation required
- **File-Based**: Single file, easy to backup
- **Perfect for Prototypes**: Ideal for hackathons
- **Production Ready**: Can handle moderate loads

### Why React with Vite?
- **Fast Development**: Hot Module Replacement (HMR)
- **Modern**: Latest React 18 features
- **Optimized Builds**: Fast production builds
- **Simple Setup**: Less configuration than CRA

### Why Scikit-learn for AI?
- **Lightweight**: Small footprint
- **Well-Documented**: Extensive tutorials
- **Industry Standard**: Widely used
- **Easy Integration**: Works seamlessly with Python

---

## 5. Security Considerations

### Current Implementation
- **CORS**: Configured for local development
- **Input Validation**: Pydantic models validate all inputs
- **SQL Injection Protection**: SQLAlchemy ORM prevents SQL injection
- **Error Handling**: No sensitive data in error responses

### Production Recommendations
1. **Authentication**: Add JWT or OAuth2
2. **HTTPS**: Enable SSL/TLS
3. **Rate Limiting**: Prevent API abuse
4. **Environment Variables**: Store sensitive config
5. **Database**: Use PostgreSQL/MySQL in production
6. **CORS**: Restrict origins to specific domains

---

## 6. Scalability Considerations

### Current Architecture (Hackathon/Prototype)
- **Single Server**: Backend and database on same machine
- **File-based DB**: SQLite suitable for <100K records
- **No Caching**: Direct database queries

### Production Scaling Strategy
1. **Database**: Migrate to PostgreSQL with connection pooling
2. **Caching**: Add Redis for frequently accessed data
3. **Load Balancing**: Multiple FastAPI instances behind Nginx
4. **CDN**: Serve frontend static files via CDN
5. **Async Workers**: Celery for background tasks (email, notifications)
6. **Monitoring**: Add logging (ELK stack) and metrics (Prometheus)

---

## 7. AI/ML Model Details

### Risk Scoring Model

**Type**: Rule-based weighted scoring system

**Input Features**:
1. Monthly Income (continuous)
2. Employment Status (categorical)
3. Existing Loans (discrete)
4. Credit History (categorical)
5. Loan-to-Income Ratio (continuous)

**Output**:
- Risk Score: 0-100 (continuous)
- Risk Level: Low/Medium/High (categorical)

**Algorithm**:
```
Risk Score = Σ (Factor Score × Weight)

Where:
- Income Score (25%): Inverse relationship with income
- Employment Score (20%): Based on stability
- Existing Loans Score (20%): More loans = higher risk
- Credit History Score (25%): Historical performance
- Loan-to-Income Score (10%): Ratio analysis
```

**Future Enhancement**:
- Train machine learning model (Random Forest, XGBoost) on historical data
- Add more features (age, industry, location)
- Implement model versioning and A/B testing

### Default Alert System

**Type**: Pattern detection and threshold-based alerts

**Detection Rules**:
1. **Multiple Missed Payments**: ≥3 overdue installments
2. **Poor Payment History**: <50% payment rate
3. **Recent Payment Issues**: ≥2 recent missed payments

**Default Probability Formula**:
```
Default Probability = min(100, (Risk Score × 0.5 + Overdue Count × 15) × Status Factor)

Where:
- Risk Score: Client's base risk (0-100)
- Overdue Count: Number of overdue installments
- Status Factor: 1.0 (Active) or 1.5 (Other)
```

---

## 8. API Communication Protocol

### Request/Response Format

All API communication uses **JSON** format.

**Example Request**:
```http
POST /api/clients/ HTTP/1.1
Host: localhost:8000
Content-Type: application/json

{
  "name": "John Doe",
  "cnic": "12345-1234567-1",
  "phone": "+92-300-1234567",
  "address": "123 Main St, Karachi",
  "monthly_income": 50000,
  "employment_status": "Employed",
  "existing_loans": 1,
  "credit_history": "Good"
}
```

**Example Response**:
```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 1,
  "name": "John Doe",
  "cnic": "12345-1234567-1",
  "phone": "+92-300-1234567",
  "address": "123 Main St, Karachi",
  "monthly_income": 50000.0,
  "employment_status": "Employed",
  "existing_loans": 1,
  "credit_history": "Good",
  "risk_score": 25.5,
  "risk_level": "Low",
  "created_at": "2025-01-15T10:30:00"
}
```

### Error Handling

**Standard Error Response**:
```json
{
  "detail": "Client with this CNIC already exists"
}
```

**HTTP Status Codes Used**:
- `200 OK`: Successful GET/PUT requests
- `201 Created`: Successful POST requests
- `400 Bad Request`: Validation errors
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server errors

---

## 9. Deployment Architecture

### Local Development (Current)
```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│  Frontend   │      │   Backend   │      │  Database   │
│   :3000     │─────►│    :8000    │─────►│  SQLite DB  │
│   (Vite)    │      │  (Uvicorn)  │      │  (File)     │
└─────────────┘      └─────────────┘      └─────────────┘
```

### Recommended Production Deployment
```
                    ┌─────────────┐
                    │   Cloudflare│
                    │   (CDN/DNS) │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    Nginx    │
                    │ (Reverse    │
                    │  Proxy)     │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    ┌─────▼─────┐    ┌────▼────┐    ┌─────▼─────┐
    │  React    │    │ FastAPI │    │ FastAPI   │
    │  Static   │    │ Instance│    │ Instance  │
    │  Files    │    │   #1    │    │   #2      │
    └───────────┘    └────┬────┘    └────┬──────┘
                          │              │
                          └──────┬───────┘
                                 │
                          ┌──────▼──────┐
                          │ PostgreSQL  │
                          │  Database   │
                          └─────────────┘
```

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Author**: MLMS Development Team

