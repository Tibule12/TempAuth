# TempAuth

**TempAuth** is a professional, secure, and ephemeral Multi-Factor Authentication (MFA) system designed for temporary access. It features a high-performance backend, a glassmorphism-styled admin dashboard, and a sleek mobile authenticator app.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Status](https://img.shields.io/badge/status-production--ready-green)

---

## 🚀 Features

### 🛡️ Core Security
- **Ephemeral Tokens:** Automatic expiration (TTL) for all access grants.
- **Secure API:** Endpoints protected by high-entropy API Keys (`X-API-Key`).
- **Audit Logging:** Immutably tracks creation, revocation, and access attempts.

### 💻 Admin Dashboard (Next.js)
- **Glassmorphism UI:** Modern, translucent design with Tailwind CSS.
- **Real-time Stats:** Monitor active sessions and system health.
- **One-Click Revocation:** Instantly kill compromised or expired tokens.
- **QR Code Generation:** Secure provisioning for the mobile app.

### 📱 Mobile App (Flutter)
- **Professional UX:** Slate & Emerald dark theme with `GoogleFonts`.
- **Live Countdowns:** Circular progress indicators for TOTP codes.
- **Cross-Platform:** Runs on Android, iOS, and Web.
- **Offline Capable:** Generates codes without internet access once provisioned.

---

## 🛠️ Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend** | **FastAPI** (Python 3.10+) | Async high-performance API with SQLAlchemy & SQLite/Postgres. |
| **Admin** | **Next.js 16** (React) | Server-side rendered dashboard using Tailwind CSS. |
| **Mobile** | **Flutter 3.16+** | Native compiled app for Android/iOS/Web. |

---

## ⚡ Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- Flutter SDK (for mobile)

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```
*   Server runs at: `http://localhost:8000`
*   API Documentation: `http://localhost:8000/docs`

### 3. Admin Panel Setup
```bash
cd admin
npm install
npm run dev
```
*   Dashboard runs at: `http://localhost:3000`
*   Default API Key: `dev_secret_key_123` (configured in `.env` or code fallback)

### 4. Mobile App Setup
```bash
cd mobile
flutter pub get
flutter run -d chrome  # For Web
# flutter run          # For Android/iOS
```

---

## 🔐 Environment Variables

For production deployment, you **must** configure the following environment variables. See [DEPLOYMENT.md](./DEPLOYMENT.md) for full details.

**Backend (`.env`):**
```env
TEMP_AUTH_API_KEY=your_secure_production_key
DATABASE_URL=postgresql://user:pass@host/db
ALLOWED_ORIGINS=https://your-admin-site.com
```

**Admin (`.env.local`):**
```env
NEXT_PUBLIC_API_URL=https://your-backend-api.com
NEXT_PUBLIC_API_KEY=your_secure_production_key
```

---

## 📦 Deployment

### Backend
Dockerize the `backend/` directory or deploy to platforms like Railway/Render.

### Frontend
Deploy the `admin/` directory to **Vercel** or Netlify.

### Mobile
Build release binaries:
```bash
# Android
flutter build apk --release

# Web
flutter build web --release
```

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.