import React, { useState } from "react";
import type { AttendanceRecord } from "../../services/attendance.service";
import Pagination from "../../components/common/Pagination";

interface AttendanceHistoryProps {
  records: AttendanceRecord[];
  onViewImage: (url: string, title: string) => void;
}

export const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({
  records,
  onViewImage,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
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
      return <span className="history-badge badge-warning">Chưa check-out</span>;
    }
    if (isLate && isEarly) {
      return <span className="history-badge badge-danger">Trễ & Về sớm</span>;
    }
    if (isLate) {
      return <span className="history-badge badge-danger">Trễ {record.lateMinutes}m</span>;
    }
    if (isEarly) {
      return <span className="history-badge badge-danger">Về sớm {record.earlyMinutes}m</span>;
    }
    return <span className="history-badge badge-success">Đúng giờ</span>;
  };

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(records.length / itemsPerPage));
  const currentPageSanitized = Math.min(currentPage, totalPages);
  const startIndex = (currentPageSanitized - 1) * itemsPerPage;
  const paginatedRecords = records.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="attendance-history card">
      <div className="history-header">
        <h3 className="history-title">Lịch sử chấm công</h3>
        <span className="history-count">Tổng: {records.length} ngày</span>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Ca làm việc</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Trạng thái</th>
              <th>Ảnh Check In</th>
              <th>Ảnh Check Out</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-table-cell">
                  Không có lịch sử chấm công
                </td>
              </tr>
            ) : (
              paginatedRecords.map((record) => (
                <tr key={record.attendanceId}>
                  <td className="date-cell">{formatDate(record.workDate)}</td>
                  <td>
                    {record.shiftName ? (
                      <div className="shift-cell">
                        <span className="shift-name-tag">{record.shiftName}</span>
                        <span className="shift-time-tag">
                          {record.shiftStartTime ? record.shiftStartTime.slice(0, 5) : '--:--'} – {record.shiftEndTime ? record.shiftEndTime.slice(0, 5) : '--:--'}
                        </span>
                      </div>
                    ) : (
                      <span className="no-img-label">—</span>
                    )}
                  </td>
                  <td className="time-cell">{formatTime(record.checkInTime)}</td>
                  <td className="time-cell">{formatTime(record.checkOutTime)}</td>
                  <td>{getStatusBadge(record)}</td>
                  <td>
                    {record.checkInImage ? (
                      <button
                        className="view-img-btn"
                        onClick={() => onViewImage(record.checkInImage!, `Ảnh Check In ngày ${formatDate(record.workDate)}`)}
                      >
                        🖼️ Xem ảnh
                      </button>
                    ) : (
                      <span className="no-img-label">—</span>
                    )}
                  </td>
                  <td>
                    {record.checkOutImage ? (
                      <button
                        className="view-img-btn"
                        onClick={() => onViewImage(record.checkOutImage!, `Ảnh Check Out ngày ${formatDate(record.workDate)}`)}
                      >
                        🖼️ Xem ảnh
                      </button>
                    ) : (
                      <span className="no-img-label">—</span>
                    )}
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
          totalItems={records.length}
          showingCount={paginatedRecords.length}
          itemName="ngày chấm công"
        />
      </div>

      <style>{`
        .attendance-history {
          margin-top: 16px;
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .history-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
        }

        .history-count {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          background: #f1f5f9;
          padding: 4px 10px;
          border-radius: 20px;
        }

        .table-responsive {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .empty-table-cell {
          text-align: center;
          color: #94a3b8;
          padding: 32px !important;
          font-style: italic;
        }

        .date-cell {
          font-weight: 600;
          color: #334155;
        }

        .time-cell {
          font-weight: 500;
          color: #475569;
        }

        .history-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .badge-success {
          background: #d1fae5;
          color: #065f46;
        }

        .badge-warning {
          background: #fef3c7;
          color: #92400e;
        }

        .badge-danger {
          background: #fee2e2;
          color: #991b1b;
        }

        .view-img-btn {
          background: transparent;
          border: 1px solid #cbd5e1;
          color: #0ea5e9;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .view-img-btn:hover {
          background: #f0f9ff;
          border-color: #0ea5e9;
          color: #0284c7;
        }

        .no-img-label {
          color: #94a3b8;
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
      `}</style>
    </div>
  );
};
