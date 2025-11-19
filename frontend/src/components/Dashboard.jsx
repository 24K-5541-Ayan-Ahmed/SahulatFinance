import { useState, useEffect } from "react";
import { getDashboardStats, getAllAlerts, updateOverdueStatus } from "../api";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      await updateOverdueStatus();
      const statsResponse = await getDashboardStats();
      setStats(statsResponse.data);

      const alertsResponse = await getAllAlerts();
      setAlerts(alertsResponse.data.alerts);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Syncing the latest metrics...</div>;
  }

  if (!stats) {
    return <div className="empty-state">No dashboard data available yet.</div>;
  }

  const riskData = [
    {
      name: "Low Risk",
      value: stats.clients.risk_distribution.low,
      color: "#0bbf74",
    },
    {
      name: "Medium Risk",
      value: stats.clients.risk_distribution.medium,
      color: "#f59e0b",
    },
    {
      name: "High Risk",
      value: stats.clients.risk_distribution.high,
      color: "#ef4444",
    },
  ];

  const loanStatusData = [
    { name: "Active", count: stats.loans.active },
    { name: "Completed", count: stats.loans.completed },
    { name: "Defaulted", count: stats.loans.defaulted },
  ];

  const loanTypeData = Object.entries(stats.loan_types).map(
    ([type, count]) => ({
      name: type,
      count,
    })
  );

  const yearStats = stats.financial.yearly || {
    year: new Date().getFullYear(),
    disbursed: 0,
    expected: 0,
    collected: 0,
  };

  const comparisonData = [
    { label: "Disbursed", amount: yearStats.disbursed },
    { label: "Expected", amount: yearStats.expected },
    { label: "Collected", amount: yearStats.collected },
  ];

  return (
    <section className="page-section">
      <div className="page-header">
        <button className="btn btn-ghost" onClick={fetchDashboardData}>
          Refresh snapshot
        </button>
      </div>

      <div className="card">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total clients</h3>
            <div className="stat-value">{stats.clients.total}</div>
            <p className="stat-meta">Borrowers onboarded</p>
          </div>
          <div className="stat-card">
            <h3>Total loans</h3>
            <div className="stat-value">{stats.loans.total}</div>
            <p className="stat-meta">All-time disbursed</p>
          </div>
          <div className="stat-card">
            <h3>Active loans</h3>
            <div className="stat-value">{stats.loans.active}</div>
            <p className="stat-meta">Currently servicing</p>
          </div>
          <div className="stat-card">
            <h3>Completed</h3>
            <div className="stat-value">{stats.loans.completed}</div>
            <p className="stat-meta">Fully paid back</p>
          </div>
        </div>

        <div className="stats-grid" style={{ marginTop: "1.25rem" }}>
          <div className="stat-card">
            <h3>Total disbursed</h3>
            <div className="stat-value">
              ₨ {stats.financial.total_disbursed.toLocaleString()}
            </div>
            <p className="stat-meta">Capital released</p>
          </div>
          <div className="stat-card">
            <h3>Total expected</h3>
            <div className="stat-value">
              ₨ {stats.financial.total_expected.toLocaleString()}
            </div>
            <p className="stat-meta">Including interest</p>
          </div>
          <div className="stat-card">
            <h3>Collected so far</h3>
            <div className="stat-value">
              ₨ {stats.financial.total_collected.toLocaleString()}
            </div>
            <p className="stat-meta">Settled installments</p>
          </div>
          <div className="stat-card">
            <h3>Collection rate</h3>
            <div className="stat-value">{stats.financial.collection_rate}%</div>
            <p className="stat-meta">Recovered vs. expected</p>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="alert alert-warning" style={{ marginTop: "1.5rem" }}>
            <h3>Active default alerts ({alerts.length})</h3>
            <p style={{ marginBottom: "0.75rem" }}>
              Clients highlighted below have overdue installments and elevated
              risk signals.
            </p>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Loan ID</th>
                    <th>Overdue</th>
                    <th>Exposure</th>
                    <th>Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert) => (
                    <tr key={alert.loan_id}>
                      <td>{alert.client_name}</td>
                      <td>#{alert.loan_id}</td>
                      <td>{alert.overdue_count}</td>
                      <td>₨ {alert.loan_amount.toLocaleString()}</td>
                      <td>
                        <span
                          className={`badge badge-${alert.risk_level.toLowerCase()}`}
                        >
                          {alert.risk_level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Year-on-year comparison ({yearStats.year})</h2>
        <ResponsiveContainer
          width="100%"
          height={window.innerWidth <= 768 ? 220 : 260}
        >
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: window.innerWidth <= 480 ? 10 : 12 }}
            />
            <YAxis tick={{ fontSize: window.innerWidth <= 480 ? 10 : 12 }} />
            <Tooltip
              formatter={(value) => [`₨ ${value.toLocaleString()}`, "Amount"]}
            />
            <Legend
              wrapperStyle={{
                fontSize: window.innerWidth <= 480 ? "0.75rem" : "0.85rem",
              }}
            />
            <Bar dataKey="amount" fill="#4335f2" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2>Insight overlays</h2>
        <div className="analytics-grid">
          <div>
            <h3>Client risk distribution</h3>
            <ResponsiveContainer
              width="100%"
              height={window.innerWidth <= 768 ? 220 : 260}
            >
              <PieChart>
                <Pie
                  data={riskData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={
                    window.innerWidth <= 480
                      ? false
                      : ({ name, value }) => `${name}: ${value}`
                  }
                  outerRadius={window.innerWidth <= 480 ? 70 : 90}
                  dataKey="value"
                >
                  {riskData.map((entry, index) => (
                    <Cell key={`risk-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  wrapperStyle={{
                    fontSize: window.innerWidth <= 480 ? "0.75rem" : "0.85rem",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3>Loan status distribution</h3>
            <ResponsiveContainer
              width="100%"
              height={window.innerWidth <= 768 ? 220 : 260}
            >
              <BarChart data={loanStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: window.innerWidth <= 480 ? 10 : 12 }}
                />
                <YAxis
                  tick={{ fontSize: window.innerWidth <= 480 ? 10 : 12 }}
                />
                <Tooltip />
                <Legend
                  wrapperStyle={{
                    fontSize: window.innerWidth <= 480 ? "0.75rem" : "0.85rem",
                  }}
                />
                <Bar dataKey="count" fill="#574afb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {loanTypeData.length > 0 && (
            <div>
              <h3>Loan type distribution</h3>
              <ResponsiveContainer
                width="100%"
                height={window.innerWidth <= 768 ? 220 : 260}
              >
                <BarChart data={loanTypeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: window.innerWidth <= 480 ? 10 : 12 }}
                  />
                  <YAxis
                    tick={{ fontSize: window.innerWidth <= 480 ? 10 : 12 }}
                  />
                  <Tooltip />
                  <Legend
                    wrapperStyle={{
                      fontSize:
                        window.innerWidth <= 480 ? "0.75rem" : "0.85rem",
                    }}
                  />
                  <Bar dataKey="count" fill="#f472b6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
