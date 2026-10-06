import { useRef, useState, useCallback } from "react";

export const useCamera = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      activeStreamRef.current = mediaStream;
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch((err) => {
          console.error("Lỗi khi play video stream:", err);
        });
      }
    } catch (err: any) {
      console.error("Không thể truy cập camera:", err);
      setError("Không thể truy cập camera. Vui lòng cấp quyền hoặc kiểm tra thiết bị.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }
    setStream(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const capture = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const activeStream = activeStreamRef.current;

      if (!video || !canvas || !activeStream) {
        resolve(null);
        return;
      }

      const context = canvas.getContext("2d");
      if (!context) {
        resolve(null);
        return;
      }

      // Đặt kích thước canvas bằng kích thước hiển thị của video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      // Vẽ hình ảnh từ video lên canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Chuyển đổi canvas thành Blob JPEG với chất lượng 0.6 để giảm dung lượng ảnh (200~300 KB)
      canvas.toBlob(
        (blob) => {
          // Tắt camera ngay sau khi chụp
          stopCamera();
          resolve(blob);
        },
        "image/jpeg",
        0.6
      );
    });
  }, [stopCamera]);

  return {
    videoRef,
    canvasRef,
    stream,
    error,
    startCamera,
    stopCamera,
    capture,
  };
};
