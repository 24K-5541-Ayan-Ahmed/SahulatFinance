import { useState, useEffect } from "react";
import {
  getAllClients,
  createLoan,
  getLoanSuggestions,
  getAllLoans,
  updateLoan,
  deleteLoan,
} from "../api";

function LoanApplication() {
  const [clients, setClients] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [editingLoanId, setEditingLoanId] = useState(null);

  const [formData, setFormData] = useState({
    client_id: "",
    loan_amount: "",
    loan_type: "Business",
    interest_rate: "",
    duration_months: "",
    start_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchClients();
    fetchLoans();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await getAllClients();
      setClients(response.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await getAllLoans();
      setLoans(response.data);
    } catch (error) {
      console.error("Error fetching loans:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: "",
      loan_amount: "",
      loan_type: "Business",
      interest_rate: "",
      duration_months: "",
      start_date: new Date().toISOString().split("T")[0],
    });
    setEditingLoanId(null);
    setSuggestions(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "client_id" || name === "loan_amount") {
      setSuggestions(null);
    }
  };

  const handleGetSuggestions = async () => {
    if (!formData.client_id || !formData.loan_amount) {
      setMessage({
        type: "error",
        text: "Select a client and enter the loan amount to get AI recommendations.",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await getLoanSuggestions(
        parseInt(formData.client_id, 10),
        parseFloat(formData.loan_amount)
      );
      setSuggestions(response.data);
      setFormData((prev) => ({
        ...prev,
        interest_rate: response.data.recommended_interest_rate.toString(),
        duration_months: response.data.recommended_duration_months.toString(),
      }));
    } catch (error) {
      console.error("Error getting suggestions:", error);
      setMessage({
        type: "error",
        text: "Unable to fetch AI suggestions right now.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        client_id: parseInt(formData.client_id, 10),
        loan_amount: parseFloat(formData.loan_amount),
        loan_type: formData.loan_type,
        interest_rate: parseFloat(formData.interest_rate),
        duration_months: parseInt(formData.duration_months, 10),
        start_date: new Date(formData.start_date).toISOString(),
      };

      if (editingLoanId) {
        await updateLoan(editingLoanId, payload);
      } else {
        await createLoan(payload);
      }

      setMessage({
        type: "success",
        text: `Loan ${
          editingLoanId ? "updated" : "created"
        } successfully with a refreshed schedule.`,
      });
      resetForm();
      setShowForm(false);
      fetchLoans();
    } catch (error) {
      console.error("Error saving loan:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.detail ||
          "Error saving loan. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditLoan = (loan) => {
    setFormData({
      client_id: loan.client_id.toString(),
      loan_amount: loan.loan_amount,
      loan_type: loan.loan_type,
      interest_rate: loan.interest_rate,
      duration_months: loan.duration_months,
      start_date: new Date(loan.start_date).toISOString().split("T")[0],
    });
    setEditingLoanId(loan.id);
    setShowForm(true);
  };

  const handleDeleteLoan = async (loanId) => {
    if (!window.confirm("Delete this loan and its installments?")) return;
    try {
      setLoading(true);
      await deleteLoan(loanId);
      setMessage({ type: "success", text: "Loan deleted successfully." });
      fetchLoans();
    } catch (error) {
      console.error("Error deleting loan:", error);
      setMessage({ type: "error", text: "Unable to delete loan right now." });
    } finally {
      setLoading(false);
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : "Unknown";
  };

  const renderSuggestionDetails = () => {
    if (!suggestions) return null;
    return (
      <div className="suggestion-box">
        <h4>AI Recommendation Snapshot</h4>
        <div className="suggestion-item">
          <strong>Risk assessment:</strong>
          <span
            className={`badge badge-${suggestions.risk_level.toLowerCase()}`}
          >
            {suggestions.risk_level} ({suggestions.risk_score})
          </span>
        </div>
        <div className="suggestion-item">
          <strong>Recommended interest rate:</strong>
          <span>{suggestions.recommended_interest_rate}% per annum</span>
        </div>
        <div className="suggestion-item">
          <strong>Recommended tenure:</strong>
          <span>{suggestions.recommended_duration_months} months</span>
        </div>
        <div className="suggestion-item">
          <strong>Monthly installment:</strong>
          <span>
            ₨ {suggestions.recommended_monthly_installment.toLocaleString()}
          </span>
        </div>
        {suggestions.debt_service_ratio && (
          <div className="suggestion-item">
            <strong>Debt service ratio:</strong>
            <span>{suggestions.debt_service_ratio}% of income</span>
          </div>
        )}
        {suggestions.loan_to_income_ratio && (
          <div className="suggestion-item">
            <strong>Loan-to-income ratio:</strong>
            <span>{suggestions.loan_to_income_ratio}x</span>
          </div>
        )}
        <div className="suggestion-item">
          <strong>Stress test installment:</strong>
          <span>
            ₨ {suggestions.stress_test.monthly_installment.toLocaleString()} at{" "}
            {suggestions.stress_test.interest_rate}% APR
          </span>
        </div>
        <div className="suggestion-item">
          <strong>Max suggested exposure:</strong>
          <span>₨ {suggestions.max_suggested_loan.toLocaleString()}</span>
        </div>
        <div>
          <strong>Actionable insights:</strong>
          <ul
            style={{
              marginTop: "0.5rem",
              paddingLeft: "1.25rem",
              color: "#475467",
            }}
          >
            {suggestions.insights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        </div>
        <div className="suggestion-item">
          <strong>Recommendation:</strong>
          <span
            className={`badge ${
              suggestions.approval_recommendation === "Approve"
                ? "badge-low"
                : "badge-medium"
            }`}
          >
            {suggestions.approval_recommendation}
          </span>
        </div>
      </div>
    );
  };

  return (
    <section className="page-section">
      <div className="page-header">
        <button
          className="btn btn-primary"
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
        >
          {showForm ? "Close builder" : "+ Create loan"}
        </button>
      </div>

      <div className="card">
        {message && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{ marginTop: "1.5rem", marginBottom: "2rem" }}
          >
            <div className="form-row">
              <div className="form-group">
                <label>Select Client *</label>
                <select
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Select Client --</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} (CNIC: {client.cnic}) — Risk:{" "}
                      {client.risk_level}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Loan Amount (₨) *</label>
                <input
                  type="number"
                  name="loan_amount"
                  value={formData.loan_amount}
                  onChange={handleInputChange}
                  required
                  min="1000"
                  step="0.01"
                  placeholder="Enter loan amount"
                />
              </div>
            </div>

            <div style={{ marginBottom: "1.2rem" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleGetSuggestions}
                disabled={
                  !formData.client_id || !formData.loan_amount || loading
                }
              >
                Generate AI loan suggestions
              </button>
            </div>

            {renderSuggestionDetails()}

            <div className="form-row">
              <div className="form-group">
                <label>Loan Type *</label>
                <select
                  name="loan_type"
                  value={formData.loan_type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Business">Business</option>
                  <option value="Personal">Personal</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Education">Education</option>
                </select>
              </div>

              <div className="form-group">
                <label>Interest Rate (% per annum) *</label>
                <input
                  type="number"
                  name="interest_rate"
                  value={formData.interest_rate}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="50"
                  step="0.1"
                  placeholder="Enter interest rate"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Duration (Months) *</label>
                <input
                  type="number"
                  name="duration_months"
                  value={formData.duration_months}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="60"
                  placeholder="Enter duration in months"
                />
              </div>

              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? "Saving loan..."
                : editingLoanId
                ? "Update loan"
                : "Create loan & schedule"}
            </button>
          </form>
        )}

        <h3>All loans ({loans.length})</h3>

        {loading && !showForm ? (
          <div className="loading">Loading loan book...</div>
        ) : loans.length === 0 ? (
          <div className="empty-state">
            <p>
              No loans created yet. Click “Create loan” to start disbursing.
            </p>
          </div>
        ) : (
          <div className="table-container" style={{ marginTop: "1rem" }}>
            <table>
              <thead>
                <tr>
                  <th>Loan ID</th>
                  <th>Client Name</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Interest Rate</th>
                  <th>Duration</th>
                  <th>Monthly Installment</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id}>
                    <td>#{loan.id}</td>
                    <td>{getClientName(loan.client_id)}</td>
                    <td>₨ {loan.loan_amount.toLocaleString()}</td>
                    <td>{loan.loan_type}</td>
                    <td>{loan.interest_rate}%</td>
                    <td>{loan.duration_months} months</td>
                    <td>₨ {loan.monthly_installment.toLocaleString()}</td>
                    <td>
                      <span
                        className={`badge badge-${loan.status.toLowerCase()}`}
                      >
                        {loan.status}
                      </span>
                    </td>
                    <td>{new Date(loan.start_date).toLocaleDateString()}</td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleEditLoan(loan)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteLoan(loan.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default LoanApplication;
