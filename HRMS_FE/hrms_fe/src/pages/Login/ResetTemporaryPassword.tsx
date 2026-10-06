import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./ResetTemporaryPassword.css";

const ResetTemporaryPassword: React.FC = () => {
  const { user, updateUserFields } = useAuth();
  const navigate = useNavigate();

  const [tempPassword, setTempPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!tempPassword) {
      setError("Vui lòng nhập mật khẩu tạm thời hiện tại.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Mật khẩu mới phải dài tối thiểu 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu mới và mật khẩu xác nhận không khớp.");
      return;
    }

    if (newPassword === tempPassword) {
      setError("Mật khẩu mới không được trùng với mật khẩu tạm thời.");
      return;
    }

    setLoading(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 1. Update matching user in local_users registry so it is saved permanently
      if (user?.email) {
        const savedUsers = localStorage.getItem("local_users");
        if (savedUsers) {
          const usersList = JSON.parse(savedUsers);
          const updatedList = usersList.map((u: any) =>
            u.email.toLowerCase() === user.email.toLowerCase()
              ? { ...u, isTemporaryPassword: false }
              : u
          );
          localStorage.setItem("local_users", JSON.stringify(updatedList));
        }
      }

      // 2. Update current authenticated context state
      updateUserFields({ isTemporaryPassword: false });

      alert("Thay đổi mật khẩu thành công! Tài khoản của bạn đã được kích hoạt hoàn toàn.");
      navigate("/dashboard");
    } catch (err) {
      setError("Đã xảy ra lỗi trong quá trình cập nhật mật khẩu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-card">
        <div className="reset-password-header">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12, color: "var(--brand)" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h2>Bắt buộc đổi mật khẩu</h2>
          <p>
            Đây là lần đầu tiên bạn đăng nhập bằng <strong>mật khẩu tạm thời</strong>.
            <br />
            Để bảo mật, bạn bắt buộc phải thiết lập mật khẩu mới trước khi tiếp tục truy cập.
          </p>
        </div>

        {error && (
          <div className="alert-danger-global" style={{ marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form className="reset-password-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="tempPassword">Mật khẩu tạm thời hiện tại</label>
            <input
              type="password"
              id="tempPassword"
              placeholder="Nhập mật khẩu tạm được cấp"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="newPassword">Mật khẩu mới</label>
            <input
              type="password"
              id="newPassword"
              placeholder="Tối thiểu 6 ký tự"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="reset-password-btn"
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Kích hoạt tài khoản"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetTemporaryPassword;
