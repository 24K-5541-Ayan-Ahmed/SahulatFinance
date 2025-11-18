-- =============================================================================
-- AI-Enhanced Microfinance Loan Management System (MLMS)
-- Database Schema - SQLite
-- =============================================================================
-- This file documents the complete database schema for the MLMS application.
-- The actual tables are created automatically by SQLAlchemy when the backend
-- starts up. This file is for reference and documentation purposes.
-- =============================================================================

-- =============================================================================
-- TABLE: clients
-- Purpose: Store client information and AI-calculated risk profiles
-- =============================================================================
CREATE TABLE IF NOT EXISTS clients (
    -- Primary Key
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Client Personal Information
    name VARCHAR NOT NULL,                  -- Full name of the client
    cnic VARCHAR UNIQUE NOT NULL,           -- National ID (must be unique)
    phone VARCHAR NOT NULL,                 -- Contact phone number
    address VARCHAR NOT NULL,               -- Complete address
    
    -- Financial Information
    monthly_income FLOAT NOT NULL,          -- Monthly income in local currency
    employment_status VARCHAR NOT NULL,     -- Values: 'Employed', 'Self-Employed', 'Unemployed'
    existing_loans INTEGER DEFAULT 0,       -- Number of existing loans
    credit_history VARCHAR NOT NULL,        -- Values: 'Good', 'Average', 'Poor'
    
    -- AI-Generated Risk Assessment
    risk_score FLOAT,                       -- AI-calculated score (0-100)
    risk_level VARCHAR,                     -- AI-categorized: 'Low', 'Medium', 'High'
    
    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups by CNIC
CREATE INDEX IF NOT EXISTS idx_clients_cnic ON clients(cnic);

-- Index for risk level filtering
CREATE INDEX IF NOT EXISTS idx_clients_risk_level ON clients(risk_level);

-- =============================================================================
-- TABLE: loans
-- Purpose: Store loan information, terms, and status
-- =============================================================================
CREATE TABLE IF NOT EXISTS loans (
    -- Primary Key
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Foreign Key to clients table
    client_id INTEGER NOT NULL,
    
    -- Loan Terms
    loan_amount FLOAT NOT NULL,             -- Principal amount
    loan_type VARCHAR NOT NULL,             -- Values: 'Business', 'Personal', 'Agriculture', 'Education'
    interest_rate FLOAT NOT NULL,           -- Annual interest rate (percentage)
    duration_months INTEGER NOT NULL,       -- Loan duration in months
    monthly_installment FLOAT NOT NULL,     -- Calculated monthly payment amount
    
    -- Loan Timeline
    start_date DATETIME NOT NULL,           -- Loan start date
    
    -- Loan Status
    status VARCHAR DEFAULT 'Active',        -- Values: 'Active', 'Completed', 'Defaulted'
    
    -- Metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraint
    FOREIGN KEY (client_id) REFERENCES clients(id)
);

-- Index for faster lookups by client
CREATE INDEX IF NOT EXISTS idx_loans_client_id ON loans(client_id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);

-- Index for loan type analytics
CREATE INDEX IF NOT EXISTS idx_loans_type ON loans(loan_type);

-- =============================================================================
-- TABLE: installments
-- Purpose: Store repayment schedule and track payment status
-- =============================================================================
CREATE TABLE IF NOT EXISTS installments (
    -- Primary Key
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Foreign Key to loans table
    loan_id INTEGER NOT NULL,
    
    -- Installment Details
    installment_number INTEGER NOT NULL,    -- Sequential number (1, 2, 3, ...)
    due_date DATETIME NOT NULL,             -- Payment due date
    amount FLOAT NOT NULL,                  -- Installment amount
    
    -- Payment Tracking
    paid BOOLEAN DEFAULT FALSE,             -- Payment status (0 = unpaid, 1 = paid)
    paid_date DATETIME,                     -- Actual payment date (NULL if unpaid)
    is_overdue BOOLEAN DEFAULT FALSE,       -- Overdue flag (updated by system)
    
    -- Foreign Key Constraint with Cascade Delete
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE
);

-- Index for faster lookups by loan
CREATE INDEX IF NOT EXISTS idx_installments_loan_id ON installments(loan_id);

-- Index for payment status filtering
CREATE INDEX IF NOT EXISTS idx_installments_paid ON installments(paid);

-- Index for overdue tracking
CREATE INDEX IF NOT EXISTS idx_installments_overdue ON installments(is_overdue);

-- Index for due date queries
CREATE INDEX IF NOT EXISTS idx_installments_due_date ON installments(due_date);

-- =============================================================================
-- RELATIONSHIPS
-- =============================================================================

/*
Relationship Diagram:

┌──────────────┐
│   clients    │
│  (Parent)    │
└──────┬───────┘
       │ 1:N (One-to-Many)
       │ One client can have multiple loans
       │
┌──────▼───────┐
│    loans     │
│  (Child of   │
│   clients)   │
└──────┬───────┘
       │ 1:N (One-to-Many)
       │ One loan has multiple installments
       │
┌──────▼────────┐
│ installments  │
│  (Child of    │
│    loans)     │
└───────────────┘

Cascade Rules:
- If a loan is deleted → All its installments are automatically deleted
- If a client is deleted → Manual handling required (business logic)
*/

-- =============================================================================
-- SAMPLE DATA FOR TESTING
-- =============================================================================

-- Sample Client 1 (Low Risk)
INSERT INTO clients (name, cnic, phone, address, monthly_income, employment_status, existing_loans, credit_history, risk_score, risk_level)
VALUES ('Ahmed Khan', '12345-1234567-1', '+92-300-1234567', '123 Main St, Karachi', 50000, 'Employed', 0, 'Good', 20.5, 'Low');

-- Sample Client 2 (Medium Risk)
INSERT INTO clients (name, cnic, phone, address, monthly_income, employment_status, existing_loans, credit_history, risk_score, risk_level)
VALUES ('Fatima Ali', '23456-2345678-2', '+92-321-2345678', '456 Park Ave, Lahore', 30000, 'Self-Employed', 1, 'Average', 45.0, 'Medium');

-- Sample Client 3 (High Risk)
INSERT INTO clients (name, cnic, phone, address, monthly_income, employment_status, existing_loans, credit_history, risk_score, risk_level)
VALUES ('Hassan Mahmood', '34567-3456789-3', '+92-333-3456789', '789 Green Rd, Islamabad', 15000, 'Self-Employed', 2, 'Poor', 72.5, 'High');

-- Sample Loan for Ahmed Khan
INSERT INTO loans (client_id, loan_amount, loan_type, interest_rate, duration_months, monthly_installment, start_date, status)
VALUES (1, 100000, 'Business', 12.0, 12, 8800, '2025-01-01 00:00:00', 'Active');

-- Sample Installments for the loan (3 months shown)
INSERT INTO installments (loan_id, installment_number, due_date, amount, paid, paid_date, is_overdue)
VALUES 
(1, 1, '2025-02-01 00:00:00', 8800, TRUE, '2025-02-01 10:30:00', FALSE),
(1, 2, '2025-03-01 00:00:00', 8800, TRUE, '2025-03-02 14:15:00', FALSE),
(1, 3, '2025-04-01 00:00:00', 8800, FALSE, NULL, FALSE);

-- =============================================================================
-- USEFUL QUERIES FOR COMMON OPERATIONS
-- =============================================================================

-- 1. Get all clients with their risk levels
SELECT id, name, cnic, risk_score, risk_level, monthly_income 
FROM clients 
ORDER BY risk_score DESC;

-- 2. Get all active loans with client names
SELECT l.id, c.name, l.loan_amount, l.loan_type, l.status, l.start_date
FROM loans l
JOIN clients c ON l.client_id = c.id
WHERE l.status = 'Active';

-- 3. Get all unpaid overdue installments
SELECT i.id, l.id as loan_id, c.name, i.due_date, i.amount
FROM installments i
JOIN loans l ON i.loan_id = l.id
JOIN clients c ON l.client_id = c.id
WHERE i.paid = FALSE AND i.is_overdue = TRUE
ORDER BY i.due_date;

-- 4. Calculate total disbursed amount
SELECT SUM(loan_amount) as total_disbursed
FROM loans;

-- 5. Calculate collection rate
SELECT 
    SUM(CASE WHEN paid = TRUE THEN amount ELSE 0 END) as collected,
    SUM(amount) as total_expected,
    ROUND(SUM(CASE WHEN paid = TRUE THEN amount ELSE 0 END) * 100.0 / SUM(amount), 2) as collection_rate
FROM installments;

-- 6. Get client with all their loans
SELECT 
    c.name,
    c.risk_level,
    COUNT(l.id) as total_loans,
    SUM(l.loan_amount) as total_loan_amount,
    SUM(CASE WHEN l.status = 'Active' THEN 1 ELSE 0 END) as active_loans
FROM clients c
LEFT JOIN loans l ON c.id = l.client_id
GROUP BY c.id, c.name, c.risk_level;

-- 7. Get payment progress for a specific loan
SELECT 
    l.id as loan_id,
    COUNT(i.id) as total_installments,
    SUM(CASE WHEN i.paid = TRUE THEN 1 ELSE 0 END) as paid_installments,
    SUM(CASE WHEN i.is_overdue = TRUE AND i.paid = FALSE THEN 1 ELSE 0 END) as overdue_installments,
    ROUND(SUM(CASE WHEN i.paid = TRUE THEN 1 ELSE 0 END) * 100.0 / COUNT(i.id), 2) as payment_progress
FROM loans l
JOIN installments i ON l.id = i.loan_id
WHERE l.id = 1
GROUP BY l.id;

-- 8. Risk distribution statistics
SELECT 
    risk_level,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM clients), 2) as percentage
FROM clients
GROUP BY risk_level;

-- 9. Loan type distribution
SELECT 
    loan_type,
    COUNT(*) as count,
    SUM(loan_amount) as total_amount
FROM loans
GROUP BY loan_type;

-- 10. Clients with most overdue payments
SELECT 
    c.name,
    c.cnic,
    l.id as loan_id,
    COUNT(CASE WHEN i.is_overdue = TRUE AND i.paid = FALSE THEN 1 END) as overdue_count
FROM clients c
JOIN loans l ON c.id = l.client_id
JOIN installments i ON l.id = i.loan_id
WHERE l.status = 'Active'
GROUP BY c.id, c.name, c.cnic, l.id
HAVING overdue_count > 0
ORDER BY overdue_count DESC;

-- =============================================================================
-- MAINTENANCE QUERIES
-- =============================================================================

-- Update overdue status for all installments
UPDATE installments 
SET is_overdue = TRUE 
WHERE paid = FALSE AND due_date < datetime('now');

-- Mark loan as completed when all installments are paid
UPDATE loans
SET status = 'Completed'
WHERE id IN (
    SELECT loan_id
    FROM installments
    GROUP BY loan_id
    HAVING COUNT(*) = SUM(CASE WHEN paid = TRUE THEN 1 ELSE 0 END)
) AND status = 'Active';

-- =============================================================================
-- DATABASE STATISTICS
-- =============================================================================

-- Get table sizes and row counts
SELECT 'clients' as table_name, COUNT(*) as row_count FROM clients
UNION ALL
SELECT 'loans', COUNT(*) FROM loans
UNION ALL
SELECT 'installments', COUNT(*) FROM installments;

-- =============================================================================
-- NOTES
-- =============================================================================

/*
1. Database File: mlms_database.db (created automatically in backend folder)

2. SQLite Features Used:
   - AUTOINCREMENT for primary keys
   - FOREIGN KEY constraints
   - CASCADE DELETE on installments
   - DEFAULT values
   - UNIQUE constraints
   - Indexes for performance

3. Data Types:
   - INTEGER: Whole numbers (IDs, counts)
   - FLOAT: Decimal numbers (money, scores)
   - VARCHAR: Text strings (names, addresses)
   - DATETIME: Date and time stamps
   - BOOLEAN: True/False values (stored as 0/1 in SQLite)

4. Best Practices Implemented:
   - Primary keys on all tables
   - Foreign key constraints
   - Indexes on frequently queried columns
   - Meaningful column names
   - NOT NULL constraints where appropriate
   - Default values for optional fields

5. Backup Recommendation:
   - Simply copy the mlms_database.db file
   - Use SQLite backup command: .backup backup.db
   - Regular backups recommended for production

6. Tools to View Database:
   - DB Browser for SQLite (https://sqlitebrowser.org/)
   - DBeaver (https://dbeaver.io/)
   - Command line: sqlite3 mlms_database.db
*/

