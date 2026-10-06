import React, { useEffect, useState, useMemo } from "react";
import SectionHeader from "../../components/common/SectionHeader";
import { getAllAttendances } from "../../services/attendance.service";
import type { AttendanceRecord } from "../../services/attendance.service";
import Swal from "sweetalert2";
import Pagination from "../../components/common/Pagination";

type FilterMode = "day" | "month";

export const AdminAttendancePage: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>("day");
  const [searchQuery, setSearchQuery] = useState("");

  // Image viewer states
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);
  const [viewImageTitle, setViewImageTitle] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Date helpers
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getLocalMonthString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [selectedMonth, setSelectedMonth] = useState(getLocalMonthString());

  const getDateRange = (): { startDate: string; endDate: string } => {
    if (filterMode === "day") {
      return { startDate: selectedDate, endDate: selectedDate };
    } else {
      // Month mode: first day to last day
      const [year, month] = selectedMonth.split("-").map(Number);
      const firstDay = `${year}-${String(month).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month, 0).getDate();
      const lastDayStr = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      return { startDate: firstDay, endDate: lastDayStr };
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();
      const res = await getAllAttendances(startDate, endDate);
      if (res.success && res.data) {
        setRecords(res.data);
      }
    } catch (err: any) {
      console.error("Lỗi khi tải dữ liệu chấm công:", err);
      Swal.fire({
        icon: "error",
        title: "Lỗi tải dữ liệu",
        text: err?.response?.data?.message || "Không thể tải dữ liệu chấm công.",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate, selectedMonth, filterMode]);

  // Filtered records by search
  const filteredRecords = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const q = searchQuery.toLowerCase();
    return records.filter(
      (r) =>
        r.employeeName?.toLowerCase().includes(q) ||
        r.shiftName?.toLowerCase().includes(q) ||
        String(r.employeeId).includes(q)
    );
  }, [records, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / rowsPerPage));
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDate, selectedMonth, filterMode]);

  // Stats
  const stats = useMemo(() => {
    const total = records.length;
    const onTime = records.filter((r) => r.lateMinutes === 0 && r.earlyMinutes === 0 && r.checkOutTime).length;
    const late = records.filter((r) => r.lateMinutes > 0).length;
    const early = records.filter((r) => r.earlyMinutes > 0).length;
    const missingCheckout = records.filter((r) => !r.checkOutTime).length;
    return { total, onTime, late, early, missingCheckout };
  }, [records]);

  // Format helpers
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

  const formatTime = (timeStr: string | null | undefined) => {
    if (!timeStr) return "--:--";
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      return "--:--";
    }
  };

  const getStatusBadge = (record: AttendanceRecord) => {
    const isMissingCheckout = !record.checkOutTime;
    const isLate = record.lateMinutes > 0;
    const isEarly = record.earlyMinutes > 0;

    if (isMissingCheckout) {
      return <span className="admin-att-badge badge-warning">Chưa checkout</span>;
    }
    if (isLate && isEarly) {
      return <span className="admin-att-badge badge-danger">Trễ & Về sớm</span>;
    }
    if (isLate) {
      return <span className="admin-att-badge badge-danger">Trễ {record.lateMinutes}p</span>;
    }
    if (isEarly) {
      return <span className="admin-att-badge badge-danger">Về sớm {record.earlyMinutes}p</span>;
    }
    return <span className="admin-att-badge badge-success">Đúng giờ</span>;
  };

  const handleViewImage = (url: string, title: string) => {
    setViewImageUrl(url);
    setViewImageTitle(title);
  };

  const closeImageViewer = () => {
    setViewImageUrl(null);
  };

  const handleToday = () => {
    setFilterMode("day");
    setSelectedDate(getLocalDateString());
  };

  const getFilterLabel = () => {
    if (filterMode === "day") {
      return formatDate(selectedDate);
    } else {
      const [year, month] = selectedMonth.split("-");
      return `Tháng ${month}/${year}`;
    }
  };

  return (
    <div className="page-container">
      <SectionHeader
        title="Quản lý chấm công"
        subtitle="Theo dõi và giám sát toàn bộ lịch sử chấm công nhân viên."
      />

      {/* Stat Cards */}
      <div className="admin-att-stats-grid">
        <div className="admin-att-stat-card stat-total">
          <div className="stat-icon-wrap stat-icon-total">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-text-wrap">
            <span className="admin-stat-value">{stats.total}</span>
            <span className="admin-stat-label">Tổng bản ghi</span>
          </div>
        </div>
        <div className="admin-att-stat-card stat-ontime">
          <div className="stat-icon-wrap stat-icon-ontime">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="stat-text-wrap">
            <span className="admin-stat-value">{stats.onTime}</span>
            <span className="admin-stat-label">Đúng giờ</span>
          </div>
        </div>
        <div className="admin-att-stat-card stat-late">
          <div className="stat-icon-wrap stat-icon-late">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="stat-text-wrap">
            <span className="admin-stat-value">{stats.late}</span>
            <span className="admin-stat-label">Đi trễ</span>
          </div>
        </div>
        <div className="admin-att-stat-card stat-missing">
          <div className="stat-icon-wrap stat-icon-missing">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className="stat-text-wrap">
            <span className="admin-stat-value">{stats.missingCheckout}</span>
            <span className="admin-stat-label">Chưa checkout</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="admin-att-filter-bar card">
        <div className="filter-left">
          <div className="filter-mode-toggle">
            <button
              className={`mode-btn ${filterMode === "day" ? "active" : ""}`}
              onClick={() => setFilterMode("day")}
            >
              📅 Theo ngày
            </button>
            <button
              className={`mode-btn ${filterMode === "month" ? "active" : ""}`}
              onClick={() => setFilterMode("month")}
            >
              🗓️ Theo tháng
            </button>
          </div>

          {filterMode === "day" ? (
            <input
              type="date"
              className="filter-date-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          ) : (
            <input
              type="month"
              className="filter-date-input"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          )}

          <button className="today-btn" onClick={handleToday}>
            Hôm nay
          </button>
        </div>

        <div className="filter-right">
          <div className="filter-search-wrap">
            <svg className="filter-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Tìm theo tên nhân viên..."
              className="filter-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <span className="filter-result-label">
            {getFilterLabel()} — {filteredRecords.length} bản ghi
          </span>
        </div>
      </div>

      {/* Data Table */}
      <div className="admin-att-table-card card">
        {loading ? (
          <div className="admin-att-loading">
            <div className="loading-spinner" />
            <span>Đang tải dữ liệu...</span>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table admin-att-table">
                <thead>
                  <tr>
                    <th>Nhân viên</th>
                    <th>Ngày</th>
                    <th>Ca làm</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Giờ làm</th>
                    <th>Trạng thái</th>
                    <th>Ảnh Check In</th>
                    <th>Ảnh Check Out</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="empty-table-cell">
                        <div className="empty-state">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <p>Không có dữ liệu chấm công cho khoảng thời gian này</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((record) => (
                      <tr key={record.attendanceId}>
                        <td>
                          <div className="employee-cell">
                            <div className="emp-avatar">
                              {record.employeeName ? record.employeeName[0].toUpperCase() : "?"}
                            </div>
                            <div className="emp-info">
                              <span className="emp-name">{record.employeeName || "—"}</span>
                              <span className="emp-id">ID: {record.employeeId}</span>
                            </div>
                          </div>
                        </td>
                        <td className="date-cell">{formatDate(record.workDate)}</td>
                        <td>
                          {record.shiftName ? (
                            <div className="shift-cell">
                              <span className="shift-name-tag">{record.shiftName}</span>
                              <span className="shift-time-tag">
                                {record.shiftStartTime ? record.shiftStartTime.slice(0, 5) : "--:--"} – {record.shiftEndTime ? record.shiftEndTime.slice(0, 5) : "--:--"}
                              </span>
                            </div>
                          ) : (
                            <span className="no-data-label">—</span>
                          )}
                        </td>
                        <td className="time-cell">{formatTime(record.checkInTime)}</td>
                        <td className="time-cell">{formatTime(record.checkOutTime)}</td>
                        <td className="hours-cell">
                          {record.actualHours != null ? (
                            <span className={`hours-value ${record.isFullWorkDay ? "hours-full" : "hours-short"}`}>
                              {record.actualHours.toFixed(1)}h
                            </span>
                          ) : (
                            <span className="no-data-label">—</span>
                          )}
                        </td>
                        <td>{getStatusBadge(record)}</td>
                        <td>
                          {record.checkInImage ? (
                            <div
                              className="admin-img-thumbnail"
                              onClick={() => handleViewImage(record.checkInImage!, `Ảnh Check In — ${record.employeeName} — ${formatDate(record.workDate)}`)}
                            >
                              <img src={record.checkInImage} alt="Check In" />
                              <div className="img-hover-overlay">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </div>
                            </div>
                          ) : (
                            <span className="no-data-label">—</span>
                          )}
                        </td>
                        <td>
                          {record.checkOutImage ? (
                            <div
                              className="admin-img-thumbnail"
                              onClick={() => handleViewImage(record.checkOutImage!, `Ảnh Check Out — ${record.employeeName} — ${formatDate(record.workDate)}`)}
                            >
                              <img src={record.checkOutImage} alt="Check Out" />
                              <div className="img-hover-overlay">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                  <circle cx="12" cy="12" r="3" />
                                </svg>
                              </div>
                            </div>
                          ) : (
                            <span className="no-data-label">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredRecords.length}
              showingCount={paginatedRecords.length}
              itemName="bản ghi chấm công"
            />
          </>
        )}
      </div>

      {/* Image Viewer Modal */}
      {viewImageUrl && (
        <div className="admin-image-viewer-overlay" onClick={closeImageViewer}>
          <div className="admin-image-viewer-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-viewer-header">
              <h4>{viewImageTitle}</h4>
              <button className="close-viewer-btn" onClick={closeImageViewer}>&times;</button>
            </div>
            <div className="admin-viewer-body">
              <img src={viewImageUrl} alt={viewImageTitle} className="admin-full-viewer-image" />
            </div>
          </div>
        </div>
      )}

      <style>{`
        /* ====== Stat Cards ====== */
        .admin-att-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        @media (max-width: 1100px) {
          .admin-att-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .admin-att-stats-grid {
            grid-template-columns: 1fr;
          }
        }

        .admin-att-stat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px 22px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .admin-att-stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
        }

        .stat-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-icon-total {
          background: linear-gradient(135deg, #e0f2fe, #bae6fd);
          color: #0284c7;
        }

        .stat-icon-ontime {
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
          color: #16a34a;
        }

        .stat-icon-late {
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          color: #d97706;
        }

        .stat-icon-missing {
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          color: #dc2626;
        }

        .stat-text-wrap {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .admin-stat-value {
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
        }

        .admin-stat-label {
          font-size: 13px;
          font-weight: 550;
          color: #64748b;
        }

        /* ====== Filter Bar ====== */
        .admin-att-filter-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          padding: 16px 24px;
        }

        .filter-left {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-mode-toggle {
          display: flex;
          background: #f1f5f9;
          border-radius: 10px;
          padding: 3px;
          gap: 2px;
        }

        .mode-btn {
          background: transparent;
          border: none;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .mode-btn.active {
          background: #ffffff;
          color: #0284c7;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        .mode-btn:hover:not(.active) {
          color: #334155;
        }

        .filter-date-input {
          padding: 8px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #0f172a;
          background: #ffffff;
          outline: none;
          transition: border-color 0.2s ease;
          font-family: inherit;
        }

        .filter-date-input:focus {
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
        }

        .today-btn {
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          color: #ffffff;
          border: none;
          padding: 8px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .today-btn:hover {
          background: linear-gradient(135deg, #0284c7, #0369a1);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
        }

        .filter-right {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .filter-search-wrap {
          position: relative;
        }

        .filter-search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
        }

        .filter-search-input {
          padding: 8px 14px 8px 38px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 13px;
          color: #0f172a;
          background: #f8fafc;
          outline: none;
          min-width: 220px;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .filter-search-input:focus {
          border-color: #0ea5e9;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
        }

        .filter-result-label {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          background: #f1f5f9;
          padding: 6px 12px;
          border-radius: 20px;
          white-space: nowrap;
        }

        /* ====== Data Table ====== */
        .admin-att-table-card {
          padding: 0;
          overflow: hidden;
        }

        .admin-att-table-card .table-responsive {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .admin-att-table th {
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .employee-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .emp-avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
          color: #4338ca;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .emp-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .emp-name {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          white-space: nowrap;
        }

        .emp-id {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 500;
        }

        .date-cell {
          font-weight: 600;
          color: #334155;
          white-space: nowrap;
        }

        .time-cell {
          font-weight: 600;
          color: #475569;
          font-family: 'Courier New', monospace;
          font-size: 13px;
        }

        .shift-cell {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .shift-name-tag {
          font-size: 12px;
          font-weight: 700;
          color: #3730a3;
          background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
          padding: 2px 8px;
          border-radius: 4px;
          display: inline-block;
          width: fit-content;
        }

        .shift-time-tag {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
        }

        .hours-cell .hours-value {
          font-size: 13px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .hours-full {
          background: #dcfce7;
          color: #166534;
        }

        .hours-short {
          background: #fef3c7;
          color: #92400e;
        }

        .no-data-label {
          color: #cbd5e1;
          font-weight: 500;
        }

        /* Status Badges */
        .admin-att-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 8px;
          white-space: nowrap;
        }

        .badge-success {
          background: #dcfce7;
          color: #166534;
        }

        .badge-warning {
          background: #fef3c7;
          color: #92400e;
        }

        .badge-danger {
          background: #fee2e2;
          color: #991b1b;
        }

        /* ====== Image Thumbnails ====== */
        .admin-img-thumbnail {
          width: 50px;
          height: 50px;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          border: 2px solid #f1f5f9;
          transition: all 0.2s ease;
          display: inline-block;
        }

        .admin-img-thumbnail:hover {
          border-color: #0ea5e9;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.2);
          transform: scale(1.08);
        }

        .admin-img-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1);
        }

        .img-hover-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
          color: #ffffff;
        }

        .admin-img-thumbnail:hover .img-hover-overlay {
          opacity: 1;
        }

        /* ====== Empty State ====== */
        .empty-table-cell {
          text-align: center;
          padding: 48px 16px !important;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .empty-state p {
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
          margin: 0;
        }

        /* ====== Loading ====== */
        .admin-att-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 24px;
          gap: 16px;
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
        }

        .loading-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid #e2e8f0;
          border-top-color: #0ea5e9;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ====== Pagination ====== */
        .admin-att-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
        }

        .pagination-btn {
          background: transparent;
          border: 1px solid #e2e8f0;
          color: #475569;
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #f0f9ff;
          border-color: #0ea5e9;
          color: #0284c7;
        }

        .pagination-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .pagination-pages {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .pagination-page-btn {
          background: transparent;
          border: none;
          color: #64748b;
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
          min-width: 32px;
        }

        .pagination-page-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .pagination-page-btn.active {
          background: #0ea5e9;
          color: #ffffff;
        }

        .pagination-ellipsis {
          color: #94a3b8;
          padding: 0 4px;
          font-size: 14px;
        }

        /* ====== Image Viewer Modal ====== */
        .admin-image-viewer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.85);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(5px);
          animation: adminFadeIn 0.2s ease-out;
        }

        @keyframes adminFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .admin-image-viewer-content {
          background: #ffffff;
          border-radius: 20px;
          max-width: 640px;
          width: 92%;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
          animation: adminScaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes adminScaleUp {
          from { transform: scale(0.92); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        .admin-viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .admin-viewer-header h4 {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
        }

        .close-viewer-btn {
          background: none;
          border: none;
          font-size: 28px;
          color: #94a3b8;
          cursor: pointer;
          line-height: 1;
          transition: color 0.15s ease;
        }

        .close-viewer-btn:hover {
          color: #0f172a;
        }

        .admin-viewer-body {
          padding: 24px;
          background: #f8fafc;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .admin-full-viewer-image {
          max-width: 100%;
          max-height: 70vh;
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.12);
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};
