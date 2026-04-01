# Mission 13 — Bookstore admin CRUD and Azure deployment

Builds on Mission 12 with **create / update / delete books** (admin page), **SPA deep links** for Azure, and notes for **deploying the API and React app**.

## Run locally

**1. API** (from `Mission13/BookstoreAPI`):

```bash
dotnet run
```

API: http://localhost:5103

The SQLite file `Bookstore.sqlite` at the Mission 13 folder root is copied into the API output folder on build. If no `ConnectionStrings:Bookstore` is set, the API uses that file next to the built DLL, or falls back to `..\Bookstore.sqlite` during development.

**2. React app** (from `Mission13/bookstore-app`):

```bash
npm install
npm run dev
```

App: http://localhost:5173

- **Catalog:** http://localhost:5173/
- **Admin (add / edit / delete books):** http://localhost:5173/adminbooks

Optional: create `bookstore-app/.env` with `VITE_API_BASE_URL=http://localhost:5103` (defaults to this if unset).

## Admin API endpoints

| Method | Route | Description |
|--------|--------|-------------|
| GET | `/api/books/{id}` | Single book |
| POST | `/api/books` | Create (JSON body matches `Book`; `bookID` ignored) |
| PUT | `/api/books/{id}` | Update |
| DELETE | `/api/books/{id}` | Delete |

Existing list and category endpoints are unchanged.

## Azure deployment (overview)

Typical setup: **React** on **Azure Static Web Apps** (or Azure Storage static website + CDN) and **ASP.NET Core API** on **Azure App Service** (Windows or Linux).

### Front end

1. In the Static Web Apps (or build pipeline) **application settings**, set the build-time variable **`VITE_API_BASE_URL`** to your API’s public origin (no trailing slash), for example `https://your-api-name.azurewebsites.net`.
2. Build: `npm run build` in `bookstore-app`. Deploy the contents of `dist/`.
3. **SPA routing:** `public/routes.json` is included per course instructions so paths like `/adminbooks` resolve to the React app. `public/staticwebapp.config.json` adds a **navigation fallback** to `index.html` for Azure Static Web Apps.

### API (App Service)

1. Publish the `BookstoreAPI` project (e.g. zip deploy or GitHub Actions).
2. Ensure **`Bookstore.sqlite`** is deployed with the app (it is included from the project via `BookstoreAPI.csproj`), or set **`ConnectionStrings__Bookstore`** to `Data Source=Bookstore.sqlite` in **Configuration → Application settings** if needed.
3. **CORS:** In App Service application settings, set **`Cors__AllowedOrigins`** to your front-end origin (semicolon-separated if multiple), for example `https://your-app.azurestaticapps.net`. If unset, the API allows any origin (fine for local dev; tighten for production).

Submit the **deployed site URL** via Learning Suite (or your GitHub repo link if the site is not deployed).

## Learning Suite — Bootstrap (#notcoveredinthevideos)

Use the same bullets as Mission 12 (Offcanvas in `Layout.tsx`, Accordion in `BookList.tsx`) unless your instructor asks for new items.
