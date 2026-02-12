# Deploying TempAuth to Render

This guide walks you through deploying the **Backend** and **Admin Panel** to Render.com.

> **Prerequisites:** Push your latest code to GitHub.

---

## 🏗️ 1. Deploy the Backend (FastAPI)

1.  Log in to [Render](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository: `TempAuth`.
4.  **Configuration:**
    *   **Name:** `tempauth-backend`
    *   **Root Directory:** `backend`
    *   **Runtime:** **Docker** (Render will automatically detect the `Dockerfile` in the `backend/` directory)
    *   **Environment Variables** (Scroll down to "Advanced"):
        *   `TEMP_AUTH_API_KEY`: *(Generate a strong secure key)*
        *   `ALLOWED_ORIGINS`: `https://tempauth-admin.onrender.com` *(You will update this later with your actual Admin URL)*
        *   `DATABASE_URL`: *(If using Render PostgreSQL, this is auto-injected. Otherwise, if unset, it defaults to ephemeral SQLite)*
5.  Click **Create Web Service**.
6.  **Copy the URL** (e.g., `https://tempauth-backend.onrender.com`) once it's live.

> **Database Note:** By default, this uses SQLite, which wipes data on every deploy/restart. For permanent data, create a **Render PostgreSQL** database and set `DATABASE_URL` in the environment variables.

---

## 🖥️ 2. Deploy the Admin Panel (Next.js)

1.  Click **New +** -> **Web Service**.
2.  Connect the same GitHub repository.
3.  **Configuration:**
    *   **Name:** `tempauth-admin`
    *   **Root Directory:** `admin`
    *   **Runtime:** **Node**
    *   **Build Command:** `npm install; npm run build`
    *   **Start Command:** `npm start`
4.  **Environment Variables:**
    *   `NEXT_PUBLIC_API_URL`: Paste your **Backend URL** (e.g., `https://tempauth-backend.onrender.com`)
    *   `NEXT_PUBLIC_API_KEY`: Paste the same key you used for the Backend.
5.  Click **Create Web Service**.

---

## 🔄 3. Final Connection

1.  Go back to your **Backend Service** settings.
2.  Update the `ALLOWED_ORIGINS` variable.
3.  Set it to your new **Admin URL** (e.g., `https://tempauth-admin.onrender.com`).
4.  Render will auto-deploy the change.

---

## 📱 4. Mobile App (Web Version)

Since Render is great for static sites, you can host the Flutter Web build here too!

1.  **Build Locally:**
    ```bash
    cd mobile
    flutter build web --release
    ```
2.  **Deploy Option A: Manual Upload (Netlify/Surge)** 
    *   Drag and drop the contents of `mobile/build/web` to [Netlify Drop](https://app.netlify.com/drop).

3.  **Deploy Option B: Render Static Site**
    *   You need to commit the `build/web` folder to git (usually ignored).
    *   Create a **New Static Site** on Render.
    *   Root Directory: `mobile/build/web`.
    *   Go live!
