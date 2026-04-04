# Mission 13 — Bookstore admin CRUD and Azure deployment

Builds on Mission 12 with **create / update / delete books** (admin page), **SPA deep links** for Azure, and notes for **deploying the API and React app**.

## Run locally

**Prerequisites:** [.NET 10 SDK](https://dotnet.microsoft.com/download) for the API; Node.js for the React app.

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

**Recommended:** deploy **one** App Service that runs the **ASP.NET Core API** and serves the **Vite build** from `BookstoreAPI/wwwroot` (same site URL for UI and `/api`). GitHub Actions (`.github/workflows/main_mission13.yml`) runs `npm run build` with `VITE_API_BASE_URL=__SAME_ORIGIN__`, copies `bookstore-app/dist` into `wwwroot`, then `dotnet publish` and deploys. `Program.cs` uses static files + `MapFallbackToFile("index.html")` so React Router works on refresh.

**Optional:** host the React app separately on **Azure Static Web Apps** (older split); see **`AzureDeployment.md`**. The generated Static Web Apps workflow in this repo is **disabled** in favor of the single-host path.

### App Service (API + SPA)

1. Publish `BookstoreAPI` (GitHub Actions or manual `dotnet publish` after copying `dist` → `BookstoreAPI/wwwroot`).
2. **Database:** **SQLite:** `Bookstore.sqlite` ships with the project, or set **`ConnectionStrings__Bookstore`**. **Azure SQL:** set **`ConnectionStrings__Bookstore`** to the ADO.NET string from the portal. Details in **`AzureDeployment.md`**.
3. **CORS:** For the single-host setup, the browser calls `/api` on the **same origin**, so **`Cors__AllowedOrigins`** is usually unnecessary. If you split the front end to another domain, set **`Cors__AllowedOrigins`** to that origin.

Submit the **deployed App Service URL** (same URL for catalog and API) via Learning Suite unless your syllabus asks for something else.

## Learning Suite — Bootstrap (#notcoveredinthevideos)

Use the same bullets as Mission 12 (Offcanvas in `Layout.tsx`, Accordion in `BookList.tsx`) unless your instructor asks for new items.
