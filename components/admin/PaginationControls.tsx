import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPreviousPage: () => void;
  onNextPage: () => void;
  startIndex: number;
  endIndex: number;
  total: number;
  perPage: number;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPreviousPage,
  onNextPage,
  startIndex,
  endIndex,
  total,
  perPage,
}: PaginationControlsProps) {
  return (
    <div className="flex flex-col gap-2 border-t border-white/10 bg-black/10 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-white/35">
        បង្ហាញ {startIndex > 0 ? startIndex + 1 : 1}-{endIndex} / {total} | ទំព័រ {currentPage} / {totalPages}
      </p>
      <div className="flex items-center gap-2 self-end sm:self-auto">
        <button
          type="button"
          onClick={onPreviousPage}
          disabled={currentPage === 1}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/70 hover:bg-white/10 disabled:opacity-40"
        >
          <ChevronLeft size={12} />
          មុន
        </button>
        <button
          type="button"
          onClick={onNextPage}
          disabled={currentPage === totalPages}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-white/70 hover:bg-white/10 disabled:opacity-40"
        >
          បន្ទាប់
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
