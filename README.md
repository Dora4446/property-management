# PropertyHub – Smart Property Management System (MERN Stack)

**PropertyHub** is an enterprise-grade full-stack real estate and rental property management web application built strictly with the **MERN** stack (MongoDB, Express.js, React, Node.js) and TypeScript.

Designed specifically for independent property owners, residential housing societies, property managers, and real estate agencies in India.

- **Currency:** Indian Rupee (INR - ₹)
- **Date Format:** DD-MM-YYYY
- **Locale:** India

---

## 🚀 Key Features

### 1. Role-Based Access Control (RBAC)
Dedicated interfaces, permissions, and security middleware for 5 distinct roles:
- **ADMIN:** Complete platform oversight, user activation/deactivation, financial audits, and activity logs.
- **PROPERTY OWNER:** Manage owned residential & commercial properties, monitor occupancy rates, track rental income yield, and calculate Net Operating Income (NOI).
- **PROPERTY MANAGER:** Supervise assigned units, verify tenant KYC (Aadhaar/PAN), manage 11-month lease agreements, and dispatch repair technicians.
- **REAL ESTATE AGENT:** Manage vacant unit inventory, schedule physical property showing visits, and track prospective tenant inquiries.
- **TENANT RESIDENT:** Access rented home details, review 11-month digital lease terms, pay monthly rent via Razorpay, download tax-compliant PDF rent receipts, and submit maintenance tickets.

### 2. Core Modules
- **Property Management:** Full CRUD with specifications (BHK, bathrooms, built-up sq ft, furnishing status), amenities, photo galleries, and occupancy state.
- **Tenant Management:** Resident directory, emergency contacts, employer details, and Aadhaar/PAN identity verification badges.
- **Rental & Lease Contracts:** 11-month standard Indian tenancy agreements with start/end dates, renewal workflows, and termination safeguards to prevent double-booking.
- **Rent Invoicing & Payments:**
  - Automated monthly pending rent invoice generation.
  - Razorpay payment gateway integration with server-side HMAC-SHA256 signature verification.
  - Development sandbox fallback mode when live credentials are not provided.
  - Automatic downloadable PDF rent receipts with landlord, tenant, tax placeholders, and transaction references.
  - Offline payment recording (Cash, Cheque, RTGS) with receipt generation.
- **Maintenance & Complaints:** Ticket workflow (Open → Assigned → In Progress → Resolved → Closed), technician phone assignment, estimated/actual repair costs, and automatic recording into operating expenses upon resolution.
- **Financial Ledger & Net Operating Income (NOI):** Gross rental collections minus operating expenses (society maintenance, BBMP property taxes, repairs, utility bills) formatted in INR (₹).
- **Analytics & Recharts:** Interactive visualizations for monthly cash flow growth, portfolio asset breakdown, and occupancy dynamics with CSV export capability.
- **In-App Notifications:** Real-time notices for rent dues, successful payments, and maintenance updates.

---

## 🛠️ Technology Stack

- **Frontend:**
  - React 18 + TypeScript + Vite
  - Tailwind CSS (Curated Navy Blue `#0f172a`, Slate `#334155`, and Accent Teal `#0d9488` palette)
  - Lucide React Icons
  - Recharts (Data Visualizations)
  - Zustand (State Management with persistence)
  - Axios (HTTP client with automatic JWT Bearer token interceptor)
- **Backend:**
  - Node.js + Express.js + TypeScript
  - Mongoose ODM
  - Dual-mode Database: Connects to local/Atlas MongoDB via `MONGO_URI` if active; automatically boots an embedded in-memory MongoDB (`mongodb-memory-server`) as a seamless zero-configuration fallback.
  - JWT Authentication (Access + Refresh tokens)
  - bcrypt Password Hashing
  - Zod Request Schema Validation
  - PDFKit for official PDF rent receipt generation
  - Razorpay SDK with verified server-side signature validation
  - Helmet & CORS security middleware

---

## 🔑 Pre-Configured Accounts (Standard Login)

Users can sign in on `/login` using the standard email and password authentication, or register a new account on `/register`:

| Role | Name | Email | Password |
|---|---|---|---|
| **ADMIN** | Anand Verma | `admin@propertyhub.in` | `Admin@123` |
| **PROPERTY OWNER** | Rajesh Sharma | `owner@propertyhub.in` | `Owner@123` |
| **PROPERTY MANAGER** | Pooja Mehta | `manager@propertyhub.in` | `Manager@123` |
| **AGENT** | Vikram Singh | `agent@propertyhub.in` | `Agent@123` |
| **TENANT** | Aarav Patel | `tenant@propertyhub.in` | `Tenant@123` |

---

## 📦 Project Structure

```
property management/
├── package.json                   # Root monorepo workspace scripts
├── .gitignore
├── README.md
│
├── client/                        # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── components/            # StatCard, Badge, Modal, Sidebar, Topbar
│   │   ├── layouts/               # DashboardLayout, AuthLayout
│   │   ├── pages/                 # Public, Role Dashboards, Properties, Tenants,
│   │   │                          # Agreements, Payments, Maintenance, Expenses, Reports
│   │   ├── routes/                # ProtectedRoute, AppRoutes
│   │   ├── services/              # Axios API configuration
│   │   ├── store/                 # Zustand Auth & Notification stores
│   │   ├── types/                 # TypeScript interfaces
│   │   └── utils/                 # INR & DD-MM-YYYY formatters
│   └── package.json
│
└── server/                        # Node.js + Express + TypeScript Backend
    ├── src/
    │   ├── config/                # Dual-mode DB connection, env config
    │   ├── controllers/           # Auth, Properties, Tenants, Agreements, Payments,
    │   │                          # Maintenance, Expenses, Reports, Visits, Users
    │   ├── middleware/            # Auth, Role authorization, Zod validation, ErrorHandler
    │   ├── models/                # 10 Mongoose models with validation & indexes
    │   ├── routes/                # REST endpoints under /api/*
    │   ├── seed/                  # Realistic Indian property management seed data
    │   ├── services/              # PDFKit receipt generator & Razorpay verification
    │   ├── app.ts                 # Express configuration
    │   └── server.ts              # Server bootstrap and auto-seeding
    └── package.json
```

---

## 🏃 Running the Application

### 1. Install Dependencies
Run from the root directory:
```bash
npm run install:all
```

### 2. Start Both Backend & Frontend Simultaneously
```bash
npm run dev
```
- **Backend API:** `http://localhost:5000` (Health check: `http://localhost:5000/api/health`)
- **Frontend App:** `http://localhost:5173`

### 3. Re-seed Sample Database (Optional)
If you wish to re-populate the sample data at any time:
```bash
npm run seed
```

---

## 🛡️ Security Best Practices
- **No Client-Side Payment Trust:** Payment orders are initiated server-side. Payments are only confirmed after cryptographic HMAC-SHA256 signature verification.
- **Strict Role Enforcement:** Every administrative endpoint validates both JWT token validity and role membership on the backend.
- **Data Integrity:** Active leases prevent accidental unit deletion or conflicting tenant reassignments.
