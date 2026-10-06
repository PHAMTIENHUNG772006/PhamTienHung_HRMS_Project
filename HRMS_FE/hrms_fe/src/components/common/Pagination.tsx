import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  showingCount: number;
  itemName?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  showingCount,
  itemName = "bản ghi",
}) => {
  if (totalItems === 0) return null;

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Hiển thị <strong>{showingCount}</strong> trên tổng số <strong>{totalItems}</strong> {itemName}
      </div>
      {totalPages > 1 && (
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            type="button"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Trang trước
          </button>

          <div style={{ display: "flex", gap: "4px", alignSelf: "center" }}>
            {getPageNumbers().map((p, idx) => {
              if (typeof p === "number") {
                return (
                  <button
                    key={idx}
                    className={`pagination-page-btn ${p === currentPage ? "active" : ""}`}
                    onClick={() => onPageChange(p)}
                    type="button"
                  >
                    {p}
                  </button>
                );
              }
              return (
                <span key={idx} className="pagination-ellipsis" style={{ alignSelf: "center", padding: "0 4px", fontSize: "13.5px", color: "var(--text-tertiary)" }}>
                  {p}
                </span>
              );
            })}
          </div>

          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            type="button"
          >
            Trang sau
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default Pagination;
