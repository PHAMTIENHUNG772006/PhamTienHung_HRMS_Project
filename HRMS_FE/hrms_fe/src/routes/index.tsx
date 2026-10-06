import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/Login/Login";
import ForgotPassword from "../pages/Login/ForgotPassword";
import Register from "../pages/Register/Register";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/common/ProtectedRoute";
import Dashboard from "../pages/Dashboard";
import Employees from "../pages/Employees";
import Departments from "../pages/Departments";
import Positions from "../pages/Positions";
import Attendance from "../pages/Attendance";
import ShiftManagement from "../pages/ShiftManagement";
import Leave from "../pages/Leave";
import OvertimeManagement from "../pages/OvertimeManagement";
import Payroll from "../pages/Payroll";
import Recruitment from "../pages/Recruitment";
import AssetManagement from "../pages/AssetManagement";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import Users from "../pages/Users";
import ResetTemporaryPassword from "../pages/Login/ResetTemporaryPassword";
import { useAuth } from "../contexts/AuthContext";

const AppRoutes: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />
        <Route
          path="/forgot-password"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <ForgotPassword />
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Register />
            )
          }
        />
      </Route>

      {/* Main App Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Fullscreen standalone page for password resets */}
        <Route path="/reset-temporary-password" element={<ResetTemporaryPassword />} />

        <Route element={<MainLayout />}>
          {/* General landing page (open to all authenticated users) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />

          {/* Feature-guarded routes */}
          <Route element={<ProtectedRoute requiredFeature="F03" />}>
            <Route path="/employees" element={<Employees />} />
          </Route>

          <Route element={<ProtectedRoute requiredFeature="F04" />}>
            <Route path="/departments" element={<Departments />} />
            <Route path="/positions" element={<Positions />} />
          </Route>

          <Route element={<ProtectedRoute requiredFeature="F05" />}>
            <Route path="/attendance" element={<Attendance />} />
          </Route>

          <Route element={<ProtectedRoute requiredFeature="F06" />}>
            <Route path="/shifts" element={<ShiftManagement />} />
          </Route>

          <Route element={<ProtectedRoute requiredFeature="F07" />}>
            <Route path="/leave" element={<Leave />} />
          </Route>

          <Route element={<ProtectedRoute requiredFeature="F08" />}>
            <Route path="/overtime" element={<OvertimeManagement />} />
          </Route>

          <Route element={<ProtectedRoute requiredFeature="F09" />}>
            <Route path="/payroll" element={<Payroll />} />
          </Route>

          <Route element={<ProtectedRoute requiredFeature="F10" />}>
            <Route path="/recruitment" element={<Recruitment />} />
          </Route>

          <Route element={<ProtectedRoute requiredFeature="F11" />}>
            <Route path="/assets" element={<AssetManagement />} />
          </Route>

          <Route element={<ProtectedRoute requiredFeature="F12" />}>
            <Route path="/reports" element={<Reports />} />
          </Route>

          <Route element={<ProtectedRoute requiredFeature="F02" />}>
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>
      </Route>

      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />

      {/* Fallback Route */}
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />
    </Routes>
  );
};

export default AppRoutes;
