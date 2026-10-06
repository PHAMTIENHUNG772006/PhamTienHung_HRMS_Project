import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { AttendancePage } from "./AttendancePage";
import { AdminAttendancePage } from "./AdminAttendancePage";

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin" || user?.role === "HR";

  return isAdmin ? <AdminAttendancePage /> : <AttendancePage />;
};

export default Attendance;
