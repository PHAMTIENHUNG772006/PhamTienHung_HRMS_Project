import React from 'react';
import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout: React.FC = () => {
  return (
    <div className="auth-layout">
      {/* ===== Hiệu ứng các ô vuông bay Background toàn màn hình ===== */}
      <ul className="circles">
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
        <li></li>
      </ul>

      {/* ===== Khung trung tâm bọc các trang con (Login/Register) ===== */}
      <div className="auth-content-center">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;