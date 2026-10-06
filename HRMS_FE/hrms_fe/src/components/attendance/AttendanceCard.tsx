import React from "react";
import { AttendanceButton } from "./AttendanceButton";
import type { AttendanceRecord } from "../../services/attendance.service";
import type { ShiftAssignmentItem } from "../../api/endpoints/shifts-assignment.api";

interface AttendanceCardProps {
  todayRecord: AttendanceRecord | null;
  onActionClick: (mode: 'check-in' | 'check-out') => void;
  loading: boolean;
  selectedShiftCode: string;
  onShiftChange: (code: string) => void;
  myShiftsToday: ShiftAssignmentItem[];
}

export const AttendanceCard: React.FC<AttendanceCardProps> = ({
  todayRecord,
  onActionClick,
  loading,
  selectedShiftCode,
  onShiftChange,
  myShiftsToday,
}) => {
  const hasCheckedIn = !!todayRecord?.checkInTime;
  const hasCheckedOut = !!todayRecord?.checkOutTime;

  // Trả về thời gian định dạng HH:mm từ chuỗi ISO
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

  const getTodayDateString = () => {
    const today = new Date();
    return today.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Xác định xem chế độ hiện tại là check-in hay check-out
  const currentMode = !hasCheckedIn ? "check-in" : "check-out";
  const isButtonDisabled = (myShiftsToday.length === 0) || (hasCheckedIn && hasCheckedOut);

  return (
    <div className="attendance-card">
      <div className="card-header">
        <span className="card-badge">Hôm nay</span>
        <h3 className="card-date">{getTodayDateString()}</h3>
      </div>

      <div className="card-body">
        {myShiftsToday.length > 0 ? (
          <div className="shift-select-box">
            <label className="shift-label">Ca chấm công hôm nay</label>
            <select
              value={selectedShiftCode}
              onChange={(e) => onShiftChange(e.target.value)}
              className="shift-select"
            >
              {myShiftsToday.map((item) => (
                <option key={item.shiftCode} value={item.shiftCode}>
                  {item.shiftName} ({item.startTime.slice(0, 5)} - {item.endTime.slice(0, 5)})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="no-shifts-alert">
            ⚠️ Bạn chưa được phân ca làm việc cho hôm nay.
          </div>
        )}

        <div className="time-col">
          <div className="time-block">
            <span className="time-label">Check In</span>
            <span className={`time-value ${hasCheckedIn ? "value-active" : ""}`}>
              {formatTime(todayRecord?.checkInTime)}
            </span>
          </div>
          <div className="time-divider" />
          <div className="time-block">
            <span className="time-label">Check Out</span>
            <span className={`time-value ${hasCheckedOut ? "value-active" : ""}`}>
              {formatTime(todayRecord?.checkOutTime)}
            </span>
          </div>
        </div>

        <div className="action-row">
          {isButtonDisabled ? (
            <div className="complete-banner">
              <span className="complete-icon">🎉</span>
              Bạn đã hoàn thành chấm công ngày hôm nay!
            </div>
          ) : (
            <AttendanceButton
              mode={currentMode}
              onClick={() => onActionClick(currentMode)}
              disabled={loading}
            />
          )}
        </div>
      </div>

      <style>{`
        .attendance-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.02), 0 4px 6px -2px rgba(0, 0, 0, 0.02), inset 0 1px 0 rgba(255,255,255,0.6);
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
        }

        .attendance-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #0ea5e9 0%, #10b981 100%);
        }

        .card-header {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 24px;
        }

        .card-badge {
          align-self: flex-start;
          background: #f0f9ff;
          color: #0369a1;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .card-date {
          margin: 0;
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          text-transform: capitalize;
        }

        .card-body {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .time-col {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          padding: 20px;
        }

        .time-block {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .time-divider {
          width: 1px;
          height: 40px;
          background: #e2e8f0;
        }

        .time-label {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .time-value {
          font-size: 24px;
          font-weight: 800;
          color: #cbd5e1;
        }

        .value-active {
          color: #0f172a;
          animation: scaleUpText 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .action-row {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .complete-banner {
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #065f46;
          border-radius: 12px;
          padding: 14px 20px;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          justify-content: center;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .complete-icon {
          font-size: 18px;
        }

        .shift-select-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .shift-label {
          font-size: 11px;
          font-weight: 700;
          color: #6366f1;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .shift-select {
          width: 100%;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
          cursor: pointer;
          transition: all 0.2s;
          outline: none;
        }

        .shift-select:focus {
          border-color: #6366f1;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .no-shifts-alert {
          background: #fee2e2;
          border: 1px solid #fecaca;
          color: #991b1b;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          text-align: center;
        }

        @keyframes scaleUpText {
          from { transform: scale(0.8); }
          to { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};
