# Dr's Kart — Administration Platform (Full-Stack)

This is the independent, standalone **Administration Panel** for Dr's Kart Medical Equipment B2B Marketplace.
It is completely decoupled from the customer marketplace application, enabling independent hosting, distinct security policies, and zero admin code footprint in the marketplace codebase.

---

## 🏗️ Architecture

```
d:\adminpanel\
├── backend/                  # Dedicated Express API Server (Port 5000)
│   ├── config/               # DB (PostgreSQL), Twilio, Nodemailer, Cache
│   ├── controllers/          # Admin, 2FA Auth, and Analytics controllers
│   ├── middlewares/          # JWT auth, 2FA admin role guard, auditLog, file upload
│   ├── routes/               # /api/admin, /api/admin/auth, /api/analytics
│   ├── services/             # Platform stats, KYC moderation, banner manager, user controls
│   ├── public/uploads/       # Uploaded hero banners and assets
│   ├── server.js             # API entrypoint
│   └── .env                  # DB connection and secrets
│
└── frontend/                 # Standalone React + Vite + Tailwind Website (Port 5174)
    ├── src/
    │   ├── pages/admin/      # 2FA Secret Portal, Overview, KYC, Banners, Users, Security...
    │   ├── components/       # AdminLayout, AdminNotifications, AdminProtectedRoute, UI kit
    │   ├── hooks/            # React Query hooks for KYC, Banners, Flags, Services
    │   ├── lib/              # Axios API client configured to http://localhost:5000/api
    │   └── routes/           # App router
    ├── vite.config.ts        # Proxies /api and /uploads to backend:5000
    └── .env                  # VITE_API_URL and VITE_MARKETPLACE_URL
```

---

## 🚀 Quick Start

### 1. Start the Backend API Server
```bash
cd d:\adminpanel\backend
npm install
npm run dev
```
* **API Server**: `http://localhost:5000`
* **Health Check**: `http://localhost:5000/health`

### 2. Start the Frontend Admin Dashboard
```bash
cd d:\adminpanel\frontend
npm install
npm run dev
```
* **Admin Website**: `http://localhost:5174`
* **Login URL**: `http://localhost:5174/secret-admin-portal`

---

## 🔐 2-Factor Authentication (2FA) Dual Verification Flow
1. Navigate to `http://localhost:5174/secret-admin-portal`.
2. Enter your administrator email or phone number.
3. The system generates and sends:
   - An **Email OTP** to the registered administrator email.
   - An **SMS OTP** via Twilio to the registered mobile number.
4. Enter both 6-digit verification codes to authenticate.
5. On successful dual verification, an elevated session token (`admin2Fa: true`) is issued, granting access to the control center.

---

## 🔗 Shared Database Connection
Both the customer marketplace (`DkartAuthFinal`) and this Admin Panel connect to the same PostgreSQL database:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/dkartauth
```
Any changes made in this admin panel (approving seller KYC, modifying banners, suspending users, resolving tickets) immediately update the shared database and reflect in real time on the marketplace.
