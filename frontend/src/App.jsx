import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import ClientOnboarding from "./components/ClientOnboarding";
import LoanApplication from "./components/LoanApplication";
import RepaymentTracker from "./components/RepaymentTracker";
import Login from "./components/Login";
import Logo from "./logo.png";

const IconDashboard = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M4 13h4v7H4zM10 4h4v16h-4zM16 9h4v11h-4z"
      stroke="none"
      fill="currentColor"
    />
  </svg>
);

const IconClients = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-3.33 0-6 1.34-6 3v2h12v-2c0-1.66-2.67-3-6-3ZM20 10.5a2.5 2.5 0 1 0-2.5-2.5 2.5 2.5 0 0 0 2.5 2.5Zm-1 1.5c-1.08 0-2.06.22-2.86.58A4.77 4.77 0 0 1 18 15v1h4v-1c0-1.54-2.24-3-3-3Z"
      fill="currentColor"
    />
  </svg>
);

const IconLoans = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M18 6H6a2 2 0 0 0-2 2v10h2v-2h12v2h2V8a2 2 0 0 0-2-2Zm0 8H6V8h12ZM8 4h8v2H8Z"
      fill="currentColor"
    />
  </svg>
);

const IconRepayments = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M12 2a10 10 0 1 0 10 10h-2a8 8 0 1 1-8-8V2Zm1 5h-2v4.41l3.3 3.3 1.4-1.41-2.7-2.7Z"
      fill="currentColor"
    />
  </svg>
);

const NAV_ITEMS = [
  {
    id: "dashboard",
    Icon: IconDashboard,
    label: "Dashboard",
    helper: "Portfolio pulse",
    title: "Stats and Analytics",
    subtitle:
      "Monitor risk, disbursement velocity, and collections in real time.",
  },
  {
    id: "clients",
    Icon: IconClients,
    label: "Clients",
    helper: "Onboard & assess",
    title: "Client Onboarding & Risk Profiling",
    subtitle:
      "Capture KYC data, automate risk scoring, and keep borrower records tidy.",
  },
  {
    id: "loans",
    Icon: IconLoans,
    label: "Loans",
    helper: "Create & plan",
    title: "Loan origination & smart schedules",
    subtitle:
      "Structure lending products with AI guidance and auto-generated repayment calendars.",
  },
  {
    id: "repayments",
    Icon: IconRepayments,
    label: "Repayments",
    helper: "Track & act",
    title: "Repayment Tracking & Default Alerts",
    subtitle:
      "Stay ahead of arrears with proactive alerts and structured follow-up workflows.",
  },
];

const getIsMobile = () =>
  typeof window !== "undefined"
    ? window.matchMedia("(max-width: 1024px)").matches
    : false;

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(getIsMobile);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("auth_token");
    if (token) {
      setIsAuthenticated(true);
    }
    setCheckingAuth(false);
  }, []);

  useEffect(() => {
    const handler = () => setIsMobile(getIsMobile());
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setIsAuthenticated(false);
  };

  // Show login page if not authenticated
  if (checkingAuth) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <div style={{ color: "white", fontSize: "1.2rem" }}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "clients":
        return <ClientOnboarding />;
      case "loans":
        return <LoanApplication />;
      case "repayments":
        return <RepaymentTracker />;
      default:
        return <Dashboard />;
    }
  };

  const currentPage =
    NAV_ITEMS.find((item) => item.id === activeTab) || NAV_ITEMS[0];
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="app-shell">
      <aside className={`sidebar ${isSidebarOpen ? "is-open" : ""}`}>
        <div className="sidebar__logo">
          <div className="sidebar__logo-badge">
            <img src={Logo} alt="SahulatFin logo" />
          </div>
          <h1>SahulatFin</h1>
          <span>AI-enhanced loan management</span>
        </div>
        <div className="sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (isMobile) setSidebarOpen(false);
              }}
              className={`sidebar__button ${
                activeTab === item.id ? "is-active" : ""
              }`}
            >
              <div className="sidebar__icon">
                <item.Icon />
              </div>
              <div className="sidebar__info">
                <strong>{item.label}</strong>
                <span>{item.helper}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="sidebar__footer">
          <span>Connected workspace</span>
          <div className="sidebar__badge">AI insights enabled</div>
        </div>
      </aside>

      {isMobile && (
        <div
          className={`sidebar-backdrop ${isSidebarOpen ? "is-visible" : ""}`}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="main">
        <div className="topbar">
          <div className="topbar__meta">
            <span className="eyebrow">{formattedDate}</span>
            <h2 className="topbar__title">{currentPage.title}</h2>
            <p className="topbar__subtitle">{currentPage.subtitle}</p>
          </div>
          <div className="topbar__actions">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle navigation"
            >
              <span />
              <span />
              <span />
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => window.location.reload()}
            >
              Refresh data
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setActiveTab("clients")}
            >
              + New client
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleLogout}
              style={{ marginLeft: "0.5rem" }}
            >
              Logout
            </button>
          </div>
        </div>
        <div className="page-content">{renderActiveComponent()}</div>
      </main>
    </div>
  );
}

export default App;
