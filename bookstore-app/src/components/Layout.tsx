import { Link, Outlet } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

/**
 * Site layout: navbar, cart offcanvas, main content outlet.
 *
 * Bootstrap (#notcoveredinthevideos): Offcanvas — sliding panel (`offcanvas offcanvas-end`)
 * toggled by the navbar button using `data-bs-toggle="offcanvas"` and `data-bs-target="#cartOffcanvas"`.
 */
export default function Layout() {
  const { lines, grandTotal, itemCount } = useCart();

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/">
            Online Bookstore
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-2">
              <li className="nav-item">
                <button
                  type="button"
                  className="btn btn-outline-light btn-sm"
                  data-bs-toggle="offcanvas"
                  data-bs-target="#cartOffcanvas"
                  aria-controls="cartOffcanvas"
                >
                  Cart preview
                </button>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/adminbooks">
                  Admin books
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/cart">
                  View cart{' '}
                  {itemCount > 0 && (
                    <span className="badge text-bg-warning ms-1">{itemCount}</span>
                  )}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div
        className="offcanvas offcanvas-end"
        tabIndex={-1}
        id="cartOffcanvas"
        aria-labelledby="cartOffcanvasLabel"
      >
        <div className="offcanvas-header">
          <h2 className="offcanvas-title h5" id="cartOffcanvasLabel">
            Your cart
          </h2>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          />
        </div>
        <div className="offcanvas-body">
          {lines.length === 0 ? (
            <p className="text-muted mb-0">No items yet.</p>
          ) : (
            <>
              <ul className="list-group list-group-flush mb-3">
                {lines.map((line) => (
                  <li
                    key={line.bookID}
                    className="list-group-item d-flex justify-content-between align-items-start"
                  >
                    <div className="me-2 text-start">
                      <div className="fw-medium">{line.title}</div>
                      <small className="text-muted">
                        Qty {line.quantity} × ${line.price.toFixed(2)}
                      </small>
                    </div>
                    <span className="text-nowrap">
                      ${(line.price * line.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="fw-semibold text-end mb-3">
                Total: ${grandTotal.toFixed(2)}
              </p>
              <Link
                className="btn btn-primary w-100"
                to="/cart"
                data-bs-dismiss="offcanvas"
              >
                Open full cart
              </Link>
            </>
          )}
        </div>
      </div>

      <main className="app-main">
        <Outlet />
      </main>
    </>
  );
}
