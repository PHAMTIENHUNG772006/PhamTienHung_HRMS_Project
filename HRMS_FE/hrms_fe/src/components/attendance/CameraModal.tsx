import React, { useEffect, useState } from "react";
import { useCamera } from "../../hooks/useCamera";

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (blob: Blob) => void;
  title: string;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title,
}) => {
  const {
    videoRef,
    canvasRef,
    stream,
    error,
    startCamera,
    stopCamera,
    capture,
  } = useCamera();

  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startCamera();
      // Bắt đầu đếm ngược 3 giây tự động chụp
      setCountdown(3);
    } else {
      stopCamera();
      setCountdown(null);
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      handleCapture();
    }
  }, [countdown]);

  const handleCapture = async () => {
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 150); // Hiệu ứng nháy camera
    const blob = await capture();
    if (blob) {
      onCapture(blob);
    }
    setCountdown(null);
  };

  if (!isOpen) return null;

  return (
    <div className="camera-modal-overlay">
      <div className="camera-modal-content">
        <div className="camera-modal-header">
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="camera-modal-body">
          {error ? (
            <div className="camera-error-message">
              <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p>{error}</p>
              <button className="primary-btn" onClick={startCamera} style={{ marginTop: "12px" }}>
                Thử lại
              </button>
            </div>
          ) : (
            <div className="webcam-container">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="webcam-video"
              />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              
              {/* Flash Effect */}
              {isFlashing && <div className="camera-flash" />}

              {/* Countdown overlay */}
              {countdown !== null && countdown > 0 && (
                <div className="countdown-overlay">
                  <div className="countdown-number">{countdown}</div>
                  <p className="countdown-sub">Tự động chụp sau {countdown}s...</p>
                </div>
              )}

              {/* Camera frame guide */}
              <div className="face-guide-overlay">
                <div className="face-oval" />
                <p className="face-guide-text">Đặt khuôn mặt vào trong khung hình</p>
              </div>
            </div>
          )}
        </div>

        <div className="camera-modal-footer">
          {!error && stream && (
            <button className="primary-btn capture-btn" onClick={handleCapture}>
              <span className="shutter-icon">📸</span> Chụp ảnh
            </button>
          )}
          <button className="secondary-btn cancel-btn" onClick={onClose}>
            Huỷ
          </button>
        </div>
      </div>

      <style>{`
        .camera-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
          animation: fadeIn 0.2s ease-out;
        }

        .camera-modal-content {
          background: #ffffff;
          border-radius: 16px;
          width: 90%;
          max-width: 540px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .camera-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .camera-modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          color: #94a3b8;
          cursor: pointer;
          transition: color 0.15s;
        }

        .close-btn:hover {
          color: #0f172a;
        }

        .camera-modal-body {
          padding: 24px;
          background: #f8fafc;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 380px;
        }

        .camera-error-message {
          display: flex;
          flex-direction: column;
          align-items: center;
          color: #ef4444;
          text-align: center;
          padding: 20px;
        }

        .camera-error-message p {
          margin: 8px 0 0;
          font-weight: 500;
        }

        .webcam-container {
          position: relative;
          width: 100%;
          max-width: 480px;
          aspect-ratio: 4/3;
          border-radius: 12px;
          overflow: hidden;
          background: #000;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.6);
        }

        .webcam-video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1); /* Mirror effect */
        }

        .camera-flash {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: #ffffff;
          z-index: 10;
          animation: flashAnimation 0.15s ease-out;
        }

        .countdown-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.4);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 5;
        }

        .countdown-number {
          font-size: 80px;
          font-weight: 800;
          color: #ffffff;
          text-shadow: 0 4px 12px rgba(0,0,0,0.5);
          animation: ping 1s ease-in-out infinite;
        }

        .countdown-sub {
          color: #ffffff;
          margin-top: 8px;
          font-weight: 500;
          font-size: 14px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }

        .face-guide-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          pointer-events: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 2;
        }

        .face-oval {
          width: 200px;
          height: 260px;
          border: 2px dashed rgba(255, 255, 255, 0.65);
          border-radius: 50%;
          box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.3);
        }

        .face-guide-text {
          position: absolute;
          bottom: 16px;
          background: rgba(15, 23, 42, 0.7);
          color: #ffffff;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }

        .camera-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
        }

        .capture-btn {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .shutter-icon {
          font-size: 16px;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes flashAnimation {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
