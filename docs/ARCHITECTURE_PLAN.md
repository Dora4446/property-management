# PropertyHub – Smart Property Management System
## Architectural Blueprint & Implementation Plan

### 1. Workspace Inspection Findings
- **Workspace Directory:** `c:\Users\dorab\OneDrive\Desktop\Mtech_KLU\fullstack web engineering\property management`
- **Current State:** Empty directory (clean slate).
- **Legacy Stack Check:** No existing Java, Spring Boot, or PostgreSQL codebase present. We can build a pure, clean MERN TypeScript monorepo directly.
- **Runtime Environment:**
  - Node.js: `v24.21.0`
  - npm: `11.19.0`
  - OS: Windows 11
- **Database Strategy:** 
  - Dual-mode MongoDB connection: Connects to local/Atlas MongoDB via `MONGO_URI` if available in `.env`; automatically initializes an embedded MongoDB engine (`mongodb-memory-server`) as a zero-setup fallback. This guarantees immediate out-of-the-box functionality with zero external dependencies.

---

### 2. Proposed Folder Structure

```
propertyhub/
├── package.json                   # Monorepo root scripts (dev, build, seed, install:all)
├── .gitignore
├── README.md
│
├── client/                        # React + TypeScript + Vite + Tailwind Frontend
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── common/            # Button, Badge, Modal, Input, Table, StatCard
│       │   ├── layout/            # Sidebar, Topbar, RoleHeader, NotificationDropdown
│       │   ├── dashboard/         # Role-specific dashboard widgets, charts
│       │   └── ui/                # Toast notifications, confirmation dialogs
│       ├── layouts/               # AuthLayout, DashboardLayout, PublicLayout
│       ├── pages/
│       │   ├── public/            # LandingPage, AboutPage, ContactPage, LoginPage, RegisterPage
│       │   ├── dashboard/         # Role-based dashboard views (Admin, Owner, Manager, Agent, Tenant)
│       │   ├── properties/        # PropertyList, PropertyDetail, AddEditProperty
│       │   ├── tenants/           # TenantList, TenantDetail, AddTenantModal
│       │   ├── agreements/        # AgreementList, CreateAgreementModal, LeaseDetails
│       │   ├── payments/          # PaymentList, PayRentModal, ReceiptViewer
│       │   ├── maintenance/       # MaintenanceList, CreateRequestModal, TicketDetails
│       │   ├── expenses/          # ExpenseList, AddExpenseModal, FinancialOverview
│       │   ├── reports/           # FinancialReports, OccupancyReports, Analytics
│       │   └── profile/           # UserProfile, SecuritySettings
│       ├── hooks/                 # useAuth, useDebounce, useCurrency
│       ├── services/              # api.ts, authService, propertyService, paymentService, etc.
│       ├── store/                 # authStore.ts, notificationStore.ts, filterStore.ts
│       ├── routes/                # AppRoutes.tsx, ProtectedRoute.tsx, RoleRoute.tsx
│       ├── types/                 # User, Property, Tenant, Agreement, Payment, Maintenance, etc.
│       ├── utils/                 # formatters.ts (INR currency, DD-MM-YYYY dates), pdfGenerator.ts
│       ├── App.tsx
│       ├── main.tsx
│       └── index.css              # Custom design tokens, glassmorphism, responsive utilities
│
└── server/                        # Node.js + Express + TypeScript + Mongoose Backend
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    └── src/
        ├── config/                # db.ts (MongoDB + fallback), razorpay.ts, env.ts
        ├── models/                # User, Property, Tenant, RentalAgreement, Payment,
        │                          # MaintenanceRequest, Expense, Notification, PropertyVisit, ActivityLog
        ├── controllers/           # authController, propertyController, tenantController,
        │                          # agreementController, paymentController, maintenanceController,
        │                          # expenseController, reportController, userController
        ├── services/              # pdfReceiptService, razorpayService, emailService, notificationService
        ├── routes/                # authRoutes, propertyRoutes, tenantRoutes, agreementRoutes,
        │                          # paymentRoutes, maintenanceRoutes, expenseRoutes, reportRoutes, userRoutes
        ├── middleware/            # authMiddleware, roleMiddleware, validateMiddleware, errorHandler
        ├── validators/            # Zod validation schemas for all inputs
        ├── utils/                 # apiResponse.ts, logger.ts, constants.ts
        ├── types/                 # Express extended types, JWT payload types
        ├── seed/                  # Realistic Indian property management seed dataset & runner
        ├── app.ts                 # Express application setup, CORS, Helmet, Swagger, Routes
        └── server.ts              # Server bootstrap and graceful shutdown
```

---

### 3. Implementation Phases & Milestones

1. **Phase 1: Project Setup & Monorepo Configuration**
   - Initialize root `package.json` with workspace orchestration.
   - Configure `server` with TypeScript, Express, Mongoose, Zod, and dual-mode MongoDB connection.
   - Configure `client` with Vite, React, TypeScript, Tailwind CSS, Lucide icons, and routing.
   - Verify both backend (`http://localhost:5000`) and frontend (`http://localhost:5173`) boot without errors.

2. **Phase 2: Design System & Public Pages**
   - Define enterprise Navy Blue (`#0f172a`), Slate (`#334155`), Teal (`#0d9488`), and Indian Rupee (`₹`) styling.
   - Build Landing page, Features, Public property catalog, Contact, and About pages.
   - Build responsive layout with collapsible Sidebar, Top Navbar with search, quick actions, and user menu.

3. **Phase 3: Authentication & Role-Based Access Control (RBAC)**
   - Implement JWT access/refresh token system, bcrypt password hashing.
   - Roles: `ADMIN`, `PROPERTY_OWNER`, `PROPERTY_MANAGER`, `AGENT`, `TENANT`.
   - Backend route protection middleware (`authenticate`, `authorize(roles...)`).
   - Frontend route guards (`ProtectedRoute`, `RoleRoute`) and Zustand auth store with persistence.

4. **Phase 4: Property & People Management**
   - Property CRUD with Indian address fields (City, State, PIN), amenities, image galleries, and occupancy state.
   - Search, filter by city/type/budget, sort, and pagination.
   - Management modules for Owners, Property Managers, Agents, and Tenants.

5. **Phase 5: Rental Agreements, Leases & Rent Invoicing**
   - Digital rental agreements (Lease terms, monthly rent, deposit, start/end dates, renewal).
   - Invariant check: Prevent conflicting active leases on the same unit.
   - Automated monthly rent schedule generation with Paid, Pending, Overdue, and Partial statuses.

6. **Phase 6: Maintenance & Financial Expense Tracking**
   - Tenant maintenance request system (Category, Priority, photos, technician assignment, resolution notes).
   - Financial ledger: Rental incomes vs Property maintenance/utility expenses.
   - Property-wise net operating income (NOI) calculation in INR.

7. **Phase 7: Razorpay Payment Integration, Reports & Notifications**
   - Razorpay order creation and signature verification (with auto-detecting simulated Dev sandbox for local testing).
   - Automatic downloadable PDF rent receipts with Indian tax/PAN placeholders and transaction IDs.
   - Visual analytics using Recharts (Revenue trends, Occupancy rates, Expense breakdown).
   - In-app notification center for rent dues, lease renewals, and ticket updates.

8. **Phase 8: Comprehensive Realistic Seed Data, Testing & Documentation**
   - Seed script creating realistic Indian properties (Bengaluru, Mumbai, Hyderabad, Pune, Delhi NCR), tenants, agreements, payments, and tickets.
   - Pre-configured demo accounts for each role with 1-click login.
   - Complete README, API reference documentation, and operational guides.

---

### 4. Dependencies Breakdown

#### Root Dependencies:
- `concurrently`

#### Backend (`server`):
- Core: `express`, `mongoose`, `dotenv`, `cors`, `helmet`, `bcryptjs`, `jsonwebtoken`, `zod`, `morgan`
- Fallback DB: `mongodb-memory-server`
- Payments: `razorpay`
- Documents: `pdfkit`, `@types/pdfkit`
- Dev: `typescript`, `ts-node-dev`, `@types/express`, `@types/node`, `@types/cors`, `@types/jsonwebtoken`, `@types/bcryptjs`, `@types/morgan`

#### Frontend (`client`):
- Core: `react`, `react-dom`, `react-router-dom`, `lucide-react`, `zustand`, `axios`, `react-hook-form`, `@hookform/resolvers`, `zod`, `recharts`
- Dev: `vite`, `@vitejs/plugin-react`, `typescript`, `tailwindcss`, `postcss`, `autoprefixer`, `@types/react`, `@types/react-dom`
