import React from "react";
import type { AttendanceRecord } from "../../services/attendance.service";

interface AttendanceTodayProps {
  todayRecord: AttendanceRecord | null;
  onViewImage: (url: string, title: string) => void;
}

export const AttendanceToday: React.FC<AttendanceTodayProps> = ({
  todayRecord,
  onViewImage,
}) => {
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

  const formatShiftTime = (timeStr: string | null | undefined) => {
    if (!timeStr) return "--:--";
    return timeStr.slice(0, 5);
  };

  const getStatusBadgeClass = (status: string | undefined) => {
    if (!status) return "status-none";
    if (status.includes("Đúng giờ")) return "status-ontime";
    if (status.includes("Chưa")) return "status-missing";
    return "status-late-early";
  };

  return (
    <div className="attendance-today">
      <div className="section-title-wrap">
        <h4 className="section-title">Chi tiết hôm nay</h4>
      </div>

      {!todayRecord ? (
        <div className="no-record-box">
          <p>Hôm nay bạn chưa thực hiện chấm công nào.</p>
        </div>
      ) : (
        <>
          {/* Shift Info Banner */}
          {todayRecord.shiftName && (
            <div className="shift-info-banner">
              <div className="shift-info-icon">🕐</div>
              <div className="shift-info-details">
                <span className="shift-info-label">Ca làm việc</span>
                <span className="shift-info-value">
                  {todayRecord.shiftName}
                  <span className="shift-time-range">
                    {formatShiftTime(todayRecord.shiftStartTime)} – {formatShiftTime(todayRecord.shiftEndTime)}
                  </span>
                </span>
              </div>
            </div>
          )}

          <div className="today-grid">
            {/* Check In Detail */}
            <div className="detail-item">
              <div className="detail-header">
                <span className="item-label">Check In</span>
                <span className={`status-badge ${getStatusBadgeClass(todayRecord.status)}`}>
                  {todayRecord.lateMinutes > 0 ? `Muộn ${todayRecord.lateMinutes} phút` : "Đúng giờ"}
                </span>
              </div>
              <div className="detail-body">
                <span className="detail-time">{formatTime(todayRecord.checkInTime)}</span>
                {todayRecord.checkInImage ? (
                  <div 
                    className="image-preview-thumbnail" 
                    onClick={() => onViewImage(todayRecord.checkInImage!, "Ảnh Check In")}
                  >
                    <img src={todayRecord.checkInImage} alt="Check In" />
                    <div className="hover-overlay">
                      <span>🖼️ Xem ảnh</span>
                    </div>
                  </div>
                ) : (
                  <span className="no-image-text">Không có ảnh chụp</span>
                )}
              </div>
            </div>

            {/* Check Out Detail */}
            <div className="detail-item">
              <div className="detail-header">
                <span className="item-label">Check Out</span>
                <span className={`status-badge ${todayRecord.checkOutTime ? "status-ontime" : "status-missing"}`}>
                  {todayRecord.checkOutTime 
                    ? (todayRecord.earlyMinutes > 0 ? `Về sớm ${todayRecord.earlyMinutes} phút` : "Đúng giờ")
                    : "Chưa check-out"}
                </span>
              </div>
              <div className="detail-body">
                <span className="detail-time">{formatTime(todayRecord.checkOutTime)}</span>
                {todayRecord.checkOutImage ? (
                  <div 
                    className="image-preview-thumbnail" 
                    onClick={() => onViewImage(todayRecord.checkOutImage!, "Ảnh Check Out")}
                  >
                    <img src={todayRecord.checkOutImage} alt="Check Out" />
                    <div className="hover-overlay">
                      <span>🖼️ Xem ảnh</span>
                    </div>
                  </div>
                ) : (
                  <span className="no-image-text">Không có ảnh chụp</span>
                )}
              </div>
            </div>
          </div>

          {todayRecord.checkInTime && todayRecord.checkOutTime && (
            <div className="working-hours-stats" style={{
              marginTop: "16px",
              padding: "12px 16px",
              background: todayRecord.isFullWorkDay ? "#ecfdf5" : "#fffbeb",
              border: `1.5px solid ${todayRecord.isFullWorkDay ? "#a7f3d0" : "#fde68a"}`,
              borderRadius: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: todayRecord.isFullWorkDay ? "#065f46" : "#78350f" }}>
                ⏱️ Tổng giờ làm: {todayRecord.actualHours ? todayRecord.actualHours.toFixed(2) : "0.00"} giờ
              </span>
              <span style={{
                fontSize: "11px",
                fontWeight: 800,
                padding: "4px 10px",
                borderRadius: "20px",
                background: todayRecord.isFullWorkDay ? "#d1fae5" : "#fef3c7",
                color: todayRecord.isFullWorkDay ? "#065f46" : "#92400e"
              }}>
                {todayRecord.isFullWorkDay ? "ĐỦ GIỜ CA" : "THIẾU GIỜ CA"}
              </span>
            </div>
          )}
        </>
      )}

      <style>{`
        .attendance-today {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.01);
          height: 100%;
        }

        .section-title-wrap {
          margin-bottom: 20px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 12px;
        }

        .section-title {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
        }

        .no-record-box {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 180px;
          background: #f8fafc;
          border-radius: 12px;
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
          border: 1px dashed #cbd5e1;
        }

        /* Shift Info Banner */
        .shift-info-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #eff6ff, #e0e7ff);
          border: 1px solid #c7d2fe;
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .shift-info-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .shift-info-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .shift-info-label {
          font-size: 11px;
          font-weight: 600;
          color: #6366f1;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .shift-info-value {
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .shift-time-range {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          font-weight: 600;
          color: #4f46e5;
          background: rgba(99, 102, 241, 0.1);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .today-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 600px) {
          .today-grid {
            grid-template-columns: 1fr;
          }
        }

        .detail-item {
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .item-label {
          font-size: 13px;
          font-weight: 700;
          color: #334155;
          text-transform: uppercase;
        }

        .status-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 8px;
        }

        .status-none {
          background: #f1f5f9;
          color: #64748b;
        }

        .status-ontime {
          background: #d1fae5;
          color: #065f46;
        }

        .status-missing {
          background: #fef3c7;
          color: #92400e;
        }

        .status-late-early {
          background: #fee2e2;
          color: #991b1b;
        }

        .detail-body {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .detail-time {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
        }

        .image-preview-thumbnail {
          width: 70px;
          height: 70px;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }

        .image-preview-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1); /* Keep mirror view */
        }

        .hover-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .image-preview-thumbnail:hover .hover-overlay {
          opacity: 1;
        }

        .hover-overlay span {
          color: #ffffff;
          font-size: 9px;
          font-weight: 600;
          white-space: nowrap;
        }

        .no-image-text {
          font-size: 12px;
          color: #94a3b8;
          font-style: italic;
        }
      `}</style>
    </div>
  );
};
