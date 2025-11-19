import { useState } from "react";
import { login } from "../api";
import Logo from "../logo.png";

const FEATURE_PILLS = [
  "Client 360° dossiers",
  "AI risk co-pilot",
  "Live repayment radar",
];

const HERO_STATS = [
  { label: "Portfolios monitored", value: "3.8k+" },
  { label: "AI nudges / week", value: "120+" },
  { label: "On-time recovery", value: "97.4%" },
];

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await login(username, password);
      const { access_token, username: user, is_admin } = response.data;

      localStorage.setItem("auth_token", access_token);
      localStorage.setItem(
        "auth_user",
        JSON.stringify({ username: user, is_admin })
      );

      if (onLogin) {
        onLogin();
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-panel login-panel--hero">
        <div className="login-hero">
          <span className="login-hero__eyebrow">SahulatFin Control Hub</span>
          <h1>Confidence for every disbursement</h1>
          <p>
            Activate the same design language you see inside the workspace—clean
            layouts, AI-first guidance, and instant context across onboarding,
            lending, and collections.
          </p>

          <div className="login-pill-row">
            {FEATURE_PILLS.map((pill) => (
              <span key={pill} className="login-pill">
                {pill}
              </span>
            ))}
          </div>

          <div className="login-hero__stats">
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="login-hero__stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="login-hero__footer">
            <p>
              Secure-by-default · SOC2-inspired guardrails · Field-ready within
              minutes
            </p>
          </div>
        </div>
      </div>

      <div className="login-panel login-panel--form">
        <div className="login-card">
          <div className="login-card__brand">
            <div className="login-logo-badge">
              <img src={Logo} alt="SahulatFin logo" />
            </div>
            <div>
              <h1>SahulatFin</h1>
              <span>AI-enhanced loan management</span>
            </div>
          </div>

          <div className="login-card__header">
            <h2>Welcome back</h2>
            <p>
              Sign in to orchestrate onboarding, origination, and repayment
              operations.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                autoComplete="username"
                placeholder="admin"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Access workspace"}
            </button>

            <div className="login-security-note">
              Protected endpoints · Token expires automatically after inactivity
            </div>

            <div className="login-info">
              <div>
                <p className="login-info__label">Default Credentials</p>
                <p>
                  Username: <code>hexenzirkle</code>
                </p>
                <p>
                  Password: <code>24k-5541@Hexa</code>
                </p>
              </div>
              <div className="login-support">
                <span>Need a fresh admin token?</span>
                <a href="mailto:k245541@nu.edu.pk">Contact system owner</a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
