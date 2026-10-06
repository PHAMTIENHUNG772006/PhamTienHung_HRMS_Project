import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../api/endpoints/login.api";
import { useAuth } from "../../contexts/AuthContext";
import type { Role } from "../../types/auth.types";
import { normalizeRole } from "../../types/auth.types";
import "./Login.css";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const extractServerErrors = (payload: any): Record<string, string> => {
    const normalizedErrors: Record<string, string> = {};

    if (
      payload?.data &&
      typeof payload.data === "object" &&
      !Array.isArray(payload.data)
    ) {
      Object.entries(payload.data).forEach(([field, message]) => {
        normalizedErrors[field] = String(message);
      });
    } else if (payload?.message) {
      normalizedErrors.global = payload.message;
    } else {
      normalizedErrors.global = "Đăng nhập thất bại. Vui lòng thử lại.";
    }

    return normalizedErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const payload = { email, password };
      const response = await loginUser(payload);

      if (response.success) {
        const loginData = response.data as any;
        const accessToken =
          loginData?.accessToken ||
          loginData?.token ||
          loginData?.access_token;
        const refreshToken =
          loginData?.refreshToken ||
          loginData?.refresh_token;
        const user = loginData?.user;

        if (accessToken) {
          // Resolve role, status and temporary password flags
          let resolvedRole: Role = "CANDIDATE";
          let resolvedStatus = "PENDING_APPROVAL";
          let isTempPwd = Boolean((user as any)?.isTemporaryPassword || (user as any)?.is_temporary_password || loginData?.isTemporaryPassword);

          const incomingRole = loginData?.role || (user as any)?.role || (user as any)?.roleName;
          
          if (incomingRole) {
            resolvedRole = normalizeRole(incomingRole);
            resolvedStatus = loginData?.status || (user as any)?.status || "ACTIVE";
          } else {
            const emailLower = email.toLowerCase();
            if (emailLower.includes("admin")) {
              resolvedRole = "Admin";
              resolvedStatus = "ACTIVE";
            } else if (emailLower.includes("hr")) {
              resolvedRole = "HR";
              resolvedStatus = "ACTIVE";
            } else if (emailLower.includes("manager")) {
              resolvedRole = "Manager";
              resolvedStatus = "ACTIVE";
            } else if (emailLower.includes("payroll")) {
              resolvedRole = "Payroll";
              resolvedStatus = "ACTIVE";
            } else if (emailLower.includes("recruit")) {
              resolvedRole = "HR";
              resolvedStatus = "ACTIVE";
            } else if (emailLower.includes("employee")) {
              resolvedRole = "Employee";
              resolvedStatus = "ACTIVE";
            } else if (emailLower.includes("guest")) {
              resolvedRole = "Guest";
              resolvedStatus = "ACTIVE";
            }
            
            // Testing helper: force isTemporaryPassword if email contains 'temp'
            if (emailLower.includes("temp")) {
              isTempPwd = true;
              resolvedStatus = "ACTIVE";
            }
          }

          login(
            {
              id: loginData?.userId || (user as any)?.id,
              email: user?.email || email || loginData?.email,
              fullName: user?.fullName || loginData?.username || (resolvedRole === "CANDIDATE" ? "Ứng viên tự do" : "Nhân viên"),
              role: resolvedRole,
              isTemporaryPassword: isTempPwd,
              status: resolvedStatus,
            },
            accessToken,
            refreshToken,
            rememberMe
          );

          navigate("/dashboard");
        } else {
          setErrors({ global: "No access token received from server." });
        }
      } else {
        setErrors(extractServerErrors(response));
      }
    } catch (error: any) {
      if (error.response?.data) {
        setErrors(extractServerErrors(error.response.data));
      } else {
        setErrors({
          global: "Cannot connect to server. Please try again later.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      <div className="login-header">
        <div className="login-logo-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        </div>
        <h2>Welcome Back</h2>
        <p>Please enter your details to sign in</p>
      </div>

      {errors.global && (
        <div className="alert-danger-global">{errors.global}</div>
      )}

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <div
            className={`input-wrapper ${errors.email ? "input-error-border" : ""}`}
          >
            <svg
              className="input-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {errors.email && (
            <span className="error-message-text">{errors.email}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div
            className={`input-wrapper ${errors.password ? "input-error-border" : ""}`}
          >
            <svg
              className="input-icon"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {errors.password && (
            <span className="error-message-text">{errors.password}</span>
          )}
        </div>

        <div className="login-options">
          <label className="remember-me">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Remember me</span>
          </label>
          <Link to="/forgot-password" className="forgot-password-link">
            Forgot password?
          </Link>
        </div>

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="login-footer">
        <p>
          Don't have an account?{" "}
          <Link to="/register" className="signup-link">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
