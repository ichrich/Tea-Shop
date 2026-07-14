import React from 'react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const renderPageNumbers = () => {
    const pages = [];
    pages.push(
      <button
        key={1}
        className={`Pagination_btn ${currentPage === 1 ? 'Pagination_btn_active' : ''}`}
        onClick={() => onPageChange(1)}
      >
        1
      </button>
    );
    if (totalPages >= 2) {
      pages.push(
        <button
          key={2}
          className={`Pagination_btn ${currentPage === 2 ? 'Pagination_btn_active' : ''}`}
          onClick={() => onPageChange(2)}
        >
          2
        </button>
      );
    }
    if (totalPages >= 3) {
      pages.push(
        <button
          key={3}
          className={`Pagination_btn ${currentPage === 3 ? 'Pagination_btn_active' : ''}`}
          onClick={() => onPageChange(3)}
        >
          3
        </button>
      );
    }
    if (totalPages >= 4) {
      pages.push(
        <button
          key={4}
          className={`Pagination_btn ${currentPage === 4 ? 'Pagination_btn_active' : ''}`}
          onClick={() => onPageChange(4)}
        >
          4
        </button>
      );
    }
    if (totalPages > 5) {
      pages.push(
        <span key="dots" className="Pagination_dots">
          ...
        </span>
      );
    }
    if (totalPages > 4) {
      pages.push(
        <button
          key={totalPages}
          className={`Pagination_btn ${currentPage === totalPages ? 'Pagination_btn_active' : ''}`}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className="Pagination">
      <button
        className="Pagination_arrow"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        <svg width="8" height="12" viewBox="0 0 8 12" fill="none" aria-label="Назад">
          <path d="M7 1L2 6L7 11" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {renderPageNumbers()}

      <button
        className="Pagination_arrow"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        <svg width="8" height="12" viewBox="0 0 8 12" fill="none" aria-label="Вперёд">
          <path d="M1 11L6 6L1 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
