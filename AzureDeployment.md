# Deploying the Mission 13 Bookstore to Azure

This guide walks through a common setup for this project:

- **Front end:** React (Vite) → **Azure Static Web Apps**
- **Back end:** ASP.NET Core minimal API → **Azure App Service** (Linux is typical)
- **Database:** **SQLite** (file shipped with the API) or **Azure SQL Database** (managed; see section 1.3 below)

Your instructor may also allow other hosting options; this path matches the course notes and works well with `routes.json` and `staticwebapp.config.json` in `bookstore-app/public/`.

---

## Prerequisites

- An [Azure account](https://azure.microsoft.com/free/) (student credit or free tier is fine).
- **Git** (optional but recommended if you connect GitHub to Azure).
- Your project builds locally:
  - API: `dotnet publish` from `BookstoreAPI`
  - App: `npm run build` from `bookstore-app` (after setting `VITE_API_BASE_URL` for production—see below).

---

## Part 1 — Deploy the API (App Service)

### 1.1 Create the App Service

1. In the [Azure Portal](https://portal.azure.com), create a resource.
2. Search for **Web App** and create it.
3. **Basics:**
   - **Subscription / Resource group:** Create or pick a group (e.g. `rg-bookstore-m13`).
   - **Name:** e.g. `bookstore-api-yourname` (must be globally unique). This becomes `https://bookstore-api-yourname.azurewebsites.net`.
   - **Publish:** Code.
   - **Runtime stack:** **.NET 8** (LTS).
   - **Operating System:** **Linux** (recommended) or Windows.
   - **Region:** Choose one near you.
4. **App Service plan:** Start with the cheapest **Dev/Test** / **B1** (or **F1** Free if available and acceptable for class; free tier has limitations).
5. Finish **Review + create**, then **Create**.

### 1.2 Publish your API

Pick one approach; both work.

**Option A — Visual Studio / VS Code**

- Right‑click `BookstoreAPI` → **Publish** → Azure → App Service → select the web app you created.
- Or use `dotnet publish` and deploy the output folder (see Option B).

**Option B — `dotnet publish` + zip deploy**

From a terminal in `Mission13/BookstoreAPI`:

```bash
dotnet publish -c Release -o ./publish
```

Zip the **contents** of `publish` (the `publish` folder’s inner files, not the folder name itself as the only item—Azure expects the zip root to contain `BookstoreAPI.dll` and dependencies).

In the portal: open your **Web App** → **Deployment Center** → **FTPS credentials** or **Zip Deploy** (or use **Advanced Tools (Kudu)** → **Zip push deploy**). Many tutorials use **Azure CLI**:

```bash
az webapp deployment source config-zip --resource-group <your-rg> --name <your-api-name> --src <path-to-your.zip>
```

After deployment, the site root should contain `BookstoreAPI.dll`, `Bookstore.sqlite` (if copied from the project), and `appsettings.json` / `appsettings.Production.json`.

### 1.3 Database options

#### Option A — SQLite on App Service (simplest)

The project copies `Bookstore.sqlite` into the publish output. The API resolves the database path at runtime (see `Program.cs`).

- **Application settings** (Configuration → Application settings), if needed:
  - **`ConnectionStrings__Bookstore`** = `Data Source=Bookstore.sqlite`

This path is relative to the app’s working directory on App Service; the copied file next to the DLL should work after a correct publish.

**Note:** SQLite on App Service is fine for many class projects. If the app scales out or the file is not persisted, consider Azure SQL.

#### Option B — Azure SQL Database (managed, recommended if you want the DB in Azure)

1. In the Azure Portal, create a **SQL database** (or **Azure SQL Database**). Create a server if you do not have one. Note the **server name** (e.g. `yourserver.database.windows.net`).

2. **Networking / firewall:** Allow connections from Azure services (or add your App Service outbound IPs). For development, you can temporarily allow your client IP.

3. In the SQL database’s **Connection strings** blade, copy the **ADO.NET** connection string. Replace `{your_username}` and `{your_password}` with the SQL admin login you created.

4. On your **Web App** (App Service) → **Configuration** → **Application settings**, add:

   | Name | Value |
   |------|--------|
   | **`ConnectionStrings__Bookstore`** | The full ADO.NET connection string (must include `Server=tcp:xxx.database.windows.net` and credentials). |

   The API **auto-detects** SQL Server when the connection string looks like Azure SQL (`database.windows.net` or `Server=` + `Initial Catalog` / `Database=`). It applies **EF Core migrations** on startup so the `Books` table is created automatically.

5. Optional override: **`Database__Provider`** = `SqlServer` or `Sqlite` if you need to force a provider (normally not required).

6. **Seed data:** SQLite data in `Bookstore.sqlite` is **not** copied to Azure SQL automatically. After the first deploy, use **SQL Server Management Studio**, **Azure Data Studio**, or the portal **Query editor** to run `INSERT` statements, or add a small seed step in code if your instructor allows it.

### 1.4 CORS (required for the SPA)

The browser must be allowed to call your API from your Static Web App origin.

1. Web App → **Configuration** → **Application settings** → **New application setting**.
2. Name: **`Cors__AllowedOrigins`**  
   Value: your **front-end URL only**, e.g. `https://your-app-name.azurestaticapps.net`  
   (No trailing slash. For multiple origins, use **semicolons** between URLs.)
3. **Save**, then restart the app if prompted.

Until you set this, **do not** rely on “allow all” in production—your API code only restricts origins when `Cors:AllowedOrigins` is non-empty.

### 1.5 Test the API

Open a browser or `curl`:

```text
https://<your-api-name>.azurewebsites.net/api/categories
```

You should see JSON. If you get **500**, check **Log stream** or **Diagnose and solve problems** in the portal.

---

## Part 2 — Deploy the React app (Static Web Apps)

### 2.1 Why Static Web Apps

Azure Static Web Apps hosts the built Vite app, gives you HTTPS and a URL, and works with the `navigationFallback` in `public/staticwebapp.config.json` so routes like `/adminbooks` load the SPA (in addition to `routes.json` as required by your course).

### 2.2 Build settings (important)

The API URL is **baked in at build time** via Vite:

- **`VITE_API_BASE_URL`** must be your **HTTPS API origin**, e.g. `https://bookstore-api-yourname.azurewebsites.net`  
  - **No trailing slash.**

### 2.3 Create Static Web App (GitHub — recommended)

1. Push your repo to **GitHub** if it is not already there.
2. Portal → **Create a resource** → **Static Web App**.
3. Choose **GitHub**, sign in, select **repository** and **branch**.
4. **Build details:**
   - **Build Presets:** Custom.
   - **App location:** `Mission13/bookstore-app` (adjust if your repo root differs).
   - **Api location:** leave empty (API is hosted separately on App Service).
   - **Output location:** `dist` (Vite’s `npm run build` output).
5. **Add environment variable** for the build (name varies slightly in the UI; look for “Application settings” or build variables in the workflow):

   - **`VITE_API_BASE_URL`** = `https://<your-api-name>.azurewebsites.net`

6. Azure will add a GitHub Actions workflow under `.github/workflows/`.  
   - If the workflow does **not** pass `VITE_API_BASE_URL`, edit the workflow file so the `npm run build` step has access to that variable (e.g. `env` block on the build step, or set it in the Static Web App **Configuration** → **Application settings** for the **build** in newer setups).

   Example pattern for the build step:

   ```yaml
   env:
     VITE_API_BASE_URL: https://your-api-name.azurewebsites.net
   ```

   Replace with your real API URL.

7. After the workflow succeeds, open the **Static Web App URL** from the portal (e.g. `https://xxx.azurestaticapps.net`).

### 2.4 Manual deploy (no GitHub)

1. Build locally:

   ```bash
   cd bookstore-app
   set VITE_API_BASE_URL=https://your-api-name.azurewebsites.net
   npm install
   npm run build
   ```

   On PowerShell: `$env:VITE_API_BASE_URL="https://..."` before `npm run build`.

2. Upload the contents of `bookstore-app/dist` using **Azure Storage** static website + CDN, or **Static Web Apps** “Bring your own” deployment options if your portal supports it.

### 2.5 Final CORS check

Set **`Cors__AllowedOrigins`** on the **API** App Service to exactly the **Static Web App URL** (including `https://`). Then hard refresh the SPA and test:

- Catalog loads books.
- **Admin books** (`/adminbooks`) loads and can add/edit/delete.

---

## Part 3 — Troubleshooting

| Symptom | What to check |
|--------|----------------|
| Blank page or wrong API host | Rebuild the SPA with `VITE_API_BASE_URL` set to the **live** API URL; env vars are compile-time for Vite. |
| Browser CORS error | `Cors__AllowedOrigins` on API matches the **exact** front-end origin (scheme + host, no trailing slash). |
| API 404 | App Service URL + path `/api/...` — confirm the API project deployed and is listening. |
| API 500 on first DB access | **SQLite:** file missing or wrong path; verify publish includes `Bookstore.sqlite` and connection string. **Azure SQL:** firewall / connection string / credentials; check Log stream. |
| `/adminbooks` 404 on refresh | Ensure `dist` includes `routes.json` and `staticwebapp.config.json` from `public/` (Vite copies them). Redeploy after `npm run build`. |

---

## Part 4 — What to submit (Learning Suite)

Submit the **public URL** of your deployed **front end** (Static Web App). If deployment is incomplete, your instructor may accept a **GitHub** link instead—follow the syllabus.

---

## Quick reference — URLs and settings

| Item | Example |
|------|---------|
| API base URL | `https://<api-app-name>.azurewebsites.net` |
| SPA URL | `https://<static-web-app>.azurestaticapps.net` |
| Build env (front end) | `VITE_API_BASE_URL=<API base URL>` |
| App Service setting (API) | `Cors__AllowedOrigins=<SPA URL>` |
| DB on App Service (API) | **SQLite:** `ConnectionStrings__Bookstore=Data Source=Bookstore.sqlite` **Azure SQL:** paste ADO.NET string from the SQL database blade (auto-detected). |

---

## Optional: Azure CLI login

If you use the CLI:

```bash
az login
az account show
```

Use the same subscription and resource group as in the portal when running `az webapp` commands.

---

## Rubric checklist (course grading)

Use this to self-check before you submit.

| Criterion | What “Yes” looks like |
|-----------|------------------------|
| **App compiles and runs** | `dotnet build` and `npm run build` succeed; local catalog and admin pages load without console/network errors when the API is running. |
| **Add / edit / delete books** | On `/adminbooks`, you can create a row, change it, and remove it; the catalog reflects changes after refresh. |
| **Deployed on Azure (front + back)** | Static Web App URL loads the UI; API `https://…azurewebsites.net/api/categories` returns JSON from the browser’s address bar; SPA can call the API (CORS + `VITE_API_BASE_URL` set at build time). |
| **Code quality** | Clear names, short file/module comments where helpful, consistent formatting; run `npm run lint` with no errors. |

Deployment itself must be done in Azure; this repo includes `AzureDeployment.md`, `routes.json`, `staticwebapp.config.json`, and CORS/API URL configuration to support it.
