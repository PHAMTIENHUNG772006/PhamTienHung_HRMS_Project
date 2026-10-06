import React, { useEffect, useState } from "react";
import {
  getUsers,
  toggleLockUser,
} from "../../api/endpoints/auth.api";
import type { UserRecord } from "../../api/endpoints/auth.api";
import "./Users.css";
import Swal from 'sweetalert2';

import Pagination from "../../components/common/Pagination";

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);

  // Filter tabs: "all", "active", "inactive"
  const [activeTab, setActiveTab] = useState<"all" | "active" | "inactive">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getUsers();
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
        
        // If a user was previously selected, update their data from the freshly loaded list
        if (selectedUser) {
          const uId = selectedUser.id || selectedUser.userId;
          const updated = res.data.find(u => (u.id || u.userId) === uId);
          if (updated) {
            setSelectedUser(updated);
          }
        }
      } else {
        throw new Error(res.message || "Không thể lấy danh sách tài khoản từ máy chủ");
      }
    } catch (e: any) {
      setError(e.message || "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleLock = async (id: number) => {
    try {
      const res = await toggleLockUser(id, false);
      if (res.success) {
        Swal.fire({
          title: 'Thành công!',
          text: 'Thay đổi trạng thái tài khoản thành công!',
          icon: 'success',
          confirmButtonColor: 'var(--brand)',
          timer: 1500,
          timerProgressBar: true
        });
        
        // Reload list and sync selected user
        const updatedUsers = await getUsers();
        if (updatedUsers.success && Array.isArray(updatedUsers.data)) {
          setUsers(updatedUsers.data);
          const currentSelected = updatedUsers.data.find((u: any) => (u.id || u.userId) === id);
          if (currentSelected) {
            setSelectedUser(currentSelected);
          }
        }
      } else {
        Swal.fire('Thất bại', res.message || 'Không thể thay đổi trạng thái tài khoản', 'error');
      }
    } catch (e) {
      Swal.fire('Lỗi', 'Đã xảy ra lỗi khi thay đổi trạng thái tài khoản', 'error');
    }
  };

  // Apply filters and search queries
  const getFilteredUsers = () => {
    let filtered = [...users];

    // Filter by tab (exclude pending since candidates are approved through recruitment page)
    if (activeTab === "active") {
      filtered = filtered.filter(u => u.status === "ACTIVE");
    } else if (activeTab === "inactive") {
      filtered = filtered.filter(u => u.status === "INACTIVE");
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        u =>
          u.email.toLowerCase().includes(q) ||
          (u.fullName || "").toLowerCase().includes(q) ||
          (u.username || "").toLowerCase().includes(q)
      );
    }

    return filtered;
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === "ACTIVE") return "active";
    if (status === "PENDING_APPROVAL") return "probation";
    return "inactive";
  };

  const getStatusLabel = (status: string) => {
    if (status === "ACTIVE") return "Hoạt động";
    if (status === "PENDING_APPROVAL") return "Chờ phê duyệt";
    return "Đã khóa";
  };

  const filteredUsers = getFilteredUsers();

  // Reset page when filters or search queries change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const currentPageSanitized = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSanitized - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="users-page page-container">
      <div className="users-header" style={{ marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Quản lý Tài khoản</h2>
      </div>

      {/* Tabs Filter & Search toolbar */}
      <div className="card" style={{ padding: "12px 20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div className="tab-buttons" style={{ display: "flex", gap: "8px" }}>
            <button
              id="tab-all-users"
              className={`tab-btn ${activeTab === "all" ? "active-tab" : ""}`}
              onClick={() => setActiveTab("all")}
              style={{
                padding: "8px 16px",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
                background: activeTab === "all" ? "var(--brand-soft)" : "transparent",
                color: activeTab === "all" ? "var(--brand-dark)" : "var(--text-secondary)"
              }}
            >
              Tất cả ({users.length})
            </button>
            <button
              id="tab-active-users"
              className={`tab-btn ${activeTab === "active" ? "active-tab" : ""}`}
              onClick={() => setActiveTab("active")}
              style={{
                padding: "8px 16px",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
                background: activeTab === "active" ? "#dcfce7" : "transparent",
                color: activeTab === "active" ? "#16a34a" : "var(--text-secondary)"
              }}
            >
              Đang hoạt động ({users.filter(u => u.status === "ACTIVE").length})
            </button>
            <button
              id="tab-inactive-users"
              className={`tab-btn ${activeTab === "inactive" ? "active-tab" : ""}`}
              onClick={() => setActiveTab("inactive")}
              style={{
                padding: "8px 16px",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
                background: activeTab === "inactive" ? "#fee2e2" : "transparent",
                color: activeTab === "inactive" ? "#dc2626" : "var(--text-secondary)"
              }}
            >
              Đã khóa ({users.filter(u => u.status === "INACTIVE").length})
            </button>
          </div>

          <div className="search-input-wrapper">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              id="search-user"
              type="text"
              placeholder="Tìm theo email, họ tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "36px" }}
            />
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "20px", alignItems: "start" }}>
        {/* Main List Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {error && (
            <div style={{ padding: 20, color: "#b91c1c", backgroundColor: "#fee2e2", textAlign: "center", fontWeight: 550 }}>
              {error}
            </div>
          )}

          {loading ? (
            <div className="loading-state" style={{ padding: 40, textAlign: "center" }}>Đang tải danh sách tài khoản...</div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Họ tên / Username</th>
                    <th>Email</th>
                    <th>Quyền hệ thống</th>
                    <th>Trạng thái</th>
                    <th style={{ width: "120px", textAlign: "center" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: 24, color: "var(--text-secondary)" }}>
                        Không có tài khoản nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u) => {
                      const uId = u.id || u.userId;
                      const isSelected = selectedUser && (selectedUser.id || selectedUser.userId) === uId;
                      return (
                        <tr 
                          key={uId} 
                          style={{ cursor: "pointer", background: isSelected ? "var(--brand-soft)" : "transparent" }}
                          onClick={() => setSelectedUser(u)}
                        >
                          <td>{uId}</td>
                          <td style={{ fontWeight: 600 }}>{u.fullName || u.username || "-"}</td>
                          <td>{u.email}</td>
                          <td>
                            <span className="role-badge employee" style={{ background: u.role === "Admin" ? "#ef4444" : u.role === "HR" ? "#10b981" : "#0ea5e9" }}>
                              {u.role || "-"}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${getStatusBadgeClass(u.status || "ACTIVE")}`}>
                              {getStatusLabel(u.status || "ACTIVE")}
                            </span>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="action-btn-group" style={{ justifyContent: "center" }}>
                              <button 
                                id={`btn-view-user-${uId}`}
                                className="table-action-btn" 
                                onClick={() => setSelectedUser(u)} 
                                title="Xem chi tiết"
                                style={{ color: "var(--brand-dark)" }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                              </button>
                              <button
                                id={`btn-lock-user-${uId}`}
                                className="table-action-btn"
                                onClick={() => handleToggleLock(uId!)}
                                title={u.status === "INACTIVE" ? "Mở khóa" : "Khóa tài khoản"}
                                style={{ color: u.status === "INACTIVE" ? "#16a34a" : "#ea580c" }}
                              >
                                {u.status === "INACTIVE" ? (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                  </svg>
                                ) : (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7c0-2.76 2.24-5 5-5s5 2.24 5 5v4"></path>
                                  </svg>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPageSanitized}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredUsers.length}
                showingCount={paginatedUsers.length}
                itemName="tài khoản"
              />
            </>
          )}
        </div>

        {/* Right Details Panel */}
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ margin: "0 0 20px 0", fontSize: "1.15rem", borderBottom: "1px solid var(--border)", paddingBottom: "10px", color: "var(--text-primary)" }}>
            Chi tiết tài khoản
          </h3>
          {selectedUser ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "10px" }}>
                <div style={{
                  width: "54px",
                  height: "54px",
                  borderRadius: "50%",
                  background: "var(--brand-soft)",
                  color: "var(--brand-dark)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  fontWeight: "bold"
                }}>
                  {(selectedUser.fullName || selectedUser.username || "U")[0].toUpperCase()}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "700" }}>
                    {selectedUser.fullName || selectedUser.username || "-"}
                  </h4>
                  <span style={{ fontSize: "13px", color: "var(--text-tertiary)" }}>
                    ID: {selectedUser.id || selectedUser.userId}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "13.5px", fontWeight: 550 }}>Email:</span>
                  <span style={{ color: "var(--text-primary)", fontSize: "13.5px", fontWeight: 600 }}>{selectedUser.email}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "13.5px", fontWeight: 550 }}>Quyền hạn:</span>
                  <span className="role-badge employee" style={{ 
                    margin: 0,
                    background: selectedUser.role === "Admin" ? "#ef4444" : selectedUser.role === "HR" ? "#10b981" : "#0ea5e9" 
                  }}>
                    {selectedUser.role || "-"}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "13.5px", fontWeight: 550 }}>Trạng thái:</span>
                  <span className={`status-badge ${getStatusBadgeClass(selectedUser.status || "ACTIVE")}`}>
                    {getStatusLabel(selectedUser.status || "ACTIVE")}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
                  <span style={{ color: "var(--text-secondary)", fontSize: "13.5px", fontWeight: 550 }}>Mật khẩu tạm thời:</span>
                  <span style={{ color: selectedUser.isTemporaryPassword ? "#ea580c" : "var(--text-secondary)", fontSize: "13.5px", fontWeight: 600 }}>
                    {selectedUser.isTemporaryPassword ? "Bắt buộc đổi ở lần đầu" : "Đã đổi"}
                  </span>
                </div>
              </div>

              <div style={{ marginTop: "12px" }}>
                <button
                  id="btn-detail-toggle-lock"
                  className="btn"
                  onClick={() => handleToggleLock((selectedUser.id || selectedUser.userId)!)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontWeight: 600,
                    fontSize: "14px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                    background: selectedUser.status === "INACTIVE" ? "#10b981" : "#ea580c",
                    color: "#fff",
                    transition: "opacity 0.2s"
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
                  onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  {selectedUser.status === "INACTIVE" ? "✓ Mở khóa tài khoản" : "🔒 Khóa tài khoản"}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ 
              textAlign: "center", 
              padding: "40px 20px", 
              color: "var(--text-tertiary)", 
              fontSize: "14px",
              border: "1px dashed var(--border)",
              borderRadius: "12px"
            }}>
              Chọn một tài khoản trong danh sách để xem chi tiết thông tin và thực hiện khóa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
