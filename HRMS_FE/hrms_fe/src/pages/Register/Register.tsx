import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { registerUser } from "../../api/endpoints/auth.api";
import "./Register.css";

const Register: React.FC = () => {
  const navigate = useNavigate();

  // 1. Khai báo các state dữ liệu form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 2. State quản lý lỗi validate và trạng thái loading
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
        if (typeof message === "string" && message.trim()) {
          normalizedErrors[field] = message;
        }
      });
    }

    if (payload?.error) {
      if (typeof payload.error === "object" && !Array.isArray(payload.error)) {
        Object.assign(normalizedErrors, payload.error);
      } else if (typeof payload.error === "string" && payload.error.trim()) {
        normalizedErrors.global = payload.error;
      }
    }

    if (Object.keys(normalizedErrors).length === 0) {
      const message = payload?.message;
      if (typeof message === "string" && message.trim()) {
        normalizedErrors.global = message;
      }
    }

    return normalizedErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Reset lỗi cũ

    if (!fullName.trim()) {
      setErrors({ fullName: "Vui lòng nhập họ và tên!" });
      return;
    }

    if (!email.trim()) {
      setErrors({ email: "Vui lòng nhập email!" });
      return;
    }

    if (!password) {
      setErrors({ password: "Vui lòng nhập mật khẩu!" });
      return;
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Mật khẩu xác nhận không khớp!" });
      Swal.fire({
        title: "Lỗi xác thực",
        text: "Mật khẩu xác nhận không khớp!",
        icon: "warning",
        confirmButtonColor: "var(--brand, #3b82f6)",
      });
      return;
    }

    setLoading(true);

    try {
      const apiResponse = await registerUser({
        fullName,
        email,
        password,
      });

      if (apiResponse.success) {
        await Swal.fire({
          title: "Đăng ký thành công!",
          text: apiResponse.message || "Đăng ký tài khoản ứng viên thành công! Vui lòng đăng nhập để tiếp tục.",
          icon: "success",
          confirmButtonColor: "var(--brand, #3b82f6)",
        });
        navigate("/login");
      } else {
        const serverErrors = extractServerErrors(apiResponse);
        setErrors(serverErrors);
        Swal.fire({
          title: "Đăng ký thất bại",
          text: apiResponse.message || "Đã xảy ra lỗi trong quá trình đăng ký.",
          icon: "error",
          confirmButtonColor: "var(--brand, #3b82f6)",
        });
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        const apiResponse = error.response.data;
        const serverErrors = extractServerErrors(apiResponse);
        setErrors(serverErrors);
        Swal.fire({
          title: "Đăng ký thất bại",
          text: apiResponse.message || "Đã xảy ra lỗi trong quá trình đăng ký.",
          icon: "error",
          confirmButtonColor: "var(--brand, #3b82f6)",
        });
      } else {
        const globalMsg = "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.";
        setErrors({
          global: globalMsg,
        });
        Swal.fire({
          title: "Lỗi kết nối",
          text: globalMsg,
          icon: "error",
          confirmButtonColor: "var(--brand, #3b82f6)",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-card">
      <div className="register-header">
        <div className="register-logo-icon">
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
        <h2>Đăng ký tài khoản</h2>
        <p>Tạo tài khoản ứng viên để tham gia ứng tuyển và theo dõi kết quả</p>
      </div>

      {/* Hiển thị thông báo lỗi global (nếu có) */}
      {errors.global && (
        <div className="alert-danger-global">{errors.global}</div>
      )}

      <form className="register-form" onSubmit={handleSubmit} noValidate>
        {/* Full Name Input */}
        <div className="form-group">
          <label htmlFor="fullName">Họ và tên</label>
          <div
            className={`input-wrapper ${errors.fullName ? "input-error-border" : ""}`}
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
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <input
              type="text"
              id="fullName"
              placeholder="Nhập họ và tên đầy đủ"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          {errors.fullName && (
            <span className="error-message-text">{errors.fullName}</span>
          )}
        </div>

        {/* Email Input */}
        <div className="form-group">
          <label htmlFor="email">Địa chỉ Email</label>
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
              placeholder="Nhập địa chỉ email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          {errors.email && (
            <span className="error-message-text">{errors.email}</span>
          )}
        </div>

        {/* Password Input */}
        <div className="form-group">
          <label htmlFor="password">Mật khẩu</label>
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
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {errors.password && (
            <span className="error-message-text">{errors.password}</span>
          )}
        </div>

        {/* Confirm Password Input */}
        <div className="form-group">
          <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
          <div
            className={`input-wrapper ${errors.confirmPassword ? "input-error-border" : ""}`}
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
              id="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          {errors.confirmPassword && (
            <span className="error-message-text">{errors.confirmPassword}</span>
          )}
        </div>

        {/* Submit Button - Disable khi đang gọi API */}
        <button type="submit" className="register-btn" disabled={loading}>
          {loading ? "Đang xử lý..." : "Đăng ký tài khoản"}
        </button>
      </form>

      {/* Footer Link */}
      <div className="register-footer">
        <p>
          Đã có tài khoản?{" "}
          <Link to="/login" className="login-link">
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
