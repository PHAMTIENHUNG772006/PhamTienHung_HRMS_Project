import React, { useEffect, useState } from "react";
import SectionHeader from "../../components/common/SectionHeader";
import { AttendanceCard } from "../../components/attendance/AttendanceCard";
import { AttendanceToday } from "./AttendanceToday";
import { AttendanceHistory } from "./AttendanceHistory";
import { CameraModal } from "../../components/attendance/CameraModal";
import { CameraPreview } from "../../components/attendance/CameraPreview";
import { getMyAttendances, checkIn, checkOut } from "../../services/attendance.service";
import type { AttendanceRecord } from "../../services/attendance.service";
import { getMyShiftAssignmentsToday } from "../../api/endpoints/shifts-assignment.api";
import type { ShiftAssignmentItem } from "../../api/endpoints/shifts-assignment.api";
import Swal from "sweetalert2";

export const AttendancePage: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'check-in' | 'check-out'>('check-in');
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);

  // States for viewing images in modal
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);
  const [viewImageTitle, setViewImageTitle] = useState<string>("");

  const [selectedShiftCode, setSelectedShiftCode] = useState<string>("");
  const [myShiftsToday, setMyShiftsToday] = useState<ShiftAssignmentItem[]>([]);

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString();
  const todayRecord = records.find((r) => r.workDate === todayStr && r.shiftCode === selectedShiftCode) || null;

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getMyAttendances();
      if (res.success && res.data) {
        setRecords(res.data);
      }

      const shiftsRes = await getMyShiftAssignmentsToday();
      if (shiftsRes.success && shiftsRes.data) {
        setMyShiftsToday(shiftsRes.data);
        if (shiftsRes.data.length > 0) {
          setSelectedShiftCode(prev => {
            const exists = shiftsRes.data!.some(s => s.shiftCode === prev);
            return exists ? prev : shiftsRes.data![0].shiftCode;
          });
        } else {
          setSelectedShiftCode("");
        }
      }
    } catch (err: any) {
      console.error("Lỗi khi tải lịch sử chấm công:", err);
      Swal.fire({
        icon: "error",
        title: "Lỗi tải dữ liệu",
        text: err?.response?.data?.message || "Không thể tải lịch sử chấm công.",
        confirmButtonColor: "#3085d6",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleActionClick = (mode: 'check-in' | 'check-out') => {
    setCameraMode(mode);
    setPreviewBlob(null);
    setCameraOpen(true);
  };

  const handleCapture = (blob: Blob) => {
    setPreviewBlob(blob);
    setCameraOpen(false);
  };

  const handleConfirmUpload = async () => {
    if (!previewBlob) return;
    setLoading(true);
    try {
      let res;
      if (cameraMode === 'check-in') {
        res = await checkIn(previewBlob, selectedShiftCode);
      } else {
        res = await checkOut(previewBlob, selectedShiftCode);
      }

      if (res.success) {
        Swal.fire({
          icon: "success",
          title: cameraMode === 'check-in' ? "Check In Thành Công!" : "Check Out Thành Công!",
          text: res.message || (cameraMode === 'check-in' ? "Đã ghi nhận giờ vào ca." : "Đã ghi nhận giờ ra ca."),
          timer: 2000,
          showConfirmButton: false,
        });
        setPreviewBlob(null);
        loadData(); // Tải lại dữ liệu mới nhất
      }
    } catch (err: any) {
      console.error("Lỗi khi gửi yêu cầu chấm công:", err);
      Swal.fire({
        icon: "error",
        title: "Chấm công thất bại",
        text: err?.response?.data?.message || "Lỗi đường truyền hoặc hệ thống.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    setPreviewBlob(null);
    setCameraOpen(true);
  };

  const handleViewImage = (url: string, title: string) => {
    setViewImageUrl(url);
    setViewImageTitle(title);
  };

  const closeImageViewer = () => {
    setViewImageUrl(null);
  };

  return (
    <div className="page-container">
      <SectionHeader
        title="Chấm công nhân viên"
        subtitle="Quản lý và thực hiện check-in/check-out hàng ngày với nhận diện ảnh."
      />

      <div className="attendance-layout">
        <div className="left-panel">
          <AttendanceCard
            todayRecord={todayRecord}
            onActionClick={handleActionClick}
            loading={loading}
            selectedShiftCode={selectedShiftCode}
            onShiftChange={setSelectedShiftCode}
            myShiftsToday={myShiftsToday}
          />
        </div>
        <div className="right-panel">
          <AttendanceToday
            todayRecord={todayRecord}
            onViewImage={handleViewImage}
          />
        </div>
      </div>

      {previewBlob && (
        <div className="preview-section-overlay">
          <CameraPreview
            photoBlob={previewBlob}
            onConfirm={handleConfirmUpload}
            onRetake={handleRetake}
            loading={loading}
          />
        </div>
      )}

      <AttendanceHistory
        records={records}
        onViewImage={handleViewImage}
      />

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={handleCapture}
        title={cameraMode === 'check-in' ? "Chụp ảnh Check In" : "Chụp ảnh Check Out"}
      />

      {/* Custom Image Viewer Modal */}
      {viewImageUrl && (
        <div className="image-viewer-overlay" onClick={closeImageViewer}>
          <div className="image-viewer-content" onClick={(e) => e.stopPropagation()}>
            <div className="viewer-header">
              <h4>{viewImageTitle}</h4>
              <button className="close-viewer-btn" onClick={closeImageViewer}>&times;</button>
            </div>
            <div className="viewer-body">
              <img src={viewImageUrl} alt={viewImageTitle} className="full-viewer-image" />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .attendance-layout {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }

        @media (max-width: 900px) {
          .attendance-layout {
            grid-template-columns: 1fr;
          }
        }

        .left-panel {
          display: flex;
          flex-direction: column;
        }

        .right-panel {
          display: flex;
          flex-direction: column;
        }

        .preview-section-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.7);
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
        }

        /* Image Viewer Modal Styles */
        .image-viewer-overlay {
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
          animation: fadeIn 0.2s ease-out;
        }

        .image-viewer-content {
          background: #ffffff;
          border-radius: 16px;
          max-width: 600px;
          width: 90%;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .viewer-header h4 {
          margin: 0;
          font-size: 16px;
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
        }

        .close-viewer-btn:hover {
          color: #0f172a;
        }

        .viewer-body {
          padding: 24px;
          background: #f8fafc;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .full-viewer-image {
          max-width: 100%;
          max-height: 70vh;
          border-radius: 8px;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
          transform: scaleX(-1); /* Keep mirror standard format */
        }
      `}</style>
    </div>
  );
};
export default AttendancePage;
