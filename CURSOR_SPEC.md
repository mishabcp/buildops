# CURSOR BUILD SPEC — Buildops (MVP)

> This is a technical specification document. Follow it exactly to build the MVP.
> Do not deviate from the stack, schema, or folder structure unless explicitly noted.
> Build in the order defined in Section 8.

---

## 1. TECH STACK (MANDATORY)

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React (Vite) | Latest |
| UI Library | Tailwind CSS + shadcn/ui | Latest |
| State Management | Zustand | Latest |
| Frontend Routing | React Router v6 | Latest |
| Backend | Node.js + Express | Latest LTS |
| ORM | Prisma | Latest |
| Database | PostgreSQL | 15+ |
| Authentication | JWT (jsonwebtoken) + bcrypt | Latest |
| File Export | pdfkit (PDF) + exceljs (Excel) | Latest |
| API Style | REST |  |

**Monorepo structure:**
```
/project-root
  /client        → React frontend (Vite)
  /server        → Node.js + Express backend
  /prisma        → Prisma schema and migrations
  .env           → Environment variables
```

---

## 2. ENVIRONMENT VARIABLES (.env)

```
DATABASE_URL=postgresql://user:password@localhost:5432/construction_db
JWT_SECRET=your_jwt_secret_here
PORT=5000
CLIENT_URL=http://localhost:5173
```

---

## 3. DATABASE SCHEMA (PRISMA)

Create the following schema in `/prisma/schema.prisma`. Define all models exactly as specified.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ───────────────────────────────────────────

enum Role {
  SUPER_ADMIN
  BRANCH_MANAGER
  STAFF
}

enum ProjectStatus {
  ENQUIRY
  ACTIVE
  ON_HOLD
  COMPLETED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PARTIALLY_PAID
  PAID
}

enum PaymentMode {
  CASH
  BANK_TRANSFER
  CHEQUE
  UPI
}

enum BillType {
  PAYABLE
  RECEIVABLE
}

// ─── MODELS ──────────────────────────────────────────

model Branch {
  id        Int       @id @default(autoincrement())
  name      String
  location  String?
  createdAt DateTime  @default(now())

  users     User[]
  projects  Project[]
}

model User {
  id           Int      @id @default(autoincrement())
  name         String
  email        String   @unique
  passwordHash String
  role         Role     @default(STAFF)
  branchId     Int?
  branch       Branch?  @relation(fields: [branchId], references: [id])
  createdAt    DateTime @default(now())
  isActive     Boolean  @default(true)
}

model Client {
  id        Int       @id @default(autoincrement())
  name      String
  phone     String?
  email     String?
  address   String?
  createdAt DateTime  @default(now())

  projects  Project[]
}

model Project {
  id              Int           @id @default(autoincrement())
  name            String
  clientId        Int
  client          Client        @relation(fields: [clientId], references: [id])
  branchId        Int
  branch          Branch        @relation(fields: [branchId], references: [id])
  location        String?
  status          ProjectStatus @default(ENQUIRY)
  contractValue   Decimal       @db.Decimal(12, 2)
  startDate       DateTime?
  estimatedEndDate DateTime?
  description     String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  paymentStages   PaymentStage[]
  labourPayments  LabourPayment[]
  materialItems   MaterialItem[]
  associatePayments AssociatePayment[]
  bills           Bill[]
  otherExpenses   OtherExpense[]
}

// Stage-wise client payment tracking
model PaymentStage {
  id            Int           @id @default(autoincrement())
  projectId     Int
  project       Project       @relation(fields: [projectId], references: [id])
  stageName     String        // e.g. "Advance", "Foundation Complete"
  stageNumber   Int
  expectedAmount Decimal      @db.Decimal(12, 2)
  dueDate       DateTime?
  status        PaymentStatus @default(PENDING)
  createdAt     DateTime      @default(now())

  receipts      PaymentReceipt[]
}

model PaymentReceipt {
  id             Int          @id @default(autoincrement())
  paymentStageId Int
  paymentStage   PaymentStage @relation(fields: [paymentStageId], references: [id])
  amount         Decimal      @db.Decimal(12, 2)
  receivedDate   DateTime
  paymentMode    PaymentMode
  referenceNo    String?      // cheque no / transaction id
  notes          String?
  createdAt      DateTime     @default(now())
}

// Labour payments
model LabourPayment {
  id          Int           @id @default(autoincrement())
  projectId   Int
  project     Project       @relation(fields: [projectId], references: [id])
  workerName  String
  workType    String?       // e.g. "Mason", "Helper"
  days        Decimal?      @db.Decimal(6, 2)
  ratePerDay  Decimal?      @db.Decimal(8, 2)
  totalAmount Decimal       @db.Decimal(12, 2)
  paidAmount  Decimal       @db.Decimal(12, 2) @default(0)
  status      PaymentStatus @default(PENDING)
  paymentDate DateTime?
  paymentMode PaymentMode?
  notes       String?
  createdAt   DateTime      @default(now())
}

// Materials
model Material {
  id           Int      @id @default(autoincrement())
  name         String   @unique
  unit         String   // e.g. "bags", "kg", "MT", "nos"
  currentStock Decimal  @db.Decimal(12, 2) @default(0)
  minThreshold Decimal  @db.Decimal(12, 2) @default(0)
  createdAt    DateTime @default(now())

  items        MaterialItem[]
}

model MaterialItem {
  id          Int      @id @default(autoincrement())
  projectId   Int
  project     Project  @relation(fields: [projectId], references: [id])
  materialId  Int
  material    Material @relation(fields: [materialId], references: [id])
  type        String   // "PURCHASE" or "USAGE"
  quantity    Decimal  @db.Decimal(12, 2)
  ratePerUnit Decimal? @db.Decimal(10, 2)
  totalCost   Decimal? @db.Decimal(12, 2)
  supplierName String?
  date        DateTime
  notes       String?
  createdAt   DateTime @default(now())
}

// Associates / Subcontractors
model Associate {
  id        Int      @id @default(autoincrement())
  name      String
  phone     String?
  email     String?
  workType  String?
  createdAt DateTime @default(now())

  payments  AssociatePayment[]
}

model AssociatePayment {
  id            Int           @id @default(autoincrement())
  projectId     Int
  project       Project       @relation(fields: [projectId], references: [id])
  associateId   Int
  associate     Associate     @relation(fields: [associateId], references: [id])
  scopeOfWork   String?
  agreedAmount  Decimal       @db.Decimal(12, 2)
  paidAmount    Decimal       @db.Decimal(12, 2) @default(0)
  status        PaymentStatus @default(PENDING)
  createdAt     DateTime      @default(now())

  transactions  AssociateTransaction[]
}

model AssociateTransaction {
  id                 Int              @id @default(autoincrement())
  associatePaymentId Int
  associatePayment   AssociatePayment @relation(fields: [associatePaymentId], references: [id])
  amount             Decimal          @db.Decimal(12, 2)
  paidDate           DateTime
  paymentMode        PaymentMode
  referenceNo        String?
  notes              String?
  createdAt          DateTime         @default(now())
}

// Bills (Payable to vendors / Receivable from clients)
model Bill {
  id           Int           @id @default(autoincrement())
  projectId    Int?
  project      Project?      @relation(fields: [projectId], references: [id])
  type         BillType
  partyName    String        // vendor name or client name
  billNumber   String?
  billDate     DateTime
  dueDate      DateTime?
  totalAmount  Decimal       @db.Decimal(12, 2)
  paidAmount   Decimal       @db.Decimal(12, 2) @default(0)
  status       PaymentStatus @default(PENDING)
  description  String?
  createdAt    DateTime      @default(now())

  payments     BillPayment[]
}

model BillPayment {
  id          Int         @id @default(autoincrement())
  billId      Int
  bill        Bill        @relation(fields: [billId], references: [id])
  amount      Decimal     @db.Decimal(12, 2)
  paidDate    DateTime
  paymentMode PaymentMode
  referenceNo String?
  notes       String?
  createdAt   DateTime    @default(now())
}

// Miscellaneous project expenses
model OtherExpense {
  id          Int         @id @default(autoincrement())
  projectId   Int
  project     Project     @relation(fields: [projectId], references: [id])
  description String
  amount      Decimal     @db.Decimal(12, 2)
  date        DateTime
  paymentMode PaymentMode?
  createdAt   DateTime    @default(now())
}
```

---

## 4. FOLDER STRUCTURE

### Backend `/server`
```
/server
  /src
    /controllers
      auth.controller.js
      branch.controller.js
      project.controller.js
      paymentStage.controller.js
      labour.controller.js
      material.controller.js
      associate.controller.js
      bill.controller.js
      expense.controller.js
      dashboard.controller.js
      report.controller.js
    /routes
      auth.routes.js
      branch.routes.js
      project.routes.js
      paymentStage.routes.js
      labour.routes.js
      material.routes.js
      associate.routes.js
      bill.routes.js
      expense.routes.js
      dashboard.routes.js
      report.routes.js
    /middleware
      auth.middleware.js       → verifyToken
      role.middleware.js       → requireRole(roles[])
      error.middleware.js
    /utils
      prisma.js                → Prisma client singleton
      jwt.js
      response.js              → standard API response helpers
    app.js
    server.js
```

### Frontend `/client`
```
/client/src
  /api
    axios.js                   → axios instance with base URL + auth header
    auth.api.js
    projects.api.js
    payments.api.js
    labour.api.js
    materials.api.js
    associates.api.js
    bills.api.js
    dashboard.api.js
  /components
    /layout
      Sidebar.jsx
      Topbar.jsx
      PageWrapper.jsx
    /ui                        → shadcn/ui components live here
    /shared
      StatusBadge.jsx
      DataTable.jsx
      ConfirmDialog.jsx
      EmptyState.jsx
      LoadingSpinner.jsx
      StatCard.jsx
      PaymentBar.jsx           → visual progress bar for paid vs total
  /pages
    /auth
      Login.jsx
    /dashboard
      Dashboard.jsx
    /projects
      ProjectList.jsx
      ProjectDetail.jsx
      ProjectForm.jsx
    /payments
      PaymentStages.jsx        → stage list for a project
      PaymentStageForm.jsx
      ReceiptForm.jsx
    /labour
      LabourList.jsx
      LabourForm.jsx
    /materials
      MaterialList.jsx         → stock overview
      MaterialForm.jsx
      MaterialItemForm.jsx     → purchase or usage entry
    /associates
      AssociateList.jsx
      AssociateForm.jsx
      AssociatePaymentForm.jsx
    /bills
      BillList.jsx
      BillForm.jsx
      BillPaymentForm.jsx
    /expenses
      ExpenseList.jsx
      ExpenseForm.jsx
    /reports
      Reports.jsx
    /settings
      UserManagement.jsx
      BranchSettings.jsx
  /store
    authStore.js               → Zustand: user, token, login, logout
    uiStore.js                 → Zustand: sidebar state, loading
  /hooks
    useAuth.js
    useProjects.js
  /utils
    formatCurrency.js          → always format as ₹ with 2 decimals
    formatDate.js
    calcProjectSummary.js      → derive totals from project data
  App.jsx
  main.jsx
  routes.jsx                   → all route definitions
```

---

## 5. API ENDPOINTS

All routes prefixed with `/api`. All protected routes require `Authorization: Bearer <token>` header.

### Auth
```
POST   /api/auth/login          → { email, password } → { token, user }
GET    /api/auth/me             → returns current user from token
```

### Branches
```
GET    /api/branches            → list all branches (SUPER_ADMIN only)
POST   /api/branches            → create branch
```

### Users
```
GET    /api/users               → list users (SUPER_ADMIN only)
POST   /api/users               → create user (SUPER_ADMIN only)
PUT    /api/users/:id           → update user
DELETE /api/users/:id           → deactivate user (soft delete)
```

### Projects
```
GET    /api/projects                    → list projects (filtered by branch for BRANCH_MANAGER/STAFF)
POST   /api/projects                    → create project
GET    /api/projects/:id                → get single project with all relations
PUT    /api/projects/:id                → update project
DELETE /api/projects/:id                → delete project (SUPER_ADMIN only)
GET    /api/projects/:id/summary        → returns financial summary of project
```

### Payment Stages
```
GET    /api/projects/:id/stages         → list stages for a project
POST   /api/projects/:id/stages         → add a stage
PUT    /api/stages/:id                  → update stage
DELETE /api/stages/:id                  → delete stage
POST   /api/stages/:id/receipts         → record a payment receipt for a stage
GET    /api/stages/:id/receipts         → list receipts for a stage
```

### Labour
```
GET    /api/projects/:id/labour         → list labour entries for project
POST   /api/projects/:id/labour         → add labour entry
PUT    /api/labour/:id                  → update labour entry
DELETE /api/labour/:id                  → delete entry
```

### Materials
```
GET    /api/materials                   → list all materials with current stock
POST   /api/materials                   → create a new material type
PUT    /api/materials/:id               → update material (name, unit, threshold)
GET    /api/projects/:id/materials      → material items for a project
POST   /api/projects/:id/materials      → add purchase or usage entry
DELETE /api/material-items/:id          → delete item
```

### Associates
```
GET    /api/associates                  → list all associates
POST   /api/associates                  → create associate
GET    /api/projects/:id/associates     → associate payments for project
POST   /api/projects/:id/associates     → assign associate to project with agreed amount
POST   /api/associate-payments/:id/transactions  → record a payment transaction
```

### Bills
```
GET    /api/bills                       → list all bills (filter: type, status, branchId)
POST   /api/bills                       → create bill
GET    /api/bills/:id                   → single bill with payment history
PUT    /api/bills/:id                   → update bill
POST   /api/bills/:id/payments          → record payment against a bill
```

### Other Expenses
```
GET    /api/projects/:id/expenses       → list other expenses for project
POST   /api/projects/:id/expenses       → add expense
DELETE /api/expenses/:id                → delete expense
```

### Dashboard
```
GET    /api/dashboard                   → returns:
  {
    activeProjects: number,
    totalReceivedThisMonth: number,
    totalOutstandingFromClients: number,
    totalPendingToVendors: number,
    totalPendingToLabour: number,
    totalPendingToAssociates: number,
    lowStockMaterials: Material[],
    recentProjects: Project[]
  }
```

### Reports
```
GET    /api/reports/project-pl          → project-wise P&L (query: branchId, dateRange)
GET    /api/reports/payment-collection  → monthly payment collection (query: month, year)
GET    /api/reports/pending-bills       → all unpaid/partial bills
GET    /api/reports/labour-cost         → labour cost by project
GET    /api/reports/material-usage      → material consumption summary
GET    /api/reports/export/pdf          → export any report as PDF
GET    /api/reports/export/excel        → export any report as Excel
```

---

## 6. PAGES & SCREENS

### Auth
- **Login Page** — email + password form, JWT stored in localStorage, redirect to dashboard

### Dashboard (Home)
- Stat cards: Active Projects, Received This Month, Outstanding from Clients, Pending to Vendors
- Low stock alerts banner (if any materials below threshold)
- Recent projects table (last 5)
- Branch filter dropdown (SUPER_ADMIN only)

### Projects
- **Project List** — table with: Name, Client, Branch, Status badge, Contract Value, Received, Balance, Actions
  - Filter by: Branch, Status
  - Search by project name or client
  - "New Project" button
- **Project Detail Page** — tabbed layout:
  - Tab 1: Overview (summary cards: contract value, total received, total expenses, profit/loss estimate)
  - Tab 2: Payment Stages
  - Tab 3: Labour
  - Tab 4: Materials
  - Tab 5: Associates
  - Tab 6: Bills
  - Tab 7: Other Expenses
- **Project Form** — create/edit: name, client (searchable dropdown), branch, location, status, contract value, dates

### Clients
- **Clients** — list with search, add client (modal/form), edit, delete (with confirm; block delete if client has projects)

### Payment Stages (inside Project Detail → Tab 2)
- List of stages in order (Stage 1, 2, 3...) with: stage name, expected amount, due date, paid amount, status badge
- PaymentBar component showing % paid
- "Add Stage" button → inline form or modal
- Each stage row expandable to show receipts
- "Record Payment" button per stage → modal with: amount, date, mode, reference

### Labour (inside Project Detail → Tab 3)
- Table: Worker Name, Work Type, Days, Rate, Total, Paid, Balance, Status
- "Add Labour Entry" button
- Edit / Delete per row

### Materials (inside Project Detail → Tab 4)
- Two sub-tabs: **Purchases** and **Usage**
- "Add Purchase" → form: material (dropdown), quantity, rate, total, supplier, date
- "Add Usage" → form: material (dropdown), quantity, date
- Running total cost shown

### Materials Stock (separate page)
- Table: Material Name, Unit, Current Stock, Min Threshold, Status (OK / Low Stock)
- "Add Material" button (to create a new material type)

### Associates (inside Project Detail → Tab 5)
- Table: Associate Name, Scope, Agreed Amount, Paid, Balance, Status
- "Add Associate" button
- Expand row to see transaction history
- "Record Payment" button per associate

### Bills (separate page + inside Project Detail → Tab 6)
- Tabs: **Payable** | **Receivable** | **All**
- Table: Party, Bill No, Date, Due Date, Total, Paid, Balance, Status badge, Project
- "Add Bill" button
- Expand or click to view bill + payment history
- "Record Payment" button

### Reports Page
- Sidebar of report types
- Date range picker
- Branch filter
- Table/chart preview of selected report
- Export as PDF / Export as Excel buttons

### Settings
- User Management (SUPER_ADMIN): table of users, add/edit user, toggle active
- Branch Settings: view/edit branch names

---

## 7. BUSINESS LOGIC RULES

Implement these rules in backend controllers and/or frontend displays:

1. **PaymentStage status auto-update:**
   - Sum all receipts for a stage
   - If sum == 0 → PENDING
   - If 0 < sum < expectedAmount → PARTIALLY_PAID
   - If sum >= expectedAmount → PAID

2. **LabourPayment status auto-update:**
   - Same logic: compare paidAmount vs totalAmount

3. **AssociatePayment status auto-update:**
   - Same logic: compare paidAmount vs agreedAmount

4. **Bill status auto-update:**
   - Same logic: compare paidAmount vs totalAmount

5. **Project financial summary (GET /api/projects/:id/summary):**
   ```
   totalContractValue    = project.contractValue
   totalReceived         = sum of all PaymentReceipts
   totalOutstanding      = totalContractValue - totalReceived
   totalLabourCost       = sum of all LabourPayment.totalAmount
   totalMaterialCost     = sum of MaterialItem where type=PURCHASE
   totalAssociateCost    = sum of AssociatePayment.agreedAmount
   totalBillsPayable     = sum of Bill where type=PAYABLE
   totalOtherExpenses    = sum of OtherExpense.amount
   totalExpenses         = totalLabourCost + totalMaterialCost + totalAssociateCost + totalBillsPayable + totalOtherExpenses
   estimatedProfit       = totalContractValue - totalExpenses
   profitMargin          = (estimatedProfit / totalContractValue) * 100
   ```

6. **Material stock update:**
   - On PURCHASE entry: `material.currentStock += quantity`
   - On USAGE entry: `material.currentStock -= quantity`
   - Never allow currentStock to go below 0 (return error)

7. **Branch-level access control:**
   - SUPER_ADMIN: sees all data across both branches
   - BRANCH_MANAGER: sees only their `branchId` data
   - STAFF: sees only their `branchId` data, cannot delete any record

8. **Currency:** All monetary values stored as `Decimal(12,2)`. Display always as Indian Rupees (₹).

---

## 8. BUILD ORDER

Follow this exact order to build the MVP:

```
Step 1:  Setup monorepo, install dependencies, configure .env
Step 2:  Write Prisma schema, run migrations, seed initial data (2 branches, 1 admin user)
Step 3:  Build auth system (login endpoint, JWT middleware, /me route)
Step 4:  Build React app shell (Vite, Tailwind, shadcn/ui, React Router, Zustand authStore)
Step 5:  Build Login page + protected route wrapper
Step 6:  Build Sidebar + Topbar layout components
Step 7:  Build Branches + Users CRUD (backend + frontend)
Step 8:  Build Projects CRUD (backend + frontend list + form)
Step 9:  Build Project Detail page shell with tabs
Step 10: Build Payment Stages module (backend + frontend)
Step 11: Build Labour Payment module (backend + frontend)
Step 12: Build Materials module — stock + project items (backend + frontend)
Step 13: Build Associates module (backend + frontend)
Step 14: Build Bills module (backend + frontend)
Step 15: Build Other Expenses module (backend + frontend)
Step 16: Build Dashboard (aggregate all data, stat cards, recent projects)
Step 17: Build Reports page (all 5 reports + PDF + Excel export)
Step 18: Apply role-based access control across all routes and UI
Step 19: Final polish — loading states, empty states, error handling, responsive layout
```

---

## 9. SEED DATA

Create a seed file at `/prisma/seed.js` with the following:

```javascript
// 2 Branches
{ name: "Branch A - Main Office", location: "City Centre" }
{ name: "Branch B - Site Office", location: "Industrial Area" }

// 1 Super Admin user (password: admin123)
{ name: "Admin User", email: "admin@company.com", role: "SUPER_ADMIN" }

// 1 Branch Manager per branch

// 3 Sample Clients
{ name: "Rajesh Constructions", phone: "9876543210" }
{ name: "Metro Developers", phone: "9123456789" }
{ name: "City Infrastructure Ltd", phone: "9988776655" }

// 2 Sample Projects (one per branch, status ACTIVE)

// 5 Materials (pre-seeded in stock)
{ name: "Cement", unit: "bags", currentStock: 500, minThreshold: 50 }
{ name: "Steel", unit: "MT", currentStock: 10, minThreshold: 2 }
{ name: "Sand", unit: "cubic ft", currentStock: 200, minThreshold: 30 }
{ name: "Bricks", unit: "nos", currentStock: 5000, minThreshold: 500 }
{ name: "Paint", unit: "litres", currentStock: 100, minThreshold: 20 }

// 3 Sample Associates
{ name: "SK Electricals", workType: "Electrical" }
{ name: "RK Plumbing Works", workType: "Plumbing" }
{ name: "Fast Interiors", workType: "Interior" }
```

---

## 10. UI/UX RULES

- **Color scheme:** Use a neutral dark sidebar (`gray-900`) with white main content area
- **Status badges:** 
  - PENDING → yellow
  - PARTIALLY_PAID → blue
  - PAID → green
  - ACTIVE → green
  - ON_HOLD → yellow
  - CANCELLED → red
  - COMPLETED → gray
- **Currency display:** Always `₹ 1,23,456.00` (Indian number format)
- **Date format:** `DD MMM YYYY` (e.g., 10 Mar 2026)
- **Tables:** Use zebra striping, hover highlight, sticky header on scroll
- **Forms:** Use modals for quick entry forms. Use full page for complex forms (new project)
- **Empty states:** Show a helpful message + CTA button when a list is empty
- **Loading states:** Show skeleton loaders, not spinners, for table data
- **Mobile:** Sidebar collapses to hamburger menu on small screens

---

## 11. ERROR HANDLING

- All API responses follow this format:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": "Human readable message" }
```
- HTTP status codes: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error
- Frontend: Show toast notifications for success and error actions (use shadcn/ui Toast)
- Never expose raw Prisma/DB errors to the client

---

*End of Cursor Build Spec v1.0*
