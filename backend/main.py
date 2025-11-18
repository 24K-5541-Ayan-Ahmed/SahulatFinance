from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Optional
from pydantic import BaseModel
from jose import JWTError, jwt
from passlib.context import CryptContext
import database
import ai_models

# Initialize FastAPI app
app = FastAPI(title="SahulatFin API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development - restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security setup
SECRET_KEY = "sahulatfin-secret-key-change-in-production-2025"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    database.init_db()
    create_default_admin()

# Initialize AI models
risk_scorer = ai_models.RiskScorer()
alert_system = ai_models.DefaultAlertSystem()

# ============================================
# Authentication Utilities
# ============================================

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    # Bcrypt has a 72 byte limit, truncate if necessary
    if len(password.encode('utf-8')) > 72:
        password = password[:72]
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_default_admin():
    """Create default admin user if it doesn't exist"""
    db = database.SessionLocal()
    try:
        admin = db.query(database.User).filter(database.User.username == "admin").first()
        if not admin:
            admin_user = database.User(
                username="admin",
                hashed_password=get_password_hash("admin123"),
                is_admin=True
            )
            db.add(admin_user)
            db.commit()
            print("✅ Default admin created: username='admin', password='admin123'")
    except Exception as e:
        print(f"Error creating default admin: {e}")
    finally:
        db.close()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(database.get_db)
):
    """Verify JWT token and return current user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(database.User).filter(database.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

# ============================================
# Pydantic Models for Request/Response
# ============================================

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    username: str
    is_admin: bool

class ClientCreate(BaseModel):
    name: str
    cnic: str
    phone: str
    address: str
    monthly_income: float
    employment_status: str
    existing_loans: int
    credit_history: str

class ClientResponse(BaseModel):
    id: int
    name: str
    cnic: str
    phone: str
    address: str
    monthly_income: float
    employment_status: str
    existing_loans: int
    credit_history: str
    risk_score: Optional[float]
    risk_level: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class LoanCreate(BaseModel):
    client_id: int
    loan_amount: float
    loan_type: str
    interest_rate: float
    duration_months: int
    start_date: datetime

class LoanResponse(BaseModel):
    id: int
    client_id: int
    loan_amount: float
    loan_type: str
    interest_rate: float
    duration_months: int
    monthly_installment: float
    start_date: datetime
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class InstallmentResponse(BaseModel):
    id: int
    loan_id: int
    installment_number: int
    due_date: datetime
    amount: float
    paid: bool
    paid_date: Optional[datetime]
    is_overdue: bool
    
    class Config:
        from_attributes = True

class LoanSuggestionRequest(BaseModel):
    client_id: int
    loan_amount: float

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    cnic: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    monthly_income: Optional[float] = None
    employment_status: Optional[str] = None
    existing_loans: Optional[int] = None
    credit_history: Optional[str] = None

class LoanUpdate(BaseModel):
    loan_amount: Optional[float] = None
    loan_type: Optional[str] = None
    interest_rate: Optional[float] = None
    duration_months: Optional[int] = None
    start_date: Optional[datetime] = None
    status: Optional[str] = None

# ============================================
# Authentication Endpoints
# ============================================

@app.post("/api/auth/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(database.get_db)):
    """Admin login endpoint"""
    user = db.query(database.User).filter(database.User.username == login_data.username).first()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "is_admin": user.is_admin},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username,
        "is_admin": user.is_admin
    }

@app.get("/api/auth/me")
def get_current_user_info(current_user: database.User = Depends(get_current_user)):
    """Get current logged-in user info"""
    return {
        "username": current_user.username,
        "is_admin": current_user.is_admin
    }

# ============================================
# MODULE 1: Client Onboarding & Risk Profiling
# ============================================

@app.post("/api/clients/", response_model=ClientResponse)
def create_client(client: ClientCreate, db: Session = Depends(database.get_db), current_user: database.User = Depends(get_current_user)):
    """
    Register a new client with automatic AI-based risk profiling
    """
    # Check if CNIC already exists
    existing_client = db.query(database.Client).filter(database.Client.cnic == client.cnic).first()
    if existing_client:
        raise HTTPException(status_code=400, detail="Client with this CNIC already exists")
    
    # Calculate risk score using AI
    client_data = {
        'monthly_income': client.monthly_income,
        'employment_status': client.employment_status,
        'existing_loans': client.existing_loans,
        'credit_history': client.credit_history
    }
    risk_score, risk_level = risk_scorer.calculate_risk_score(client_data)
    
    # Create new client
    db_client = database.Client(
        name=client.name,
        cnic=client.cnic,
        phone=client.phone,
        address=client.address,
        monthly_income=client.monthly_income,
        employment_status=client.employment_status,
        existing_loans=client.existing_loans,
        credit_history=client.credit_history,
        risk_score=risk_score,
        risk_level=risk_level
    )
    
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    
    return db_client

@app.get("/api/clients/", response_model=List[ClientResponse])
def get_all_clients(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: database.User = Depends(get_current_user)):
    """
    Get all registered clients
    """
    clients = db.query(database.Client).offset(skip).limit(limit).all()
    return clients

@app.get("/api/clients/{client_id}", response_model=ClientResponse)
def get_client(client_id: int, db: Session = Depends(database.get_db), current_user: database.User = Depends(get_current_user)):
    """
    Get a specific client by ID
    """
    client = db.query(database.Client).filter(database.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client

@app.put("/api/clients/{client_id}", response_model=ClientResponse)
def update_client(client_id: int, updated_client: ClientUpdate, db: Session = Depends(database.get_db), current_user: database.User = Depends(get_current_user)):
    """
    Update an existing client and refresh their risk profile when needed
    """
    client = db.query(database.Client).filter(database.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    if updated_client.cnic and updated_client.cnic != client.cnic:
        existing = db.query(database.Client).filter(database.Client.cnic == updated_client.cnic).first()
        if existing:
            raise HTTPException(status_code=400, detail="Another client already uses this CNIC")

    update_payload = updated_client.dict(exclude_unset=True)
    for field, value in update_payload.items():
        setattr(client, field, value)

    # Recalculate risk score if financial fields changed
    if any(field in update_payload for field in ["monthly_income", "employment_status", "existing_loans", "credit_history"]):
        client_data = {
            'monthly_income': client.monthly_income,
            'employment_status': client.employment_status,
            'existing_loans': client.existing_loans,
            'credit_history': client.credit_history
        }
        client.risk_score, client.risk_level = risk_scorer.calculate_risk_score(client_data)

    db.commit()
    db.refresh(client)
    return client

@app.delete("/api/clients/{client_id}")
def delete_client(client_id: int, db: Session = Depends(database.get_db), current_user: database.User = Depends(get_current_user)):
    """
    Delete a client and all associated records
    """
    client = db.query(database.Client).filter(database.Client.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    db.delete(client)
    db.commit()
    return {"message": "Client deleted successfully"}

# ============================================
# MODULE 2: Loan Application & Smart Schedule Generation
# ============================================

@app.post("/api/loans/suggest")
def get_loan_suggestions(request: LoanSuggestionRequest, db: Session = Depends(database.get_db), current_user: database.User = Depends(get_current_user)):
    """
    Get AI-powered loan term suggestions for a client
    """
    # Get client data
    client = db.query(database.Client).filter(database.Client.id == request.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    client_data = {
        'monthly_income': client.monthly_income,
        'employment_status': client.employment_status,
        'existing_loans': client.existing_loans,
        'credit_history': client.credit_history
    }
    
    suggestions = risk_scorer.suggest_loan_terms(client_data, request.loan_amount)
    return suggestions

@app.post("/api/loans/", response_model=LoanResponse)
def create_loan(loan: LoanCreate, db: Session = Depends(database.get_db), current_user: database.User = Depends(get_current_user)):
    """
    Create a new loan with automatic repayment schedule generation
    """
    # Verify client exists
    client = db.query(database.Client).filter(database.Client.id == loan.client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Calculate monthly installment
    # Using simple interest formula: Total = Principal + (Principal * Rate * Time)
    total_interest = loan.loan_amount * (loan.interest_rate / 100) * (loan.duration_months / 12)
    total_amount = loan.loan_amount + total_interest
    monthly_installment = total_amount / loan.duration_months
    
    # Create loan
    db_loan = database.Loan(
        client_id=loan.client_id,
        loan_amount=loan.loan_amount,
        loan_type=loan.loan_type,
        interest_rate=loan.interest_rate,
        duration_months=loan.duration_months,
        monthly_installment=round(monthly_installment, 2),
        start_date=loan.start_date,
        status="Active"
    )
    
    db.add(db_loan)
    db.commit()
    db.refresh(db_loan)
    
    # Generate repayment schedule (installments)
    for i in range(loan.duration_months):
        due_date = loan.start_date + timedelta(days=30 * (i + 1))  # Approximate monthly
        installment = database.Installment(
            loan_id=db_loan.id,
            installment_number=i + 1,
            due_date=due_date,
            amount=round(monthly_installment, 2),
            paid=False,
            is_overdue=False
        )
        db.add(installment)
    
    db.commit()
    
    return db_loan

@app.get("/api/loans/", response_model=List[LoanResponse])
def get_all_loans(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: database.User = Depends(get_current_user)):
    """
    Get all loans
    """
    loans = db.query(database.Loan).offset(skip).limit(limit).all()
    return loans

@app.get("/api/loans/{loan_id}", response_model=LoanResponse)
def get_loan(loan_id: int, db: Session = Depends(database.get_db), current_user: database.User = Depends(get_current_user)):
    """
    Get a specific loan by ID
    """
    loan = db.query(database.Loan).filter(database.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    return loan

@app.put("/api/loans/{loan_id}", response_model=LoanResponse)
def update_loan(loan_id: int, updated_loan: LoanUpdate, db: Session = Depends(database.get_db), current_user: database.User = Depends(get_current_user)):
    """
    Update an existing loan. If financial terms change, regenerate the repayment schedule.
    """
    loan = db.query(database.Loan).filter(database.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    update_payload = updated_loan.dict(exclude_unset=True)
    if not update_payload:
        return loan

    regenerate_schedule = any(
        field in update_payload for field in ["loan_amount", "interest_rate", "duration_months", "start_date"]
    )

    for field, value in update_payload.items():
        setattr(loan, field, value)

    if regenerate_schedule:
        if loan.duration_months <= 0:
            raise HTTPException(status_code=400, detail="Duration must be greater than zero")
        total_interest = loan.loan_amount * (loan.interest_rate / 100) * (loan.duration_months / 12)
        total_amount = loan.loan_amount + total_interest
        monthly_installment = total_amount / loan.duration_months
        loan.monthly_installment = round(monthly_installment, 2)

        db.query(database.Installment).filter(database.Installment.loan_id == loan.id).delete()
        for i in range(loan.duration_months):
            due_date = loan.start_date + timedelta(days=30 * (i + 1))
            installment = database.Installment(
                loan_id=loan.id,
                installment_number=i + 1,
                due_date=due_date,
                amount=round(monthly_installment, 2),
                paid=False,
                is_overdue=False
            )
            db.add(installment)

    db.commit()
    db.refresh(loan)
    return loan

@app.delete("/api/loans/{loan_id}")
def delete_loan(loan_id: int, db: Session = Depends(database.get_db), current_user: database.User = Depends(get_current_user)):
    """
    Delete a loan and its installments
    """
    loan = db.query(database.Loan).filter(database.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    db.delete(loan)
    db.commit()
    return {"message": "Loan deleted successfully"}

@app.get("/api/clients/{client_id}/loans", response_model=List[LoanResponse])
def get_client_loans(client_id: int, db: Session = Depends(database.get_db), current_user: database.User = Depends(get_current_user)):
    """
    Get all loans for a specific client
    """
    loans = db.query(database.Loan).filter(database.Loan.client_id == client_id).all()
    return loans

# ============================================
# MODULE 3: Repayment Tracking & Default Alerts
# ============================================

@app.get("/api/loans/{loan_id}/installments", response_model=List[InstallmentResponse])
def get_loan_installments(loan_id: int, db: Session = Depends(database.get_db), current_user: database.User = Depends(get_current_user)):
    """
    Get all installments for a specific loan
    """
    loan = db.query(database.Loan).filter(database.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    installments = db.query(database.Installment).filter(database.Installment.loan_id == loan_id).all()
    return installments

@app.put("/api/installments/{installment_id}/pay")
def mark_installment_paid(installment_id: int, db: Session = Depends(database.get_db), current_user: database.User = Depends(get_current_user)):
    """
    Mark an installment as paid
    """
    installment = db.query(database.Installment).filter(database.Installment.id == installment_id).first()
    if not installment:
        raise HTTPException(status_code=404, detail="Installment not found")
    
    installment.paid = True
    installment.paid_date = datetime.utcnow()
    installment.is_overdue = False
    
    db.commit()
    db.refresh(installment)
    
    # Check if all installments are paid
    loan = db.query(database.Loan).filter(database.Loan.id == installment.loan_id).first()
    all_installments = db.query(database.Installment).filter(database.Installment.loan_id == installment.loan_id).all()
    
    if all(inst.paid for inst in all_installments):
        loan.status = "Completed"
        db.commit()
    
    return {"message": "Installment marked as paid", "installment": installment}

@app.put("/api/loans/{loan_id}/mark-all-paid")
def mark_all_installments_paid(loan_id: int, db: Session = Depends(database.get_db), current_user: database.User = Depends(get_current_user)):
    """
    Mark every installment for a loan as paid (bulk close)
    """
    loan = db.query(database.Loan).filter(database.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")

    installments = db.query(database.Installment).filter(database.Installment.loan_id == loan_id).all()
    updated = 0
    now = datetime.utcnow()
    for inst in installments:
        if not inst.paid:
            inst.paid = True
            inst.paid_date = now
            inst.is_overdue = False
            updated += 1

    loan.status = "Completed"
    db.commit()

    return {"message": f"Marked {updated} installments as paid", "completed": True}

@app.put("/api/installments/update-overdue")
def update_overdue_status(db: Session = Depends(database.get_db), current_user: database.User = Depends(get_current_user)):
    """
    Update overdue status for all unpaid installments
    """
    current_date = datetime.utcnow()
    installments = db.query(database.Installment).filter(
        database.Installment.paid == False,
        database.Installment.due_date < current_date
    ).all()
    
    count = 0
    for installment in installments:
        installment.is_overdue = True
        count += 1
    
    db.commit()
    
    return {"message": f"Updated {count} overdue installments"}

@app.get("/api/loans/{loan_id}/alerts")
def get_loan_alerts(loan_id: int, db: Session = Depends(database.get_db), current_user: database.User = Depends(get_current_user)):
    """
    Get default alerts for a specific loan using AI
    """
    loan = db.query(database.Loan).filter(database.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    
    # Get loan data
    loan_data = {
        'status': loan.status,
        'loan_amount': loan.loan_amount
    }
    
    # Get installments data
    installments = db.query(database.Installment).filter(database.Installment.loan_id == loan_id).all()
    installments_data = [
        {
            'paid': inst.paid,
            'is_overdue': inst.is_overdue,
            'due_date': inst.due_date.isoformat()
        }
        for inst in installments
    ]
    
    # Get client risk score
    client_risk_score = loan.client.risk_score or 50
    overdue_count = sum(1 for inst in installments if inst.is_overdue and not inst.paid)
    
    # Generate alerts
    alerts = alert_system.check_default_risk(loan_data, installments_data)
    default_probability = alert_system.calculate_default_probability(loan_data, client_risk_score, overdue_count)
    
    return {
        "loan_id": loan_id,
        "alerts": alerts,
        "default_probability": default_probability,
        "overdue_installments": overdue_count,
        "total_installments": len(installments)
    }

@app.get("/api/alerts/all")
def get_all_alerts(db: Session = Depends(database.get_db), current_user: database.User = Depends(get_current_user)):
    """
    Get alerts for all active loans
    """
    loans = db.query(database.Loan).filter(database.Loan.status == "Active").all()
    all_alerts = []
    
    for loan in loans:
        installments = db.query(database.Installment).filter(database.Installment.loan_id == loan.id).all()
        overdue_count = sum(1 for inst in installments if inst.is_overdue and not inst.paid)
        
        if overdue_count > 0:
            all_alerts.append({
                "loan_id": loan.id,
                "client_name": loan.client.name,
                "client_id": loan.client_id,
                "overdue_count": overdue_count,
                "loan_amount": loan.loan_amount,
                "risk_level": loan.client.risk_level
            })
    
    return {"alerts": all_alerts, "total_count": len(all_alerts)}

# ============================================
# MODULE 4: Dashboard & Analytics
# ============================================

@app.get("/api/dashboard/stats")
def get_dashboard_stats(db: Session = Depends(database.get_db), current_user: database.User = Depends(get_current_user)):
    """
    Get comprehensive dashboard statistics
    """
    # Total clients
    total_clients = db.query(database.Client).count()
    
    # Risk distribution
    low_risk = db.query(database.Client).filter(database.Client.risk_level == "Low").count()
    medium_risk = db.query(database.Client).filter(database.Client.risk_level == "Medium").count()
    high_risk = db.query(database.Client).filter(database.Client.risk_level == "High").count()
    
    # Loan statistics
    total_loans = db.query(database.Loan).count()
    active_loans = db.query(database.Loan).filter(database.Loan.status == "Active").count()
    completed_loans = db.query(database.Loan).filter(database.Loan.status == "Completed").count()
    defaulted_loans = db.query(database.Loan).filter(database.Loan.status == "Defaulted").count()
    
    # Financial statistics
    loans = db.query(database.Loan).all()
    total_disbursed = sum(loan.loan_amount for loan in loans)
    
    # Calculate total expected and collected
    total_expected = 0
    total_collected = 0
    current_year = datetime.utcnow().year
    yearly_disbursed = 0
    yearly_expected = 0
    yearly_collected = 0
    
    for loan in loans:
        installments = db.query(database.Installment).filter(database.Installment.loan_id == loan.id).all()
        total_expected += sum(inst.amount for inst in installments)
        total_collected += sum(inst.amount for inst in installments if inst.paid)

        if loan.start_date.year == current_year:
            yearly_disbursed += loan.loan_amount
            yearly_expected += sum(inst.amount for inst in installments if inst.due_date.year == current_year)
            yearly_collected += sum(
                inst.amount for inst in installments if inst.paid and inst.paid_date and inst.paid_date.year == current_year
            )
    
    # Active overdue count
    overdue_count = db.query(database.Installment).filter(
        database.Installment.is_overdue == True,
        database.Installment.paid == False
    ).count()
    
    # Loan type distribution
    loan_types = {}
    for loan in loans:
        loan_types[loan.loan_type] = loan_types.get(loan.loan_type, 0) + 1
    
    return {
        "clients": {
            "total": total_clients,
            "risk_distribution": {
                "low": low_risk,
                "medium": medium_risk,
                "high": high_risk
            }
        },
        "loans": {
            "total": total_loans,
            "active": active_loans,
            "completed": completed_loans,
            "defaulted": defaulted_loans
        },
        "financial": {
            "total_disbursed": round(total_disbursed, 2),
            "total_expected": round(total_expected, 2),
            "total_collected": round(total_collected, 2),
            "collection_rate": round((total_collected / total_expected * 100) if total_expected > 0 else 0, 2),
            "yearly": {
                "year": current_year,
                "disbursed": round(yearly_disbursed, 2),
                "expected": round(yearly_expected, 2),
                "collected": round(yearly_collected, 2)
            }
        },
        "alerts": {
            "overdue_installments": overdue_count
        },
        "loan_types": loan_types
    }

# ============================================
# Health Check
# ============================================

@app.get("/")
def root():
    return {
        "message": "SahulatFin API",
        "version": "1.0.0",
        "status": "active"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}

