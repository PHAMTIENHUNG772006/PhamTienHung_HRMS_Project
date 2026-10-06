import React, { useState, useEffect } from "react";
import SectionHeader from "../../components/common/SectionHeader";
import { getShifts, createShift, updateShift, deleteShift } from "../../api/endpoints/shifts.api";
import type { ShiftItem } from "../../api/endpoints/shifts.api";
import { getShiftAssignments, createShiftAssignment, deleteShiftAssignment } from "../../api/endpoints/shifts-assignment.api";
import type { ShiftAssignmentItem } from "../../api/endpoints/shifts-assignment.api";
import { getEmployees } from "../../api/endpoints/employees.api";
import type { Employee } from "../../api/endpoints/employees.api";
import Swal from "sweetalert2";

import Pagination from "../../components/common/Pagination";

const ShiftManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"shifts" | "assignments">("shifts");

  // Pagination
  const itemsPerPage = 5;
  const [currentPageShifts, setCurrentPageShifts] = useState(1);
  const [currentPageAssignments, setCurrentPageAssignments] = useState(1);

  // ===== TAB 1: Shifts CRUD =====
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(true);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedShiftCode, setSelectedShiftCode] = useState<string>("");

  const [shiftCode, setShiftCode] = useState("");
  const [shiftName, setShiftName] = useState("");
  const [shiftDate, setShiftDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [breakDuration, setBreakDuration] = useState<number>(60);

  // ===== TAB 2: Shift Assignments =====
  const [assignments, setAssignments] = useState<ShiftAssignmentItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignEmployeeId, setAssignEmployeeId] = useState<number | "">("");
  const [assignShiftCode, setAssignShiftCode] = useState("");
  const [assignDate, setAssignDate] = useState("");

  const loadShifts = async () => {
    setLoadingShifts(true);
    try {
      const res = await getShifts();
      if (res.success) {
        setShifts(res.data || []);
      } else {
        Swal.fire("Lỗi", res.message || "Không thể tải danh sách ca làm việc", "error");
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire("Lỗi", "Lỗi kết nối khi tải danh sách ca làm việc", "error");
    } finally {
      setLoadingShifts(false);
    }
  };

  const loadAssignments = async () => {
    setLoadingAssignments(true);
    try {
      const res = await getShiftAssignments("1970-01-01", "2099-12-31");
      if (res.success) {
        setAssignments(res.data || []);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const res = await getEmployees();
      if (res.success) {
        setEmployees(res.data || []);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadShifts();
    loadAssignments();
    loadEmployees();
  }, []);

  // ========== SHIFT CRUD HANDLERS ==========
  const openCreateShiftModal = () => {
    setIsEdit(false);
    setSelectedShiftCode("");
    setShiftCode("");
    setShiftName("");
    setStartTime("");
    setEndTime("");
    setBreakDuration(60);
    setShiftDate(new Date().toISOString().split("T")[0]);
    setShowShiftModal(true);
  };

  const openEditShiftModal = (shift: ShiftItem) => {
    setIsEdit(true);
    setSelectedShiftCode(shift.shiftCode);
    setShiftCode(shift.shiftCode);
    setShiftName(shift.shiftName);
    setStartTime(shift.startTime ? shift.startTime.slice(0, 5) : "");
    setEndTime(shift.endTime ? shift.endTime.slice(0, 5) : "");
    setBreakDuration(shift.breakDuration || 0);
    setShiftDate(shift.shiftDate ? shift.shiftDate.split("T")[0] : "");
    setShowShiftModal(true);
  };

  const formatTime = (t: string) => (t.length === 5 ? `${t}:00` : t);

  const handleShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: ShiftItem = {
      shiftCode: shiftCode.trim(),
      shiftName: shiftName.trim(),
      startTime: startTime ? formatTime(startTime) : (null as any),
      endTime: endTime ? formatTime(endTime) : (null as any),
      breakDuration,
      shiftDate,
    };

    try {
      let res;
      if (isEdit && selectedShiftCode !== "") {
        res = await updateShift(selectedShiftCode, payload);
      } else {
        res = await createShift(payload);
      }

      if (res.success) {
        Swal.fire("Thành công", isEdit ? "Cập nhật ca làm việc thành công!" : "Tạo ca làm việc thành công!", "success");
        setShowShiftModal(false);
        loadShifts();
      } else {
        Swal.fire("Thất bại", res.message || "Xử lý thông tin thất bại", "error");
      }
    } catch (err: any) {
      let errorMsg = "Đã xảy ra lỗi khi lưu ca làm việc.";
      if (err.response?.data) {
        const responseData = err.response.data;
        if (responseData.data && typeof responseData.data === "object") {
          const fieldErrors = Object.values(responseData.data) as string[];
          if (fieldErrors.length > 0) {
            errorMsg = fieldErrors.join("\n");
          } else {
            errorMsg = responseData.message || errorMsg;
          }
        } else {
          errorMsg = responseData.message || errorMsg;
        }
      } else {
        errorMsg = err.message || errorMsg;
      }
      Swal.fire("Lỗi kiểm thực (Validation)", errorMsg, "error");
    }
  };

  const handleDeleteShift = async (shift: ShiftItem) => {
    if (!shift.shiftCode) return;
    const confirmResult = await Swal.fire({
      title: "Xác nhận xóa?",
      text: `Bạn có chắc muốn xóa ca làm việc [${shift.shiftCode}] không?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#ef4444",
    });

    if (confirmResult.isConfirmed) {
      try {
        const res = await deleteShift(shift.shiftCode);
        if (res.success) {
          Swal.fire("Thành công", "Đã xóa ca làm việc thành công!", "success");
          loadShifts();
        } else {
          Swal.fire("Thất bại", res.message || "Xóa ca thất bại", "error");
        }
      } catch (err: any) {
        Swal.fire("Lỗi", err.response?.data?.message || err.message || "Đã xảy ra lỗi", "error");
      }
    }
  };

  // ========== ASSIGNMENT HANDLERS ==========
  const openAssignModal = () => {
    setAssignEmployeeId("");
    setAssignShiftCode("");
    setAssignDate(new Date().toISOString().split("T")[0]);
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assignEmployeeId || !assignShiftCode || !assignDate) {
      Swal.fire("Lỗi", "Vui lòng điền đầy đủ thông tin phân ca!", "warning");
      return;
    }

    try {
      const res = await createShiftAssignment({
        employeeIds: [Number(assignEmployeeId)],
        shiftCode: assignShiftCode,
        fromDate: assignDate,
        toDate: assignDate,
      });

      if (res.success) {
        Swal.fire("Thành công", "Phân ca thành công!", "success");
        setShowAssignModal(false);
        loadAssignments();
      } else {
        Swal.fire("Thất bại", res.message || "Phân ca thất bại", "error");
      }
    } catch (err: any) {
      let errorMsg = "Đã xảy ra lỗi khi phân ca.";
      if (err.response?.data) {
        const responseData = err.response.data;
        if (responseData.data && typeof responseData.data === "object") {
          const fieldErrors = Object.values(responseData.data) as string[];
          if (fieldErrors.length > 0) {
            errorMsg = fieldErrors.join("\n");
          } else {
            errorMsg = responseData.message || errorMsg;
          }
        } else {
          errorMsg = responseData.message || errorMsg;
        }
      } else {
        errorMsg = err.message || errorMsg;
      }
      Swal.fire("Lỗi kiểm thực (Validation)", errorMsg, "error");
    }
  };

  const handleDeleteAssignment = async (id: number) => {
    const confirmResult = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Bạn có chắc muốn xóa phân ca này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#ef4444",
    });

    if (confirmResult.isConfirmed) {
      try {
        const res = await deleteShiftAssignment(id);
        if (res.success) {
          Swal.fire("Thành công", "Đã xóa phân ca thành công!", "success");
          loadAssignments();
        } else {
          Swal.fire("Thất bại", res.message || "Xóa phân ca thất bại", "error");
        }
      } catch (err: any) {
        Swal.fire("Lỗi", err.response?.data?.message || err.message || "Đã xảy ra lỗi", "error");
      }
    }
  };

  const formatDisplayTime = (t: string) => {
    if (!t) return "--:--";
    return t.slice(0, 5);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Pagination for Shifts
  const totalPagesShifts = Math.max(1, Math.ceil(shifts.length / itemsPerPage));
  const currentPageShiftsSanitized = Math.min(currentPageShifts, totalPagesShifts);
  const startIndexShifts = (currentPageShiftsSanitized - 1) * itemsPerPage;
  const paginatedShifts = shifts.slice(startIndexShifts, startIndexShifts + itemsPerPage);

  // Pagination for Assignments
  const totalPagesAssignments = Math.max(1, Math.ceil(assignments.length / itemsPerPage));
  const currentPageAssignmentsSanitized = Math.min(currentPageAssignments, totalPagesAssignments);
  const startIndexAssignments = (currentPageAssignmentsSanitized - 1) * itemsPerPage;
  const paginatedAssignments = assignments.slice(startIndexAssignments, startIndexAssignments + itemsPerPage);

  return (
    <div className="page-container">
      <SectionHeader
        title="Quản lý ca làm việc"
        subtitle="Thiết lập các ca làm việc của công ty theo lịch ngày và giờ, phân ca làm việc cho nhân viên."
      />

      {/* Tab Navigation */}
      <div className="shift-tabs">
        <button
          className={`shift-tab ${activeTab === "shifts" ? "active" : ""}`}
          onClick={() => setActiveTab("shifts")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          Danh sách ca
        </button>
        <button
          className={`shift-tab ${activeTab === "assignments" ? "active" : ""}`}
          onClick={() => setActiveTab("assignments")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Phân ca nhân viên
        </button>
      </div>

      {/* ===== TAB 1: Danh sách ca ===== */}
      {activeTab === "shifts" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Danh sách ca làm việc</h3>
            <button className="primary-btn" onClick={openCreateShiftModal}>
              + Thêm ca làm việc
            </button>
          </div>

          {loadingShifts ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)" }}>Đang tải danh sách ca làm việc...</div>
          ) : shifts.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)" }}>
              Chưa có ca làm việc nào. Hãy tạo ca mới để bắt đầu.
            </div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã ca</th>
                    <th>Tên ca làm việc</th>
                    <th>Ngày áp dụng</th>
                    <th>Giờ làm việc</th>
                    <th>Nghỉ (phút)</th>
                    <th style={{ width: "120px", textAlign: "center" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedShifts.map((shift) => (
                    <tr key={shift.shiftCode}>
                      <td>
                        <span className="shift-code-badge">{shift.shiftCode}</span>
                      </td>
                      <td style={{ fontWeight: 550 }}>{shift.shiftName}</td>
                      <td>
                        {shift.shiftDate ? (
                          <span className="date-badge">{formatDate(shift.shiftDate)}</span>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#94a3b8" }}>Chưa xác định</span>
                        )}
                      </td>
                      <td>
                        <span className="time-range">
                          {formatDisplayTime(shift.startTime)} – {formatDisplayTime(shift.endTime)}
                        </span>
                      </td>
                      <td>{shift.breakDuration} phút</td>
                      <td>
                        <div className="action-btn-group" style={{ justifyContent: "center" }}>
                          <button
                            className="table-action-btn"
                            title="Sửa thông tin"
                            onClick={() => openEditShiftModal(shift)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            className="table-action-btn"
                            title="Xóa ca làm việc"
                            onClick={() => handleDeleteShift(shift)}
                            style={{ color: "#ef4444" }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPageShiftsSanitized}
                totalPages={totalPagesShifts}
                onPageChange={setCurrentPageShifts}
                totalItems={shifts.length}
                showingCount={paginatedShifts.length}
                itemName="ca làm việc"
              />
            </>
          )}
        </div>
      )}

      {/* ===== TAB 2: Phân ca nhân viên ===== */}
      {activeTab === "assignments" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Lịch phân ca cho nhân viên</h3>
            <button className="primary-btn" onClick={openAssignModal}>
              + Phân ca mới
            </button>
          </div>

          {loadingAssignments ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)" }}>Đang tải danh sách phân ca...</div>
          ) : assignments.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)" }}>
              Chưa có phân ca nào. Hãy phân ca cho nhân viên.
            </div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nhân viên</th>
                    <th>Ca làm việc</th>
                    <th>Giờ làm</th>
                    <th>Ngày áp dụng</th>
                    <th style={{ width: "120px", textAlign: "center" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAssignments.map((a) => (
                    <tr key={a.assignmentId}>
                      <td>
                        <div className="employee-cell">
                          <span className="employee-avatar">
                            {(a.employeeName || "?").charAt(0).toUpperCase()}
                          </span>
                          <span style={{ fontWeight: 550 }}>{a.employeeName}</span>
                        </div>
                      </td>
                      <td>
                        <span className="shift-code-badge">{a.shiftCode}</span>
                        <span style={{ marginLeft: 8 }}>{a.shiftName}</span>
                      </td>
                      <td>
                        <span className="time-range">
                          {formatDisplayTime(a.startTime)} – {formatDisplayTime(a.endTime)}
                        </span>
                      </td>
                      <td>
                        <span className="date-badge">{formatDate(a.assignDate)}</span>
                      </td>
                      <td>
                        <div className="action-btn-group" style={{ justifyContent: "center" }}>
                          <button
                            className="table-action-btn"
                            title="Xóa phân ca"
                            onClick={() => handleDeleteAssignment(a.assignmentId)}
                            style={{ color: "#ef4444" }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPageAssignmentsSanitized}
                totalPages={totalPagesAssignments}
                onPageChange={setCurrentPageAssignments}
                totalItems={assignments.length}
                showingCount={paginatedAssignments.length}
                itemName="bản ghi phân ca"
              />
            </>
          )}
        </div>
      )}

      {/* ===== MODAL: Thêm/Sửa ca ===== */}
      {showShiftModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>{isEdit ? "Chỉnh sửa ca làm việc" : "Tạo ca làm việc mới"}</h3>
              <button className="modal-close-btn" onClick={() => setShowShiftModal(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleShiftSubmit} noValidate>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="shiftCode">Mã ca làm việc</label>
                    <input
                      type="text"
                      id="shiftCode"
                      value={shiftCode}
                      onChange={(e) => setShiftCode(e.target.value)}
                      placeholder="Ví dụ: HC, SANG, CHIEU..."
                      disabled={isEdit}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="shiftName">Tên ca làm việc</label>
                    <input
                      type="text"
                      id="shiftName"
                      value={shiftName}
                      onChange={(e) => setShiftName(e.target.value)}
                      placeholder="Ví dụ: Ca hành chính, Ca tối..."
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="shiftDate">Ngày áp dụng</label>
                  <input
                    type="date"
                    id="shiftDate"
                    value={shiftDate}
                    onChange={(e) => setShiftDate(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="startTime">Giờ bắt đầu</label>
                    <input
                      type="time"
                      id="startTime"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="endTime">Giờ kết thúc</label>
                    <input
                      type="time"
                      id="endTime"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="breakDuration">Thời gian nghỉ (phút)</label>
                  <input
                    type="number"
                    id="breakDuration"
                    value={breakDuration}
                    onChange={(e) => setBreakDuration(parseInt(e.target.value) || 0)}
                    placeholder="Ví dụ: 60"
                    min="0"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setShowShiftModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="primary-btn">
                  {isEdit ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: Phân ca ===== */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Phân ca cho nhân viên</h3>
              <button className="modal-close-btn" onClick={() => setShowAssignModal(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} noValidate>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="assignEmployeeId">Nhân viên</label>
                  <select
                    id="assignEmployeeId"
                    value={assignEmployeeId}
                    onChange={(e) => setAssignEmployeeId(e.target.value ? Number(e.target.value) : "")}
                  >
                    <option value="">-- Chọn nhân viên --</option>
                    {employees.map((emp) => (
                      <option key={emp.employeeId} value={emp.employeeId}>
                        {emp.fullName || emp.name} (ID: {emp.employeeId})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="assignShiftCode">Ca làm việc</label>
                  <select
                    id="assignShiftCode"
                    value={assignShiftCode}
                    onChange={(e) => setAssignShiftCode(e.target.value)}
                  >
                    <option value="">-- Chọn ca làm việc --</option>
                    {shifts.map((s) => (
                      <option key={s.shiftCode} value={s.shiftCode}>
                        {s.shiftName} - {s.shiftCode} ({formatDisplayTime(s.startTime)} - {formatDisplayTime(s.endTime)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="assignDate">Ngày áp dụng</label>
                  <input
                    type="date"
                    id="assignDate"
                    value={assignDate}
                    onChange={(e) => setAssignDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setShowAssignModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="primary-btn">
                  Phân ca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        /* ====== TABS ====== */
        .shift-tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 20px;
          background: #f1f5f9;
          border-radius: 12px;
          padding: 4px;
          width: fit-content;
        }

        .shift-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: none;
          background: transparent;
          font-size: 14px;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .shift-tab.active {
          background: #ffffff;
          color: #4f46e5;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        /* ====== BADGES ====== */
        .shift-code-badge {
          background: #eff6ff;
          color: #2563eb;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
          text-transform: uppercase;
        }

        .date-badge {
          background: #f0fdf4;
          color: #16a34a;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .time-range {
          font-family: 'Courier New', monospace;
          font-size: 13px;
          font-weight: 600;
          color: #4f46e5;
          background: rgba(99, 102, 241, 0.05);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .employee-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .employee-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
};

export default ShiftManagement;
