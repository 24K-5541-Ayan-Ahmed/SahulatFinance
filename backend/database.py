from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

# SQLite database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///./mlms_database.db"

# Create engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Database Models
class Client(Base):
    __tablename__ = "clients"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    cnic = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String, nullable=False)
    address = Column(String, nullable=False)
    monthly_income = Column(Float, nullable=False)
    employment_status = Column(String, nullable=False)  # Employed, Self-Employed, Unemployed
    existing_loans = Column(Integer, default=0)
    credit_history = Column(String, nullable=False)  # Good, Average, Poor
    risk_score = Column(Float, nullable=True)  # 0-100
    risk_level = Column(String, nullable=True)  # Low, Medium, High
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    loans = relationship("Loan", back_populates="client", cascade="all, delete-orphan")


class Loan(Base):
    __tablename__ = "loans"
    
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    loan_amount = Column(Float, nullable=False)
    loan_type = Column(String, nullable=False)  # Business, Personal, Agriculture, Education
    interest_rate = Column(Float, nullable=False)  # Annual percentage
    duration_months = Column(Integer, nullable=False)
    monthly_installment = Column(Float, nullable=False)
    start_date = Column(DateTime, nullable=False)
    status = Column(String, default="Active")  # Active, Completed, Defaulted
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    client = relationship("Client", back_populates="loans")
    installments = relationship("Installment", back_populates="loan", cascade="all, delete-orphan")


class Installment(Base):
    __tablename__ = "installments"
    
    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(Integer, ForeignKey("loans.id"), nullable=False)
    installment_number = Column(Integer, nullable=False)
    due_date = Column(DateTime, nullable=False)
    amount = Column(Float, nullable=False)
    paid = Column(Boolean, default=False)
    paid_date = Column(DateTime, nullable=True)
    is_overdue = Column(Boolean, default=False)
    
    # Relationships
    loan = relationship("Loan", back_populates="installments")


# Create all tables
def init_db():
    Base.metadata.create_all(bind=engine)


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

