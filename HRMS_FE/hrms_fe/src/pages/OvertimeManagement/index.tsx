import React, { useState, useEffect } from "react";
import SectionHeader from "../../components/common/SectionHeader";
import {
  getOvertimeRequests,
  updateOvertimeRequestStatus,
  createOvertimeRequest,
  updateOvertimeRequest,
  deleteOvertimeRequest
} from "../../api/endpoints/overtime.api";
import type { OvertimeRequestItem } from "../../api/endpoints/overtime.api";
import { getEmployees, type Employee } from "../../api/endpoints/employees.api";
import { getMyShiftAssignmentsToday, type ShiftAssignmentItem } from "../../api/endpoints/shifts-assignment.api";
import { useAuth } from "../../contexts/AuthContext";
import Swal from "sweetalert2";
import "./Overtime.css";
import Pagination from "../../components/common/Pagination";

const OvertimeManagement: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<OvertimeRequestItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [todayShifts, setTodayShifts] = useState<ShiftAssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    employeeId: "" as number | "",
    otDate: "",
    startTime: "",
    endTime: "",
    status: "PENDING",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await getOvertimeRequests();
      if (res.success) {
        setRequests(res.data || []);
      } else {
        Swal.fire("Lỗi", res.message || "Không thể tải danh sách đơn tăng ca", "error");
      }

      const empRes = await getEmployees();
      if (empRes.success && Array.isArray(empRes.data)) {
        setEmployees(empRes.data);
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire("Lỗi", "Lỗi kết nối máy chủ khi tải danh sách dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const getLatestShiftEndTime = (shifts: ShiftAssignmentItem[]) => {
    if (!shifts || shifts.length === 0) return null;
    let latest = shifts[0].endTime;
    for (let i = 1; i < shifts.length; i++) {
      if (shifts[i].endTime > latest) {
        latest = shifts[i].endTime;
      }
    }
    return latest.substring(0, 5); // Lấy HH:MM
  };

  const handleOpenCreate = async () => {
    setFormErrors({});

    if (!myEmployeeId) {
      Swal.fire({
        title: "Không thể tạo đơn",
        text: "Tài khoản của bạn chưa được liên kết với hồ sơ nhân viên trong hệ thống.",
        icon: "error",
        confirmButtonColor: "var(--brand)"
      });
      return;
    }

    // Tải ca làm việc ngày hôm nay của nhân viên
    try {
      const shiftRes = await getMyShiftAssignmentsToday();
      if (shiftRes.success && Array.isArray(shiftRes.data)) {
        setTodayShifts(shiftRes.data);
      } else {
        setTodayShifts([]);
      }
    } catch (err) {
      console.error(err);
      setTodayShifts([]);
    }

    const todayStr = new Date().toISOString().split("T")[0];
    setFormData({
      employeeId: myEmployeeId,
      otDate: todayStr,
      startTime: "",
      endTime: "",
      status: "PENDING",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const extractServerErrors = (payload: any): Record<string, string> => {
    const normalizedErrors: Record<string, string> = {};

    if (payload?.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
      Object.entries(payload.data).forEach(([field, message]) => {
        if (typeof message === "string" && message.trim()) {
          normalizedErrors[field] = message;
        }
      });
    }

    if (payload?.error) {
      if (typeof payload.error === "object" && !Array.isArray(payload.error)) {
        Object.assign(normalizedErrors, payload.error);
      } else if (typeof payload.error === "string" && payload.error.trim()) {
        normalizedErrors.global = payload.error;
      }
    }

    if (Object.keys(normalizedErrors).length === 0) {
      const message = payload?.message;
      if (typeof message === "string" && message.trim()) {
        normalizedErrors.global = message;
      }
    }

    return normalizedErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const errors: Record<string, string> = {};
    if (!formData.employeeId) errors.employeeId = "Vui lòng chọn nhân viên";
    if (!formData.otDate) errors.otDate = "Vui lòng chọn ngày tăng ca";
    if (!formData.startTime) errors.startTime = "Vui lòng chọn giờ bắt đầu";
    if (!formData.endTime) errors.endTime = "Vui lòng chọn giờ kết thúc";

    const todayStr = new Date().toISOString().split("T")[0];
    if (formData.otDate && formData.otDate < todayStr) {
      errors.otDate = "Ngày tăng ca không được là ngày quá khứ";
    }
    if (formData.startTime && formData.endTime && formData.endTime <= formData.startTime) {
      errors.endTime = "Giờ kết thúc phải sau giờ bắt đầu";
    }

    // Ràng buộc: Chỉ được đăng ký tăng ca ngày hôm nay sau khi ca làm việc ngày hôm nay kết thúc
    if (user?.role === "Employee") {
      if (formData.otDate === todayStr) {
        if (todayShifts.length === 0) {
          errors.otDate = "Hôm nay bạn không có ca làm việc nào được phân công, không thể đăng ký tăng ca.";
        } else {
          const latestEndTime = getLatestShiftEndTime(todayShifts);
          if (latestEndTime && formData.startTime && formData.startTime < latestEndTime) {
            errors.startTime = `Giờ bắt đầu tăng ca phải từ ${latestEndTime} trở đi (sau khi ca làm kết thúc)`;
          }
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      employeeId: Number(formData.employeeId),
      otDate: formData.otDate,
      startTime: formData.startTime + (formData.startTime.length === 5 ? ":00" : ""),
      endTime: formData.endTime + (formData.endTime.length === 5 ? ":00" : ""),
      status: formData.status
    };

    try {
      const res = editingId
        ? await updateOvertimeRequest(editingId, payload)
        : await createOvertimeRequest(payload);

      if (res.success) {
        Swal.fire({
          title: "Thành công!",
          text: editingId ? "Cập nhật đơn tăng ca thành công!" : "Đăng ký tăng ca thành công!",
          icon: "success",
          confirmButtonColor: "var(--brand)",
          timer: 2000,
          timerProgressBar: true
        });
        handleCloseModal();
        loadRequests();
      } else {
        setFormErrors(extractServerErrors(res));
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        setFormErrors(extractServerErrors(err.response.data));
      } else {
        setFormErrors({ global: err.message || "Lỗi kết nối máy chủ" });
      }
    }
  };

  const handleOpenEdit = async (request: OvertimeRequestItem) => {
    setFormErrors({});
    setEditingId(request.otRequestId || null);

    // Tải ca làm việc ngày hôm nay của nhân viên
    try {
      const shiftRes = await getMyShiftAssignmentsToday();
      if (shiftRes.success && Array.isArray(shiftRes.data)) {
        setTodayShifts(shiftRes.data);
      } else {
        setTodayShifts([]);
      }
    } catch (err) {
      console.error(err);
      setTodayShifts([]);
    }

    setFormData({
      employeeId: request.employeeId || "",
      otDate: request.otDate,
      startTime: request.startTime.substring(0, 5),
      endTime: request.endTime.substring(0, 5),
      status: request.status || "PENDING",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const confirmResult = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Bạn có chắc chắn muốn xóa yêu cầu tăng ca này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
    });

    if (confirmResult.isConfirmed) {
      try {
        const res = await deleteOvertimeRequest(id);
        if (res.success) {
          Swal.fire("Thành công", "Đã xóa yêu cầu tăng ca thành công!", "success");
          loadRequests();
        } else {
          Swal.fire("Thất bại", res.message || "Xóa yêu cầu thất bại", "error");
        }
      } catch (err: any) {
        Swal.fire("Lỗi", err.response?.data?.message || err.message || "Đã xảy ra lỗi", "error");
      }
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    let approvedHours: number | null = null;

    if (status === "Đã duyệt") {
      const { value: hours } = await Swal.fire({
        title: "Xác nhận phê duyệt tăng ca",
        text: "Nhập số giờ làm thêm được duyệt thực tế:",
        input: "number",
        inputLabel: "Số giờ (ví dụ: 1.5, 2, 3...)",
        inputValue: "2",
        showCancelButton: true,
        confirmButtonText: "Phê duyệt",
        cancelButtonText: "Hủy",
        confirmButtonColor: "#10b981",
        inputValidator: (value) => {
          if (!value || parseFloat(value) <= 0) {
            return "Vui lòng nhập số giờ hợp lệ lớn hơn 0!";
          }
          return null;
        },
      });

      if (hours === undefined) return; // User cancelled
      approvedHours = parseFloat(hours);
    } else {
      const confirmResult = await Swal.fire({
        title: "Xác nhận từ chối?",
        text: "Bạn có chắc chắn muốn từ chối yêu cầu làm thêm này không?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Từ chối",
        cancelButtonText: "Hủy",
        confirmButtonColor: "#ef4444",
      });

      if (!confirmResult.isConfirmed) return;
    }

    try {
      const res = await updateOvertimeRequestStatus(id, status, approvedHours);
      if (res.success) {
        Swal.fire("Thành công", status === "Đã duyệt" ? "Đã duyệt yêu cầu tăng ca!" : "Đã từ chối yêu cầu tăng ca!", "success");
        loadRequests();
      } else {
        Swal.fire("Thất bại", res.message || "Cập nhật trạng thái thất bại", "error");
      }
    } catch (err: any) {
      Swal.fire("Lỗi", err.response?.data?.message || err.message || "Đã xảy ra lỗi", "error");
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Đã duyệt":
      case "APPROVED":
        return "status-active";
      case "Từ chối":
      case "REJECTED":
        return "status-locked";
      default:
        return "status-pending";
    }
  };

  const currentEmployee = employees.find(emp => emp.userId === Number(user?.id))
    || employees.find(emp => emp.fullName?.toLowerCase() === user?.fullName?.toLowerCase())
    || employees.find(emp => {
      const empNorm = emp.fullName?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, "");
      const userNorm = user?.fullName?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, "");
      if (!empNorm || !userNorm) return false;
      if (empNorm === userNorm) return true;
      const empWords = emp.fullName?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/\s+/).filter(Boolean) || [];
      const userWords = user?.fullName?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/\s+/).filter(Boolean) || [];
      if (empWords.length > 0 && userWords.length > 0) {
        const allUserInEmp = userWords.every(w => empWords.includes(w));
        const allEmpInUser = empWords.every(w => userWords.includes(w));
        return allUserInEmp || allEmpInUser;
      }
      return false;
    });
  const myEmployeeId = currentEmployee?.employeeId;

  const displayedRequests = user?.role === "Employee"
    ? requests.filter(r => r.employeeId === myEmployeeId)
    : requests;

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(displayedRequests.length / itemsPerPage));
  const currentPageSanitized = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSanitized - 1) * itemsPerPage;
  const paginatedRequests = displayedRequests.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="page-container">
      <SectionHeader
        title={user?.role === "Employee" ? "Đăng ký tăng ca" : "Quản lý tăng ca"}
        subtitle={user?.role === "Employee" ? "Đăng ký và theo dõi lịch sử làm thêm giờ của bạn" : "Xem và phê duyệt yêu cầu làm thêm giờ của nhân viên"}
        action={
          user?.role === "Employee" && (
            <button className="primary-btn" onClick={handleOpenCreate}>
              + Đăng ký tăng ca
            </button>
          )
        }
      />

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>Đang tải dữ liệu...</div>
        ) : displayedRequests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>Không có yêu cầu tăng ca nào.</div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  {user?.role !== "Employee" && <th>Nhân viên</th>}
                  <th>Ngày tăng ca</th>
                  <th>Giờ bắt đầu</th>
                  <th>Giờ kết thúc</th>
                  <th>Số giờ duyệt</th>
                  <th>Trạng thái</th>
                  <th style={{ width: "160px", textAlign: "center" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map((request) => (
                  <tr key={request.otRequestId}>
                    <td style={{ fontWeight: 600, color: "var(--brand-dark)" }}>OT-{request.otRequestId}</td>
                    {user?.role !== "Employee" && (
                      <td style={{ fontWeight: 550 }}>{request.employeeName || `Nhân viên #${request.employeeId}`}</td>
                    )}
                    <td>{request.otDate}</td>
                    <td>{request.startTime}</td>
                    <td>{request.endTime}</td>
                    <td style={{ fontWeight: 500 }}>
                      {request.approvedHours !== null && request.approvedHours !== undefined
                        ? `${request.approvedHours} giờ`
                        : "Chưa duyệt"}
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                        {request.status === "PENDING" || request.status === "Chờ duyệt" ? "Chờ duyệt" :
                         request.status === "APPROVED" || request.status === "Đã duyệt" ? "Đã duyệt" :
                         request.status === "REJECTED" || request.status === "Từ chối" ? "Từ chối" :
                         request.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btn-group" style={{ justifyContent: "center" }}>
                        {user?.role === "Employee" ? (
                          (request.status === "PENDING" || request.status === "Chờ duyệt") ? (
                            <>
                              <button
                                className="table-action-btn"
                                title="Sửa đơn tăng ca"
                                onClick={() => handleOpenEdit(request)}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                              </button>
                              <button
                                className="table-action-btn"
                                title="Xóa đơn tăng ca"
                                onClick={() => handleDelete(request.otRequestId!)}
                                style={{ color: "#ef4444" }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6"></polyline>
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                              </button>
                            </>
                          ) : (
                            <span style={{ color: "#9ca3af", fontSize: "12px", fontStyle: "italic" }}>Đã xử lý</span>
                          )
                        ) : (
                          (request.status === "Chờ duyệt" || request.status === "PENDING") ? (
                            <>
                              <button
                                className="table-action-btn"
                                title="Phê duyệt tăng ca"
                                onClick={() => handleStatusUpdate(request.otRequestId!, "Đã duyệt")}
                                style={{ color: "#10b981" }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </button>
                              <button
                                className="table-action-btn"
                                title="Từ chối tăng ca"
                                onClick={() => handleStatusUpdate(request.otRequestId!, "Từ chối")}
                                style={{ color: "#ef4444" }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </>
                          ) : (
                            <button
                              className="table-action-btn"
                              title="Xóa đơn tăng ca"
                              onClick={() => handleDelete(request.otRequestId!)}
                              style={{ color: "#ef4444" }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPageSanitized}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={displayedRequests.length}
              showingCount={paginatedRequests.length}
              itemName="yêu cầu tăng ca"
            />
          </>
        )}
      </div>

      {/* Modal Dialog for Creation & Editing */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>{editingId ? "Chỉnh sửa đơn đăng ký tăng ca" : "Đăng ký tăng ca mới"}</h3>
              <button className="modal-close-btn" onClick={handleCloseModal}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="modal-body">
                {formErrors.global && (
                  <div className="alert-danger-global">
                    {formErrors.global}
                  </div>
                )}

                {/* Thông tin ca làm việc hôm nay */}
                {user?.role === "Employee" && (
                  <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", padding: "10px 12px", borderRadius: "8px", fontSize: "13px", color: "#0369a1", marginBottom: "10px" }}>
                    <strong>Ca làm việc hôm nay:</strong>{" "}
                    {todayShifts.length > 0 ? (
                      todayShifts.map(s => `${s.shiftName} (${s.startTime.substring(0,5)} - ${s.endTime.substring(0,5)})`).join(", ")
                    ) : (
                      <span style={{ color: "#ef4444", fontWeight: 600 }}>Không được phân ca làm việc hôm nay</span>
                    )}
                  </div>
                )}

                {/* Tên nhân viên */}
                <div className="form-group">
                  <label htmlFor="employeeName">Nhân viên</label>
                  <input
                    type="text"
                    id="employeeName"
                    value={user?.fullName || ""}
                    disabled
                  />
                </div>

                {/* Ngày tăng ca */}
                <div className="form-group">
                  <label htmlFor="otDate">Ngày tăng ca <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="date"
                    id="otDate"
                    value={formData.otDate}
                    onChange={(e) => setFormData({ ...formData, otDate: e.target.value })}
                    className={formErrors.otDate ? "input-error-border" : ""}
                    disabled={user?.role === "Employee"}
                  />
                  {formErrors.otDate && (
                    <span className="error-message-text">{formErrors.otDate}</span>
                  )}
                </div>

                {/* Giờ bắt đầu và Giờ kết thúc */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="startTime">Giờ bắt đầu <span style={{ color: "#ef4444" }}>*</span></label>
                    <input
                      type="time"
                      id="startTime"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className={formErrors.startTime ? "input-error-border" : ""}
                    />
                    {formErrors.startTime && (
                      <span className="error-message-text">{formErrors.startTime}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="endTime">Giờ kết thúc <span style={{ color: "#ef4444" }}>*</span></label>
                    <input
                      type="time"
                      id="endTime"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className={formErrors.endTime ? "input-error-border" : ""}
                    />
                    {formErrors.endTime && (
                      <span className="error-message-text">{formErrors.endTime}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={handleCloseModal}>
                  Hủy bỏ
                </button>
                <button type="submit" className="primary-btn">
                  {editingId ? "Lưu thay đổi" : "Đăng ký"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OvertimeManagement;
