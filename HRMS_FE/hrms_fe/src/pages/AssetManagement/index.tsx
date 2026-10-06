import React, { useState, useEffect } from "react";
import SectionHeader from "../../components/common/SectionHeader";
import { getAssets, createAsset, updateAsset, deleteAsset } from "../../api/endpoints/assets.api";
import type { AssetItem } from "../../api/endpoints/assets.api";
import Swal from "sweetalert2";
import Pagination from "../../components/common/Pagination";

const AssetManagement: React.FC = () => {
  const [assets, setAssets] = useState<AssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form States
  const [assetId, setAssetId] = useState<number | undefined>(undefined);
  const [assetName, setAssetName] = useState("");
  const [assetType, setAssetType] = useState("Laptop");
  const [status, setStatus] = useState("Sẵn sàng");

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

  const loadAssets = async () => {
    setLoading(true);
    try {
      const res = await getAssets();
      if (res.success) {
        setAssets(res.data || []);
      } else {
        Swal.fire("Lỗi", res.message || "Không thể tải danh sách tài sản", "error");
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire("Lỗi", "Lỗi kết nối khi tải danh sách tài sản", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  const openCreateModal = () => {
    setIsEdit(false);
    setFormErrors({});
    setAssetId(undefined);
    setAssetName("");
    setAssetType("Laptop");
    setStatus("Sẵn sàng");
    setShowModal(true);
  };

  const openEditModal = (asset: AssetItem) => {
    setIsEdit(true);
    setFormErrors({});
    setAssetId(asset.assetId);
    setAssetName(asset.assetName);
    setAssetType(asset.assetType);
    setStatus(asset.status);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    if (!assetName.trim() || !assetType || !status) {
      Swal.fire("Cảnh báo", "Vui lòng điền đầy đủ các thông tin bắt buộc", "warning");
      return;
    }

    const payload: AssetItem = {
      assetId,
      assetName: assetName.trim(),
      assetType,
      status,
    };

    try {
      let res;
      if (isEdit && assetId) {
        res = await updateAsset(assetId, payload);
      } else {
        res = await createAsset(payload);
      }

      if (res.success) {
        Swal.fire("Thành công", isEdit ? "Cập nhật tài sản thành công!" : "Tạo tài sản mới thành công!", "success");
        setShowModal(false);
        loadAssets();
      } else {
        setFormErrors(extractServerErrors(res));
      }
    } catch (err: any) {
      if (err.response?.data) {
        setFormErrors(extractServerErrors(err.response.data));
      } else {
        setFormErrors({ global: err.message || "Đã xảy ra lỗi kết nối" });
      }
    }
  };

  const handleDelete = async (id: number) => {
    const confirmResult = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Bạn có chắc chắn muốn xóa tài sản này khỏi hệ thống?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#ef4444",
    });

    if (confirmResult.isConfirmed) {
      try {
        const res = await deleteAsset(id);
        if (res.success) {
          Swal.fire("Thành công", "Đã xóa tài sản thành công!", "success");
          loadAssets();
        } else {
          Swal.fire("Thất bại", res.message || "Xóa thất bại", "error");
        }
      } catch (err: any) {
        Swal.fire("Lỗi", err.response?.data?.message || err.message || "Đã xảy ra lỗi", "error");
      }
    }
  };

  const getStatusBadgeClass = (s: string) => {
    switch (s) {
      case "Sẵn sàng":
        return "status-active";
      case "Bảo trì":
        return "status-locked";
      default:
        return "status-pending"; // Đang sử dụng
    }
  };

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(assets.length / itemsPerPage));
  const currentPageSanitized = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSanitized - 1) * itemsPerPage;
  const paginatedAssets = assets.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="page-container">
      <SectionHeader
        title="Quản lý tài sản"
        subtitle="Theo dõi trang thiết bị và tài sản doanh nghiệp"
        action={
          <button className="btn btn-primary" onClick={openCreateModal}>
            Thêm tài sản
          </button>
        }
      />

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>Đang tải dữ liệu...</div>
        ) : assets.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            Không có tài sản nào. Vui lòng thêm mới.
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã tài sản</th>
                  <th>Tên tài sản</th>
                  <th>Loại thiết bị</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: "center" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAssets.map((asset) => (
                  <tr key={asset.assetId}>
                    <td style={{ fontWeight: 600, color: "var(--brand-dark)" }}>AST-0{asset.assetId}</td>
                    <td style={{ fontWeight: 550 }}>{asset.assetName}</td>
                    <td>{asset.assetType}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(asset.status)}`}>
                        {asset.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-btn-group" style={{ justifyContent: "center" }}>
                        <button
                          className="table-action-btn"
                          title="Sửa tài sản"
                          onClick={() => openEditModal(asset)}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>
                        <button
                          className="table-action-btn"
                          title="Xóa tài sản"
                          onClick={() => handleDelete(asset.assetId!)}
                          style={{ color: "#ef4444" }}
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
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPageSanitized}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={assets.length}
              showingCount={paginatedAssets.length}
              itemName="tài sản"
            />
          </>
        )}
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2>{isEdit ? "Sửa tài sản" : "Thêm tài sản mới"}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} noValidate>
              {formErrors.global && (
                <div style={{ color: "#ef4444", backgroundColor: "#fee2e2", padding: "10px", borderRadius: "4px", marginBottom: "15px", fontSize: "13px", fontWeight: 500 }}>
                  {formErrors.global}
                </div>
              )}
              <div className="form-group">
                <label>Tên tài sản <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  type="text"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  className={formErrors.assetName ? 'input-error-border' : ''}
                  placeholder="Ví dụ: Laptop Dell Latitude, Màn hình LG 24 inch..."
                  required
                />
                {formErrors.assetName && (
                  <span className="error-message-text" style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{formErrors.assetName}</span>
                )}
              </div>
              <div className="form-group">
                <label>Loại thiết bị <span style={{ color: "#ef4444" }}>*</span></label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  className={formErrors.assetType ? 'input-error-border' : ''}
                  required
                >
                  <option value="Laptop">Laptop (Máy tính xách tay)</option>
                  <option value="Điện thoại">Điện thoại di động</option>
                  <option value="Thiết bị VP">Thiết bị văn phòng</option>
                  <option value="Bàn ghế">Bàn ghế / Nội thất</option>
                  <option value="Khác">Khác</option>
                </select>
                {formErrors.assetType && (
                  <span className="error-message-text" style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{formErrors.assetType}</span>
                )}
              </div>
              <div className="form-group">
                <label>Trạng thái sử dụng <span style={{ color: "#ef4444" }}>*</span></label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={formErrors.status ? 'input-error-border' : ''}
                  required
                >
                  <option value="Sẵn sàng">Sẵn sàng (Thiết bị rảnh)</option>
                  <option value="Đang sử dụng">Đang sử dụng (Đã bàn giao)</option>
                  <option value="Bảo trì">Đang bảo trì / Hỏng</option>
                </select>
                {formErrors.status && (
                  <span className="error-message-text" style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{formErrors.status}</span>
                )}
              </div>
              <div style={{ display: "flex", justifyContent: "end", gap: "10px", marginTop: "20px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">{isEdit ? "Cập nhật" : "Tạo mới"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetManagement;
