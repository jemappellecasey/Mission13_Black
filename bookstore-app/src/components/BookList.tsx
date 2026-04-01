/** Public catalog: pagination, category filter, sort, cart actions. */
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Book, BooksResponse } from '../types/Book';
import { useCart } from '../contexts/CartContext';
import { API_BASE } from '../config';

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

/**
 * Bootstrap (#notcoveredinthevideos): Accordion — collapsible help panel using
 * `accordion`, `accordion-item`, `accordion-header`, `accordion-collapse`,
 * `data-bs-toggle="collapse"`, and `data-bs-parent` (see sidebar below).
 */
export default function BookList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    lines,
    grandTotal,
    itemCount,
    addToCart,
    rememberBrowsingContext,
  } = useCart();

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSizeRaw = parseInt(searchParams.get('pageSize') || '5', 10);
  const pageSize = PAGE_SIZE_OPTIONS.includes(pageSizeRaw) ? pageSizeRaw : 5;
  const category = searchParams.get('category') ?? '';
  const sortAsc = searchParams.get('sort') !== 'desc';

  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const patchQuery = (patch: Record<string, string | number | null>) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, val] of Object.entries(patch)) {
          if (val === null || val === '') next.delete(key);
          else next.set(key, String(val));
        }
        return next;
      },
      { replace: true }
    );
  };

  const setPage = (p: number) => patchQuery({ page: p });
  const setPageSize = (ps: number) => patchQuery({ pageSize: ps, page: 1 });
  const setCategoryFilter = (c: string) =>
    patchQuery({ category: c ? c : null, page: 1 });
  const toggleSort = () =>
    patchQuery({ sort: sortAsc ? 'desc' : 'asc', page: 1 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/categories`);
        if (!res.ok) throw new Error(res.statusText);
        const data: string[] = await res.json();
        if (!cancelled) setCategories(data);
      } catch {
        if (!cancelled) setCategories([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const sortBy = sortAsc ? 'title' : 'title_desc';
    const catQ = category
      ? `&category=${encodeURIComponent(category)}`
      : '';
    const url = `${API_BASE}/api/books?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}${catQ}`;

    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(res.statusText);
        const data: BooksResponse = await res.json();
        if (cancelled) return;
        setBooks(data.books);
        setTotalPages(data.totalPages);
        setTotalCount(data.totalCount);
        if (data.totalPages > 0 && page > data.totalPages) {
          setSearchParams(
            (prev) => {
              const next = new URLSearchParams(prev);
              next.set('page', String(data.totalPages));
              return next;
            },
            { replace: true }
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load books');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, category, sortAsc, setSearchParams]);

  const handleAddToCart = (book: Book) => {
    rememberBrowsingContext({
      page,
      pageSize,
      category,
      sortAsc,
    });
    addToCart(book, 1);
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (loading && books.length === 0) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-auto text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 mb-0">Loading books...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger" role="alert">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-3 px-lg-4">
      <div className="row g-4">
        <aside className="col-lg-3 order-lg-1">
          <div className="card shadow-sm mb-3">
            <div className="card-header fw-semibold">Cart summary</div>
            <div className="card-body">
              {itemCount === 0 ? (
                <p className="text-muted small mb-0">
                  No items in your cart yet.
                </p>
              ) : (
                <>
                  <p className="mb-1">
                    <span className="fw-medium">{itemCount}</span> item
                    {itemCount !== 1 ? 's' : ''} in cart
                  </p>
                  <p className="fs-5 fw-semibold mb-3">
                    Total: ${grandTotal.toFixed(2)}
                  </p>
                  <ul className="list-group list-group-flush small mb-3">
                    {lines.map((line) => (
                      <li
                        key={line.bookID}
                        className="list-group-item px-0 d-flex justify-content-between"
                      >
                        <span className="text-truncate me-2">{line.title}</span>
                        <span className="text-nowrap">
                          ×{line.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link className="btn btn-primary w-100" to="/cart">
                    View / edit cart
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="accordion accordion-flush shadow-sm" id="browseTips">
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#tips-collapse"
                  aria-expanded="true"
                  aria-controls="tips-collapse"
                >
                  Browse tips
                </button>
              </h2>
              <div
                id="tips-collapse"
                className="accordion-collapse collapse show"
                data-bs-parent="#browseTips"
              >
                <div className="accordion-body small text-start">
                  Choose a category to filter the catalog; page counts and page
                  links update for that subset. Use <strong>Continue shopping</strong>{' '}
                  on the cart page to return here with the same page, sort, and
                  category you had when you last added a book.
                </div>
              </div>
            </div>
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#session-collapse"
                  aria-expanded="false"
                  aria-controls="session-collapse"
                >
                  About your cart session
                </button>
              </h2>
              <div
                id="session-collapse"
                className="accordion-collapse collapse"
                data-bs-parent="#browseTips"
              >
                <div className="accordion-body small text-start">
                  Cart data is stored in <code>sessionStorage</code> so it stays
                  while you move between this list and the cart, and clears when
                  you close the browser tab.
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="col-lg-9 order-lg-0">
          <div className="row mb-3">
            <div className="col">
              <h1 className="h2 mb-1 text-start">Book catalog</h1>
              <p className="text-muted text-start mb-0">
                Filter by category, sort by title, and add books to your cart.
              </p>
            </div>
          </div>

          <div className="row g-3 mb-3 align-items-end">
            <div className="col-md-4 text-start">
              <label htmlFor="category" className="form-label mb-1">
                Category
              </label>
              <select
                id="category"
                className="form-select"
                value={category}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4 text-start text-md-center">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={toggleSort}
              >
                Sort by title {sortAsc ? '↑ A–Z' : '↓ Z–A'}
              </button>
            </div>
            <div className="col-md-4 text-start text-md-end">
              <label htmlFor="pageSize" className="form-label mb-1">
                Results per page
              </label>
              <select
                id="pageSize"
                className="form-select d-inline-block w-auto"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="table-responsive shadow-sm rounded">
                <table className="table table-striped table-hover table-bordered align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col">Title</th>
                      <th scope="col">Author</th>
                      <th scope="col">Publisher</th>
                      <th scope="col">ISBN</th>
                      <th scope="col">Classification</th>
                      <th scope="col">Category</th>
                      <th scope="col">Pages</th>
                      <th scope="col" className="text-end">
                        Price
                      </th>
                      <th scope="col" style={{ minWidth: '7rem' }}>
                        Cart
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {books.map((book) => (
                      <tr key={book.bookID}>
                        <td>{book.title}</td>
                        <td>{book.author}</td>
                        <td>{book.publisher}</td>
                        <td>{book.isbn}</td>
                        <td>{book.classification}</td>
                        <td>{book.category}</td>
                        <td>{book.pageCount}</td>
                        <td className="text-end">${book.price.toFixed(2)}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-success w-100"
                            onClick={() => handleAddToCart(book)}
                          >
                            Add to cart
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="row mt-3">
              <div className="col-12">
                <nav aria-label="Book pagination">
                  <ul className="pagination justify-content-center flex-wrap mb-0">
                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                      <a
                        className="page-link"
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (page > 1) setPage(page - 1);
                        }}
                        aria-disabled={page === 1}
                      >
                        Previous
                      </a>
                    </li>
                    {pageNumbers.map((pageNum) => (
                      <li
                        key={pageNum}
                        className={`page-item ${page === pageNum ? 'active' : ''}`}
                      >
                        <a
                          className="page-link"
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(pageNum);
                          }}
                        >
                          {pageNum}
                        </a>
                      </li>
                    ))}
                    <li
                      className={`page-item ${page === totalPages ? 'disabled' : ''}`}
                    >
                      <a
                        className="page-link"
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (page < totalPages) setPage(page + 1);
                        }}
                        aria-disabled={page === totalPages}
                      >
                        Next
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          )}

          <div className="row mt-2">
            <div className="col text-center text-muted small">
              Showing {books.length} of {totalCount} books
              {category ? ` in “${category}”` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
