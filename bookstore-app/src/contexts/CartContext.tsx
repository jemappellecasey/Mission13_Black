import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Book, BrowsingContext } from '../types/Book';

const CART_KEY = 'bookstore-cart';
const RETURN_KEY = 'bookstore-return';

export interface CartLine {
  bookID: number;
  title: string;
  author: string;
  price: number;
  quantity: number;
}

function loadCartFromStorage(): CartLine[] {
  try {
    const raw = sessionStorage.getItem(CART_KEY);
    if (!raw) return [];
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (row): row is CartLine =>
        row !== null &&
        typeof row === 'object' &&
        typeof (row as CartLine).bookID === 'number' &&
        typeof (row as CartLine).quantity === 'number' &&
        typeof (row as CartLine).price === 'number'
    );
  } catch {
    return [];
  }
}

function saveCartToStorage(lines: CartLine[]) {
  sessionStorage.setItem(CART_KEY, JSON.stringify(lines));
}

function loadBrowsingFromStorage(): BrowsingContext | null {
  try {
    const raw = sessionStorage.getItem(RETURN_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<BrowsingContext>;
    if (
      typeof o.page !== 'number' ||
      typeof o.pageSize !== 'number' ||
      typeof o.category !== 'string' ||
      typeof o.sortAsc !== 'boolean'
    )
      return null;
    return {
      page: o.page,
      pageSize: o.pageSize,
      category: o.category,
      sortAsc: o.sortAsc,
    };
  } catch {
    return null;
  }
}

function saveBrowsingToStorage(ctx: BrowsingContext) {
  sessionStorage.setItem(RETURN_KEY, JSON.stringify(ctx));
}

interface CartContextValue {
  lines: CartLine[];
  addToCart: (book: Book, quantity?: number) => void;
  setLineQuantity: (bookID: number, quantity: number) => void;
  removeLine: (bookID: number) => void;
  lineSubtotal: (bookID: number) => number;
  grandTotal: number;
  itemCount: number;
  rememberBrowsingContext: (ctx: BrowsingContext) => void;
  getBrowsingContext: () => BrowsingContext | null;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => loadCartFromStorage());

  const addToCart = useCallback(
    (book: Book, quantity = 1) => {
      const qty = Math.max(1, quantity);
      setLines((prev) => {
        const idx = prev.findIndex((l) => l.bookID === book.bookID);
        let next: CartLine[];
        if (idx === -1) {
          next = [
            ...prev,
            {
              bookID: book.bookID,
              title: book.title,
              author: book.author,
              price: book.price,
              quantity: qty,
            },
          ];
        } else {
          next = prev.map((l, i) =>
            i === idx ? { ...l, quantity: l.quantity + qty } : l
          );
        }
        saveCartToStorage(next);
        return next;
      });
    },
    []
  );

  const setLineQuantity = useCallback(
    (bookID: number, quantity: number) => {
      const q = Math.floor(quantity);
      if (q < 1) {
        setLines((prev) => {
          const next = prev.filter((l) => l.bookID !== bookID);
          saveCartToStorage(next);
          return next;
        });
        return;
      }
      setLines((prev) => {
        const next = prev.map((l) =>
          l.bookID === bookID ? { ...l, quantity: q } : l
        );
        saveCartToStorage(next);
        return next;
      });
    },
    []
  );

  const removeLine = useCallback((bookID: number) => {
    setLines((prev) => {
      const next = prev.filter((l) => l.bookID !== bookID);
      saveCartToStorage(next);
      return next;
    });
  }, []);

  const rememberBrowsingContext = useCallback((ctx: BrowsingContext) => {
    saveBrowsingToStorage(ctx);
  }, []);

  const getBrowsingContext = useCallback(() => loadBrowsingFromStorage(), []);

  const lineSubtotal = useCallback(
    (bookID: number) => {
      const line = lines.find((l) => l.bookID === bookID);
      if (!line) return 0;
      return line.price * line.quantity;
    },
    [lines]
  );

  const grandTotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    [lines]
  );

  const itemCount = useMemo(
    () => lines.reduce((n, l) => n + l.quantity, 0),
    [lines]
  );

  const value = useMemo(
    () => ({
      lines,
      addToCart,
      setLineQuantity,
      removeLine,
      lineSubtotal,
      grandTotal,
      itemCount,
      rememberBrowsingContext,
      getBrowsingContext,
    }),
    [
      lines,
      addToCart,
      setLineQuantity,
      removeLine,
      lineSubtotal,
      grandTotal,
      itemCount,
      rememberBrowsingContext,
      getBrowsingContext,
    ]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

// Cart state hook (use only under <CartProvider>). Colocated with provider for clarity.
// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
