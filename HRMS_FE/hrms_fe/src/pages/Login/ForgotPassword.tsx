import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword } from "../../api/endpoints/auth.api";
import "./Login.css";

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await forgotPassword({ email });
      if (res.success) {
        setMessage(
          res.message || "Password reset instructions sent to your email.",
        );
        setTimeout(() => navigate("/login"), 2500);
      } else {
        setError(res.message || "Unable to process request.");
      }
    } catch (err: any) {
      setError("Cannot connect to server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      <div className="login-header">
        <h2>Forgot Password</h2>
        <p>Enter your email and we'll send reset instructions.</p>
      </div>

      {error && <div className="alert-danger-global">{error}</div>}
      {message && <div className="alert-success-global">{message}</div>}

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <div className="input-wrapper">
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <div className="login-footer">
        <p>
          Remembered?{" "}
          <Link to="/login" className="signup-link">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
