# Mission 13 — Bookstore admin CRUD and Azure deployment

Builds on Mission 12 with **create / update / delete books** (admin page), **SPA deep links** for Azure, and notes for **deploying the API and React app**.

## Run locally

**Prerequisites:** [.NET 10 SDK](https://dotnet.microsoft.com/download) for the API; Node.js for the React app.

**1. API** (from `Mission13/BookstoreAPI`):

```bash
dotnet run
```

API: [http://localhost:5103](http://localhost:5103)

The SQLite file `Bookstore.sqlite` at the Mission 13 folder root is copied into the API output folder on build. If no `ConnectionStrings:Bookstore` is set, the API uses that file next to the built DLL, or falls back to `..\Bookstore.sqlite` during development.

**2. React app** (from `Mission13/bookstore-app`):

```bash
npm install
npm run dev
```

App: [http://localhost:5173](http://localhost:5173)

- **Catalog:** [http://localhost:5173/](http://localhost:5173/)
- **Admin (add / edit / delete books):** [http://localhost:5173/adminbooks](http://localhost:5173/adminbooks)

Optional: create `bookstore-app/.env` with `VITE_API_BASE_URL=http://localhost:5103` (defaults to this if unset).

## Admin API endpoints


| Method | Route             | Description                                         |
| ------ | ----------------- | --------------------------------------------------- |
| GET    | `/api/books/{id}` | Single book                                         |
| POST   | `/api/books`      | Create (JSON body matches `Book`; `bookID` ignored) |
| PUT    | `/api/books/{id}` | Update                                              |
| DELETE | `/api/books/{id}` | Delete                                              |


Existing list and category endpoints are unchanged.

## Azure deployment

The app is deployed on azure:
[https://mission13-h5dcdpe0b6abb0ab.francecentral-01.azurewebsites.net](https://mission13-h5dcdpe0b6abb0ab.francecentral-01.azurewebsites.net)