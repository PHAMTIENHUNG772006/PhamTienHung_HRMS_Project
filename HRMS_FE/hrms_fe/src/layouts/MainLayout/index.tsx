import React from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Swal from "sweetalert2";

interface NavItem {
  to: string;
  label: string;
  featureCode?: string;
  icon: React.ReactNode;
}

const MainLayout: React.FC = () => {
  const { hasPermission, logout, user } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    Swal.fire({
      title: "Xác nhận đăng xuất",
      text: "Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
      }
    });
  };

  // SVG Icons for each sidebar item
  const dashboardIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9"></rect>
      <rect x="14" y="3" width="7" height="5"></rect>
      <rect x="14" y="12" width="7" height="9"></rect>
      <rect x="3" y="16" width="7" height="5"></rect>
    </svg>
  );

  const employeesIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );

  const departmentsIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  );

  const positionsIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7"></circle>
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
    </svg>
  );

  const attendanceIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polyline points="12 6 12 12 16 14"></polyline>
    </svg>
  );

  const shiftsIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
    </svg>
  );

  const leaveIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  );

  const overtimeIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
    </svg>
  );

  const payrollIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"></line>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
    </svg>
  );

  const recruitmentIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
      <path d="M9 14h6"></path>
      <path d="M9 18h6"></path>
      <path d="M12 10h.01"></path>
    </svg>
  );

  const assetsIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
      <line x1="12" y1="22.08" x2="12" y2="12"></line>
    </svg>
  );

  const reportsIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
  );

  const usersIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"></circle>
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"></path>
    </svg>
  );

  const settingsIcon = (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  );

  const NAV_ITEMS: NavItem[] = [
    { to: "/dashboard", label: "Bảng điều khiển", icon: dashboardIcon },
    { to: "/employees", label: "Nhân viên", featureCode: "F03", icon: employeesIcon },
    { to: "/departments", label: "Phòng ban", featureCode: "F04", icon: departmentsIcon },
    { to: "/positions", label: "Chức vụ", featureCode: "F04", icon: positionsIcon },
    { to: "/attendance", label: "Chấm công", featureCode: "F05", icon: attendanceIcon },
    { to: "/shifts", label: "Ca làm việc", featureCode: "F06", icon: shiftsIcon },
    { to: "/leave", label: "Nghỉ phép", featureCode: "F07", icon: leaveIcon },
    { to: "/overtime", label: "Tăng ca", featureCode: "F08", icon: overtimeIcon },
    { to: "/payroll", label: "Lương", featureCode: "F09", icon: payrollIcon },
    { to: "/recruitment", label: "Tuyển dụng", featureCode: "F10", icon: recruitmentIcon },
    { to: "/assets", label: "Tài sản", featureCode: "F11", icon: assetsIcon },
    { to: "/reports", label: "Báo cáo", featureCode: "F12", icon: reportsIcon },
    { to: "/users", label: "Tài khoản", featureCode: "F02", icon: usersIcon },
    { to: "/settings", label: "Cấu hình", icon: settingsIcon },
  ];

  const allowedNavItems = NAV_ITEMS.filter(
    (item) => !item.featureCode || hasPermission(item.featureCode)
  );

  // Parse breadcrumbs based on active path
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split("/").filter(Boolean);
    if (segments.length === 0) return ["Home", "Bảng điều khiển"];

    const mapping: Record<string, string> = {
      dashboard: "Bảng điều khiển",
      employees: "Danh sách nhân viên",
      departments: "Quản lý phòng ban",
      positions: "Quản lý chức vụ",
      attendance: "Nhật ký chấm công",
      shifts: "Thiết lập ca làm việc",
      leave: "Phê duyệt nghỉ phép",
      overtime: "Phê duyệt tăng ca",
      payroll: "Tính toán lương",
      recruitment: "Chiến dịch tuyển dụng",
      assets: "Cấp phát tài sản",
      reports: "Xem báo cáo",
      users: "Tài khoản người dùng",
      settings: "Cấu hình ứng dụng",
    };

    return ["Home", ...segments.map((s) => mapping[s] || s)];
  };

  return (
    <div className="main-layout">
      {/* Phenikaa-style Sidebar (White with grey borders) */}
      <aside className="sidebar">
        {/* Brand layout */}
        <div className="brand">
          <div className="brand-logo-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
            <h2 className="brand-title">HRMS PORTAL</h2>
          </div>
        </div>

        {/* Sidebar Search input */}
        <div className="sidebar-search">
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input type="text" placeholder="Tìm kiếm" />
        </div>

        {/* Sidebar Navigation */}
        <nav className="sidebar-nav">
          {allowedNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} className="sidebar-link-item">
              <span className="sidebar-link-icon">{item.icon}</span>
              <span className="sidebar-link-text">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Profile card */}
        <div className="sidebar-profile">
          <div className="profile-avatar">
            {user?.fullName ? user.fullName[0].toUpperCase() : "U"}
          </div>
          <div className="profile-info">
            <span className="profile-name">{user?.fullName || "Employee User"}</span>
            <span className="profile-email">{user?.email || "user@phenikaa.com"}</span>
          </div>
          <button className="profile-logout-icon" onClick={handleLogout} title="Đăng xuất">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="content">
        {/* Dynamic breadcrumb navigation */}
        <div className="breadcrumbs">
          {getBreadcrumbs().map((b, index, arr) => (
            <React.Fragment key={index}>
              <span className={index === arr.length - 1 ? "breadcrumb-active" : "breadcrumb-item"}>
                {b}
              </span>
              {index < arr.length - 1 && (
                <span className="breadcrumb-separator">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
