import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import StatisticCard from "../../components/common/StatisticCard";
import { getEmployees } from "../../api/endpoints/employees.api";
import { getLeaveRequests } from "../../api/endpoints/leave.api";
import { getOvertimeRequests } from "../../api/endpoints/overtime.api";
import { getAssets } from "../../api/endpoints/assets.api";
import { getMyAttendances, getAllAttendances } from "../../services/attendance.service";
import { getCandidates } from "../../api/endpoints/recruitment.api";
import { getPayrolls } from "../../api/endpoints/payroll.api";
import { getMyShiftAssignmentsToday } from "../../api/endpoints/shifts-assignment.api";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || "Employee";
  const navigate = useNavigate();

  // Real statistics state
  const [employeeCount, setEmployeeCount] = useState<number | string>("...");
  const [leaveTodayCount, setLeaveTodayCount] = useState<number | string>("...");
  const [otCount, setOtCount] = useState<number | string>("...");
  const [assetCount, setAssetCount] = useState<number | string>("...");

  // Employee specific real statistics
  const [empWorkingDays, setEmpWorkingDays] = useState<number | string>("...");
  const [empRemainingLeaves, setEmpRemainingLeaves] = useState<number | string>("...");
  const [empApprovedLeaves, setEmpApprovedLeaves] = useState<number | string>("...");
  const [empOtHours, setEmpOtHours] = useState<number | string>("...");

  // Real recent activities state
  const [realActivities, setRealActivities] = useState<string[]>([]);

  useEffect(() => {
    const fetchRealData = async () => {
      let employeesList: any[] = [];
      try {
        const empRes = await getEmployees();
        if (empRes.success && Array.isArray(empRes.data)) {
          setEmployeeCount(empRes.data.length);
          employeesList = empRes.data;
        } else {
          setEmployeeCount(0);
        }
      } catch (err) {
        setEmployeeCount(0);
      }

      let leaveRequestsList: any[] = [];
      try {
        const leaveRes = await getLeaveRequests();
        if (leaveRes.success && Array.isArray(leaveRes.data)) {
          leaveRequestsList = leaveRes.data;
          const todayStr = new Date().toISOString().split("T")[0];
          const today = new Date(todayStr);
          const activeLeavesToday = leaveRes.data.filter((lr: any) => {
            if (!lr.startDate || !lr.endDate) return false;
            const start = new Date(lr.startDate);
            const end = new Date(lr.endDate);
            return start <= today && today <= end && 
              (lr.status?.toLowerCase() === "approved" || lr.status === "Đã duyệt");
          });
          setLeaveTodayCount(activeLeavesToday.length);
        } else {
          setLeaveTodayCount(0);
        }
      } catch (err) {
        setLeaveTodayCount(0);
      }

      let overtimeRequestsList: any[] = [];
      try {
        const otRes = await getOvertimeRequests();
        if (otRes.success && Array.isArray(otRes.data)) {
          overtimeRequestsList = otRes.data;
          const pendingOt = otRes.data.filter((ot: any) => 
            ot.status?.toLowerCase() === "pending" || ot.status === "Chờ duyệt"
          );
          setOtCount(pendingOt.length);
        } else {
          setOtCount(0);
        }
      } catch (err) {
        setOtCount(0);
      }

      let assetsList: any[] = [];
      try {
        const assetRes = await getAssets();
        if (assetRes.success && Array.isArray(assetRes.data)) {
          assetsList = assetRes.data;
          const activeAssets = assetRes.data.filter((a: any) => 
            a.status === "Đang sử dụng" || a.status?.toLowerCase() === "in_use"
          );
          setAssetCount(activeAssets.length);
        } else {
          setAssetCount(0);
        }
      } catch (err) {
        setAssetCount(0);
      }

      let myAttendancesList: any[] = [];
      let allAttendancesList: any[] = [];
      let myShiftsTodayList: any[] = [];
      let candidatesList: any[] = [];
      let payrollsList: any[] = [];

      try {
        const attRes = await getMyAttendances();
        if (attRes.success && Array.isArray(attRes.data)) {
          myAttendancesList = attRes.data;
        }
      } catch (e) {}

      try {
        if (role === "Admin" || role === "HR" || role === "Manager" || role === "Payroll") {
          const allAttRes = await getAllAttendances();
          if (allAttRes.success && Array.isArray(allAttRes.data)) {
            allAttendancesList = allAttRes.data;
          }
        }
      } catch (e) {}

      try {
        const shiftRes = await getMyShiftAssignmentsToday();
        if (shiftRes.success && Array.isArray(shiftRes.data)) {
          myShiftsTodayList = shiftRes.data;
        }
      } catch (e) {}

      try {
        if (role === "Admin" || role === "HR") {
          const candRes = await getCandidates();
          if (candRes.success && Array.isArray(candRes.data)) {
            candidatesList = candRes.data;
          }
        }
      } catch (e) {}

      try {
        if (role === "Admin" || role === "Payroll") {
          const payRes = await getPayrolls();
          if (payRes.success && Array.isArray(payRes.data)) {
            payrollsList = payRes.data;
          }
        }
      } catch (e) {}

      // Fetch employee specific data
      const matchedEmp = employeesList.find((e: any) => Number(e.userId) === Number(user?.id));
      const employeeId = matchedEmp?.employeeId || matchedEmp?.id;

      if (employeeId) {
        // 1. Phép năm còn lại & Đơn xin nghỉ đã duyệt
        if (leaveRequestsList.length > 0) {
          const currentYear = new Date().getFullYear();
          const approvedLeavesThisYear = leaveRequestsList.filter((lr: any) => {
            const isEmpMatch = Number(lr.employeeId) === Number(employeeId);
            const isApproved = lr.status?.toLowerCase() === "approved" || lr.status === "Đã duyệt";
            const isThisYear = lr.startDate && new Date(lr.startDate).getFullYear() === currentYear;
            const isLeaveTypeMatch = lr.leaveType?.toLowerCase().includes("phép");
            return isEmpMatch && isApproved && isThisYear && isLeaveTypeMatch;
          });
          const usedDays = approvedLeavesThisYear.reduce((sum: number, lr: any) => sum + (Number(lr.totalDays) || 0), 0);
          setEmpRemainingLeaves(Math.max(0, 12 - usedDays));

          const totalApprovedLeaves = leaveRequestsList.filter((lr: any) => 
            Number(lr.employeeId) === Number(employeeId) && 
            (lr.status?.toLowerCase() === "approved" || lr.status === "Đã duyệt")
          ).length;
          setEmpApprovedLeaves(totalApprovedLeaves);
        } else {
          setEmpRemainingLeaves(12);
          setEmpApprovedLeaves(0);
        }

        // 2. Ngày công trong tháng
        const currentMonthStr = new Date().toISOString().slice(0, 7); // "2026-07"
        const workingDaysThisMonth = myAttendancesList.filter((att: any) => {
          return att.workDate && 
            att.workDate.startsWith(currentMonthStr) && 
            (att.checkInTime !== null || att.checkOutTime !== null);
        }).length;
        setEmpWorkingDays(workingDaysThisMonth);

        // 3. Giờ tăng ca tích lũy
        if (overtimeRequestsList.length > 0) {
          const myOtHours = overtimeRequestsList
            .filter((ot: any) => 
              Number(ot.employeeId) === Number(employeeId) && 
              (ot.status?.toLowerCase() === "approved" || ot.status === "Đã duyệt") &&
              ot.otDate && ot.otDate.startsWith(currentMonthStr)
            )
            .reduce((sum: number, ot: any) => sum + (Number(ot.approvedHours) || 0), 0);
          setEmpOtHours(myOtHours);
        } else {
          setEmpOtHours(0);
        }
      } else {
        setEmpWorkingDays(0);
        setEmpRemainingLeaves(12);
        setEmpApprovedLeaves(0);
        setEmpOtHours(0);
      }

      // Generate Real Recent Activities
      const formatDateStr = (dStr?: string) => {
        if (!dStr) return "";
        const clean = dStr.split("T")[0];
        const parts = clean.split("-");
        if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
        return dStr;
      };

      const formatTimeStr = (tStr?: string | null) => {
        if (!tStr) return "";
        try {
          const d = new Date(tStr);
          if (!isNaN(d.getTime())) {
            return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
          }
        } catch {}
        return tStr.slice(0, 5);
      };

      const acts: string[] = [];

      if (role === "Employee") {
        if (myAttendancesList.length > 0) {
          const latestAtt = myAttendancesList[myAttendancesList.length - 1];
          if (latestAtt.checkInTime) {
            acts.push(`Bạn đã điểm danh Check-In ca ${latestAtt.shiftName || 'làm việc'} lúc ${formatTimeStr(latestAtt.checkInTime)} ngày ${formatDateStr(latestAtt.workDate)}.`);
          }
        }
        if (myShiftsTodayList.length > 0) {
          const shift = myShiftsTodayList[0];
          acts.push(`Lịch làm việc hôm nay: Ca ${shift.shiftName} (${shift.startTime?.slice(0, 5)} - ${shift.endTime?.slice(0, 5)}).`);
        }
        const myLeaves = leaveRequestsList.filter((lr: any) => Number(lr.employeeId) === Number(employeeId));
        if (myLeaves.length > 0) {
          const lastLeave = myLeaves[myLeaves.length - 1];
          acts.push(`Đơn xin nghỉ phép (${lastLeave.leaveType}) ngày ${formatDateStr(lastLeave.startDate)} - Trạng thái: ${lastLeave.status}.`);
        }
        const myOts = overtimeRequestsList.filter((ot: any) => Number(ot.employeeId) === Number(employeeId));
        if (myOts.length > 0) {
          const lastOt = myOts[myOts.length - 1];
          acts.push(`Đăng ký OT ngày ${formatDateStr(lastOt.otDate)} - Trạng thái: ${lastOt.status}.`);
        }
      } else if (role === "Manager") {
        const pendingLeaves = leaveRequestsList.filter((lr: any) => 
          lr.status?.toLowerCase().includes("pending") || lr.status === "Chờ duyệt"
        );
        pendingLeaves.slice(0, 2).forEach((lr: any) => {
          acts.push(`Yêu cầu xin nghỉ phép (${lr.leaveType}) từ ${lr.employeeName || 'nhân viên'} ngày ${formatDateStr(lr.startDate)} đang chờ bạn phê duyệt.`);
        });

        const pendingOts = overtimeRequestsList.filter((ot: any) => 
          ot.status?.toLowerCase().includes("pending") || ot.status === "Chờ duyệt"
        );
        pendingOts.slice(0, 2).forEach((ot: any) => {
          acts.push(`Đăng ký OT ngày ${formatDateStr(ot.otDate)} từ ${ot.employeeName || 'nhân viên'} đang chờ xác nhận.`);
        });

        if (allAttendancesList.length > 0) {
          const latestAtt = allAttendancesList[allAttendancesList.length - 1];
          acts.push(`Nhân sự ${latestAtt.employeeName} đã chấm công ca ${latestAtt.shiftName || ''} ngày ${formatDateStr(latestAtt.workDate)}.`);
        }
      } else if (role === "HR") {
        if (candidatesList.length > 0) {
          const lastCand = candidatesList[candidatesList.length - 1];
          acts.push(`Hồ sơ ứng viên mới: ${lastCand.candidateName} (${lastCand.positionName || 'Vị trí tuyển dụng'}) - Trạng thái: ${lastCand.status || 'Đang xử lý'}.`);
        }
        if (employeesList.length > 0) {
          const lastEmp = employeesList[employeesList.length - 1];
          acts.push(`Hồ sơ nhân sự ${lastEmp.fullName} (${lastEmp.employeeCode || 'EMP'}) thuộc phòng ${lastEmp.departmentName || 'Chung'} đã được tiếp nhận.`);
        }
        if (leaveRequestsList.length > 0) {
          const lastLeave = leaveRequestsList[leaveRequestsList.length - 1];
          acts.push(`Nhân viên ${lastLeave.employeeName || 'nhân sự'} vừa gửi đơn xin nghỉ phép ngày ${formatDateStr(lastLeave.startDate)}.`);
        }
        if (overtimeRequestsList.length > 0) {
          const lastOt = overtimeRequestsList[overtimeRequestsList.length - 1];
          acts.push(`Yêu cầu OT ngày ${formatDateStr(lastOt.otDate)} từ ${lastOt.employeeName || 'nhân sự'} đã ghi nhận trên hệ thống.`);
        }
      } else if (role === "Admin") {
        acts.push(`Hệ thống đang quản lý tổng cộng ${employeesList.length} hồ sơ nhân sự active.`);
        if (assetsList.length > 0) {
          const activeAssets = assetsList.filter((a: any) => a.status === "Đang sử dụng" || a.status?.toLowerCase() === "in_use");
          acts.push(`Hệ thống đang theo dõi ${activeAssets.length} / ${assetsList.length} thiết bị/tài sản công ty.`);
        }
        if (leaveRequestsList.length > 0) {
          acts.push(`Ghi nhận tổng số ${leaveRequestsList.length} đơn xin nghỉ phép trong cơ sở dữ liệu.`);
        }
        if (overtimeRequestsList.length > 0) {
          acts.push(`Ghi nhận tổng số ${overtimeRequestsList.length} yêu cầu OT đăng ký trên hệ thống.`);
        }
      } else if (role === "Payroll") {
        if (payrollsList.length > 0) {
          const lastPay = payrollsList[0];
          acts.push(`Bảng lương kỳ ${lastPay.salaryPeriod} của nhân sự ${lastPay.employeeName || ''} - Trạng thái: ${lastPay.status}.`);
        }
        if (allAttendancesList.length > 0) {
          acts.push(`Đã tổng hợp dữ liệu từ ${allAttendancesList.length} lượt chấm công phục vụ tính lương.`);
        }
        if (overtimeRequestsList.length > 0) {
          const approvedOts = overtimeRequestsList.filter((o: any) => o.status === "Đã duyệt" || o.status?.toLowerCase() === "approved");
          acts.push(`Ghi nhận ${approvedOts.length} đơn OT đã phê duyệt để tính lương.`);
        }
      }

      setRealActivities(acts);
    };

    fetchRealData();
  }, [user]);

  // Dynamic statistics based on User Role
  const getStats = () => {
    switch (role) {
      case "Admin":
        return [
          { label: "Tổng nhân sự", value: employeeCount.toString() },
          { label: "Nghỉ phép hôm nay", value: leaveTodayCount.toString() },
          { label: "Yêu cầu OT cần duyệt", value: otCount.toString() },
          { label: "Tài sản đang sử dụng", value: assetCount.toString() },
        ];
      case "HR":
        return [
          { label: "Tổng nhân sự", value: employeeCount.toString() },
          { label: "Nghỉ phép hôm nay", value: leaveTodayCount.toString() },
          { label: "Yêu cầu OT cần duyệt", value: otCount.toString() },
          { label: "Tài sản đang sử dụng", value: assetCount.toString() },
        ];
      case "Manager":
        return [
          { label: "Nhân viên quản lý", value: "12" },
          { label: "Đã chấm công hôm nay", value: "11" },
          { label: "Đơn xin nghỉ chờ duyệt", value: "2" },
          { label: "Đơn đăng ký OT chờ duyệt", value: "3" },
        ];
      case "Payroll":
        return [
          { label: "Chu kỳ lương hiện tại", value: "Tháng 07/2026" },
          { label: "Tiến độ tính lương", value: "85%" },
          { label: "Phiếu lương đã tạo", value: "0 / 98" },
          { label: "Tổng quỹ lương dự kiến", value: "$124,500" },
        ];
      case "Employee":
      default:
        return [
          { label: "Ngày công trong tháng", value: `${empWorkingDays} ngày` },
          { label: "Phép năm còn lại", value: `${empRemainingLeaves} ngày` },
          { label: "Đơn xin nghỉ đã duyệt", value: `${empApprovedLeaves} đơn` },
          { label: "Giờ tăng ca tích lũy", value: `${empOtHours} giờ` },
        ];
    }
  };

  // Dynamic recent activities based on User Role (fallback if real state is empty)
  const getActivities = () => {
    if (realActivities.length > 0) return realActivities;
    switch (role) {
      case "Admin":
        return [
          "Hệ thống kiểm tra và sao lưu cơ sở dữ liệu tự động hoàn tất.",
          "Theo dõi tổng số nhân sự và tài sản hệ thống theo thời gian thực.",
        ];
      case "HR":
        return [
          "Theo dõi hồ sơ nhân sự mới và ứng viên ứng tuyển theo thời gian thực.",
          "Ghi nhận các đơn xin nghỉ phép và đăng ký OT mới từ nhân viên.",
        ];
      case "Manager":
        return [
          "Không có đơn nghỉ phép hoặc đăng ký OT mới nào cần duyệt lúc này.",
          "Lịch làm việc ca của các nhân viên trong phòng ban được cập nhật.",
        ];
      case "Payroll":
        return [
          "Dữ liệu chấm công và bảng lương đang được đồng bộ theo thời gian thực.",
        ];
      case "Employee":
      default:
        return [
          "Bạn chưa có hoạt động chấm công hay xin nghỉ mới ghi nhận hôm nay.",
        ];
    }
  };

  // Dynamic quick actions based on User Role
  const getQuickActions = () => {
    const clockIcon = (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
    );
    const fileIcon = (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
      </svg>
    );
    const dollarIcon = (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
    );
    const userPlusIcon = (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="8.5" cy="7" r="4"></circle>
        <line x1="20" y1="8" x2="20" y2="14"></line>
        <line x1="23" y1="11" x2="17" y2="11"></line>
      </svg>
    );
    const briefcaseIcon = (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
    );
    const trendIcon = (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
        <polyline points="17 6 23 6 23 12"></polyline>
      </svg>
    );

    switch (role) {
      case "Admin":
        return [
          { label: "Quản lý tài khoản", icon: userPlusIcon, path: "/users" },
          { label: "Quản lý nhân sự", icon: userPlusIcon, path: "/employees" },
          { label: "Quản lý thiết bị/tài sản", icon: briefcaseIcon, path: "/assets" },
        ];
      case "HR":
        return [
          { label: "Tiếp nhận nhân sự", icon: userPlusIcon, path: "/employees" },
          { label: "Quản lý tuyển dụng", icon: briefcaseIcon, path: "/recruitment" },
          { label: "Xem báo cáo chấm công", icon: clockIcon, path: "/attendance" },
        ];
      case "Manager":
        return [
          { label: "Phê duyệt đơn nghỉ phép", icon: fileIcon, path: "/leave" },
          { label: "Phê duyệt đăng ký OT", icon: clockIcon, path: "/overtime" },
          { label: "Cập nhật ca làm việc", icon: briefcaseIcon, path: "/shifts" },
        ];
      case "Payroll":
        return [
          { label: "Tính toán bảng lương", icon: dollarIcon, path: "/payroll" },
          { label: "Xem báo cáo chi phí lương", icon: trendIcon, path: "/reports" },
        ];
      case "Employee":
      default:
        return [
          { label: "Điểm danh (Check-in)", icon: clockIcon, path: "/attendance" },
          { label: "Tạo đơn xin nghỉ phép", icon: fileIcon, path: "/leave" },
          { label: "Xem phiếu lương cá nhân", icon: dollarIcon, path: "/payroll" },
        ];
    }
  };  if (role === "CANDIDATE") {
    return (
      <div className="page-container">
        <div className="dashboard-welcome">
          <h2 style={{ margin: 0 }}>Xin chào, {user?.fullName || "Thành viên"}!</h2>
          <span className="role-badge candidate" style={{ background: "#f97316", boxShadow: "0 4px 10px rgba(249, 115, 22, 0.2)" }}>Ứng viên</span>
        </div>
        
        <p style={{ margin: "0 0 24px 0", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Trạng thái Hồ sơ Ứng tuyển của bạn
        </p>

        <div className="dashboard-layout">
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: 700 }}>Tiến trình Tuyển dụng & Phỏng vấn</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "10px 0" }}>
              
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ background: "#e0f2fe", color: "#0284c7", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>1</div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "14.5px", fontWeight: 600 }}>Nộp hồ sơ trực tuyến</h4>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>Đã tiếp nhận hồ sơ thành công. Trạng thái: <strong>Đạt yêu cầu sơ loại</strong>.</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ background: "#ffedd5", color: "#ea580c", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>2</div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "14.5px", fontWeight: 600 }}>Phỏng vấn vòng 1 (HR Interview)</h4>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>Thời gian: <strong>14:00 - 15:00 ngày 20/07/2026</strong>. Hình thức: Phỏng vấn trực tuyến qua Google Meet.</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 14, alignItems: "flex-start", opacity: 0.5 }}>
                <div style={{ background: "#f1f5f9", color: "#64748b", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>3</div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "14.5px", fontWeight: 600 }}>Phỏng vấn vòng 2 (Technical Interview)</h4>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>Chưa lên lịch trình. Sẽ thông báo sau khi hoàn tất Vòng 1.</p>
                </div>
              </div>

              <div style={{ display: "flex", gap: 14, alignItems: "flex-start", opacity: 0.5 }}>
                <div style={{ background: "#f1f5f9", color: "#64748b", width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>4</div>
                <div>
                  <h4 style={{ margin: 0, fontSize: "14.5px", fontWeight: 600 }}>Phê duyệt trúng tuyển (Transition)</h4>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--text-secondary)" }}>HR phê duyệt làm nhân viên chính thức của công ty.</p>
                </div>
              </div>

            </div>
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: 700 }}>Thông tin liên hệ</h3>
            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.6", margin: 0 }}>
              Bộ phận Tuyển dụng Phenikaa Portal luôn đồng hành cùng bạn.
              <br /><br />
              - **Hotline:** 024.1234.5678
              <br />
              - **Email:** hr-recruit@phenikaa.com
              <br />
              - **Địa chỉ:** Tầng 5, Tòa nhà Phenikaa, Láng Hạ, Đống Đa, Hà Nội.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (role === "Guest") {
    return (
      <div className="page-container">
        <div className="dashboard-welcome">
          <h2 style={{ margin: 0 }}>Xin chào, {user?.fullName || "Thành viên"}!</h2>
          <span className="role-badge guest" style={{ background: "#64748b", boxShadow: "0 4px 10px rgba(100, 116, 139, 0.2)" }}>Chờ phê duyệt</span>
        </div>
        
        <p style={{ margin: "0 0 24px 0", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Trạng thái kích hoạt tài khoản hệ thống
        </p>

        <div className="card" style={{ padding: "48px 32px", textAlign: "center", maxWidth: "600px", margin: "40px auto 0", borderTop: "4px solid #64748b" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 20, color: "#64748b" }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "1.3rem", color: "var(--text-primary)", fontWeight: 700 }}>Tài khoản chưa được kích hoạt</h3>
          <p style={{ margin: 0, color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6" }}>
            Chào mừng bạn! Tài khoản của bạn đã được đăng ký thành công trên cổng thông tin HRMS.
            Hiện tại, tài khoản này chưa được liên kết với Hồ sơ nhân viên và chưa được phê duyệt quyền truy cập.
            <br /><br />
            Vui lòng liên hệ với **Bộ phận Nhân sự (HR)** hoặc **Quản trị viên hệ thống** để được kích hoạt vai trò và gán quyền làm việc chính thức.
          </p>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const activities = getActivities();
  const actions = getQuickActions();

  return (
    <div className="page-container">
      <div className="dashboard-welcome">
        <h2 style={{ margin: 0 }}>Xin chào, {user?.fullName || "Thành viên"}!</h2>
        <span className={`role-badge ${role.toLowerCase()}`}>{role}</span>
      </div>
      
      <p style={{ margin: "0 0 24px 0", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
        Tổng quan các chỉ số quan trọng và trạng thái hoạt động dành cho vai trò của bạn.
      </p>

      {/* Grid statistics */}
      <div className="card-grid">
        {stats.map((item) => (
          <StatisticCard
            key={item.label}
            label={item.label}
            value={item.value}
          />
        ))}
      </div>

      {/* Modern Two-Column Layout */}
      <div className="dashboard-layout">
        <div className="card" style={{ marginBottom: 0 }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: 700 }}>Hoạt động gần đây</h3>
          <ul className="dashboard-list">
            {activities.map((act, index) => (
              <li key={index} className="dashboard-list-item">
                <div className="activity-icon-wrapper">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div className="activity-content">{act}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: 700 }}>Thao tác nhanh</h3>
          <div className="quick-actions-grid">
            {actions.map((act, index) => (
              <button
                key={index}
                className="quick-action-btn"
                onClick={() => {
                  if (act.path) {
                    navigate(act.path);
                  } else {
                    alert(`Tính năng "${act.label}" dành cho vai trò ${role} đang được chuẩn bị.`);
                  }
                }}
              >
                {act.icon}
                <span>{act.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
