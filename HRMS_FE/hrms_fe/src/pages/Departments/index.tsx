import React, { useState, useEffect } from "react";
import SectionHeader from "../../components/common/SectionHeader";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  type DepartmentItem
} from "../../api/endpoints/departments.api";
import { getEmployees, type Employee } from "../../api/endpoints/employees.api";
import Swal from 'sweetalert2';
import Pagination from "../../components/common/Pagination";

const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentItem | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    departmentCode: "",
    departmentName: "",
    description: "",
    managerId: "" as number | "" | null,
    active: true,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const extractServerErrors = (payload: any): Record<string, string> => {
    const normalizedErrors: Record<string, string> = {};

    if (
      payload?.data &&
      typeof payload.data === "object" &&
      !Array.isArray(payload.data)
    ) {
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

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const deptRes = await getDepartments();
      if (deptRes.success && Array.isArray(deptRes.data)) {
        setDepartments(deptRes.data);
      } else {
        throw new Error(deptRes.message || "Không thể tải danh sách phòng ban");
      }

      // Load employees for manager selection
      const empRes = await getEmployees();
      if (empRes.success && Array.isArray(empRes.data)) {
        setEmployees(empRes.data);
      }
    } catch (e: any) {
      setError(e.message || "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingDepartment(null);
    setFormErrors({});
    setFormData({
      departmentCode: "",
      departmentName: "",
      description: "",
      managerId: "",
      active: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (dept: DepartmentItem) => {
    setEditingDepartment(dept);
    setFormErrors({});
    setFormData({
      departmentCode: dept.departmentCode || "",
      departmentName: dept.departmentName,
      description: dept.description || "",
      managerId: dept.managerId || "",
      active: dept.active !== undefined ? dept.active : true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const payload = {
      departmentCode: formData.departmentCode,
      departmentName: formData.departmentName,
      description: formData.description || undefined,
      managerId: formData.managerId !== "" ? Number(formData.managerId) : null,
      active: formData.active,
    };

    try {
      if (editingDepartment) {
        // Edit Mode
        const deptId = editingDepartment.departmentId!;
        const res = await updateDepartment(deptId, payload);
        if (res.success) {
          Swal.fire({
            title: 'Thành công!',
            text: 'Cập nhật phòng ban thành công!',
            icon: 'success',
            confirmButtonColor: 'var(--brand)',
            timer: 2000,
            timerProgressBar: true
          });
          setShowModal(false);
          loadData();
        } else {
          setFormErrors(extractServerErrors(res));
        }
      } else {
        // Create Mode
        const res = await createDepartment(payload);
        if (res.success) {
          Swal.fire({
            title: 'Thành công!',
            text: 'Thêm phòng ban thành công!',
            icon: 'success',
            confirmButtonColor: 'var(--brand)',
            timer: 2000,
            timerProgressBar: true
          });
          setShowModal(false);
          loadData();
        } else {
          setFormErrors(extractServerErrors(res));
        }
      }
    } catch (apiErr: any) {
      if (apiErr.response && apiErr.response.data) {
        setFormErrors(extractServerErrors(apiErr.response.data));
      } else {
        alert("Đã xảy ra lỗi kết nối khi lưu thông tin phòng ban.");
      }
    }
  };

  const handleDelete = async (dept: DepartmentItem) => {
    const deptId = dept.departmentId!;
    Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc chắn muốn xóa phòng ban ${dept.departmentName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy bỏ'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deleteDepartment(deptId);
          if (res.success) {
            Swal.fire({
              title: 'Đã xóa!',
              text: 'Xóa phòng ban thành công!',
              icon: 'success',
              confirmButtonColor: 'var(--brand)',
              timer: 1500,
              timerProgressBar: true
            });
            loadData();
          } else {
            Swal.fire('Thất bại', res.message || 'Xóa phòng ban thất bại.', 'error');
          }
        } catch (apiErr: any) {
          Swal.fire('Lỗi', apiErr.response?.data?.message || 'Đã xảy ra lỗi kết nối khi xóa phòng ban.', 'error');
        }
      }
    });
  };

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(departments.length / itemsPerPage));
  const currentPageSanitized = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSanitized - 1) * itemsPerPage;
  const paginatedDepartments = departments.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="departments-page page-container">
      <SectionHeader
        title="Quản lý Phòng ban"
        subtitle="Quản lý cơ cấu tổ chức phòng ban và trưởng phòng"
        action={
          <button className="primary-btn" onClick={handleOpenCreate}>
            + Thêm phòng ban
          </button>
        }
      />

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {error && (
          <div style={{ padding: 24, textAlign: "center", color: "#b91c1c", backgroundColor: "#fee2e2", borderBottom: '1px solid #fca5a5', fontWeight: 550 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)" }}>
            Đang tải danh sách phòng ban...
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Mã phòng ban</th>
                  <th>Tên phòng ban</th>
                  <th>Mô tả</th>
                  <th>Trưởng phòng</th>
                  <th>Trạng thái</th>
                  <th style={{ width: "120px", textAlign: "center" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDepartments.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: "center", padding: 24, color: "var(--text-secondary)" }}>
                      Không tìm thấy phòng ban nào.
                    </td>
                  </tr>
                ) : (
                  paginatedDepartments.map((dept) => (
                    <tr key={dept.departmentId}>
                      <td style={{ fontWeight: 600, color: "var(--brand-dark)" }}>{dept.departmentId}</td>
                      <td style={{ fontWeight: 600 }}>{dept.departmentCode}</td>
                      <td style={{ fontWeight: 550 }}>{dept.departmentName}</td>
                      <td>{dept.description || "-"}</td>
                      <td style={{ color: dept.managerName ? "inherit" : "var(--text-tertiary)" }}>
                        {dept.managerName || "Chưa có"}
                      </td>
                      <td>
                        <span className={`status-badge ${dept.active ? "active" : "inactive"}`}>
                          {dept.active ? "Hoạt động" : "Tạm ngưng"}
                        </span>
                      </td>
                      <td>
                        <div className="action-btn-group" style={{ justifyContent: "center" }}>
                          <button
                            className="table-action-btn"
                            title="Sửa thông tin"
                            onClick={() => handleOpenEdit(dept)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            className="table-action-btn"
                            title="Xóa phòng ban"
                            onClick={() => handleDelete(dept)}
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
                  ))
                )}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPageSanitized}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={departments.length}
              showingCount={paginatedDepartments.length}
              itemName="phòng ban"
            />
          </>
        )}
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>{editingDepartment ? "Chỉnh sửa phòng ban" : "Tạo phòng ban mới"}</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="modal-body">
                {formErrors.global && (
                  <div className="alert-danger-global" style={{ padding: "10px 12px", backgroundColor: "#fee2e2", color: "#b91c1c", borderRadius: "8px", fontSize: "13px", border: "1px solid #fca5a5", fontWeight: 500 }}>
                    {formErrors.global}
                  </div>
                )}

                {/* Mã phòng ban và Tên phòng ban */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="departmentCode">Mã phòng ban</label>
                    <input
                      type="text"
                      id="departmentCode"
                      value={formData.departmentCode}
                      onChange={(e) => setFormData({ ...formData, departmentCode: e.target.value })}
                      className={formErrors.departmentCode ? "input-error-border" : ""}
                      placeholder="Ví dụ: CNTT, NS..."
                    />
                    {formErrors.departmentCode && (
                      <span className="error-message-text">{formErrors.departmentCode}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="departmentName">Tên phòng ban</label>
                    <input
                      type="text"
                      id="departmentName"
                      value={formData.departmentName}
                      onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                      className={formErrors.departmentName ? "input-error-border" : ""}
                      placeholder="Ví dụ: Công nghệ thông tin..."
                    />
                    {formErrors.departmentName && (
                      <span className="error-message-text">{formErrors.departmentName}</span>
                    )}
                  </div>
                </div>

                {/* Mô tả (description) */}
                <div className="form-group">
                  <label htmlFor="description">Mô tả phòng ban</label>
                  <input
                    type="text"
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={formErrors.description ? "input-error-border" : ""}
                    placeholder="Mô tả chức năng hoặc thông tin phòng ban"
                  />
                  {formErrors.description && (
                    <span className="error-message-text">{formErrors.description}</span>
                  )}
                </div>

                {/* Trưởng phòng (managerId) */}
                <div className="form-group">
                  <label htmlFor="managerId">Trưởng phòng / Người quản lý</label>
                  <select
                    id="managerId"
                    value={formData.managerId || ""}
                    onChange={(e) => setFormData({ ...formData, managerId: e.target.value ? Number(e.target.value) : "" })}
                    className={formErrors.managerId ? "input-error-border" : ""}
                  >
                    <option value="">-- Chưa bổ nhiệm --</option>
                    {employees.map((emp) => {
                      const empId = emp.employeeId || emp.id;
                      return (
                        <option key={empId} value={empId}>
                          {emp.fullName} (EMP-00{empId})
                        </option>
                      );
                    })}
                  </select>
                  {formErrors.managerId && (
                    <span className="error-message-text">{formErrors.managerId}</span>
                  )}
                </div>

                {/* Trạng thái kích hoạt */}
                <div className="form-group" style={{ flexDirection: "row", gap: "10px", marginTop: "16px", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    style={{ cursor: "pointer", width: "20px", height: "20px" }}
                  />
                  <label htmlFor="active" style={{ cursor: "pointer", userSelect: "none" }}>Kích hoạt hoạt động</label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="primary-btn">
                  {editingDepartment ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
