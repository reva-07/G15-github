import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import InputField from "../components/InputField";
import { api } from "../services/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { register, error: authError, clearError } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const modeInfo = api.getMode();

  function validate() {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = "Full name is required.";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    clearError();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    const result = await register(email.trim(), password, name.trim());
    setSubmitting(false);

    if (result.success) {
      if (result.requiresEmailConfirmation) {
        addToast(
          "Registration successful! Please check your email inbox to confirm your account.",
          "info",
          7000
        );
        navigate("/login");
      } else {
        addToast(`Account created! Welcome to Google Docs Lite, ${name.trim()}!`, "success");
        navigate("/dashboard", { replace: true });
      }
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-form-side">
        <div className="login-form-box">
          <div className="brand">
            <div className="brand-mark">G</div>
            <span className="brand-name">Google Docs Lite</span>
          </div>

          <h1>Create account</h1>
          <p className="sub">Start organizing and editing your documents today.</p>

          {authError && (
            <div className="auth-alert-box" role="alert">
              <span>⚠</span>
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <InputField
              id="name"
              label="Full name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              error={errors.name}
              placeholder="Bhumi Sharma"
              autoComplete="name"
              required
            />

            <InputField
              id="email"
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              error={errors.email}
              placeholder="you@domain.com"
              autoComplete="email"
              required
            />

            <InputField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
              }}
              error={errors.password}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              required
            />

            <InputField
              id="confirmPassword"
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
              }}
              error={errors.confirmPassword}
              placeholder="Repeat your password"
              autoComplete="new-password"
              required
            />

            <button
              className="btn-primary"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Creating account..." : "Sign up"}
            </button>
          </form>

          <p className="login-switch-text">
            Already have an account? <Link to="/login">Log in here</Link>
          </p>

          <div className="auth-backend-status">
            <span className={`status-dot ${modeInfo.isCloud ? "cloud" : "local"}`} />
            <span>{modeInfo.status}</span>
          </div>
        </div>
      </div>

      <div className="login-brand-side">
        <h2>Own your workspace.</h2>
        <p>
          Each user account is fully isolated with database Row Level Security.
          Your notes, drafts, and projects are private until you choose to share.
        </p>
      </div>
    </div>
  );
}
