import React from 'react';
import { Link } from 'react-router-dom';

export interface LogoProps {
  /**
   * 'icon': chỉ icon bánh răng + cành lá
   * 'full': icon + chữ HRMS + phụ đề nằm ngang
   * 'vertical': icon ở trên, chữ HRMS + phụ đề ở dưới (dành cho trang Login/Register)
   */
  variant?: 'icon' | 'full' | 'vertical';
  /**
   * Kích thước tổng thể: 'sm' | 'md' | 'lg' | 'xl' hoặc số pixel (áp dụng cho chiều cao icon)
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  /**
   * Có hiển thị dòng phụ đề 'Human Resources Management System' không (mặc định: true)
   */
  showSubtitle?: boolean;
  /**
   * Link bọc ngoài (ví dụ '/' hoặc '/dashboard'). Nếu không truyền thì render div/span
   */
  to?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Component Emblem SVG: Tái hiện chuẩn xác logo HRMS gồm Bánh Răng (Quản trị/Hệ thống)
 * kết hợp Cành Lá Xanh (Nhân sự/Con người/Phát triển), chuyển màu Gradient xanh lá -> xanh lam.
 */
export const LogoEmblem: React.FC<{ size?: number; className?: string }> = ({ size = 40, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`hrms-logo-emblem ${className}`}
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="hrmsLogoEmblemGrad" x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#78cc7e" />
          <stop offset="50%" stopColor="#2eb39d" />
          <stop offset="100%" stopColor="#149eb2" />
        </linearGradient>
        <mask id="hrmsLogoEmblemMask">
          <rect x="0" y="0" width="600" height="600" fill="#ffffff" />
          <circle cx="300" cy="300" r="75" fill="#000000" />
          {/* Vùng cắt tách biệt cành lá và bánh răng (cutout contour) */}
          <g fill="#000000" stroke="#000000" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 205 425 C 230 360, 285 270, 370 185 C 400 150, 430 115, 450 80" fill="none" />
            <path d="M 225.0,385.0 C 235.8,369.8 244.7,351.4 168.0,338.0 C 147.2,352.5 155.6,370.8 225.0,385.0 Z" />
            <path d="M 260.0,330.0 C 273.7,311.9 285.2,289.8 192.0,250.0 C 166.5,267.3 177.3,289.4 260.0,330.0 Z" />
            <path d="M 305.0,270.0 C 318.5,252.3 329.7,230.7 248.0,185.0 C 223.1,202.0 233.7,223.6 305.0,270.0 Z" />
            <path d="M 355.0,210.0 C 366.9,194.2 377.0,174.8 315.0,130.0 C 293.4,145.2 302.8,164.6 355.0,210.0 Z" />
            <path d="M 310.0,275.0 C 304.7,250.7 304.5,221.7 405.0,240.0 C 438.1,262.8 436.5,291.8 310.0,275.0 Z" />
            <path d="M 360.0,215.0 C 354.3,193.3 353.4,167.3 455.0,170.0 C 485.4,190.5 483.0,216.5 360.0,215.0 Z" />
            <path d="M 405.0,155.0 C 399.7,136.9 398.5,115.1 490.0,120.0 C 516.3,137.2 513.8,159.0 405.0,155.0 Z" />
            <path d="M 445.0,85.0 C 440.0,70.5 438.5,52.8 470.0,45.0 C 488.6,58.8 486.2,76.5 445.0,85.0 Z" />
          </g>
        </mask>
      </defs>

      {/* Bánh răng với mặt nạ cắt cành lá & lỗ tròn trung tâm */}
      <path
        d="M 125.0 300.0 L 97.4 333.3 L 115.8 377.7 L 140.9 384.4 L 147.6 409.5 L 130.9 453.9 L 175.3 472.3 L 208.6 444.7 L 233.7 451.4 L 258.8 476.5 L 292.1 448.9 L 336.5 467.3 L 361.6 442.2 L 386.7 448.9 L 420.0 421.3 L 401.6 376.9 L 426.7 351.8 L 451.8 358.5 L 479.4 325.2 L 435.0 306.8 L 428.3 281.7 L 453.4 256.6 L 425.8 223.3 L 381.4 241.7 L 356.3 235.0 L 331.2 209.9 L 297.9 237.5 L 253.5 219.1 L 228.4 244.2 L 203.3 237.5 L 170.0 265.1 L 188.4 309.5 Z"
        fill="url(#hrmsLogoEmblemGrad)"
        mask="url(#hrmsLogoEmblemMask)"
      />

      {/* Cành lá và mầm cây xanh */}
      <g fill="url(#hrmsLogoEmblemGrad)" stroke="url(#hrmsLogoEmblemGrad)">
        <path
          d="M 205 425 C 230 360, 285 270, 370 185 C 400 150, 430 115, 450 80"
          fill="none"
          strokeWidth="15"
          strokeLinecap="round"
        />
        <path d="M 225.0,385.0 C 235.8,369.8 244.7,351.4 168.0,338.0 C 147.2,352.5 155.6,370.8 225.0,385.0 Z" strokeWidth="0" />
        <path d="M 260.0,330.0 C 273.7,311.9 285.2,289.8 192.0,250.0 C 166.5,267.3 177.3,289.4 260.0,330.0 Z" strokeWidth="0" />
        <path d="M 305.0,270.0 C 318.5,252.3 329.7,230.7 248.0,185.0 C 223.1,202.0 233.7,223.6 305.0,270.0 Z" strokeWidth="0" />
        <path d="M 355.0,210.0 C 366.9,194.2 377.0,174.8 315.0,130.0 C 293.4,145.2 302.8,164.6 355.0,210.0 Z" strokeWidth="0" />
        <path d="M 310.0,275.0 C 304.7,250.7 304.5,221.7 405.0,240.0 C 438.1,262.8 436.5,291.8 310.0,275.0 Z" strokeWidth="0" />
        <path d="M 360.0,215.0 C 354.3,193.3 353.4,167.3 455.0,170.0 C 485.4,190.5 483.0,216.5 360.0,215.0 Z" strokeWidth="0" />
        <path d="M 405.0,155.0 C 399.7,136.9 398.5,115.1 490.0,120.0 C 516.3,137.2 513.8,159.0 405.0,155.0 Z" strokeWidth="0" />
        <path d="M 445.0,85.0 C 440.0,70.5 438.5,52.8 470.0,45.0 C 488.6,58.8 486.2,76.5 445.0,85.0 Z" strokeWidth="0" />
      </g>
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'full',
  size = 'md',
  showSubtitle = true,
  to,
  className = '',
  style,
}) => {
  // Map size prop to pixel height of emblem
  let pixelSize = 40;
  if (typeof size === 'number') {
    pixelSize = size;
  } else {
    switch (size) {
      case 'sm':
        pixelSize = 28;
        break;
      case 'md':
        pixelSize = 40;
        break;
      case 'lg':
        pixelSize = 56;
        break;
      case 'xl':
        pixelSize = 72;
        break;
    }
  }

  const renderContent = () => {
    if (variant === 'icon') {
      return <LogoEmblem size={pixelSize} className={className} />;
    }

    if (variant === 'vertical') {
      return (
        <div
          className={`hrms-logo-vertical ${className}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 12,
            ...style,
          }}
        >
          <LogoEmblem size={pixelSize} />
          <div className="hrms-logo-text-group">
            <h1
              style={{
                margin: 0,
                fontSize: pixelSize * 0.55,
                fontWeight: 800,
                color: '#144b66',
                letterSpacing: '0.06em',
                lineHeight: 1.1,
              }}
            >
              HRMS
            </h1>
            {showSubtitle && (
              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: Math.max(11, pixelSize * 0.22),
                  fontWeight: 600,
                  color: '#1b5a7b',
                  letterSpacing: '0.015em',
                  whiteSpace: 'nowrap',
                }}
              >
                Human Resources Management System
              </p>
            )}
          </div>
        </div>
      );
    }

    // Default: 'full' (horizontal)
    return (
      <div
        className={`hrms-logo-horizontal ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: Math.max(8, pixelSize * 0.25),
          textDecoration: 'none',
          ...style,
        }}
      >
        <LogoEmblem size={pixelSize} />
        <div className="hrms-logo-text-group" style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontSize: Math.round(pixelSize * 0.52),
              fontWeight: 800,
              color: '#144b66',
              letterSpacing: '0.05em',
              lineHeight: 1.1,
            }}
          >
            HRMS
          </span>
          {showSubtitle && (
            <span
              style={{
                fontSize: Math.max(10, Math.round(pixelSize * 0.24)),
                fontWeight: 600,
                color: '#1b5a7b',
                letterSpacing: '0.01em',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}
            >
              Human Resources Management System
            </span>
          )}
        </div>
      </div>
    );
  };

  if (to) {
    return (
      <Link to={to} style={{ textDecoration: 'none', display: 'inline-block' }}>
        {renderContent()}
      </Link>
    );
  }

  return renderContent();
};

export default Logo;

