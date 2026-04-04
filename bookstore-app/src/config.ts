/** Base URL for the Bookstore API (no trailing slash). Set at build time via `VITE_API_BASE_URL`. */
const raw = import.meta.env.VITE_API_BASE_URL as string | undefined;

/** Use `__SAME_ORIGIN__` when the API is served from the same host as this SPA (e.g. Vite build copied into BookstoreAPI/wwwroot). */
export const API_BASE =
  raw === undefined || raw === ''
    ? 'http://localhost:5103'
    : raw === '__SAME_ORIGIN__'
      ? ''
      : raw.replace(/\/$/, '');
