import React, { useState, useEffect } from "react";
import SectionHeader from "../../components/common/SectionHeader";
import StatisticCard from "../../components/common/StatisticCard";
import { getEmployees } from "../../api/endpoints/employees.api";
import { getLeaveRequests } from "../../api/endpoints/leave.api";
import { getOvertimeRequests } from "../../api/endpoints/overtime.api";
import { getCampaigns } from "../../api/endpoints/recruitment.api";
import { getDepartments } from "../../api/endpoints/departments.api";
import { getMyAttendances } from "../../services/attendance.service";
import { getPayrolls, type PayrollItem } from "../../api/endpoints/payroll.api";
import { useAuth } from "../../contexts/AuthContext";
import Swal from "sweetalert2";
import Pagination from "../../components/common/Pagination";

interface DepartmentAnalyticItem {
  name: string;
  employeeCount: number;
  leaveCount: number;
  otCount: number;
  percentage: number;
  color: string;
}

const Reports: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || "Employee";

  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    pendingOT: 0,
    activeCampaigns: 0,
  });
  
  // Personal stats for Employee Role
  const [personalStats, setPersonalStats] = useState({
    workingDays: 0,
    lateCount: 0,
    totalOTHours: 0,
    usedLeaves: 0,
    remainingLeaves: 12,
    pendingLeaves: 0,
  });

  const [loading, setLoading] = useState(true);
  const [deptData, setDeptData] = useState<{ name: string; count: number; percentage: number; color: string }[]>([]);
  const [deptAnalytics, setDeptAnalytics] = useState<DepartmentAnalyticItem[]>([]);
  
  // Personal historical records
  const [myPayrollsList, setMyPayrollsList] = useState<PayrollItem[]>([]);
  const [recentAttendances, setRecentAttendances] = useState<any[]>([]);

  // Pagination for report sections (3 items per page)
  const itemsPerPage = 3;
  const [currentPageAttendances, setCurrentPageAttendances] = useState(1);
  const [currentPagePayrolls, setCurrentPagePayrolls] = useState(1);
  const [currentPageDeptAnalytics, setCurrentPageDeptAnalytics] = useState(1);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [empRes, leaveRes, otRes, campRes, deptRes] = await Promise.all([
        getEmployees(),
        getLeaveRequests(),
        getOvertimeRequests(),
        getCampaigns(),
        getDepartments()
      ]);

      const employees = empRes.success ? (empRes.data || []) : [];
      const leaves = leaveRes.success ? (leaveRes.data || []) : [];
      const ots = otRes.success ? (otRes.data || []) : [];
      const campaigns = campRes.success ? (campRes.data || []) : [];
      const departments = deptRes.success ? (deptRes.data || []) : [];

      const totalEmpCount = employees.length;

      // 1. Calculate General HR Admin Stats
      setStats({
        totalEmployees: totalEmpCount,
        pendingLeaves: leaves.filter((r: any) => r.status === "Chờ duyệt" || r.status?.toUpperCase() === "PENDING").length,
        pendingOT: ots.filter((r: any) => r.status === "Chờ duyệt" || r.status?.toUpperCase() === "PENDING").length,
        activeCampaigns: campaigns.length,
      });

      // Find current employee metadata
      const matchedEmp = employees.find((e: any) => Number(e.userId) === Number(user?.id))
        || employees.find((emp: any) => emp.fullName?.toLowerCase() === user?.fullName?.toLowerCase())
        || employees.find((emp: any) => {
          const empNorm = emp.fullName?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, "");
          const userNorm = user?.fullName?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, "");
          if (!empNorm || !userNorm) return false;
          if (empNorm === userNorm) return true;
          const empWords = emp.fullName?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/\s+/).filter(Boolean) || [];
          const userWords = user?.fullName?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/\s+/).filter(Boolean) || [];
          if (empWords.length > 0 && userWords.length > 0) {
            const allUserInEmp = userWords.every((w: string) => empWords.includes(w));
            const allEmpInUser = empWords.every((w: string) => userWords.includes(w));
            return allUserInEmp || allEmpInUser;
          }
          return false;
        });
      const employeeId = matchedEmp?.employeeId || matchedEmp?.id;

      // 2. Fetch Employee specific real data
      if (role === "Employee" && employeeId) {
        const currentYear = new Date().getFullYear();
        const currentMonthStr = new Date().toISOString().slice(0, 7); // e.g. "2026-07"

        // Leave calculations
        const myLeaves = leaves.filter((lr: any) => Number(lr.employeeId) === Number(employeeId));
        const approvedLeavesThisYear = myLeaves.filter((lr: any) => {
          const isApproved = lr.status?.toLowerCase() === "approved" || lr.status === "Đã duyệt";
          const isThisYear = lr.startDate && new Date(lr.startDate).getFullYear() === currentYear;
          const isLeaveTypeMatch = lr.leaveType?.toLowerCase().includes("phép");
          return isApproved && isThisYear && isLeaveTypeMatch;
        });
        const used = approvedLeavesThisYear.reduce((sum: number, lr: any) => sum + (Number(lr.totalDays) || 0), 0);
        const pending = myLeaves.filter((lr: any) => lr.status === "Chờ duyệt" || lr.status?.toLowerCase() === "pending").length;

        // OT calculations
        const myOts = ots.filter((ot: any) => 
          Number(ot.employeeId) === Number(employeeId) && 
          (ot.status?.toLowerCase() === "approved" || ot.status === "Đã duyệt")
        );
        const totalOT = myOts
          .filter((ot: any) => ot.otDate && ot.otDate.startsWith(currentMonthStr))
          .reduce((sum: number, ot: any) => sum + (Number(ot.approvedHours) || 0), 0);

        // Attendance calculations
        let workingDaysCount = 0;
        let latesCount = 0;
        let latestAtts: any[] = [];
        try {
          const attRes = await getMyAttendances();
          if (attRes.success && Array.isArray(attRes.data)) {
            const myAtts = attRes.data;
            workingDaysCount = myAtts.filter((att: any) => 
              att.workDate && att.workDate.startsWith(currentMonthStr) && 
              (att.checkInTime !== null || att.checkOutTime !== null)
            ).length;

            latesCount = myAtts.filter((att: any) => 
              att.workDate && att.workDate.startsWith(currentMonthStr) && 
              (att.lateMinutes > 0 || att.status === "LATE")
            ).length;

            latestAtts = myAtts;
          }
        } catch (e) {
          console.error("Error loading employee attendances inside reports page", e);
        }

        // Payroll calculations
        let myPayrolls: any[] = [];
        try {
          const payRes = await getPayrolls();
          if (payRes.success && Array.isArray(payRes.data)) {
            myPayrolls = payRes.data.filter((p: any) => Number(p.employeeId) === Number(employeeId));
          }
        } catch (e) {
          console.error("Error loading employee payrolls inside reports page", e);
        }

        setPersonalStats({
          workingDays: workingDaysCount,
          lateCount: latesCount,
          totalOTHours: totalOT,
          usedLeaves: used,
          remainingLeaves: Math.max(0, 12 - used),
          pendingLeaves: pending,
        });

        setMyPayrollsList(myPayrolls);
        setRecentAttendances(latestAtts);
      }

      // 3. Calculate general department distribution (Admin/HR only)
      const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#ef4444", "#14b8a6", "#64748b"];
      const deptCounts = departments.map((dept: any, index: number) => {
        const count = employees.filter((emp: any) => emp.departmentId !== null && emp.departmentId !== undefined && Number(emp.departmentId) === Number(dept.departmentId)).length;
        const percentage = totalEmpCount > 0 ? Math.round((count / totalEmpCount) * 100) : 0;
        return {
          name: dept.departmentName,
          count,
          percentage,
          color: colors[index % colors.length]
        };
      });

      // Include employees with no department
      const unassignedCount = employees.filter((emp: any) => emp.departmentId === null || emp.departmentId === undefined || emp.departmentId === '').length;
      if (unassignedCount > 0) {
        const percentage = totalEmpCount > 0 ? Math.round((unassignedCount / totalEmpCount) * 100) : 0;
        deptCounts.push({
          name: "Chưa phân bổ",
          count: unassignedCount,
          percentage,
          color: "#94a3b8"
        });
      }

      setDeptData(deptCounts.filter(d => d.count > 0));

      // Calculate department analytics (Employees, Leaves, OT counts) with robust parsed numeric comparisons
      const deptAnalyticList = departments.map((dept: any, index: number) => {
        const deptEmployees = employees.filter((emp: any) => emp.departmentId !== null && emp.departmentId !== undefined && Number(emp.departmentId) === Number(dept.departmentId));
        const empCount = deptEmployees.length;
        const percentage = totalEmpCount > 0 ? Math.round((empCount / totalEmpCount) * 100) : 0;

        const deptEmpIds = deptEmployees.map((e: any) => Number(e.employeeId || e.id)).filter(id => !isNaN(id));
        const deptLeaves = leaves.filter((lr: any) => lr.employeeId && deptEmpIds.includes(Number(lr.employeeId))).length;
        const deptOts = ots.filter((ot: any) => ot.employeeId && deptEmpIds.includes(Number(ot.employeeId))).length;

        return {
          name: dept.departmentName,
          employeeCount: empCount,
          leaveCount: deptLeaves,
          otCount: deptOts,
          percentage,
          color: colors[index % colors.length]
        };
      });

      setDeptAnalytics(deptAnalyticList.filter((d: any) => d.employeeCount > 0));

    } catch (err) {
      console.error("Error fetching report data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [role, user]);

  const handleExportPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      Swal.fire("Lỗi", "Vui lòng cho phép trình duyệt mở cửa sổ bật lên (popup) để xuất PDF.", "error");
      return;
    }

    const title = role === "Employee"
      ? `BÁO CÁO CÁ NHÂN NHÂN VIÊN — ${user?.fullName || "Thành viên"}`
      : "BÁO CÁO TỔNG HỢP HOẠT ĐỘNG HR & NHÂN SỰ";

    const reportDate = new Date().toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    const contentHtml = role === "Employee" ? `
      <div class="header">
        <h2>HỆ THỐNG QUẢN LÝ NHÂN SỰ HRMS</h2>
        <h1>${title}</h1>
        <p class="date">Ngày xuất báo cáo: ${reportDate}</p>
      </div>

      <div class="section">
        <h3 class="section-title">I. TỔNG QUAN CÔNG VÀ NGHỈ PHÉP (THÁNG NÀY)</h3>
        <div class="grid-cards">
          <div class="card-item">
            <span class="card-val">${personalStats.workingDays} ngày</span>
            <span class="card-lbl">Số ngày công thực tế</span>
          </div>
          <div class="card-item">
            <span class="card-val">${personalStats.totalOTHours} giờ</span>
            <span class="card-lbl">Giờ tăng ca tích lũy</span>
          </div>
          <div class="card-item">
            <span class="card-val">${personalStats.remainingLeaves} / 12</span>
            <span class="card-lbl">Phép năm còn lại</span>
          </div>
          <div class="card-item">
            <span class="card-val">${personalStats.pendingLeaves} đơn</span>
            <span class="card-lbl">Đơn nghỉ chờ duyệt</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">II. LỊCH SỬ CHẤM CÔNG GẦN ĐÂY</h3>
        <table>
          <thead>
            <tr>
              <th>Ngày làm việc</th>
              <th>Giờ vào</th>
              <th>Giờ ra</th>
              <th>Trạng thái</th>
              <th>Đi muộn (phút)</th>
            </tr>
          </thead>
          <tbody>
            ${recentAttendances.length > 0 ? recentAttendances.map((att: any) => `
              <tr>
                <td>${att.workDate || 'N/A'}</td>
                <td>${att.checkInTime || '--:--'}</td>
                <td>${att.checkOutTime || '--:--'}</td>
                <td>${translateAttendanceStatus(att.status)}</td>
                <td>${att.lateMinutes > 0 ? `${att.lateMinutes} phút` : '0'}</td>
              </tr>
            `).join('') : '<tr><td colspan="5" style="text-align:center;">Chưa có dữ liệu chấm công</td></tr>'}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h3 class="section-title">III. DANH SÁCH BẢNG LƯƠNG GẦN ĐÂY</h3>
        <table>
          <thead>
            <tr>
              <th>Kỳ lương</th>
              <th>Lương cơ bản</th>
              <th>Phụ cấp</th>
              <th>Khấu trừ</th>
              <th>Thực nhận</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            ${myPayrollsList.length > 0 ? myPayrollsList.map((p: any) => `
              <tr>
                <td>${p.payPeriod || 'N/A'}</td>
                <td>${Number(p.baseSalary || 0).toLocaleString('vi-VN')} VNĐ</td>
                <td>${Number(p.allowances || 0).toLocaleString('vi-VN')} VNĐ</td>
                <td>${Number(p.deductions || 0).toLocaleString('vi-VN')} VNĐ</td>
                <td><strong>${Number(p.netSalary || 0).toLocaleString('vi-VN')} VNĐ</strong></td>
                <td>${p.paymentStatus || 'Đã tính'}</td>
              </tr>
            `).join('') : '<tr><td colspan="6" style="text-align:center;">Chưa có dữ liệu bảng lương</td></tr>'}
          </tbody>
        </table>
      </div>
    ` : `
      <div class="header">
        <h2>HỆ THỐNG QUẢN LÝ NHÂN SỰ HRMS</h2>
        <h1>${title}</h1>
        <p class="date">Ngày xuất báo cáo: ${reportDate}</p>
      </div>

      <div class="section">
        <h3 class="section-title">I. THỐNG KÊ TỔNG QUAN TOÀN CÔNG TY</h3>
        <div class="grid-cards">
          <div class="card-item">
            <span class="card-val">${stats.totalEmployees}</span>
            <span class="card-lbl">Tổng nhân sự</span>
          </div>
          <div class="card-item">
            <span class="card-val">${stats.pendingLeaves}</span>
            <span class="card-lbl">Đơn nghỉ chờ duyệt</span>
          </div>
          <div class="card-item">
            <span class="card-val">${stats.pendingOT}</span>
            <span class="card-lbl">Đơn OT chờ duyệt</span>
          </div>
          <div class="card-item">
            <span class="card-val">${stats.activeCampaigns}</span>
            <span class="card-lbl">Chiến dịch tuyển dụng</span>
          </div>
        </div>
      </div>

      <div class="section">
        <h3 class="section-title">II. PHÂN BỔ NHÂN SỰ THEO PHÒNG BAN</h3>
        <table>
          <thead>
            <tr>
              <th>Tên phòng ban</th>
              <th>Số lượng nhân sự</th>
              <th>Tỷ lệ (%)</th>
            </tr>
          </thead>
          <tbody>
            ${deptData.map((d: any) => `
              <tr>
                <td><strong>${d.name}</strong></td>
                <td>${d.count} nhân viên</td>
                <td>${d.percentage}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h3 class="section-title">III. PHÂN TÍCH HOẠT ĐỘNG PHÒNG BAN (ĐƠN NGHỈ & OT)</h3>
        <table>
          <thead>
            <tr>
              <th>Phòng ban</th>
              <th>Số nhân sự</th>
              <th>Số đơn nghỉ</th>
              <th>Số đơn OT</th>
            </tr>
          </thead>
          <tbody>
            ${deptAnalytics.map((d: any) => `
              <tr>
                <td><strong>${d.name}</strong></td>
                <td>${d.employeeCount} người</td>
                <td>${d.leaveCount} đơn</td>
                <td>${d.otCount} đơn</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 20px;
            background: #fff;
            -webkit-print-color-adjust: exact;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .header h2 {
            font-size: 13px;
            color: #64748b;
            margin: 0 0 5px 0;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .header h1 {
            font-size: 20px;
            color: #0f172a;
            margin: 0 0 8px 0;
          }
          .header .date {
            font-size: 13px;
            color: #475569;
            font-style: italic;
            margin: 0;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 14px;
            color: #1e40af;
            border-left: 4px solid #2563eb;
            padding-left: 10px;
            margin-bottom: 12px;
            text-transform: uppercase;
          }
          .grid-cards {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 15px;
          }
          .card-item {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
            text-align: center;
          }
          .card-val {
            display: block;
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 4px;
          }
          .card-lbl {
            font-size: 12px;
            color: #64748b;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            font-size: 13px;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 8px 10px;
            text-align: left;
          }
          th {
            background-color: #f1f5f9;
            color: #334155;
            font-weight: 600;
          }
          tr:nth-child(even) {
            background-color: #f8fafc;
          }
          .footer-sign {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
          }
          .sign-box {
            text-align: center;
            width: 200px;
          }
          .sign-box .title {
            font-weight: bold;
            margin-bottom: 50px;
            font-size: 13px;
          }
          .sign-box .name {
            font-style: italic;
            font-size: 12px;
            color: #475569;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        ${contentHtml}
        <div class="footer-sign">
          <div class="sign-box">
            <div class="title">Người lập báo cáo</div>
            <div class="name">(Ký, ghi rõ họ tên)</div>
          </div>
          <div class="sign-box">
            <div class="title">Trưởng phòng HR / Giám đốc</div>
            <div class="name">(Ký, đóng dấu)</div>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(fullHtml);
    printWindow.document.close();
  };

  // Helper properties for General Bar Chart (Admin/HR)
  const barChartMax = Math.max(stats.totalEmployees, stats.pendingLeaves, stats.pendingOT, stats.activeCampaigns, 10);
  const barData = [
    { label: "Nhân viên", value: stats.totalEmployees, color: "url(#blueGrad)" },
    { label: "Nghỉ chờ duyệt", value: stats.pendingLeaves, color: "url(#orangeGrad)" },
    { label: "OT chờ duyệt", value: stats.pendingOT, color: "url(#redGrad)" },
    { label: "Tuyển dụng", value: stats.activeCampaigns, color: "url(#purpleGrad)" }
  ];

  // Dynamic conic-gradient string for Donut Chart (Admin/HR)
  let accumulatedPercent = 0;
  const conicString = deptData.map(d => {
    const part = `${d.color} ${accumulatedPercent}% ${accumulatedPercent + d.percentage}%`;
    accumulatedPercent += d.percentage;
    return part;
  }).join(", ");

  const getAttendanceStatusBadgeClass = (status: string) => {
    if (!status) return "";
    switch (status.toUpperCase()) {
      case "ATTENDED":
      case "ĐÚNG GIỜ":
        return "status-badge status-active";
      case "LATE":
      case "ĐI MUỘN":
        return "status-badge status-trial";
      case "ABSENT":
      case "VẮNG MẶT":
        return "status-badge status-inactive";
      default:
        return "status-badge";
    }
  };

  const translateAttendanceStatus = (status: string) => {
    if (!status) return "Chưa xác định";
    switch (status.toUpperCase()) {
      case "ATTENDED": return "Đúng giờ";
      case "LATE": return "Đi muộn";
      case "ABSENT": return "Vắng mặt";
      default: return status;
    }
  };

  // Pagination calculations for Recent Attendances (Employee)
  const totalPagesAttendances = Math.max(1, Math.ceil(recentAttendances.length / itemsPerPage));
  const currentPageAttendancesSanitized = Math.min(currentPageAttendances, totalPagesAttendances);
  const startIndexAttendances = (currentPageAttendancesSanitized - 1) * itemsPerPage;
  const paginatedAttendances = recentAttendances.slice(startIndexAttendances, startIndexAttendances + itemsPerPage);

  // Pagination calculations for Payrolls List (Employee)
  const totalPagesPayrolls = Math.max(1, Math.ceil(myPayrollsList.length / itemsPerPage));
  const currentPagePayrollsSanitized = Math.min(currentPagePayrolls, totalPagesPayrolls);
  const startIndexPayrolls = (currentPagePayrollsSanitized - 1) * itemsPerPage;
  const paginatedPayrollsList = myPayrollsList.slice(startIndexPayrolls, startIndexPayrolls + itemsPerPage);

  // Pagination calculations for Dept Analytics (Admin/HR)
  const totalPagesDeptAnalytics = Math.max(1, Math.ceil(deptAnalytics.length / itemsPerPage));
  const currentPageDeptAnalyticsSanitized = Math.min(currentPageDeptAnalytics, totalPagesDeptAnalytics);
  const startIndexDeptAnalytics = (currentPageDeptAnalyticsSanitized - 1) * itemsPerPage;
  const paginatedDeptAnalytics = deptAnalytics.slice(startIndexDeptAnalytics, startIndexDeptAnalytics + itemsPerPage);

  return (
    <div className="page-container">
      <SectionHeader
        title={role === "Employee" ? "Báo cáo cá nhân" : "Báo cáo và thống kê"}
        subtitle={role === "Employee" ? "Theo dõi chi tiết số ngày công, phép năm còn lại và thu nhập cá nhân" : "Tổng hợp số liệu nhân sự và báo cáo hoạt động HR toàn công ty"}
        action={
          <button className="btn btn-primary" onClick={handleExportPDF} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
            Xuất file PDF
          </button>
        }
      />

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
          Đang tải số liệu thống kê & xây dựng báo cáo...
        </div>
      ) : role === "Employee" ? (
        /* ==================== EMPLOYEE REPORTS VIEW ==================== */
        <>
          {/* Employee KPI Cards */}
          <div className="card-grid">
            <StatisticCard label="Ngày công tháng này" value={String(personalStats.workingDays)} />
            <StatisticCard label="Giờ tăng ca tháng này" value={String(personalStats.totalOTHours)} />
            <StatisticCard label="Phép năm còn lại" value={String(personalStats.remainingLeaves)} />
            <StatisticCard label="Số buổi đi muộn" value={String(personalStats.lateCount)} />
          </div>

          <div className="dashboard-layout" style={{ marginTop: "24px", gap: "24px" }}>
            
            {/* Left Column: Leave Balance Breakdowns */}
            <div className="card" style={{ marginBottom: 0, flex: 1, minWidth: "300px" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: 700, color: "var(--brand-dark)" }}>
                Tình hình sử dụng phép năm
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* Visual Progress Bar */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>
                    <span style={{ color: "var(--text-primary)" }}>Hạn mức phép năm đã sử dụng</span>
                    <span style={{ color: "var(--brand-dark)" }}>{personalStats.usedLeaves} / 12 ngày</span>
                  </div>
                  <div style={{ width: "100%", height: "12px", backgroundColor: "#f3f4f6", borderRadius: "6px", overflow: "hidden" }}>
                    <div style={{
                      width: `${(personalStats.usedLeaves / 12) * 100}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
                      borderRadius: "6px"
                    }} />
                  </div>
                </div>

                {/* Leaves Breakdown Details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1.5px solid var(--border)", fontSize: "13.5px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Tổng số ngày phép tiêu chuẩn:</span>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>12 ngày / năm</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1.5px solid var(--border)", fontSize: "13.5px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Số ngày phép đã nghỉ (Approved):</span>
                    <span style={{ fontWeight: 600, color: "#10b981" }}>{personalStats.usedLeaves} ngày</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "10px", borderBottom: "1.5px solid var(--border)", fontSize: "13.5px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Đơn xin nghỉ đang chờ phê duyệt:</span>
                    <span style={{ fontWeight: 600, color: "#f59e0b" }}>{personalStats.pendingLeaves} đơn</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px" }}>
                    <span style={{ color: "var(--text-secondary)" }}>Số ngày phép khả dụng còn lại:</span>
                    <span style={{ fontWeight: 700, color: "var(--brand-dark)", fontSize: "15px" }}>{personalStats.remainingLeaves} ngày</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Recent Attendances Log */}
            <div className="card" style={{ marginBottom: 0, flex: 1.2, minWidth: "320px", padding: 0, overflow: "hidden" }}>
              <h3 style={{ padding: "16px 20px 0 20px", margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: 700, color: "var(--brand-dark)" }}>
                Nhật ký chấm công gần đây
              </h3>
              
              <div style={{ overflowX: "auto" }}>
                <table className="data-table" style={{ fontSize: "13px" }}>
                  <thead>
                    <tr>
                      <th>Ngày làm việc</th>
                      <th>Giờ vào</th>
                      <th>Giờ ra</th>
                      <th>Đi muộn</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAttendances.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: "center", padding: "16px", color: "var(--text-secondary)" }}>
                          Chưa có nhật ký chấm công trong kỳ này.
                        </td>
                      </tr>
                    ) : (
                      paginatedAttendances.map((att, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 550 }}>{att.workDate}</td>
                          <td>{att.checkInTime || "—"}</td>
                          <td>{att.checkOutTime || "—"}</td>
                          <td style={{ color: att.lateMinutes > 0 ? "#ef4444" : "inherit", fontWeight: att.lateMinutes > 0 ? 600 : "normal" }}>
                            {att.lateMinutes > 0 ? `${att.lateMinutes} phút` : "Không"}
                          </td>
                          <td>
                            <span className={getAttendanceStatusBadgeClass(att.status)}>
                              {translateAttendanceStatus(att.status)}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={currentPageAttendancesSanitized}
                totalPages={totalPagesAttendances}
                onPageChange={setCurrentPageAttendances}
                totalItems={recentAttendances.length}
                showingCount={paginatedAttendances.length}
                itemName="bản ghi chấm công"
              />
            </div>

          </div>

          {/* Employee Bottom Section: Personal Payroll History */}
          <div className="card" style={{ marginTop: "24px", padding: 0, overflow: "hidden" }}>
            <h3 style={{ padding: "20px 20px 0 20px", margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: 700, color: "var(--brand-dark)" }}>
              Lịch sử phiếu lương & thu nhập cá nhân
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã phiếu lương</th>
                    <th>Kỳ lương</th>
                    <th>Lương cơ bản</th>
                    <th>Lương thực nhận (Net)</th>
                    <th style={{ textAlign: "center" }}>Trạng thái thanh toán</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPayrollsList.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "20px", color: "var(--text-secondary)" }}>
                        Không tìm thấy phiếu lương nào được ghi nhận cho bạn.
                      </td>
                    </tr>
                  ) : (
                    paginatedPayrollsList.map((pay) => (
                      <tr key={pay.payrollId}>
                        <td style={{ fontWeight: 600, color: "var(--brand-dark)" }}>PAY-{pay.payrollId}</td>
                        <td style={{ fontWeight: 550 }}>{pay.salaryPeriod}</td>
                        <td>{pay.basicSalary ? pay.basicSalary.toLocaleString('vi-VN') + " đ" : "—"}</td>
                        <td style={{ fontWeight: 700, color: "var(--brand-dark)" }}>
                          {pay.netSalary ? pay.netSalary.toLocaleString('vi-VN') + " đ" : "—"}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span className={`status-badge ${pay.status === "PAID" || pay.status === "Đã thanh toán" ? "status-active" : "status-inactive"}`}>
                            {pay.status === "PAID" ? "Đã thanh toán" :
                             pay.status === "UNPAID" ? "Chưa thanh toán" :
                             pay.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPagePayrollsSanitized}
              totalPages={totalPagesPayrolls}
              onPageChange={setCurrentPagePayrolls}
              totalItems={myPayrollsList.length}
              showingCount={paginatedPayrollsList.length}
              itemName="phiếu lương"
            />
          </div>
        </>
      ) : (
        /* ==================== GENERAL HR ADMIN REPORTS VIEW ==================== */
        <>
          {/* General Statistic Cards */}
          <div className="card-grid">
            <StatisticCard label="Tổng nhân sự" value={String(stats.totalEmployees)} />
            <StatisticCard label="Đơn nghỉ chờ duyệt" value={String(stats.pendingLeaves)} />
            <StatisticCard label="Yêu cầu OT chờ duyệt" value={String(stats.pendingOT)} />
            <StatisticCard label="Chiến dịch tuyển dụng" value={String(stats.activeCampaigns)} />
          </div>

          {/* Charts Row */}
          <div className="dashboard-layout" style={{ marginTop: "24px", gap: "24px" }}>
            
            {/* Left Column: Bar Chart */}
            <div className="card" style={{ marginBottom: 0, flex: 1, minWidth: "300px" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: 700, color: "var(--brand-dark)" }}>
                Phân tích trạng thái hoạt động
              </h3>
              
              <svg width="0" height="0">
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#60a5fa" />
                  </linearGradient>
                  <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#fbbf24" />
                  </linearGradient>
                  <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#f87171" />
                  </linearGradient>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#a78bfa" />
                  </linearGradient>
                </defs>
              </svg>

              <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", height: "180px", gap: "24px", padding: "10px 0" }}>
                {barData.map((bar, idx) => {
                  const barH = (bar.value / barChartMax) * 140;
                  return (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                      {/* Bar Container */}
                      <div style={{ width: "100%", height: "140px", display: "flex", alignItems: "flex-end", justifyContent: "center", backgroundColor: "#f3f4f6", borderRadius: "6px", overflow: "hidden" }}>
                        <div style={{
                          width: "80%",
                          height: `${Math.max(4, barH)}px`,
                          background: bar.color,
                          borderRadius: "4px 4px 0 0",
                          transition: "height 0.8s ease-out"
                        }} />
                      </div>
                      <span style={{ fontSize: "13px", fontWeight: 700, marginTop: "8px", color: "var(--text-primary)" }}>{bar.value}</span>
                      <span style={{ fontSize: "11px", color: "var(--text-secondary)", textAlign: "center", marginTop: "2px" }}>{bar.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Donut Chart */}
            <div className="card" style={{ marginBottom: 0, flex: 1, minWidth: "300px" }}>
              <h3 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: 700, color: "var(--brand-dark)" }}>
                Cơ cấu nhân sự theo Phòng ban
              </h3>
              
              <div style={{ display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
                {/* Conic Donut Circle */}
                <div style={{
                  background: conicString ? `conic-gradient(${conicString})` : "#e2e8f0",
                  borderRadius: "50%",
                  width: "140px",
                  height: "140px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)"
                }}>
                  <div style={{
                    width: "90px",
                    height: "90px",
                    borderRadius: "50%",
                    backgroundColor: "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <span style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)" }}>{stats.totalEmployees}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Nhân sự</span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px", minWidth: "160px" }}>
                  {deptData.slice(0, 5).map((d, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "12.5px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: d.color }} />
                        <span style={{ color: "var(--text-primary)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "120px" }} title={d.name}>{d.name}</span>
                      </div>
                      <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>{d.count} ({d.percentage}%)</span>
                    </div>
                  ))}
                  {deptData.length > 5 && (
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontStyle: "italic", textAlign: "right" }}>
                      và {deptData.length - 5} phòng ban khác...
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Section: Department Activity Table with Progress Bars */}
          <div className="card" style={{ marginTop: "24px", padding: 0, overflow: "hidden" }}>
            <h3 style={{ padding: "20px 20px 0 20px", margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: 700, color: "var(--brand-dark)" }}>
              Phân tích hiệu suất & Hoạt động theo Phòng ban
            </h3>
            
            <div style={{ overflowX: "auto" }}>
              <table className="data-table" style={{ minWidth: "600px" }}>
                <thead>
                  <tr>
                    <th>Tên Phòng ban</th>
                    <th style={{ width: "240px" }}>Tỷ lệ nhân sự toàn công ty</th>
                    <th style={{ textAlign: "center" }}>Số nhân viên</th>
                    <th style={{ textAlign: "center" }}>Đơn nghỉ phép</th>
                    <th style={{ textAlign: "center" }}>Yêu cầu tăng ca</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDeptAnalytics.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "20px", color: "var(--text-secondary)" }}>
                        Chưa có dữ liệu thống kê hoạt động phòng ban.
                      </td>
                    </tr>
                  ) : (
                    paginatedDeptAnalytics.map((dept, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{dept.name}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{ flex: 1, height: "8px", backgroundColor: "#e5e7eb", borderRadius: "4px", overflow: "hidden" }}>
                              <div style={{ width: `${dept.percentage}%`, height: "100%", backgroundColor: dept.color, borderRadius: "4px" }} />
                            </div>
                            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", width: "35px" }}>{dept.percentage}%</span>
                          </div>
                        </td>
                        <td style={{ textAlign: "center", fontWeight: 550 }}>{dept.employeeCount} nhân viên</td>
                        <td style={{ textAlign: "center" }}>
                          <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "12px", backgroundColor: "#fee2e2", color: "#b91c1c", fontWeight: 600 }}>
                            {dept.leaveCount} đơn
                          </span>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "12px", backgroundColor: "#d1fae5", color: "#065f46", fontWeight: 600 }}>
                            {dept.otCount} yêu cầu
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPageDeptAnalyticsSanitized}
              totalPages={totalPagesDeptAnalytics}
              onPageChange={setCurrentPageDeptAnalytics}
              totalItems={deptAnalytics.length}
              showingCount={paginatedDeptAnalytics.length}
              itemName="phòng ban"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
