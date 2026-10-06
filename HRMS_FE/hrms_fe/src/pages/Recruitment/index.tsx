import React, { useState, useEffect } from "react";
import SectionHeader from "../../components/common/SectionHeader";
import { 
  getCampaigns, 
  createCampaign, 
  updateCampaign, 
  deleteCampaign,
  getCandidates,
  createCandidate,
  approveCandidate
} from "../../api/endpoints/recruitment.api";
import type { RecruitmentCampaignItem } from "../../api/endpoints/recruitment.api";
import { getPositions } from "../../api/endpoints/positions.api";
import type { PositionItem } from "../../api/endpoints/positions.api";
import { getDepartments } from "../../api/endpoints/departments.api";
import type { DepartmentItem } from "../../api/endpoints/departments.api";
import Swal from "sweetalert2";
import "./Recruitment.css";

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  stage: string;
  source: string;
}

import Pagination from "../../components/common/Pagination";

const Recruitment: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"campaigns" | "candidates">("campaigns");

  // Pagination
  const itemsPerPage = 5;
  const [currentPageCampaigns, setCurrentPageCampaigns] = useState(1);
  const [currentPageCandidates, setCurrentPageCandidates] = useState(1);

  // Validation Errors States
  const [campaignErrors, setCampaignErrors] = useState<Record<string, string>>({});
  const [candidateErrors, setCandidateErrors] = useState<Record<string, string>>({});
  const [addCandidateErrors, setAddCandidateErrors] = useState<Record<string, string>>({});

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

  // General Metadata States
  const [positions, setPositions] = useState<PositionItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);

  // --- CANDIDATES STATE ---
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [showAddCandidateModal, setShowAddCandidateModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Candidate Approval Form State
  const [candidateFormData, setCandidateFormData] = useState({
    employeeCode: "",
    departmentId: "" as string | number,
    positionId: "" as string | number,
    roleName: "EMPLOYEE",
    status: "Đang hoạt động",
    idCardNumber: "",
  });

  // Add Candidate Form State
  const [addCandidateFormData, setAddCandidateFormData] = useState({
    candidateName: "",
    campaignId: "" as string | number,
    email: "",
    cvFileUrl: "",
    source: "LinkedIn",
  });

  // --- CAMPAIGNS STATE ---
  const [campaigns, setCampaigns] = useState<RecruitmentCampaignItem[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [isEditCampaign, setIsEditCampaign] = useState(false);

  // Campaign Form State
  const [campaignId, setCampaignId] = useState<number | undefined>(undefined);
  const [campaignPositionId, setCampaignPositionId] = useState<number>(0);
  const [quantityNeeded, setQuantityNeeded] = useState<number>(1);
  const [deadline, setDeadline] = useState<string>("");
  const [campaignDescription, setCampaignDescription] = useState<string>("");

  // Load all metadata needed (Departments & Positions)
  const loadMetadata = async () => {
    try {
      const [posRes, deptRes] = await Promise.all([getPositions(), getDepartments()]);
      if (posRes.success) {
        setPositions(posRes.data || []);
      }
      if (deptRes.success) {
        setDepartments(deptRes.data || []);
      }
    } catch (err) {
      console.error("Failed to load metadata", err);
    }
  };

  // Load Campaigns
  const loadCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const campRes = await getCampaigns();
      if (campRes.success) {
        setCampaigns(campRes.data || []);
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Lỗi", "Không thể tải dữ liệu chiến dịch tuyển dụng", "error");
    } finally {
      setLoadingCampaigns(false);
    }
  };

  // Load Candidates
  const loadCandidates = async () => {
    setLoadingCandidates(true);
    try {
      const candRes = await getCandidates();
      if (candRes.success) {
        const list = (candRes.data || []).map((c) => ({
          id: String(c.candidateId),
          name: c.candidateName,
          email: c.email || "",
          position: c.positionName || "Không xác định",
          stage: c.status || "NEW",
          source: c.source || "Nguồn tự do",
        }));
        setCandidates(list);
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Lỗi", "Không thể tải danh sách ứng viên", "error");
    } finally {
      setLoadingCandidates(false);
    }
  };

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    if (activeTab === "campaigns") {
      loadCampaigns();
    } else {
      loadCandidates();
    }
  }, [activeTab]);

  // Campaign Handlers
  const openCreateCampaignModal = () => {
    setIsEditCampaign(false);
    setCampaignErrors({});
    setCampaignId(undefined);
    if (positions.length > 0) {
      setCampaignPositionId(positions[0].positionId!);
    }
    setQuantityNeeded(1);
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    setDeadline(nextMonth.toISOString().split("T")[0]);
    setCampaignDescription("");
    setShowCampaignModal(true);
  };

  const openEditCampaignModal = (camp: RecruitmentCampaignItem) => {
    setIsEditCampaign(true);
    setCampaignErrors({});
    setCampaignId(camp.campaignId);
    setCampaignPositionId(camp.positionId);
    setQuantityNeeded(camp.quantityNeeded);
    setDeadline(camp.deadline);
    setCampaignDescription(camp.description || "");
    setShowCampaignModal(true);
  };

  const handleCampaignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCampaignErrors({});
    if (!campaignPositionId || quantityNeeded <= 0 || !deadline) {
      Swal.fire("Cảnh báo", "Vui lòng nhập đầy đủ thông tin hợp lệ", "warning");
      return;
    }

    const payload: RecruitmentCampaignItem = {
      campaignId,
      positionId: campaignPositionId,
      quantityNeeded,
      deadline,
      description: campaignDescription,
    };

    try {
      let res;
      if (isEditCampaign && campaignId) {
        res = await updateCampaign(campaignId, payload);
      } else {
        res = await createCampaign(payload);
      }

      if (res.success) {
        Swal.fire("Thành công", isEditCampaign ? "Cập nhật chiến dịch thành công!" : "Tạo chiến dịch tuyển dụng thành công!", "success");
        setShowCampaignModal(false);
        loadCampaigns();
      } else {
        setCampaignErrors(extractServerErrors(res));
      }
    } catch (err: any) {
      if (err.response?.data) {
        setCampaignErrors(extractServerErrors(err.response.data));
      } else {
        setCampaignErrors({ global: err.message || "Đã xảy ra lỗi kết nối" });
      }
    }
  };

  const handleDeleteCampaign = async (id: number) => {
    const confirmResult = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Bạn có chắc muốn xóa chiến dịch tuyển dụng này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#ef4444",
    });

    if (confirmResult.isConfirmed) {
      try {
        const res = await deleteCampaign(id);
        if (res.success) {
          Swal.fire("Thành công", "Đã xóa chiến dịch thành công!", "success");
          loadCampaigns();
        } else {
          Swal.fire("Thất bại", res.message || "Xóa thất bại", "error");
        }
      } catch (err: any) {
        Swal.fire("Lỗi", err.response?.data?.message || err.message || "Đã xảy ra lỗi", "error");
      }
    }
  };

  // Add Candidate Handlers
  const openAddCandidateModal = () => {
    // If there is no active campaign, warn user
    if (campaigns.length === 0) {
      Swal.fire("Cảnh báo", "Bạn cần phải có ít nhất một chiến dịch tuyển dụng đang hoạt động để thêm ứng viên.", "warning");
      return;
    }
    setAddCandidateErrors({});
    setAddCandidateFormData({
      candidateName: "",
      campaignId: campaigns[0].campaignId || "",
      email: "",
      cvFileUrl: "",
      source: "LinkedIn",
    });
    setShowAddCandidateModal(true);
  };

  const handleAddCandidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddCandidateErrors({});
    const { candidateName, campaignId, email, cvFileUrl, source } = addCandidateFormData;
    if (!candidateName || !campaignId || !cvFileUrl) {
      Swal.fire("Cảnh báo", "Vui lòng nhập đầy đủ các trường bắt buộc", "warning");
      return;
    }

    try {
      const res = await createCandidate({
        candidateName,
        campaignId: Number(campaignId),
        email: email || undefined,
        cvFileUrl,
        source,
        status: "NEW"
      });

      if (res.success) {
        Swal.fire("Thành công", "Thêm ứng viên ứng tuyển thành công!", "success");
        setShowAddCandidateModal(false);
        loadCandidates();
      } else {
        setAddCandidateErrors(extractServerErrors(res));
      }
    } catch (err: any) {
      if (err.response?.data) {
        setAddCandidateErrors(extractServerErrors(err.response.data));
      } else {
        setAddCandidateErrors({ global: err.message || "Đã xảy ra lỗi kết nối" });
      }
    }
  };

  // Candidate Approval Handlers
  const handleOpenApproval = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setCandidateErrors({});

    // Attempt to match position from candidate name/position label
    const matchedPos = positions.find(p => p.positionName?.toLowerCase() === candidate.position.toLowerCase());
    const defaultPositionId = matchedPos?.positionId || (positions.length > 0 ? positions[0].positionId : "");
    const defaultDeptId = departments.length > 0 ? departments[0].departmentId : "";

    setCandidateFormData({
      employeeCode: `EMP-${Date.now().toString().slice(-4)}`,
      departmentId: defaultDeptId || "",
      positionId: defaultPositionId || "",
      roleName: "EMPLOYEE",
      status: "Đang hoạt động",
      idCardNumber: "",
    });
    setShowCandidateModal(true);
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCandidateErrors({});
    if (!selectedCandidate) return;

    const { employeeCode, departmentId, positionId, roleName, status, idCardNumber } = candidateFormData;

    if (!departmentId || !positionId) {
      Swal.fire("Cảnh báo", "Vui lòng chọn phòng ban và chức vụ", "warning");
      return;
    }

    try {
      const res = await approveCandidate(selectedCandidate.id, {
        employeeCode,
        departmentId: Number(departmentId),
        positionId: Number(positionId),
        roleName,
        status,
        idCardNumber: idCardNumber ? Number(idCardNumber) : undefined
      });

      if (res.success) {
        Swal.fire({
          title: "Phê duyệt thành công!",
          text: `Ứng viên ${selectedCandidate.name} đã trúng tuyển và được bổ nhiệm chính thức. Tài khoản đăng nhập đã được kích hoạt.`,
          icon: "success",
        });
        setShowCandidateModal(false);
        setSelectedCandidate(null);
        loadCandidates();
      } else {
        setCandidateErrors(extractServerErrors(res));
      }
    } catch (err: any) {
      if (err.response?.data) {
        setCandidateErrors(extractServerErrors(err.response.data));
      } else {
        setCandidateErrors({ global: err.message || "Đã xảy ra lỗi kết nối" });
      }
    }
  };

  const getStageBadgeClass = (stage: string) => {
    if (stage.includes("Trúng tuyển") || stage.includes("Đã chuyển đổi")) return "success";
    if (stage.includes("thành công") || stage.includes("Đề nghị") || stage.includes("OFFER")) return "pending";
    return "process";
  };

  // Pagination for Campaigns
  const totalPagesCampaigns = Math.max(1, Math.ceil(campaigns.length / itemsPerPage));
  const currentPageCampaignsSanitized = Math.min(currentPageCampaigns, totalPagesCampaigns);
  const startIndexCampaigns = (currentPageCampaignsSanitized - 1) * itemsPerPage;
  const paginatedCampaigns = campaigns.slice(startIndexCampaigns, startIndexCampaigns + itemsPerPage);

  // Pagination for Candidates
  const totalPagesCandidates = Math.max(1, Math.ceil(candidates.length / itemsPerPage));
  const currentPageCandidatesSanitized = Math.min(currentPageCandidates, totalPagesCandidates);
  const startIndexCandidates = (currentPageCandidatesSanitized - 1) * itemsPerPage;
  const paginatedCandidates = candidates.slice(startIndexCandidates, startIndexCandidates + itemsPerPage);

  return (
    <div className="recruitment-page page-container">
      <SectionHeader
        title="Quản lý tuyển dụng"
        subtitle="Quản lý chiến dịch tuyển dụng và phê duyệt ứng viên trúng tuyển"
        action={
          activeTab === "campaigns" ? (
            <button id="btn-add-campaign" className="btn btn-primary" onClick={openCreateCampaignModal}>
              + Thêm chiến dịch
            </button>
          ) : (
            <button id="btn-add-candidate" className="btn btn-primary" onClick={openAddCandidateModal} style={{ background: "#10b981", borderColor: "#10b981" }}>
              + Thêm ứng viên
            </button>
          )
        }
      />

      {/* Tab Switcher */}
      <div className="tabs-container">
        <button
          id="tab-campaigns"
          className={`tab-btn-item ${activeTab === "campaigns" ? "active-tab-item" : ""}`}
          onClick={() => setActiveTab("campaigns")}
        >
          Chiến dịch tuyển dụng
        </button>
        <button
          id="tab-candidates"
          className={`tab-btn-item ${activeTab === "candidates" ? "active-tab-item" : ""}`}
          onClick={() => setActiveTab("candidates")}
        >
          Xét chọn ứng viên
        </button>
      </div>

      {activeTab === "campaigns" ? (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {loadingCampaigns ? (
            <div className="loading-state">Đang tải dữ liệu chiến dịch...</div>
          ) : campaigns.length === 0 ? (
            <div className="empty-state">
              Chưa có chiến dịch tuyển dụng nào. Vui lòng thêm mới.
            </div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã chiến dịch</th>
                    <th>Vị trí tuyển dụng</th>
                    <th>Thông tin / Yêu cầu thêm</th>
                    <th>Số lượng tuyển</th>
                    <th>Hạn nộp hồ sơ</th>
                    <th style={{ textAlign: "center" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCampaigns.map((camp) => (
                    <tr key={camp.campaignId}>
                      <td style={{ fontWeight: 600, color: "var(--brand-dark)" }}>RC-{camp.campaignId}</td>
                      <td style={{ fontWeight: 550 }}>{camp.positionName || `Vị trí #${camp.positionId}`}</td>
                      <td>{camp.description || <em style={{ color: "#94a3b8" }}>Không có yêu cầu thêm</em>}</td>
                      <td>{camp.quantityNeeded} người</td>
                      <td>{camp.deadline}</td>
                      <td style={{ textAlign: "center" }}>
                        <div className="action-btn-group" style={{ justifyContent: "center" }}>
                          <button
                            id={`btn-edit-camp-${camp.campaignId}`}
                            className="table-action-btn"
                            onClick={() => openEditCampaignModal(camp)}
                            title="Sửa chiến dịch"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          <button
                            id={`btn-delete-camp-${camp.campaignId}`}
                            className="table-action-btn"
                            onClick={() => handleDeleteCampaign(camp.campaignId!)}
                            title="Xóa chiến dịch"
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
                currentPage={currentPageCampaignsSanitized}
                totalPages={totalPagesCampaigns}
                onPageChange={setCurrentPageCampaigns}
                totalItems={campaigns.length}
                showingCount={paginatedCampaigns.length}
                itemName="chiến dịch"
              />
            </>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {loadingCandidates ? (
            <div className="loading-state">Đang tải danh sách ứng viên...</div>
          ) : candidates.length === 0 ? (
            <div className="empty-state">
              Chưa có ứng viên nào ứng tuyển. Hãy thêm ứng viên mới để thử nghiệm phê duyệt.
            </div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã ứng viên</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Vị trí ứng tuyển</th>
                    <th>Trạng thái</th>
                    <th>Nguồn</th>
                    <th style={{ width: "160px", textAlign: "center" }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCandidates.map((candidate) => (
                    <tr key={candidate.id}>
                      <td style={{ fontWeight: 600, color: "var(--brand-dark)" }}>CAND-{candidate.id}</td>
                      <td style={{ fontWeight: 550 }}>{candidate.name}</td>
                      <td>{candidate.email}</td>
                      <td>{candidate.position}</td>
                      <td>
                        <span className={`stage-badge ${getStageBadgeClass(candidate.stage)}`}>
                          {candidate.stage}
                        </span>
                      </td>
                      <td>{candidate.source}</td>
                      <td style={{ textAlign: "center" }}>
                        {candidate.stage.includes("Trúng tuyển") || candidate.stage.includes("Đã chuyển đổi") ? (
                          <span style={{ fontSize: "12px", color: "var(--text-tertiary)", fontWeight: 600 }}>
                            ✓ Đã chuyển đổi
                          </span>
                        ) : (
                          <button
                            id={`btn-approve-candidate-${candidate.id}`}
                            className="btn btn-primary"
                            style={{ padding: "6px 12px", fontSize: "12.5px", background: "#10b981", borderColor: "#10b981" }}
                            onClick={() => handleOpenApproval(candidate)}
                          >
                            Phê duyệt
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination
                currentPage={currentPageCandidatesSanitized}
                totalPages={totalPagesCandidates}
                onPageChange={setCurrentPageCandidates}
                totalItems={candidates.length}
                showingCount={paginatedCandidates.length}
                itemName="ứng viên"
              />
            </>
          )}
        </div>
      )}

      {/* Campaign Create/Edit Modal */}
      {showCampaignModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2>{isEditCampaign ? "Sửa chiến dịch tuyển dụng" : "Thêm chiến dịch mới"}</h2>
              <button id="close-campaign-modal" className="close-btn" onClick={() => setShowCampaignModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCampaignSubmit} noValidate>
              {campaignErrors.global && (
                <div style={{ color: "#ef4444", backgroundColor: "#fee2e2", padding: "10px", borderRadius: "4px", marginBottom: "15px", fontSize: "13px", fontWeight: 500 }}>
                  {campaignErrors.global}
                </div>
              )}
              <div className="form-group">
                <label htmlFor="camp-position">Vị trí tuyển dụng <span style={{ color: "#ef4444" }}>*</span></label>
                <select
                  id="camp-position"
                  value={campaignPositionId}
                  onChange={(e) => setCampaignPositionId(parseInt(e.target.value))}
                  className={campaignErrors.positionId ? 'input-error-border' : ''}
                  required
                >
                  {positions.map((pos) => (
                    <option key={pos.positionId} value={pos.positionId}>
                      {pos.positionName}
                    </option>
                  ))}
                </select>
                {campaignErrors.positionId && (
                  <span className="error-message-text" style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{campaignErrors.positionId}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="camp-quantity">Số lượng cần tuyển <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  id="camp-quantity"
                  type="number"
                  value={quantityNeeded}
                  onChange={(e) => setQuantityNeeded(parseInt(e.target.value) || 1)}
                  className={campaignErrors.quantityNeeded ? 'input-error-border' : ''}
                  min="1"
                  required
                />
                {campaignErrors.quantityNeeded && (
                  <span className="error-message-text" style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{campaignErrors.quantityNeeded}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="camp-deadline">Hạn nộp hồ sơ <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  id="camp-deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className={campaignErrors.deadline ? 'input-error-border' : ''}
                  required
                />
                {campaignErrors.deadline && (
                  <span className="error-message-text" style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{campaignErrors.deadline}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="camp-description">Thông tin / Yêu cầu thêm</label>
                <textarea
                  id="camp-description"
                  value={campaignDescription}
                  onChange={(e) => setCampaignDescription(e.target.value)}
                  className={campaignErrors.description ? 'input-error-border' : ''}
                  placeholder="Nhập thông tin hoặc yêu cầu thêm cho chiến dịch..."
                  rows={3}
                  style={{
                    padding: "10px 14px",
                    border: "1.5px solid var(--border)",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    background: "#ffffff",
                    fontFamily: "inherit",
                    resize: "vertical"
                  }}
                />
                {campaignErrors.description && (
                  <span className="error-message-text" style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{campaignErrors.description}</span>
                )}
              </div>
              <div className="modal-footer" style={{ marginTop: "20px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCampaignModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">{isEditCampaign ? "Cập nhật" : "Tạo mới"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Candidate Modal */}
      {showAddCandidateModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h2>Thêm ứng viên ứng tuyển</h2>
              <button id="close-add-candidate-modal" className="close-btn" onClick={() => setShowAddCandidateModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleAddCandidateSubmit} noValidate>
              {addCandidateErrors.global && (
                <div style={{ color: "#ef4444", backgroundColor: "#fee2e2", padding: "10px", borderRadius: "4px", marginBottom: "15px", fontSize: "13px", fontWeight: 500 }}>
                  {addCandidateErrors.global}
                </div>
              )}
              <div className="form-group">
                <label htmlFor="cand-name">Họ và tên ứng viên <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  id="cand-name"
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={addCandidateFormData.candidateName}
                  onChange={(e) => setAddCandidateFormData({ ...addCandidateFormData, candidateName: e.target.value })}
                  className={addCandidateErrors.candidateName ? 'input-error-border' : ''}
                  required
                />
                {addCandidateErrors.candidateName && (
                  <span className="error-message-text" style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{addCandidateErrors.candidateName}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="cand-campaign">Ứng tuyển cho chiến dịch <span style={{ color: "#ef4444" }}>*</span></label>
                <select
                  id="cand-campaign"
                  value={addCandidateFormData.campaignId}
                  onChange={(e) => setAddCandidateFormData({ ...addCandidateFormData, campaignId: e.target.value })}
                  className={addCandidateErrors.campaignId ? 'input-error-border' : ''}
                  required
                >
                  {campaigns.map((camp) => (
                    <option key={camp.campaignId} value={camp.campaignId}>
                      RC-{camp.campaignId} — {camp.positionName}
                    </option>
                  ))}
                </select>
                {addCandidateErrors.campaignId && (
                  <span className="error-message-text" style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{addCandidateErrors.campaignId}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="cand-email">Địa chỉ Email</label>
                <input
                  id="cand-email"
                  type="email"
                  placeholder="nva@gmail.com"
                  value={addCandidateFormData.email}
                  onChange={(e) => setAddCandidateFormData({ ...addCandidateFormData, email: e.target.value })}
                  className={addCandidateErrors.email ? 'input-error-border' : ''}
                />
                {addCandidateErrors.email && (
                  <span className="error-message-text" style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{addCandidateErrors.email}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="cand-cv">Đường dẫn file CV (Link) <span style={{ color: "#ef4444" }}>*</span></label>
                <input
                  id="cand-cv"
                  type="url"
                  placeholder="https://drive.google.com/cv.pdf"
                  value={addCandidateFormData.cvFileUrl}
                  onChange={(e) => setAddCandidateFormData({ ...addCandidateFormData, cvFileUrl: e.target.value })}
                  className={addCandidateErrors.cvFileUrl ? 'input-error-border' : ''}
                  required
                />
                {addCandidateErrors.cvFileUrl && (
                  <span className="error-message-text" style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{addCandidateErrors.cvFileUrl}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="cand-source">Nguồn hồ sơ</label>
                <select
                  id="cand-source"
                  value={addCandidateFormData.source}
                  onChange={(e) => setAddCandidateFormData({ ...addCandidateFormData, source: e.target.value })}
                  className={addCandidateErrors.source ? 'input-error-border' : ''}
                >
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="VietnamWorks">VietnamWorks</option>
                  <option value="TopCV">TopCV</option>
                  <option value="Website công ty">Website công ty</option>
                  <option value="Referral">Referral (Giới thiệu)</option>
                </select>
                {addCandidateErrors.source && (
                  <span className="error-message-text" style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{addCandidateErrors.source}</span>
                )}
              </div>
              <div className="modal-footer" style={{ marginTop: "20px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddCandidateModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ background: "#10b981", borderColor: "#10b981" }}>Thêm ứng viên</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Candidate Approval & Profile Transition Modal */}
      {showCandidateModal && selectedCandidate && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: "550px" }}>
            <div className="modal-header">
              <h2>Phê duyệt & Tạo hồ sơ nhân sự</h2>
              <button id="close-approve-modal" className="close-btn" onClick={() => setShowCandidateModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleApproveSubmit} noValidate>
              {candidateErrors.global && (
                <div style={{ color: "#ef4444", backgroundColor: "#fee2e2", padding: "10px", borderRadius: "4px", marginBottom: "15px", fontSize: "13px", fontWeight: 500 }}>
                  {candidateErrors.global}
                </div>
              )}
              <div className="form-group">
                <label>Ứng viên phê duyệt</label>
                <input type="text" value={selectedCandidate.name} disabled style={{ fontWeight: "bold" }} />
              </div>
              <div className="form-group">
                <label>Email liên hệ</label>
                <input type="text" value={selectedCandidate.email || "Chưa cung cấp"} disabled />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label htmlFor="approve-emp-code">Mã nhân viên (Hồ sơ) <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    id="approve-emp-code"
                    type="text"
                    value={candidateFormData.employeeCode}
                    onChange={(e) => setCandidateFormData({ ...candidateFormData, employeeCode: e.target.value })}
                    className={candidateErrors.employeeCode ? 'input-error-border' : ''}
                    required
                  />
                  {candidateErrors.employeeCode && (
                    <span className="error-message-text" style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{candidateErrors.employeeCode}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="approve-dept">Phòng ban bổ nhiệm <span style={{ color: "#ef4444" }}>*</span></label>
                  <select
                    id="approve-dept"
                    value={candidateFormData.departmentId}
                    onChange={(e) => setCandidateFormData({ ...candidateFormData, departmentId: e.target.value })}
                    className={candidateErrors.departmentId ? 'input-error-border' : ''}
                    required
                  >
                    <option value="">-- Chọn phòng ban --</option>
                    {departments.map((dept) => (
                      <option key={dept.departmentId} value={dept.departmentId}>
                        {dept.departmentName} ({dept.departmentCode})
                      </option>
                    ))}
                  </select>
                  {candidateErrors.departmentId && (
                    <span className="error-message-text" style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{candidateErrors.departmentId}</span>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div className="form-group">
                  <label htmlFor="approve-role">Quyền hạn hệ thống (RBAC) <span style={{ color: "#ef4444" }}>*</span></label>
                  <select
                    id="approve-role"
                    value={candidateFormData.roleName}
                    onChange={(e) => setCandidateFormData({ ...candidateFormData, roleName: e.target.value })}
                    className={candidateErrors.roleName ? 'input-error-border' : ''}
                    required
                  >
                    <option value="EMPLOYEE">Employee (Nhân viên)</option>
                    <option value="MANAGER">Manager (Quản lý)</option>
                    <option value="HR">HR (Nhân sự)</option>
                    <option value="PAYROLL">Payroll (Kế toán lương)</option>
                    <option value="ADMIN">Admin (Quản trị viên)</option>
                  </select>
                  {candidateErrors.roleName && (
                    <span className="error-message-text" style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{candidateErrors.roleName}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="approve-status">Trạng thái làm việc <span style={{ color: "#ef4444" }}>*</span></label>
                  <select
                    id="approve-status"
                    value={candidateFormData.status}
                    onChange={(e) => setCandidateFormData({ ...candidateFormData, status: e.target.value })}
                    className={candidateErrors.status ? 'input-error-border' : ''}
                    required
                  >
                    <option value="Đang hoạt động">Đang hoạt động</option>
                    <option value="Đang thử việc">Đang thử việc</option>
                  </select>
                  {candidateErrors.status && (
                    <span className="error-message-text" style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{candidateErrors.status}</span>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "12px" }}>
                <div className="form-group">
                  <label htmlFor="approve-position">Chức vụ chuyên môn <span style={{ color: "#ef4444" }}>*</span></label>
                  <select
                    id="approve-position"
                    value={candidateFormData.positionId}
                    onChange={(e) => setCandidateFormData({ ...candidateFormData, positionId: e.target.value })}
                    className={candidateErrors.positionId ? 'input-error-border' : ''}
                    required
                  >
                    <option value="">-- Chọn chức vụ --</option>
                    {positions.map((pos) => (
                      <option key={pos.positionId} value={pos.positionId}>
                        {pos.positionName}
                      </option>
                    ))}
                  </select>
                  {candidateErrors.positionId && (
                    <span className="error-message-text" style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{candidateErrors.positionId}</span>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="approve-idcard">Số CCCD (Tùy chọn)</label>
                  <input
                    id="approve-idcard"
                    type="number"
                    value={candidateFormData.idCardNumber}
                    onChange={(e) => setCandidateFormData({ ...candidateFormData, idCardNumber: e.target.value })}
                    className={candidateErrors.idCardNumber ? 'input-error-border' : ''}
                    placeholder="Tự động sinh"
                  />
                  {candidateErrors.idCardNumber && (
                    <span className="error-message-text" style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>{candidateErrors.idCardNumber}</span>
                  )}
                </div>
              </div>

              <div className="modal-footer" style={{ marginTop: "25px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCandidateModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary" style={{ background: "#10b981", borderColor: "#10b981" }}>Phê duyệt trúng tuyển</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recruitment;
