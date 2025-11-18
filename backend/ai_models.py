from datetime import datetime, timedelta

class RiskScorer:
    """
    AI-based risk scoring system for client credit risk assessment.
    Uses a weighted scoring model based on multiple factors.
    """
    
    def __init__(self):
        self.weights = {
            'income': 0.25,
            'employment': 0.20,
            'existing_loans': 0.20,
            'credit_history': 0.25,
            'loan_to_income': 0.10
        }
    
    def calculate_risk_score(self, client_data, loan_amount=None):
        """
        Calculate risk score (0-100) where higher score = higher risk
        Returns: (risk_score, risk_level)
        """
        scores = []
        
        # 1. Income Score (inverse - higher income = lower risk)
        income = client_data.get('monthly_income', 0)
        if income >= 50000:
            income_score = 10
        elif income >= 30000:
            income_score = 30
        elif income >= 20000:
            income_score = 50
        elif income >= 10000:
            income_score = 70
        else:
            income_score = 90
        scores.append(income_score * self.weights['income'])
        
        # 2. Employment Status Score
        employment = client_data.get('employment_status', '').lower()
        if employment == 'employed':
            employment_score = 20
        elif employment == 'self-employed':
            employment_score = 40
        else:
            employment_score = 80
        scores.append(employment_score * self.weights['employment'])
        
        # 3. Existing Loans Score
        existing_loans = client_data.get('existing_loans', 0)
        if existing_loans == 0:
            loans_score = 10
        elif existing_loans == 1:
            loans_score = 30
        elif existing_loans == 2:
            loans_score = 60
        else:
            loans_score = 90
        scores.append(loans_score * self.weights['existing_loans'])
        
        # 4. Credit History Score
        credit_history = client_data.get('credit_history', '').lower()
        if credit_history == 'good':
            credit_score = 15
        elif credit_history == 'average':
            credit_score = 50
        else:
            credit_score = 85
        scores.append(credit_score * self.weights['credit_history'])
        
        # 5. Loan-to-Income Ratio (if loan amount provided)
        if loan_amount and income > 0:
            loan_to_income_ratio = loan_amount / income
            if loan_to_income_ratio <= 5:
                lti_score = 20
            elif loan_to_income_ratio <= 10:
                lti_score = 40
            elif loan_to_income_ratio <= 20:
                lti_score = 60
            else:
                lti_score = 90
            scores.append(lti_score * self.weights['loan_to_income'])
        else:
            # Default score if no loan amount
            scores.append(40 * self.weights['loan_to_income'])
        
        # Calculate final risk score
        risk_score = sum(scores)
        
        # Determine risk level
        if risk_score <= 30:
            risk_level = "Low"
        elif risk_score <= 60:
            risk_level = "Medium"
        else:
            risk_level = "High"
        
        return round(risk_score, 2), risk_level
    
    def suggest_loan_terms(self, client_data, loan_amount):
        """
        AI-powered loan term suggestions based on risk profile
        Returns recommended interest rate and duration
        """
        risk_score, risk_level = self.calculate_risk_score(client_data, loan_amount)
        income = client_data.get('monthly_income', 0) or 0
        existing_loans = client_data.get('existing_loans', 0) or 0
        
        # Base interest rates by risk level
        if risk_level == "Low":
            base_interest_rate = 12.0  # 12% annual
            max_duration = 36  # 36 months
        elif risk_level == "Medium":
            base_interest_rate = 18.0  # 18% annual
            max_duration = 24  # 24 months
        else:
            base_interest_rate = 24.0  # 24% annual
            max_duration = 12  # 12 months
        
        # Adjust based on loan amount
        if loan_amount > 500000:
            base_interest_rate += 2
        elif loan_amount < 50000:
            base_interest_rate -= 1
        
        # Recommended duration based on loan amount
        if loan_amount <= 50000:
            recommended_duration = min(12, max_duration)
        elif loan_amount <= 200000:
            recommended_duration = min(18, max_duration)
        else:
            recommended_duration = max_duration
        
        monthly_interest_rate = (base_interest_rate / 100) / 12
        monthly_installment = (loan_amount * (1 + (base_interest_rate / 100) * (recommended_duration / 12))) / recommended_duration

        loan_to_income_ratio = (loan_amount / income) if income else None
        debt_service_ratio = ((monthly_installment / income) * 100) if income else None
        max_safe_amount = income * 15 if income else loan_amount
        stress_test_interest = base_interest_rate + 3
        stress_test_installment = ((loan_amount * (1 + (stress_test_interest / 100) * (recommended_duration / 12))) / recommended_duration)

        insights = []
        if debt_service_ratio and debt_service_ratio > 35:
            insights.append("Installments exceed 35% of monthly income. Consider lowering loan amount.")
        if loan_to_income_ratio and loan_to_income_ratio > 12:
            insights.append("Loan-to-income ratio is higher than typical microfinance thresholds.")
        if existing_loans >= 2:
            insights.append("Client already services multiple loans. Verify repayment discipline.")
        if not insights:
            insights.append("Risk level is under control. Proceed with standard monitoring cadence.")

        return {
            "recommended_interest_rate": round(base_interest_rate, 2),
            "recommended_duration_months": recommended_duration,
            "recommended_monthly_installment": round(monthly_installment, 2),
            "risk_level": risk_level,
            "risk_score": risk_score,
            "loan_to_income_ratio": round(loan_to_income_ratio, 2) if loan_to_income_ratio else None,
            "debt_service_ratio": round(debt_service_ratio, 2) if debt_service_ratio else None,
            "max_suggested_loan": round(max_safe_amount, 2),
            "stress_test": {
                "interest_rate": round(stress_test_interest, 2),
                "monthly_installment": round(stress_test_installment, 2)
            },
            "approval_recommendation": "Approve" if risk_level in ["Low", "Medium"] else "Review Required",
            "insights": insights
        }


class DefaultAlertSystem:
    """
    AI-based system for detecting and alerting on potential loan defaults
    """
    
    @staticmethod
    def check_default_risk(loan_data, installments_data):
        """
        Analyze loan and installment data to detect default risks
        Returns list of alerts
        """
        alerts = []
        
        # Count overdue installments
        overdue_count = sum(1 for inst in installments_data if inst.get('is_overdue') and not inst.get('paid'))
        paid_count = sum(1 for inst in installments_data if inst.get('paid'))
        total_count = len(installments_data)
        
        # Alert 1: Multiple missed payments
        if overdue_count >= 3:
            alerts.append({
                "severity": "High",
                "type": "Multiple Missed Payments",
                "message": f"{overdue_count} installments are overdue. Immediate action required.",
                "recommendation": "Contact client immediately and consider restructuring the loan."
            })
        elif overdue_count >= 2:
            alerts.append({
                "severity": "Medium",
                "type": "Missed Payments",
                "message": f"{overdue_count} installments are overdue.",
                "recommendation": "Follow up with client and send reminder."
            })
        elif overdue_count == 1:
            alerts.append({
                "severity": "Low",
                "type": "Single Missed Payment",
                "message": "1 installment is overdue.",
                "recommendation": "Send payment reminder to client."
            })
        
        # Alert 2: Payment pattern analysis
        if total_count > 3 and paid_count > 0:
            payment_rate = paid_count / total_count
            if payment_rate < 0.5:
                alerts.append({
                    "severity": "High",
                    "type": "Poor Payment History",
                    "message": f"Only {int(payment_rate * 100)}% of installments paid on time.",
                    "recommendation": "Assess client's financial situation and consider intervention."
                })
        
        # Alert 3: Recent payment issues
        recent_installments = sorted(installments_data, key=lambda x: x.get('due_date', ''), reverse=True)[:3]
        recent_unpaid = sum(1 for inst in recent_installments if not inst.get('paid'))
        if recent_unpaid >= 2:
            alerts.append({
                "severity": "Medium",
                "type": "Recent Payment Issues",
                "message": "Multiple recent payments missed.",
                "recommendation": "Investigate reason for recent payment issues."
            })
        
        return alerts
    
    @staticmethod
    def calculate_default_probability(loan_data, client_risk_score, overdue_count):
        """
        Calculate probability of loan default (0-100%)
        """
        base_probability = client_risk_score * 0.5  # Start with 50% of risk score
        
        # Adjust based on overdue payments
        overdue_penalty = overdue_count * 15
        
        # Adjust based on loan status
        if loan_data.get('status') == 'Active':
            status_factor = 1.0
        else:
            status_factor = 1.5
        
        default_probability = min(100, (base_probability + overdue_penalty) * status_factor)
        
        return round(default_probability, 2)

