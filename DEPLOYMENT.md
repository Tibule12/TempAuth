# Deployment Guide

## 1. Environment Variables

To run in production, you must set the following environment variables.

### Backend (FastAPI)
| Variable | Description | Default (Dev) |
|----------|-------------|---------------|
| `TEMP_AUTH_API_KEY` | Secret key for protecting API endpoints | `dev_secret_key_123` |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed frontend URLs | `http://localhost:3000` |
| `DATABASE_URL` | Connection string for the database | `sqlite:///./tempauth.db` |

**Example Production Command:**
```bash
export TEMP_AUTH_API_KEY="prod_secure_key_999"
export ALLOWED_ORIGINS="https://admin.yourdomain.com"
export DATABASE_URL="postgresql://user:pass@db-host:5432/tempauth"
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Admin Panel (Next.js)
| Variable | Description | Default (Dev) |
|----------|-------------|---------------|
| `NEXT_PUBLIC_API_URL` | Full URL to the backend API | `http://localhost:8000` |
| `NEXT_PUBLIC_API_KEY` | Must match `TEMP_AUTH_API_KEY` | `dev_secret_key_123` |

**Example Production Build:**
```bash
export NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
export NEXT_PUBLIC_API_KEY="prod_secure_key_999"
npm run build
npm start
```

## 2. Infrastructure
*   **Database:** Switch from SQLite to PostgreSQL for persistence.
*   **HTTPS:** Ensure both Backend and Admin are served over HTTPS.
*   **Secret Management:** Do not commit `.env` files to git.

## 3. Deployment Steps
1.  **Backend:** Dockerize and deploy to Render/Railway/AWS.
2.  **Admin:** Deploy to Vercel/Netlify using the repository. Add the Env Vars in the dashboard.
3.  **Mobile:** Build release binaries (`flutter build apk --release`) and distribute.
