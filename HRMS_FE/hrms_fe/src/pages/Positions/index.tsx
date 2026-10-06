import React, { useState, useEffect } from "react";
import SectionHeader from "../../components/common/SectionHeader";
import {
  getPositions,
  createPosition,
  updatePosition,
  deletePosition,
  type PositionItem
} from "../../api/endpoints/positions.api";
import Swal from 'sweetalert2';
import Pagination from "../../components/common/Pagination";

const Positions: React.FC = () => {
  const [positions, setPositions] = useState<PositionItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingPosition, setEditingPosition] = useState<PositionItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    positionName: "",
    salaryGrade: "",
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
      const res = await getPositions();
      if (res.success && Array.isArray(res.data)) {
        setPositions(res.data);
      } else {
        throw new Error(res.message || "Không thể tải danh sách chức vụ");
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
    setEditingPosition(null);
    setFormErrors({});
    setFormData({
      positionName: "",
      salaryGrade: "",
      active: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (pos: PositionItem) => {
    setEditingPosition(pos);
    setFormErrors({});
    setFormData({
      positionName: pos.positionName,
      salaryGrade: pos.salaryGrade,
      active: pos.active !== undefined ? pos.active : true,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const payload = {
      positionName: formData.positionName,
      salaryGrade: formData.salaryGrade,
      active: formData.active,
    };

    try {
      if (editingPosition) {
        // Edit Mode
        const posId = editingPosition.positionId!;
        const res = await updatePosition(posId, payload);
        if (res.success) {
          Swal.fire({
            title: 'Thành công!',
            text: 'Cập nhật chức vụ thành công!',
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
        const res = await createPosition(payload);
        if (res.success) {
          Swal.fire({
            title: 'Thành công!',
            text: 'Thêm chức vụ thành công!',
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
        Swal.fire('Lỗi kết nối', 'Đã xảy ra lỗi kết nối khi lưu thông tin chức vụ.', 'error');
      }
    }
  };

  const handleDelete = async (pos: PositionItem) => {
    const posId = pos.positionId!;
    Swal.fire({
      title: 'Xác nhận xóa?',
      text: `Bạn có chắc chắn muốn xóa chức vụ ${pos.positionName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy bỏ'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await deletePosition(posId);
          if (res.success) {
            Swal.fire({
              title: 'Đã xóa!',
              text: 'Xóa chức vụ thành công!',
              icon: 'success',
              confirmButtonColor: 'var(--brand)',
              timer: 1500,
              timerProgressBar: true
            });
            loadData();
          } else {
            Swal.fire('Thất bại', res.message || 'Xóa chức vụ thất bại.', 'error');
          }
        } catch (apiErr: any) {
          Swal.fire('Lỗi', apiErr.response?.data?.message || 'Đã xảy ra lỗi kết nối khi xóa chức vụ.', 'error');
        }
      }
    });
  };

  // Filter list
  const getFilteredPositions = () => {
    let filtered = [...positions];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.positionName.toLowerCase().includes(q) ||
          p.salaryGrade.toLowerCase().includes(q)
      );
    }
    return filtered;
  };

  const filteredPositions = getFilteredPositions();

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredPositions.length / itemsPerPage));
  const currentPageSanitized = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSanitized - 1) * itemsPerPage;
  const paginatedPositions = filteredPositions.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="positions-page page-container">
      <SectionHeader
        title="Quản lý Chức vụ"
        subtitle="Thiết lập cơ cấu chức vụ công việc, cấp bậc và khung bảng lương"
        action={
          <button className="primary-btn" onClick={handleOpenCreate}>
            + Thêm chức vụ
          </button>
        }
      />

      {/* Toolbar Search */}
      <div className="card" style={{ padding: "12px 20px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div className="search-input-wrapper">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Tìm theo tên chức vụ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "36px" }}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {error && (
          <div style={{ padding: 24, textAlign: "center", color: "#b91c1c", backgroundColor: "#fee2e2", borderBottom: '1px solid #fca5a5', fontWeight: 550 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-secondary)" }}>
            Đang tải danh sách chức vụ...
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên chức vụ</th>
                  <th>Bậc lương</th>
                  <th>Trạng thái</th>
                  <th style={{ width: "120px", textAlign: "center" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPositions.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: 24, color: "var(--text-secondary)" }}>
                      Không tìm thấy chức vụ nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  paginatedPositions.map((pos) => (
                    <tr key={pos.positionId}>
                      <td style={{ fontWeight: 600, color: "var(--brand-dark)" }}>{pos.positionId}</td>
                      <td style={{ fontWeight: 550 }}>{pos.positionName}</td>
                      <td>
                        <span className="role-badge employee" style={{ background: "#e0f2fe", color: "#0369a1", fontWeight: 600 }}>
                          {pos.salaryGrade}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${pos.active ? "active" : "inactive"}`}>
                          {pos.active ? "Hoạt động" : "Tạm ngưng"}
                        </span>
                      </td>
                      <td>
                        <div className="action-btn-group" style={{ justifyContent: "center" }}>
                          <button
                            className="table-action-btn"
                            title="Sửa thông tin"
                            onClick={() => handleOpenEdit(pos)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            className="table-action-btn"
                            title="Xóa chức vụ"
                            onClick={() => handleDelete(pos)}
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
              totalItems={filteredPositions.length}
              showingCount={paginatedPositions.length}
              itemName="chức vụ"
            />
          </>
        )}
      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>{editingPosition ? "Chỉnh sửa chức vụ" : "Tạo chức vụ mới"}</h3>
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

                {/* Tên chức vụ */}
                <div className="form-group">
                  <label htmlFor="positionName">Tên chức vụ</label>
                  <input
                    type="text"
                    id="positionName"
                    value={formData.positionName}
                    onChange={(e) => setFormData({ ...formData, positionName: e.target.value })}
                    className={formErrors.positionName ? "input-error-border" : ""}
                    placeholder="Ví dụ: Lập trình viên..."
                  />
                  {formErrors.positionName && (
                    <span className="error-message-text">{formErrors.positionName}</span>
                  )}
                </div>

                {/* Bậc lương (salaryGrade) */}
                <div className="form-group">
                  <label htmlFor="salaryGrade">Bậc lương (Salary Grade)</label>
                  <input
                    type="text"
                    id="salaryGrade"
                    value={formData.salaryGrade}
                    onChange={(e) => setFormData({ ...formData, salaryGrade: e.target.value })}
                    className={formErrors.salaryGrade ? "input-error-border" : ""}
                    placeholder="Ví dụ: GR-01, GR-02..."
                  />
                  {formErrors.salaryGrade && (
                    <span className="error-message-text">{formErrors.salaryGrade}</span>
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
                  {editingPosition ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Positions;
