function Pagination({ page, totalPages, setPage, perPage, setPerPage }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxButtons = 5;
  let start = Math.max(1, page - Math.floor(maxButtons / 2));
  let end = start + maxButtons - 1;

  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxButtons + 1);
  }

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

    return (
    <div className="pagination">
      <button
        type="button"
        className="pagination__button"
        disabled={page <= 1}
        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
      >
        Previous
      </button>

      {start > 1 && (
        <>
          <button
            type="button"
            className={`pagination__page${page === 1 ? " is-active" : ""}`}
            onClick={() => setPage(1)}
          >
            1
          </button>
          {start > 2 && <span className="pagination__ellipsis">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`pagination__page${page === p ? " is-active" : ""}`}
          onClick={() => setPage(p)}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="pagination__ellipsis">…</span>
          )}
          <button
            type="button"
            className={`pagination__page${page === totalPages ? " is-active" : ""}`}
            onClick={() => setPage(totalPages)}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        className="pagination__button"
        disabled={page >= totalPages}
        onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
      >
        Next
      </button>

      <span className="pagination__label">
        Page {page} of {totalPages}
      </span>

      <label className="pagination__per-page">
        <span>Per page</span>
        <input
          type="number"
          min={1}
          max={100}
          value={perPage}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isFinite(next) && next > 0) {
              setPerPage(next);
              setPage(1);
            }
          }}
        />
      </label>
    </div>
  );
}

export default Pagination;
