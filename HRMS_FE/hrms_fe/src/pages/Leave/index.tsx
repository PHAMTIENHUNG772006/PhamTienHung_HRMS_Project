import React, { useState, useEffect } from "react";
import SectionHeader from "../../components/common/SectionHeader";
import { getLeaveRequests, updateLeaveRequestStatus, createLeaveRequest, updateLeaveRequest, deleteLeaveRequest } from "../../api/endpoints/leave.api";
import type { LeaveRequestItem } from "../../api/endpoints/leave.api";
import { getEmployees, type Employee } from "../../api/endpoints/employees.api";
import { useAuth } from "../../contexts/AuthContext";
import Swal from "sweetalert2";
import "./Leave.css";
import Pagination from "../../components/common/Pagination";

const Leave: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<LeaveRequestItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    employeeId: "" as number | "",
    leaveType: "Nghỉ phép năm",
    startDate: "",
    endDate: "",
    totalDays: "" as number | "",
    status: "PENDING",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await getLeaveRequests();
      if (res.success) {
        setRequests(res.data || []);
      } else {
        Swal.fire("Lỗi", res.message || "Không thể tải danh sách đơn xin nghỉ phép", "error");
      }

      const empRes = await getEmployees();
      if (empRes.success && Array.isArray(empRes.data)) {
        setEmployees(empRes.data);
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire("Lỗi", "Lỗi kết nối máy chủ khi tải danh sách đơn xin nghỉ", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleOpenCreate = () => {
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

    setFormData({
      employeeId: myEmployeeId,
      leaveType: "Nghỉ phép năm",
      startDate: "",
      endDate: "",
      totalDays: "",
      status: "PENDING",
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return "";
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate.getTime() - startDate.getTime();
    if (diffTime < 0) return 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
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

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    const updatedForm = { ...formData, [field]: value };
    const computed = calculateDays(updatedForm.startDate, updatedForm.endDate);
    if (computed !== "") {
      updatedForm.totalDays = computed;
    }
    setFormData(updatedForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const errors: Record<string, string> = {};
    if (!formData.employeeId) errors.employeeId = "Vui lòng chọn nhân viên";
    if (!formData.leaveType) errors.leaveType = "Vui lòng chọn loại nghỉ phép";
    if (!formData.startDate) errors.startDate = "Vui lòng chọn ngày bắt đầu";
    if (!formData.endDate) errors.endDate = "Vui lòng chọn ngày kết thúc";

    const todayStr = new Date().toISOString().split("T")[0];
    if (formData.startDate && formData.startDate < todayStr) {
      errors.startDate = "Ngày bắt đầu không được là ngày quá khứ";
    }
    if (formData.endDate && formData.endDate < todayStr) {
      errors.endDate = "Ngày kết thúc không được là ngày quá khứ";
    }
    if (formData.startDate && formData.endDate && formData.endDate < formData.startDate) {
      errors.endDate = "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu";
    }

    if (formData.totalDays === "" || Number(formData.totalDays) <= 0) {
      errors.totalDays = "Vui lòng nhập số ngày hợp lệ";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      employeeId: Number(formData.employeeId),
      leaveType: formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      totalDays: Number(formData.totalDays),
      status: formData.status
    };

    try {
      const res = editingId
        ? await updateLeaveRequest(editingId, payload)
        : await createLeaveRequest(payload);

      if (res.success) {
        Swal.fire({
          title: "Thành công!",
          text: editingId ? "Cập nhật đơn xin nghỉ phép thành công!" : "Tạo đơn xin nghỉ phép thành công!",
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

  const handleOpenEdit = (request: LeaveRequestItem) => {
    setFormErrors({});
    setEditingId(request.leaveRequestId || null);
    setFormData({
      employeeId: request.employeeId || "",
      leaveType: request.leaveType,
      startDate: request.startDate,
      endDate: request.endDate,
      totalDays: request.totalDays,
      status: request.status || "PENDING",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    const confirmResult = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Bạn có chắc chắn muốn xóa đơn xin nghỉ phép này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#9ca3af",
    });

    if (confirmResult.isConfirmed) {
      try {
        const res = await deleteLeaveRequest(id);
        if (res.success) {
          Swal.fire("Thành công", "Đã xóa đơn xin nghỉ phép thành công!", "success");
          loadRequests();
        } else {
          Swal.fire("Thất bại", res.message || "Xóa đơn xin nghỉ phép thất bại", "error");
        }
      } catch (err: any) {
        Swal.fire("Lỗi", err.response?.data?.message || err.message || "Đã xảy ra lỗi", "error");
      }
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    const actionText = status === "Đã duyệt" ? "Phê duyệt" : "Từ chối";
    const confirmResult = await Swal.fire({
      title: `Xác nhận ${actionText}?`,
      text: `Bạn có chắc chắn muốn ${actionText.toLowerCase()} đơn xin nghỉ phép này không?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
      confirmButtonColor: status === "Đã duyệt" ? "#10b981" : "#ef4444",
    });

    if (confirmResult.isConfirmed) {
      try {
        const res = await updateLeaveRequestStatus(id, status);
        if (res.success) {
          Swal.fire("Thành công", `Đã ${actionText.toLowerCase()} đơn xin nghỉ phép!`, "success");
          loadRequests();
        } else {
          Swal.fire("Thất bại", res.message || "Cập nhật trạng thái thất bại", "error");
        }
      } catch (err: any) {
        Swal.fire("Lỗi", err.response?.data?.message || err.message || "Đã xảy ra lỗi", "error");
      }
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

  useEffect(() => {
    console.log("DEBUG INFO:", {
      userInContext: user,
      userIdNumber: user?.id ? Number(user.id) : null,
      employeesInDb: employees.map(emp => ({
        employeeId: emp.employeeId,
        fullName: emp.fullName,
        userId: emp.userId
      }))
    });
  }, [user, employees]);

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
        title="Quản lý nghỉ phép"
        subtitle="Xem và xử lý yêu cầu nghỉ của nhân viên"
        action={
          user?.role === "Employee" && (
            <button className="primary-btn" onClick={handleOpenCreate}>
              + Tạo đơn nghỉ phép
            </button>
          )
        }
      />

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>Đang tải dữ liệu...</div>
        ) : displayedRequests.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>Không có đơn xin nghỉ phép nào.</div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Nhân viên</th>
                  <th>Loại nghỉ</th>
                  <th>Từ ngày</th>
                  <th>Đến ngày</th>
                  <th>Tổng số ngày</th>
                  <th>Trạng thái</th>
                  <th style={{ width: "160px", textAlign: "center" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map((request) => (
                  <tr key={request.leaveRequestId}>
                    <td style={{ fontWeight: 600, color: "var(--brand-dark)" }}>LR-{request.leaveRequestId}</td>
                    <td style={{ fontWeight: 550 }}>{request.employeeName || `Nhân viên #${request.employeeId}`}</td>
                    <td>{request.leaveType}</td>
                    <td>{request.startDate}</td>
                    <td>{request.endDate}</td>
                    <td style={{ fontWeight: 500 }}>{request.totalDays} ngày</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(request.status)}`}>
                        {request.status === "PENDING" ? "Chờ duyệt" :
                         request.status === "APPROVED" ? "Đã duyệt" :
                         request.status === "REJECTED" ? "Từ chối" :
                         request.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btn-group" style={{ justifyContent: "center" }}>
                        {user?.role === "Employee" ? (
                          <>
                            <button
                              className="table-action-btn"
                              title="Sửa đơn nghỉ phép"
                              onClick={() => handleOpenEdit(request)}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </button>
                            <button
                              className="table-action-btn"
                              title="Xóa đơn nghỉ phép"
                              onClick={() => handleDelete(request.leaveRequestId!)}
                              style={{ color: "#ef4444" }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          </>
                        ) : (
                          (request.status === "Chờ duyệt" || request.status === "PENDING") ? (
                            <>
                              <button
                                className="table-action-btn"
                                title="Phê duyệt đơn nghỉ phép"
                                onClick={() => handleStatusUpdate(request.leaveRequestId!, "Đã duyệt")}
                                style={{ color: "#10b981" }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </button>
                              <button
                                className="table-action-btn"
                                title="Từ chối đơn nghỉ phép"
                                onClick={() => handleStatusUpdate(request.leaveRequestId!, "Từ chối")}
                                style={{ color: "#ef4444" }}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="6" x2="6" y2="18"></line>
                                  <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                              </button>
                            </>
                          ) : (
                            <span style={{ color: "#9ca3af", fontSize: "12px", fontStyle: "italic" }}>Đã xử lý</span>
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
              itemName="đơn nghỉ phép"
            />
          </>
        )}
      </div>

      {/* Modal Dialog for Creation */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>{editingId ? "Chỉnh sửa đơn xin nghỉ phép" : "Tạo đơn xin nghỉ phép mới"}</h3>
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

                {/* Tên nhân viên đăng nhập */}
                <div className="form-group">
                  <label htmlFor="employeeId">Nhân viên</label>
                  <input
                    type="text"
                    id="employeeId"
                    value={user?.fullName || ""}
                    disabled
                    style={{ background: "#f3f4f6", color: "#4b5563", cursor: "not-allowed" }}
                  />
                </div>

                {/* Loại nghỉ phép */}
                <div className="form-group">
                  <label htmlFor="leaveType">Loại nghỉ phép <span style={{ color: "#ef4444" }}>*</span></label>
                  <select
                    id="leaveType"
                    value={formData.leaveType}
                    onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                    className={formErrors.leaveType ? "input-error-border" : ""}
                  >
                    <option value="Nghỉ phép năm">Nghỉ phép năm</option>
                    <option value="Nghỉ ốm">Nghỉ ốm</option>
                    <option value="Nghỉ thai sản">Nghỉ thai sản</option>
                    <option value="Nghỉ không lương">Nghỉ không lương</option>
                    <option value="Khác">Khác</option>
                  </select>
                  {formErrors.leaveType && (
                    <span className="error-message-text">{formErrors.leaveType}</span>
                  )}
                </div>

                {/* Ngày bắt đầu và ngày kết thúc */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="startDate">Từ ngày <span style={{ color: "#ef4444" }}>*</span></label>
                    <input
                      type="date"
                      id="startDate"
                      value={formData.startDate}
                      onChange={(e) => handleDateChange("startDate", e.target.value)}
                      className={formErrors.startDate ? "input-error-border" : ""}
                    />
                    {formErrors.startDate && (
                      <span className="error-message-text">{formErrors.startDate}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="endDate">Đến ngày <span style={{ color: "#ef4444" }}>*</span></label>
                    <input
                      type="date"
                      id="endDate"
                      value={formData.endDate}
                      onChange={(e) => handleDateChange("endDate", e.target.value)}
                      className={formErrors.endDate ? "input-error-border" : ""}
                    />
                    {formErrors.endDate && (
                      <span className="error-message-text">{formErrors.endDate}</span>
                    )}
                  </div>
                </div>

                {/* Tổng số ngày nghỉ */}
                <div className="form-group">
                  <label htmlFor="totalDays">Tổng số ngày nghỉ <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="number"
                    step="0.5"
                    id="totalDays"
                    value={formData.totalDays}
                    onChange={(e) => setFormData({ ...formData, totalDays: e.target.value !== "" ? Number(e.target.value) : "" })}
                    className={formErrors.totalDays ? "input-error-border" : ""}
                    placeholder="Ví dụ: 1, 1.5, 2..."
                  />
                  {formErrors.totalDays && (
                    <span className="error-message-text">{formErrors.totalDays}</span>
                  )}
                </div>


              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={handleCloseModal}>
                  Hủy bỏ
                </button>
                <button type="submit" className="primary-btn">
                  {editingId ? "Lưu thay đổi" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leave;
