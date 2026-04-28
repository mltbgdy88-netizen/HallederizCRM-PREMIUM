export interface PaginationProps {
  totalItems: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

function range(start: number, end: number): number[] {
  const values: number[] = [];
  for (let cursor = start; cursor <= end; cursor += 1) values.push(cursor);
  return values;
}

export function Pagination({ totalItems, pageSize, currentPage, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / Math.max(1, pageSize)));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const start = Math.max(1, safePage - 2);
  const end = Math.min(totalPages, start + 4);
  const visiblePages = range(Math.max(1, end - 4), end);

  return (
    <div className="hz-paginator">
      <span className="hz-paginator-total">Toplam {totalItems} kayit</span>
      <div className="hz-paginator-controls">
        <button
          type="button"
          className="hz-paginator-btn"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          ‹
        </button>
        {visiblePages.map((page) => (
          <button
            key={page}
            type="button"
            className={`hz-paginator-btn ${page === safePage ? "is-active" : ""}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          className="hz-paginator-btn"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(safePage + 1)}
        >
          ›
        </button>
      </div>
    </div>
  );
}
