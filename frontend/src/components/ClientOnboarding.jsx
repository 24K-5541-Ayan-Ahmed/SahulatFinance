import { useState, useEffect } from "react";
import {
  createClient,
  getAllClients,
  updateClient,
  deleteClient,
} from "../api";

const formatCnic = (rawValue) => {
  const digits = rawValue.replace(/\D/g, "").slice(0, 13);
  const part1 = digits.slice(0, 5);
  const part2 = digits.slice(5, 12);
  const part3 = digits.slice(12, 13);
  let formatted = part1;
  if (part2) {
    formatted += `-${part2}`;
  }
  if (part3) {
    formatted += `-${part3}`;
  }
  return formatted;
};

const CNIC_REGEX = /^\d{5}-\d{7}-\d{1}$/;

function ClientOnboarding() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingClientId, setEditingClientId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    cnic: "",
    phone: "",
    address: "",
    monthly_income: "",
    employment_status: "Employed",
    existing_loans: 0,
    credit_history: "Good",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await getAllClients();
      setClients(response.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setMessage({
        type: "error",
        text: "Unable to load clients. Please refresh.",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      cnic: "",
      phone: "",
      address: "",
      monthly_income: "",
      employment_status: "Employed",
      existing_loans: 0,
      credit_history: "Good",
    });
    setEditingClientId(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;
    if (name === "cnic") {
      nextValue = formatCnic(value);
    }
    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!CNIC_REGEX.test(formData.cnic)) {
      setMessage({
        type: "error",
        text: "CNIC must be in the format 12345-1234567-1.",
      });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        monthly_income: parseFloat(formData.monthly_income),
        existing_loans: parseInt(formData.existing_loans, 10),
      };

      let response;
      if (editingClientId) {
        response = await updateClient(editingClientId, payload);
      } else {
        response = await createClient(payload);
      }
      const result = response.data ?? response;

      setMessage({
        type: "success",
        text: `Client ${
          editingClientId ? "updated" : "registered"
        } successfully! Risk Level: ${result.risk_level || "N/A"}`,
      });
      resetForm();
      setShowForm(false);
      fetchClients();
    } catch (error) {
      console.error("Error saving client:", error);
      setMessage({
        type: "error",
        text:
          error.response?.data?.detail ||
          "Error saving client. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClient = (client) => {
    setFormData({
      name: client.name,
      cnic: client.cnic,
      phone: client.phone,
      address: client.address,
      monthly_income: client.monthly_income,
      employment_status: client.employment_status,
      existing_loans: client.existing_loans,
      credit_history: client.credit_history,
    });
    setEditingClientId(client.id);
    setShowForm(true);
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm("Delete this client and all related loans?")) return;
    try {
      setLoading(true);
      await deleteClient(clientId);
      setMessage({ type: "success", text: "Client deleted successfully." });
      fetchClients();
    } catch (error) {
      console.error("Error deleting client:", error);
      setMessage({ type: "error", text: "Unable to delete client right now." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-section">
      <div className="page-header">
        <button
          className="btn btn-primary"
          onClick={() => {
            if (showForm) {
              resetForm();
              setShowForm(false);
            } else {
              resetForm();
              setShowForm(true);
            }
          }}
        >
          {showForm ? "Close builder" : "+ Register client"}
        </button>
      </div>

      <div className="card">
        {message && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        {showForm && (
          <form
            onSubmit={handleSubmit}
            style={{ marginBottom: "2rem", marginTop: "1rem" }}
          >
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter client's full name"
                />
              </div>

              <div className="form-group">
                <label>CNIC (National ID) *</label>
                <input
                  type="text"
                  name="cnic"
                  value={formData.cnic}
                  onChange={handleInputChange}
                  required
                  placeholder="12345-1234567-1"
                  maxLength={15}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+92-300-1234567"
                />
              </div>

              <div className="form-group">
                <label>Monthly Income (₨) *</label>
                <input
                  type="number"
                  name="monthly_income"
                  value={formData.monthly_income}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Enter monthly income"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address *</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                rows="2"
                placeholder="Enter complete address"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Employment Status *</label>
                <select
                  name="employment_status"
                  value={formData.employment_status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Employed">Employed</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Unemployed">Unemployed</option>
                </select>
              </div>

              <div className="form-group">
                <label>Number of Existing Loans *</label>
                <input
                  type="number"
                  name="existing_loans"
                  value={formData.existing_loans}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Credit History *</label>
                <select
                  name="credit_history"
                  value={formData.credit_history}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Good">Good</option>
                  <option value="Average">Average</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingClientId
                ? "Update client"
                : "Register & score client"}
            </button>
          </form>
        )}

        <h3>Registered clients ({clients.length})</h3>

        {loading && !showForm ? (
          <div className="loading">Loading client registry...</div>
        ) : clients.length === 0 ? (
          <div className="empty-state">
            <p>
              No clients registered yet. Click “Register client” to get started.
            </p>
          </div>
        ) : (
          <div className="table-container" style={{ marginTop: "1rem" }}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>CNIC</th>
                  <th>Phone</th>
                  <th>Monthly Income</th>
                  <th>Employment</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td>#{client.id}</td>
                    <td>{client.name}</td>
                    <td>{client.cnic}</td>
                    <td>{client.phone}</td>
                    <td>₨ {client.monthly_income.toLocaleString()}</td>
                    <td>{client.employment_status}</td>
                    <td>{client.risk_score?.toFixed(2) || "N/A"}</td>
                    <td>
                      <span
                        className={`badge badge-${
                          client.risk_level?.toLowerCase() || "medium"
                        }`}
                      >
                        {client.risk_level || "N/A"}
                      </span>
                    </td>
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
                          onClick={() => handleEditClient(client)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteClient(client.id)}
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

export default ClientOnboarding;
