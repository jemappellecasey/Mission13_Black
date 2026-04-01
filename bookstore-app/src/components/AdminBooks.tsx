/**
 * Admin catalog: list books and add, edit, or delete rows via the API.
 * Uses a large page size so the admin table shows the full set for this assignment-sized DB.
 */
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Book } from '../types/Book';
import { API_BASE } from '../config';

const ADMIN_PAGE_SIZE = 10_000;

type FormState = {
  bookID: number | null;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  classification: string;
  category: string;
  pageCount: string;
  price: string;
};

function emptyForm(): FormState {
  return {
    bookID: null,
    title: '',
    author: '',
    publisher: '',
    isbn: '',
    classification: '',
    category: '',
    pageCount: '0',
    price: '0',
  };
}

function bookToForm(book: Book): FormState {
  return {
    bookID: book.bookID,
    title: book.title,
    author: book.author,
    publisher: book.publisher,
    isbn: book.isbn,
    classification: book.classification,
    category: book.category,
    pageCount: String(book.pageCount),
    price: String(book.price),
  };
}

export default function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/books?page=1&pageSize=${ADMIN_PAGE_SIZE}&sortBy=title`
      );
      if (!res.ok) throw new Error(res.statusText);
      const data: { books: Book[] } = await res.json();
      setBooks(data.books);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load books');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBooks();
  }, [loadBooks]);

  const openAdd = () => {
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (book: Book) => {
    setForm(bookToForm(book));
    setModalOpen(true);
  };

  const closeModal = () => {
    if (!saving) setModalOpen(false);
  };

  const parsePayload = (): Omit<Book, 'bookID'> | null => {
    const pageCount = parseInt(form.pageCount, 10);
    const price = parseFloat(form.price);
    if (Number.isNaN(pageCount) || pageCount < 0) {
      setError('Page count must be a non-negative integer.');
      return null;
    }
    if (Number.isNaN(price) || price < 0) {
      setError('Price must be a non-negative number.');
      return null;
    }
    return {
      title: form.title,
      author: form.author,
      publisher: form.publisher,
      isbn: form.isbn,
      classification: form.classification,
      category: form.category,
      pageCount,
      price,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = parsePayload();
    if (!payload) return;

    setSaving(true);
    try {
      if (form.bookID === null) {
        const res = await fetch(`${API_BASE}/api/books`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookID: 0,
            ...payload,
          }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || res.statusText);
        }
      } else {
        const res = await fetch(`${API_BASE}/api/books/${form.bookID}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookID: form.bookID,
            ...payload,
          }),
        });
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || res.statusText);
        }
      }
      setModalOpen(false);
      await loadBooks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/books/${deleteTarget.bookID}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      setDeleteTarget(null);
      await loadBooks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading && books.length === 0) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-auto text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 mb-0">Loading books…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 px-3 px-lg-4">
      <div className="row mb-3">
        <div className="col-md-8 text-start">
          <h1 className="h2 mb-1">Admin — books</h1>
          <p className="text-muted mb-0">
            Add, edit, or remove books in the catalog. Changes apply to the
            database immediately.
          </p>
        </div>
        <div className="col-md-4 text-md-end mt-2 mt-md-0 d-flex flex-wrap gap-2 justify-content-md-end">
          <Link
            className="btn btn-outline-secondary d-inline-flex align-items-center justify-content-center"
            to="/"
          >
            Back to catalog
          </Link>
          <button
            type="button"
            className="btn btn-primary"
            onClick={openAdd}
          >
            Add book
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="table-responsive shadow-sm rounded">
        <table className="table table-striped table-hover table-bordered align-middle mb-0">
          <thead className="table-dark">
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Title</th>
              <th scope="col">Author</th>
              <th scope="col">Publisher</th>
              <th scope="col">ISBN</th>
              <th scope="col">Category</th>
              <th scope="col" className="text-end">
                Price
              </th>
              <th scope="col" style={{ minWidth: '9rem' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.bookID}>
                <td>{book.bookID}</td>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.publisher}</td>
                <td>{book.isbn}</td>
                <td>{book.category}</td>
                <td className="text-end">${book.price.toFixed(2)}</td>
                <td>
                  <div className="btn-group btn-group-sm" role="group">
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => openEdit(book)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      onClick={() => setDeleteTarget(book)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {books.length === 0 && !loading && (
        <p className="text-muted text-center py-4 mb-0">No books found.</p>
      )}

      {/* Add / Edit modal */}
      <div
        className={`modal fade${modalOpen ? ' show d-block' : ''}`}
        tabIndex={-1}
        role="dialog"
        aria-modal={modalOpen}
        style={modalOpen ? { backgroundColor: 'rgba(0,0,0,0.5)' } : undefined}
      >
        <div className="modal-dialog modal-lg modal-dialog-scrollable">
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h2 className="modal-title h5">
                  {form.bookID === null ? 'Add book' : 'Edit book'}
                </h2>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={closeModal}
                  disabled={saving}
                />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="admin-title" className="form-label">
                      Title
                    </label>
                    <input
                      id="admin-title"
                      className="form-control"
                      value={form.title}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, title: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="admin-author" className="form-label">
                      Author
                    </label>
                    <input
                      id="admin-author"
                      className="form-control"
                      value={form.author}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, author: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="admin-publisher" className="form-label">
                      Publisher
                    </label>
                    <input
                      id="admin-publisher"
                      className="form-control"
                      value={form.publisher}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, publisher: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="admin-isbn" className="form-label">
                      ISBN
                    </label>
                    <input
                      id="admin-isbn"
                      className="form-control"
                      value={form.isbn}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, isbn: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="admin-classification" className="form-label">
                      Classification
                    </label>
                    <input
                      id="admin-classification"
                      className="form-control"
                      value={form.classification}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          classification: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="admin-category" className="form-label">
                      Category
                    </label>
                    <input
                      id="admin-category"
                      className="form-control"
                      value={form.category}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, category: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label htmlFor="admin-pages" className="form-label">
                      Page count
                    </label>
                    <input
                      id="admin-pages"
                      type="number"
                      min={0}
                      className="form-control"
                      value={form.pageCount}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, pageCount: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label htmlFor="admin-price" className="form-label">
                      Price
                    </label>
                    <input
                      id="admin-price"
                      type="number"
                      min={0}
                      step="0.01"
                      className="form-control"
                      value={form.price}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, price: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      <div
        className={`modal fade${deleteTarget ? ' show d-block' : ''}`}
        tabIndex={-1}
        role="dialog"
        aria-modal={!!deleteTarget}
        style={
          deleteTarget ? { backgroundColor: 'rgba(0,0,0,0.5)' } : undefined
        }
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title h5">Delete book</h2>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => !saving && setDeleteTarget(null)}
                disabled={saving}
              />
            </div>
            <div className="modal-body text-start">
              {deleteTarget && (
                <>
                  Remove <strong>{deleteTarget.title}</strong> from the database?
                  This cannot be undone.
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteTarget(null)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => void confirmDelete()}
                disabled={saving}
              >
                {saving ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
