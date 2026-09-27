import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
  itemLabel?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  className = '',
  itemLabel = 'items'
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalItems);

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safePage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (safePage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', safePage - 1, safePage, safePage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  if (totalItems <= 0) return null;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2.5 bg-aura-card border-t border-aura-border text-xs ${className}`}>
      {/* Items count summary */}
      <div className="flex items-center gap-3 text-aura-muted font-medium">
        <span>
          Showing <strong className="text-aura-text font-bold font-mono">{startItem}</strong> - <strong className="text-aura-text font-bold font-mono">{endItem}</strong> of <strong className="text-aura-text font-bold font-mono">{totalItems}</strong> {itemLabel}
        </span>

        {/* Page Size Selector */}
        {onPageSizeChange && (
          <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-aura-border">
            <span className="text-[11px]">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="px-2 py-1 rounded-lg bg-aura-bg border border-aura-border text-xs font-bold text-aura-text focus:outline-none cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={safePage <= 1}
          title="First page"
          className="w-7 h-7 rounded-lg border border-aura-border text-aura-muted hover:text-aura-text hover:bg-aura-dark flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>

        {/* Prev Page */}
        <button
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          title="Previous page"
          className="w-7 h-7 rounded-lg border border-aura-border text-aura-muted hover:text-aura-text hover:bg-aura-dark flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span key={`dots-${idx}`} className="w-7 h-7 flex items-center justify-center text-aura-muted font-bold">
                  ...
                </span>
              );
            }
            const isCurrent = p === safePage;
            return (
              <button
                key={`page-${p}`}
                onClick={() => onPageChange(Number(p))}
                className={`w-7 h-7 rounded-lg font-bold font-mono text-xs transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                    : 'text-aura-muted hover:text-aura-text hover:bg-aura-dark border border-transparent hover:border-aura-border'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          title="Next page"
          className="w-7 h-7 rounded-lg border border-aura-border text-aura-muted hover:text-aura-text hover:bg-aura-dark flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Last Page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={safePage >= totalPages}
          title="Last page"
          className="w-7 h-7 rounded-lg border border-aura-border text-aura-muted hover:text-aura-text hover:bg-aura-dark flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
