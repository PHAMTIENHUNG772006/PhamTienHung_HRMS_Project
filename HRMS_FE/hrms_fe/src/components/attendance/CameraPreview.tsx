import React, { useEffect, useState } from "react";

interface CameraPreviewProps {
  photoBlob: Blob;
  onConfirm: () => void;
  onRetake: () => void;
  loading: boolean;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  photoBlob,
  onConfirm,
  onRetake,
  loading,
}) => {
  const [imgUrl, setImgUrl] = useState<string>("");

  useEffect(() => {
    const url = URL.createObjectURL(photoBlob);
    setImgUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [photoBlob]);

  return (
    <div className="preview-container">
      <div className="preview-box">
        <h4 className="preview-title">Xem lại ảnh đã chụp</h4>
        <div className="preview-image-wrapper">
          {imgUrl && <img src={imgUrl} alt="Captured preview" className="preview-img" />}
          <div className="preview-overlay">
            <span className="check-badge">✓ Sẵn sàng upload</span>
          </div>
        </div>

        <div className="preview-actions">
          <button
            className="secondary-btn retake-btn"
            onClick={onRetake}
            disabled={loading}
          >
            📸 Chụp lại
          </button>
          <button
            className="primary-btn confirm-btn"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner-wrap">
                <span className="spinner" /> Đang tải...
              </span>
            ) : (
              "✓ Xác nhận & Tải lên"
            )}
          </button>
        </div>
      </div>

      <style>{`
        .preview-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .preview-box {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          text-align: center;
        }

        .preview-title {
          margin: 0 0 16px;
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
        }

        .preview-image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 4/3;
          border-radius: 12px;
          overflow: hidden;
          background: #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }

        .preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1); /* Keep mirror logic consistent */
        }

        .preview-overlay {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
        }

        .check-badge {
          background: rgba(16, 185, 129, 0.9);
          color: #ffffff;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          backdrop-filter: blur(4px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .preview-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }

        .preview-actions button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 42px;
        }

        .loading-spinner-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #ffffff;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
