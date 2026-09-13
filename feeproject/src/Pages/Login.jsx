import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email or username.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", email);

    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <h1>Google Docs Lite</h1>

        <p className="login-subtitle">
          Sign in to continue
        </p>

        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label htmlFor="email">
              Email or Username
            </label>

            <input
              id="email"
              type="text"
              placeholder="Enter your email or username"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />
          </div>

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="login-btn"
          >
            Login
          </button>

        </form>
      </div>
    </div>
  );
}

export default Login;