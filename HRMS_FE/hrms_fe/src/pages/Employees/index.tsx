import React, { useState, useEffect } from 'react';
import SectionHeader from '../../components/common/SectionHeader';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from '../../api/endpoints/employees.api';
import type { Employee } from '../../api/endpoints/employees.api';
import { getUsers } from '../../api/endpoints/auth.api';
import type { UserRecord } from '../../api/endpoints/auth.api';
import './Employees.css';
import Pagination from "../../components/common/Pagination";

import { getDepartments, type DepartmentItem } from '../../api/endpoints/departments.api';
import { getPositions, type PositionItem } from '../../api/endpoints/positions.api';
import Swal from 'sweetalert2';

const LIMIT = 5; // Number of items per page

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filtering and Searching
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Form errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Form states
  const [formData, setFormData] = useState<{
    userId: number | null;
    fullName: string;
    idCardNumber: string;
    departmentId: string | number;
    positionId: string | number;
    joiningDate: string;
    status: string;
    bankAccountNumber: string;
    basicSalary: string | number;
  }>({
    userId: null,
    fullName: '',
    idCardNumber: '',
    departmentId: '',
    positionId: '',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'Đang hoạt động',
    bankAccountNumber: '',
    basicSalary: '',
  });

  // Extract validation errors from backend payload
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

  const [departmentsList, setDepartmentsList] = useState<DepartmentItem[]>([]);
  const [positionsList, setPositionsList] = useState<PositionItem[]>([]);

  const loadDepartments = async () => {
    try {
      const res = await getDepartments();
      if (res.success && Array.isArray(res.data)) {
        setDepartmentsList(res.data);
      }
    } catch (e) {
      console.error('Không thể lấy danh sách phòng ban:', e);
    }
  };

  const loadPositions = async () => {
    try {
      const res = await getPositions();
      if (res.success && Array.isArray(res.data)) {
        setPositionsList(res.data);
      }
    } catch (e) {
      console.error('Không thể lấy danh sách chức vụ:', e);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await getUsers();
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data);
      }
    } catch (e) {
      console.error('Không thể lấy danh sách tài khoản:', e);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getEmployees();
      if (res.success && Array.isArray(res.data)) {
        setAllEmployees(res.data);
        let filtered = [...res.data];

        if (search.trim()) {
          const query = search.toLowerCase();
          filtered = filtered.filter(
            (emp) =>
              (emp.fullName || '').toLowerCase().includes(query) ||
              (emp.idCardNumber && emp.idCardNumber.toString().includes(query)) ||
              (emp.employeeId && emp.employeeId.toString().includes(query))
          );
        }

        if (filterDept) {
          filtered = filtered.filter((emp) => emp.departmentId === Number(filterDept));
        }

        const total = filtered.length;
        const computedTotalPages = Math.max(1, Math.ceil(total / LIMIT));

        // Keep page in bounds
        const currentPage = Math.min(page, computedTotalPages);
        if (currentPage !== page) {
          setPage(currentPage);
        }

        const startIndex = (currentPage - 1) * LIMIT;
        const paginatedItems = filtered.slice(startIndex, startIndex + LIMIT);

        setEmployees(paginatedItems);
        setTotalPages(computedTotalPages);
        setTotalItems(total);
      } else {
        throw new Error(res.message || 'Lỗi khi tải danh sách nhân viên từ máy chủ.');
      }
    } catch (e: any) {
      setError(e.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      setEmployees([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadDepartments();
    loadPositions();
  }, []);

  useEffect(() => {
    loadData();
  }, [page, search, filterDept]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingEmployee(null);
    setFormErrors({});
    setFormData({
      userId: null,
      fullName: '',
      idCardNumber: '',
      departmentId: '',
      positionId: '',
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Đang hoạt động',
      bankAccountNumber: '',
      basicSalary: '',
    });
    setShowModal(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormErrors({});
    setFormData({
      userId: emp.userId || null,
      fullName: emp.fullName || '',
      idCardNumber: emp.idCardNumber ? String(emp.idCardNumber) : '',
      departmentId: emp.departmentId || '',
      positionId: emp.positionId || '',
      joiningDate: emp.joiningDate ? emp.joiningDate : new Date().toISOString().split('T')[0],
      status: emp.status || 'Đang hoạt động',
      bankAccountNumber: emp.bankAccountNumber || '',
      basicSalary: emp.basicSalary || '',
    });
    setShowModal(true);
  };

  // Submit CRUD Form (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const errors: Record<string, string> = {};

    const cccdStr = String(formData.idCardNumber || '').trim();
    if (!cccdStr) {
      errors.idCardNumber = 'Số CCCD không được để trống.';
    } else if (!/^\d{12}$/.test(cccdStr)) {
      errors.idCardNumber = 'Số CCCD (Căn cước công dân) phải bao gồm đúng 12 chữ số.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const payload = {
      ...formData,
      userId: formData.userId ? Number(formData.userId) : null,
      idCardNumber: formData.idCardNumber !== '' ? Number(formData.idCardNumber) : null,
      departmentId: formData.departmentId !== '' ? Number(formData.departmentId) : null,
      positionId: formData.positionId !== '' ? Number(formData.positionId) : null,
      basicSalary: formData.basicSalary !== '' ? Number(formData.basicSalary) : null,
    } as any;

    try {
      if (editingEmployee) {
        // Edit Mode
        const empId = editingEmployee.employeeId || editingEmployee.id!;
        const res = await updateEmployee(empId, payload);
        if (res.success) {
          Swal.fire({
            title: 'Thành công!',
            text: 'Cập nhật thông tin nhân viên thành công!',
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
        const res = await createEmployee(payload);
        if (res.success) {
          Swal.fire({
            title: 'Thành công!',
            text: 'Thêm nhân viên thành công!',
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
        Swal.fire('Lỗi kết nối', 'Đã xảy ra lỗi kết nối khi lưu thông tin nhân viên.', 'error');
      }
    }
  };

  // Delete Handler
  const handleDelete = async (emp: Employee) => {
    const empId = emp.employeeId || emp.id!;
    Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc chắn muốn xóa nhân viên ${emp.fullName || ''}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy bỏ'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deleteEmployee(empId);
          if (res.success) {
            Swal.fire({
              title: 'Đã xóa!',
              text: 'Xóa nhân viên thành công!',
              icon: 'success',
              confirmButtonColor: 'var(--brand)',
              timer: 1500,
              timerProgressBar: true
            });
            loadData();
          } else {
            Swal.fire('Thất bại', res.message || 'Xóa nhân viên thất bại.', 'error');
          }
        } catch (apiErr: any) {
          Swal.fire('Lỗi', 'Đã xảy ra lỗi kết nối khi xóa nhân viên.', 'error');
        }
      }
    });
  };

  // Status Badge Mapper
  const getStatusClass = (status: string) => {
    if (status === 'Đang hoạt động') return 'active';
    if (status === 'Đang thử việc') return 'probation';
    return 'inactive';
  };

  // Helper to fetch/display email from linked user account
  const getEmployeeEmail = (emp: Employee) => {
    const uId = emp.userId;
    const user = users.find((u) => (u.userId === uId || u.id === uId));
    return user ? user.email : (emp.email || 'Chưa liên kết');
  };

  // Filter accounts that are unassigned or assigned to current editing employee, excluding existing employees and Admin/HR roles
  const getAvailableUsers = () => {
    return users.filter(u => {
      const uId = u.userId || u.id;
      if (!uId) return false;
      if (editingEmployee && Number(editingEmployee.userId) === Number(uId)) {
        return true;
      }
      const isAssigned = allEmployees.some(emp => Number(emp.userId) === Number(uId));
      if (isAssigned) return false;

      const roleUpper = (u.role || '').toUpperCase();
      const isForbiddenRole = roleUpper === 'ADMIN' || roleUpper === 'HR';
      return !isForbiddenRole;
    });
  };

  return (
    <div className="employees-page page-container">
      <SectionHeader
        title="Quản lý nhân viên"
        subtitle="Danh sách nhân sự hiện tại và trạng thái làm việc toàn công ty"
        action={
          <div className="section-action">
            <button className="primary-btn" onClick={handleOpenCreate}>
              + Thêm nhân viên
            </button>
          </div>
        }
      />

      {/* Toolbar Filters */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '16px' }}>
        <div className="table-toolbar">
          <div className="toolbar-left">
            <select
              value={filterDept}
              onChange={(e) => {
                setFilterDept(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                outline: 'none',
                fontSize: '13.5px',
                background: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="">Tất cả phòng ban</option>
              {departmentsList.map((dept) => (
                <option key={dept.departmentId} value={dept.departmentId}>{dept.departmentName}</option>
              ))}
            </select>
          </div>
          <div className="toolbar-right">
            <div className="search-input-wrapper">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm nhân viên..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table view */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {error && (
          <div style={{ padding: 24, textAlign: 'center', color: '#b91c1c', backgroundColor: '#fee2e2', borderBottom: '1px solid #fca5a5', fontWeight: 550 }}>
            {error}
          </div>
        )}
        
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
            Đang tải danh sách nhân viên...
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã NV</th>
                <th>Họ và tên</th>
                <th>Email liên hệ</th>
                <th>Số tài khoản</th>
                <th>Lương cơ bản</th>
                <th>Phòng ban</th>
                <th>Vị trí công việc</th>
                <th>Trạng thái</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 24, color: 'var(--text-secondary)' }}>
                    Không tìm thấy nhân viên nào phù hợp.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => {
                  const empId = emp.employeeId || emp.id;
                  return (
                    <tr key={empId}>
                      <td style={{ fontWeight: 600, color: 'var(--brand-dark)' }}>
                        {empId ? `EMP-00${empId}` : 'EMP-NEW'}
                      </td>
                      <td style={{ fontWeight: 550 }}>{emp.fullName}</td>
                      <td>{getEmployeeEmail(emp)}</td>
                      <td style={{ fontFamily: "monospace", fontWeight: 550, color: "var(--text-secondary)" }}>
                        {emp.bankAccountNumber || <em style={{ color: "#94a3b8" }}>Chưa nhập</em>}
                      </td>
                      <td style={{ fontWeight: 600, color: "var(--brand-dark)" }}>
                        {emp.basicSalary ? emp.basicSalary.toLocaleString('vi-VN') + " đ" : <em style={{ color: "#94a3b8" }}>Chưa nhập</em>}
                      </td>
                      <td>{emp.departmentName || 'Chưa xếp'}</td>
                      <td>{emp.positionName || 'Chưa xếp'}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(emp.status || '')}`}>
                          {emp.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-btn-group" style={{ justifyContent: 'center' }}>
                          <button
                            className="table-action-btn"
                            title="Sửa thông tin"
                            onClick={() => handleOpenEdit(emp)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            className="table-action-btn"
                            title="Xóa nhân viên"
                            onClick={() => handleDelete(emp)}
                            style={{ color: '#ef4444' }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {/* Pagination Footer */}
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={totalItems}
          showingCount={employees.length}
          itemName="nhân viên"
        />
      </div>

      {/* Create / Edit Modal Dialog */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>{editingEmployee ? 'Chỉnh sửa thông tin nhân viên' : 'Tiếp nhận nhân sự mới'}</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="modal-body">
                {/* Global Error Banner */}
                {formErrors.global && (
                  <div className="alert-danger-global" style={{ padding: '10px 12px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '8px', fontSize: '13px', border: '1px solid #fca5a5', fontWeight: 500 }}>
                    {formErrors.global}
                  </div>
                )}

                {/* Tài khoản liên kết (userId) */}
                <div className="form-group">
                  <label htmlFor="userId">Tài khoản hệ thống</label>
                  <select
                    id="userId"
                    value={formData.userId || ''}
                    onChange={(e) => {
                      const selectedId = e.target.value ? Number(e.target.value) : null;
                      const selectedUser = users.find(u => Number(u.userId || u.id) === selectedId);
                      setFormData({
                        ...formData,
                        userId: selectedId,
                        fullName: selectedUser?.fullName || selectedUser?.username || formData.fullName
                      });
                      if (formErrors.userId) {
                        setFormErrors({ ...formErrors, userId: '' });
                      }
                    }}
                    className={formErrors.userId ? 'input-error-border' : ''}
                  >
                    <option value="">-- Tự động sinh tài khoản mới --</option>
                    {getAvailableUsers().map((u) => {
                      const uId = u.userId || u.id;
                      return (
                        <option key={uId} value={uId}>
                          {u.fullName || u.username ? `${u.fullName || u.username} (${u.email})` : u.email}
                        </option>
                      );
                    })}
                  </select>
                  {formErrors.userId && (
                    <span className="error-message-text">{formErrors.userId}</span>
                  )}
                </div>

                {/* Họ và tên (fullName) */}
                <div className="form-group">
                  <label htmlFor="fullName">Họ và tên</label>
                  <input
                    type="text"
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={formErrors.fullName ? 'input-error-border' : ''}
                    placeholder="Nhập đầy đủ họ tên nhân viên"
                  />
                  {formErrors.fullName && (
                    <span className="error-message-text">{formErrors.fullName}</span>
                  )}
                </div>

                {/* Số CCCD (idCardNumber) */}
                <div className="form-group">
                  <label htmlFor="idCardNumber">Số CCCD (Căn cước công dân) <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="text"
                    id="idCardNumber"
                    inputMode="numeric"
                    maxLength={12}
                    value={formData.idCardNumber}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 12);
                      setFormData({ ...formData, idCardNumber: onlyDigits });
                      if (formErrors.idCardNumber) {
                        setFormErrors({ ...formErrors, idCardNumber: '' });
                      }
                    }}
                    className={formErrors.idCardNumber ? 'input-error-border' : ''}
                    placeholder="Nhập 12 số CCCD (ví dụ: 034239482394)"
                  />
                  {formErrors.idCardNumber && (
                    <span className="error-message-text">{formErrors.idCardNumber}</span>
                  )}
                </div>

                {/* Số tài khoản thanh toán lương (bankAccountNumber) */}
                <div className="form-group">
                  <label htmlFor="bankAccountNumber">Số tài khoản ngân hàng (Thanh toán lương) <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="text"
                    id="bankAccountNumber"
                    value={formData.bankAccountNumber}
                    onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                    className={formErrors.bankAccountNumber ? 'input-error-border' : ''}
                    placeholder="Nhập số tài khoản thanh toán lương (ví dụ: 1903456789)"
                    required
                  />
                  {formErrors.bankAccountNumber && (
                    <span className="error-message-text">{formErrors.bankAccountNumber}</span>
                  )}
                </div>

                {/* Lương cơ bản (basicSalary) */}
                <div className="form-group">
                  <label htmlFor="basicSalary">Lương cơ bản <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    type="number"
                    id="basicSalary"
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({ ...formData, basicSalary: e.target.value !== '' ? Number(e.target.value) : '' })}
                    className={formErrors.basicSalary ? 'input-error-border' : ''}
                    placeholder="Nhập mức lương cơ bản (Ví dụ: 12000000)"
                    required
                  />
                  {formErrors.basicSalary && (
                    <span className="error-message-text">{formErrors.basicSalary}</span>
                  )}
                </div>

                {/* Phòng ban và Trạng thái */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="departmentId">Phòng ban</label>
                    <select
                      id="departmentId"
                      value={formData.departmentId}
                      onChange={(e) => setFormData({ ...formData, departmentId: e.target.value ? Number(e.target.value) : '' })}
                      className={formErrors.departmentId ? 'input-error-border' : ''}
                    >
                      <option value="">-- Chọn phòng ban --</option>
                      {departmentsList.map((d) => (
                        <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                      ))}
                    </select>
                    {formErrors.departmentId && (
                      <span className="error-message-text">{formErrors.departmentId}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="status">Trạng thái làm việc</label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className={formErrors.status ? 'input-error-border' : ''}
                    >
                      <option value="Đang hoạt động">Đang hoạt động</option>
                      <option value="Đang thử việc">Đang thử việc</option>
                      <option value="Đã nghỉ việc">Đã nghỉ việc</option>
                    </select>
                    {formErrors.status && (
                      <span className="error-message-text">{formErrors.status}</span>
                    )}
                  </div>
                </div>

                {/* Chức vụ và Ngày tham gia */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="positionId">Chức vụ</label>
                    <select
                      id="positionId"
                      value={formData.positionId}
                      onChange={(e) => setFormData({ ...formData, positionId: e.target.value ? Number(e.target.value) : '' })}
                      className={formErrors.positionId ? 'input-error-border' : ''}
                    >
                      <option value="">-- Chọn chức vụ --</option>
                      {positionsList.map((p) => (
                        <option key={p.positionId} value={p.positionId}>{p.positionName}</option>
                      ))}
                    </select>
                    {formErrors.positionId && (
                      <span className="error-message-text">{formErrors.positionId}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="joiningDate">Ngày tham gia</label>
                    <input
                      type="date"
                      id="joiningDate"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                      className={formErrors.joiningDate ? 'input-error-border' : ''}
                    />
                    {formErrors.joiningDate && (
                      <span className="error-message-text">{formErrors.joiningDate}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="primary-btn">
                  {editingEmployee ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
