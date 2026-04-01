import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

export default function ShoppingCart() {
  const {
    lines,
    setLineQuantity,
    removeLine,
    grandTotal,
    getBrowsingContext,
  } = useCart();
  const navigate = useNavigate();

  const handleContinueShopping = () => {
    const ctx = getBrowsingContext();
    const p = new URLSearchParams();
    if (ctx) {
      p.set('page', String(Math.max(1, ctx.page)));
      p.set('pageSize', String(ctx.pageSize));
      if (ctx.category) p.set('category', ctx.category);
      p.set('sort', ctx.sortAsc ? 'asc' : 'desc');
    }
    navigate(p.toString() ? `/?${p.toString()}` : '/');
  };

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col">
          <h1 className="h2 mb-0">Shopping cart</h1>
          <p className="text-muted mb-0">
            Quantities and line totals update as you change them. Your cart is
            kept for this browser session.
          </p>
        </div>
      </div>

      {lines.length === 0 ? (
        <div className="alert alert-info" role="status">
          Your cart is empty.{' '}
          <Link to="/" className="alert-link">
            Browse books
          </Link>
        </div>
      ) : (
        <>
          <div className="row">
            <div className="col-12">
              <div className="table-responsive shadow-sm rounded">
                <table className="table table-striped table-hover align-middle mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th scope="col">Title</th>
                      <th scope="col">Author</th>
                      <th scope="col" className="text-end">
                        Price
                      </th>
                      <th scope="col" style={{ width: '8rem' }}>
                        Qty
                      </th>
                      <th scope="col" className="text-end">
                        Subtotal
                      </th>
                      <th scope="col" aria-label="Remove" />
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line) => {
                      const sub = line.price * line.quantity;
                      return (
                        <tr key={line.bookID}>
                          <td>{line.title}</td>
                          <td>{line.author}</td>
                          <td className="text-end">
                            ${line.price.toFixed(2)}
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              min={1}
                              value={line.quantity}
                              onChange={(e) => {
                                const v = parseInt(e.target.value, 10);
                                if (Number.isNaN(v)) return;
                                setLineQuantity(line.bookID, v);
                              }}
                              aria-label={`Quantity for ${line.title}`}
                            />
                          </td>
                          <td className="text-end fw-medium">
                            ${sub.toFixed(2)}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeLine(line.bookID)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="table-group-divider">
                    <tr>
                      <th colSpan={4} className="text-end">
                        Order total
                      </th>
                      <th className="text-end">
                        ${grandTotal.toFixed(2)}
                      </th>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <div className="row mt-4">
            <div className="col-md-6">
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={handleContinueShopping}
              >
                Continue shopping
              </button>
            </div>
            <div className="col-md-6 text-md-end mt-3 mt-md-0">
              <p className="fs-5 fw-semibold mb-0">
                Total: ${grandTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
