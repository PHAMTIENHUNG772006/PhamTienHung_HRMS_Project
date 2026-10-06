import React, { useState, useEffect } from "react";
import SectionHeader from "../../components/common/SectionHeader";
import { getPayrolls, runPayrollCalculation, updatePayrollStatus } from "../../api/endpoints/payroll.api";
import type { PayrollItem } from "../../api/endpoints/payroll.api";
import Swal from "sweetalert2";
import Pagination from "../../components/common/Pagination";

const Payroll: React.FC = () => {
  const [payrolls, setPayrolls] = useState<PayrollItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState("2026-07");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadPayrolls = async () => {
    setLoading(true);
    try {
      const res = await getPayrolls();
      if (res.success) {
        setPayrolls(res.data || []);
      } else {
        Swal.fire("Lỗi", res.message || "Không thể tải bảng lương", "error");
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire("Lỗi", "Lỗi kết nối máy chủ khi tải bảng lương", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayrolls();
  }, []);

  const handleCalculate = async () => {
    const periodDisplay = formatPeriod(selectedPeriod);
    const confirmResult = await Swal.fire({
      title: "Tính lương tự động?",
      text: `Hệ thống sẽ tính toán bảng lương cho tất cả nhân viên đang hoạt động trong kỳ lương [${periodDisplay}].`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Tính lương",
      cancelButtonText: "Hủy",
      confirmButtonColor: "var(--brand)",
    });

    if (confirmResult.isConfirmed) {
      try {
        Swal.fire({
          title: "Đang tính toán lương...",
          html: "Vui lòng đợi trong giây lát",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const res = await runPayrollCalculation(selectedPeriod);
        if (res.success) {
          Swal.fire("Thành công", `Đã tính toán bảng lương kỳ ${periodDisplay} thành công!`, "success");
          loadPayrolls();
        } else {
          Swal.fire("Thất bại", res.message || "Tính lương thất bại", "error");
        }
      } catch (err: any) {
        Swal.fire("Lỗi", err.response?.data?.message || err.message || "Đã xảy ra lỗi khi tính lương", "error");
      }
    }
  };

  const handleRelease = async (id: number) => {
    const confirmResult = await Swal.fire({
      title: "Xác nhận phát lương?",
      text: "Đánh dấu bảng lương này là đã phát lương cho nhân viên?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Phát lương",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#10b981",
    });

    if (confirmResult.isConfirmed) {
      try {
        const res = await updatePayrollStatus(id, "Đã phát");
        if (res.success) {
          Swal.fire("Thành công", "Đã cập nhật trạng thái phát lương!", "success");
          loadPayrolls();
        } else {
          Swal.fire("Thất bại", res.message || "Cập nhật trạng thái thất bại", "error");
        }
      } catch (err: any) {
        Swal.fire("Lỗi", err.response?.data?.message || err.message || "Đã xảy ra lỗi", "error");
      }
    }
  };

  const formatPeriod = (p: string) => {
    if (!p) return "";
    if (p.includes("Tháng")) return p;
    const parts = p.split("-");
    if (parts.length === 2) {
      return `Tháng ${parts[1]}/${parts[0]}`;
    }
    return p;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const getStatusBadgeClass = (status: string) => {
    return status === "Đã phát" ? "status-active" : "status-pending";
  };

  // Reset page when period changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPeriod]);

  // Pagination calculations
  const filteredPayrolls = payrolls.filter((p) => p.salaryPeriod === selectedPeriod);
  const totalPages = Math.max(1, Math.ceil(filteredPayrolls.length / itemsPerPage));
  const currentPageSanitized = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSanitized - 1) * itemsPerPage;
  const paginatedPayrolls = filteredPayrolls.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="page-container">
      <SectionHeader
        title="Chấm lương"
        subtitle="Theo dõi bảng lương và trạng thái phát lương của nhân viên"
      />

      <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <label style={{ fontSize: "13px", fontWeight: 550, color: "#4b5563" }}>Chọn kỳ tính lương:</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}
          >
            <option value="2026-07">Tháng 07/2026</option>
            <option value="2026-06">Tháng 06/2026</option>
            <option value="2026-05">Tháng 05/2026</option>
          </select>
        </div>
        <button
          className="btn btn-primary"
          style={{ alignSelf: "flex-end", height: "38px" }}
          onClick={handleCalculate}
        >
          Tính lương tự động
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px" }}>Đang tải bảng lương...</div>
        ) : filteredPayrolls.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            Không có bảng lương nào được tính. Vui lòng bấm "Tính lương tự động".
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã bảng lương</th>
                  <th>Nhân viên</th>
                  <th>Kỳ lương</th>
                  <th>Lương cơ bản</th>
                  <th>Thực nhận (Sau thuế)</th>
                  <th>Trạng thái</th>
                  <th style={{ textAlign: "center" }}>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayrolls.map((item) => (
                  <tr key={item.payrollId}>
                    <td style={{ fontWeight: 600, color: "var(--brand-dark)" }}>PR-0{item.payrollId}</td>
                    <td style={{ fontWeight: 550 }}>{item.employeeName || `Nhân viên #${item.employeeId}`}</td>
                    <td>{formatPeriod(item.salaryPeriod)}</td>
                    <td>{formatCurrency(item.basicSalary)}</td>
                    <td style={{ fontWeight: 600, color: "#10b981" }}>{formatCurrency(item.netSalary)}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                      {item.status === "Chờ phát" ? (
                        <button
                          className="btn btn-primary"
                          style={{ padding: "4px 10px", fontSize: "12px", background: "#10b981", borderColor: "#10b981" }}
                          onClick={() => handleRelease(item.payrollId!)}
                        >
                          Phát lương
                        </button>
                      ) : (
                        <span style={{ color: "#9ca3af", fontSize: "12px", fontStyle: "italic" }}>Đã hoàn thành</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              currentPage={currentPageSanitized}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredPayrolls.length}
              showingCount={paginatedPayrolls.length}
              itemName="bản ghi lương"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Payroll;
