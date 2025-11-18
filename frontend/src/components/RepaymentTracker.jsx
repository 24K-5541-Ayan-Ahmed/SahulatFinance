import { useState, useEffect } from "react";
import {
  getAllLoans,
  getLoanInstallments,
  markInstallmentPaid,
  getLoanAlerts,
  getAllClients,
  markAllInstallmentsPaid,
} from "../api";

function RepaymentTracker() {
  const [loans, setLoans] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchLoans();
    fetchClients();
  }, []);

  const fetchLoans = async () => {
    try {
      const response = await getAllLoans();
      setLoans(response.data);
    } catch (error) {
      console.error("Error fetching loans:", error);
    }
  };

  const handleMarkAllPaid = async () => {
    if (!selectedLoan) return;
    if (!window.confirm("Mark every installment for this loan as paid?"))
      return;
    try {
      setLoading(true);
      await markAllInstallmentsPaid(selectedLoan.id);
      setMessage({ type: "success", text: "All installments marked as paid." });
      await handleLoanSelect(selectedLoan.id);
      fetchLoans();
    } catch (error) {
      console.error("Error marking all installments as paid:", error);
      setMessage({
        type: "error",
        text: "Unable to close the loan at the moment.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await getAllClients();
      setClients(response.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const handleLoanSelect = async (loanId) => {
    if (!loanId) {
      setSelectedLoan(null);
      setInstallments([]);
      setAlerts(null);
      return;
    }

    try {
      setLoading(true);
      const loan = loans.find((l) => l.id === parseInt(loanId, 10));
      setSelectedLoan(loan);

      const installmentsResponse = await getLoanInstallments(loanId);
      setInstallments(installmentsResponse.data);

      const alertsResponse = await getLoanAlerts(loanId);
      setAlerts(alertsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error("Error loading loan details:", error);
      setMessage({
        type: "error",
        text: "Error loading loan details. Please try again.",
      });
      setLoading(false);
    }
  };

  const handleMarkPaid = async (installmentId) => {
    try {
      setLoading(true);
      await markInstallmentPaid(installmentId);
      setMessage({
        type: "success",
        text: "Installment marked as paid successfully!",
      });

      if (selectedLoan) {
        await handleLoanSelect(selectedLoan.id);
      }

      await fetchLoans();
      setLoading(false);
    } catch (error) {
      console.error("Error marking installment as paid:", error);
      setMessage({
        type: "error",
        text: "Error marking installment as paid. Please try again.",
      });
      setLoading(false);
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : "Unknown";
  };

  const calculateProgress = () => {
    if (installments.length === 0) return 0;
    const paidCount = installments.filter((inst) => inst.paid).length;
    return Math.round((paidCount / installments.length) * 100);
  };

  const getTotalPaid = () =>
    installments
      .filter((inst) => inst.paid)
      .reduce((sum, inst) => sum + inst.amount, 0);

  const getTotalRemaining = () =>
    installments
      .filter((inst) => !inst.paid)
      .reduce((sum, inst) => sum + inst.amount, 0);

  const getOverdueCount = () =>
    installments.filter((inst) => inst.is_overdue && !inst.paid).length;

  return (
    <section className="page-section">
      <div className="page-header"></div>

      <div className="card">
        {message && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        <div className="form-group" style={{ maxWidth: "560px" }}>
          <label>Select a loan to review</label>
          <select
            value={selectedLoan?.id || ""}
            onChange={(e) => handleLoanSelect(e.target.value)}
          >
            <option value="">-- Select a Loan --</option>
            {loans.map((loan) => (
              <option key={loan.id} value={loan.id}>
                Loan #{loan.id} • {getClientName(loan.client_id)} • ₨
                {loan.loan_amount.toLocaleString()} ({loan.status})
              </option>
            ))}
          </select>
        </div>

        {loading && <div className="loading">Pulling repayment data...</div>}

        {selectedLoan && !loading && (
          <>
            <div className="stats-grid" style={{ marginTop: "1.5rem" }}>
              <div className="stat-card">
                <h3>Loan amount</h3>
                <div className="stat-value">
                  ₨ {selectedLoan.loan_amount.toLocaleString()}
                </div>
                <p className="stat-meta">Disbursed principal</p>
              </div>
              <div className="stat-card">
                <h3>Monthly installment</h3>
                <div className="stat-value">
                  ₨ {selectedLoan.monthly_installment.toLocaleString()}
                </div>
                <p className="stat-meta">Fixed per schedule</p>
              </div>
              <div className="stat-card">
                <h3>Payment progress</h3>
                <div className="stat-value">{calculateProgress()}%</div>
                <p className="stat-meta">
                  {installments.filter((inst) => inst.paid).length}/
                  {installments.length} installments
                </p>
              </div>
              <div className="stat-card">
                <h3>Status</h3>
                <div className="stat-value" style={{ fontSize: "1.1rem" }}>
                  <span
                    className={`badge badge-${selectedLoan.status.toLowerCase()}`}
                  >
                    {selectedLoan.status}
                  </span>
                </div>
                <p className="stat-meta">As of today</p>
              </div>
            </div>

            <div className="stats-grid" style={{ marginTop: "1rem" }}>
              <div className="stat-card">
                <h3>Total paid</h3>
                <div className="stat-value" style={{ color: "#0bbf74" }}>
                  ₨ {getTotalPaid().toLocaleString()}
                </div>
              </div>
              <div className="stat-card">
                <h3>Remaining</h3>
                <div className="stat-value" style={{ color: "#f59e0b" }}>
                  ₨ {getTotalRemaining().toLocaleString()}
                </div>
              </div>
              <div className="stat-card">
                <h3>Overdue installments</h3>
                <div
                  className="stat-value"
                  style={{
                    color: getOverdueCount() > 0 ? "#ef4444" : "#0bbf74",
                  }}
                >
                  {getOverdueCount()}
                </div>
              </div>
              <div className="stat-card">
                <h3>Client</h3>
                <div className="stat-value" style={{ fontSize: "1.4rem" }}>
                  {getClientName(selectedLoan.client_id)}
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <button
                className="btn btn-success"
                onClick={handleMarkAllPaid}
                disabled={loading}
              >
                Mark entire loan as settled
              </button>
            </div>

            {alerts && alerts.alerts && alerts.alerts.length > 0 && (
              <div style={{ marginTop: "1.5rem" }}>
                <div className="alert alert-warning">
                  <div style={{ marginBottom: "0.75rem" }}>
                    <strong>
                      Default probability: {alerts.default_probability}%
                    </strong>
                  </div>
                  {alerts.alerts.map((alert, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: "1rem",
                        padding: "1rem",
                        background: "rgba(255,255,255,0.9)",
                        borderRadius: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "0.4rem",
                          alignItems: "center",
                        }}
                      >
                        <strong>{alert.type}</strong>
                        <span
                          className={`badge badge-${alert.severity.toLowerCase()}`}
                        >
                          {alert.severity} severity
                        </span>
                      </div>
                      <p style={{ color: "#475467", marginBottom: "0.35rem" }}>
                        {alert.message}
                      </p>
                      <p style={{ color: "#574afb", fontWeight: 600 }}>
                        💡 Recommendation: {alert.recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: "1.5rem" }}>
              <h3>Repayment schedule ({installments.length} installments)</h3>

              {installments.length === 0 ? (
                <div className="empty-state">
                  No installments found for this loan.
                </div>
              ) : (
                <div className="installment-list" style={{ marginTop: "1rem" }}>
                  {installments.map((installment) => (
                    <div
                      key={installment.id}
                      className={`installment-item ${
                        installment.paid
                          ? "paid"
                          : installment.is_overdue
                          ? "overdue"
                          : ""
                      }`}
                    >
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            marginBottom: "0.4rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <strong>
                            Installment #{installment.installment_number}
                          </strong>
                          {installment.paid && (
                            <span className="badge badge-completed">
                              ✓ Paid
                            </span>
                          )}
                          {installment.is_overdue && !installment.paid && (
                            <span className="badge badge-high">⚠ Overdue</span>
                          )}
                        </div>
                        <div style={{ color: "#475467", fontSize: "0.92rem" }}>
                          <div>
                            Amount: ₨ {installment.amount.toLocaleString()}
                          </div>
                          <div>
                            Due date:{" "}
                            {new Date(
                              installment.due_date
                            ).toLocaleDateString()}
                          </div>
                          {installment.paid && installment.paid_date && (
                            <div style={{ color: "#047857" }}>
                              Paid on:{" "}
                              {new Date(
                                installment.paid_date
                              ).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      {!installment.paid && (
                        <button
                          className="btn btn-success"
                          onClick={() => handleMarkPaid(installment.id)}
                          disabled={loading}
                        >
                          ✓ Mark as paid
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {!selectedLoan && !loading && (
          <div className="empty-state" style={{ marginTop: "1.5rem" }}>
            <p>Select a loan above to inspect its repayment journey.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default RepaymentTracker;
