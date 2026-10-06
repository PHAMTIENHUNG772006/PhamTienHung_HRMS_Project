import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
  requiredFeature?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredFeature }) => {
  const { isAuthenticated, loading, hasPermission, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Forced password reset routing gate
  if (user?.isTemporaryPassword && location.pathname !== "/reset-temporary-password") {
    return <Navigate to="/reset-temporary-password" replace />;
  }

  // Prevent accessing reset-temporary-password if not required
  if (!user?.isTemporaryPassword && location.pathname === "/reset-temporary-password") {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredFeature && !hasPermission(requiredFeature)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
