/** Base URL for the Bookstore API (no trailing slash). Set at build time via `VITE_API_BASE_URL`. */
export const API_BASE = (
  import.meta.env.VITE_API_BASE_URL as string | undefined
)?.replace(/\/$/, '') ?? 'http://localhost:5103';
