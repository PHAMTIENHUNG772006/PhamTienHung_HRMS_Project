import React from "react";

interface AttendanceButtonProps {
  mode: 'check-in' | 'check-out';
  onClick: () => void;
  disabled?: boolean;
}

export const AttendanceButton: React.FC<AttendanceButtonProps> = ({
  mode,
  onClick,
  disabled = false,
}) => {
  const isCheckIn = mode === 'check-in';

  return (
    <button
      className={`attendance-action-btn ${isCheckIn ? 'check-in-mode' : 'check-out-mode'}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="btn-icon">{isCheckIn ? "🚀" : "🏁"}</span>
      <span className="btn-text">
        {isCheckIn ? "CHECK IN" : "CHECK OUT"}
      </span>
      <style>{`
        .attendance-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.05em;
          padding: 14px 28px;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          position: relative;
          overflow: hidden;
          width: 100%;
          max-width: 240px;
        }

        .attendance-action-btn::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0);
          opacity: 0;
          transition: transform 0.5s, opacity 1s;
        }

        .attendance-action-btn:active::after {
          transform: translate(-50%, -50%) scale(2);
          opacity: 1;
          transition: 0s;
        }

        .attendance-action-btn:disabled {
          background: #cbd5e1 !important;
          color: #94a3b8 !important;
          cursor: not-allowed;
          box-shadow: none !important;
          transform: none !important;
        }

        .check-in-mode {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
        }

        .check-in-mode:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.4), 0 4px 6px -2px rgba(16, 185, 129, 0.2);
          background: linear-gradient(135deg, #34d399 0%, #059669 100%);
        }

        .check-out-mode {
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: #ffffff;
        }

        .check-out-mode:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(249, 115, 22, 0.4), 0 4px 6px -2px rgba(249, 115, 22, 0.2);
          background: linear-gradient(135deg, #fb923c 0%, #ea580c 100%);
        }

        .btn-icon {
          font-size: 18px;
          animation: wiggle 2s infinite;
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(10deg); }
        }
      `}</style>
    </button>
  );
};
