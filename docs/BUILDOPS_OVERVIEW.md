# Buildops — What you have (MVP overview)

Buildops is construction business management software. It helps you track projects, money coming in from clients, and money going out to labour, materials, subcontractors, and bills—across one or more offices (branches). This document describes what is in the current MVP and who can use it.

---

## How Buildops works at a glance

```mermaid
flowchart LR
  subgraph inputs [Your business]
    Clients[Clients - org-wide]
    Branches[Branches and offices]
  end
  subgraph core [Projects]
    Projects[Projects per branch]
  end
  subgraph moneyIn [Money in]
    Stages[Payment stages from client]
    RecBills[Receivable bills on project]
  end
  subgraph moneyOut [Money out]
    Labour[Labour]
    Materials[Materials]
    Associates[Associates and subcontractors]
    Bills[Bills to pay]
    Expenses[Other expenses]
  end
  Clients --> Projects
  Branches --> Projects
  Projects --> Stages
  Projects --> RecBills
  Projects --> Labour
  Projects --> Materials
  Projects --> Associates
  Projects --> Bills
  Projects --> Expenses
```

Every project is linked to a **client** (shared across the company) and a **branch**. You record what the client should pay (payment stages and optional receivable bills) and what you spend (labour, materials, associates, payable bills, other expenses). The system shows what is received, what is outstanding, and what you still owe.

For end-to-end flows, see **[WORKFLOW.md](WORKFLOW.md)**.

---

## What is in the MVP

```mermaid
flowchart TB
  subgraph mvp [This version includes]
    Dashboard[Dashboard - KPIs and charts]
    Clients[Clients - org-wide list]
    Projects[Projects - tabs and Overview]
    Stages[Payment stages]
    Labour[Labour]
    Materials[Materials and stock]
    Associates[Associates]
    Bills[Bills - payable and receivable]
    Reports[Reports - PDF and Excel]
    Settings[Settings - users and branches]
    Guide[In-app Guide at /guide]
    SiteMedia[Site media per project]
  end
```

| Area | What it does |
|------|----------------|
| **Clients** | Organization-wide client list (add, edit, delete). Not branch-scoped. Required for projects. |
| **Dashboard** | Active projects, received this month, client outstanding, pending to vendors/labour/associates, charts, **company-wide** low-stock alert, recent projects (cards). Super Admin can filter by branch. |
| **Projects** | Status: Enquiry, Active, On hold, Completed, Cancelled. Tabs: Overview, Payment Stages, Labour, Materials, Associates, Bills, Other Expenses, **Site media**, **Guide**. |
| **Site media** | Per-project photos, PDFs, and videos (date + note). Optional links to payment stages and cost rows. Internal team only. |
| **Payment stages** | Milestones and receipts; contract value drives contract outstanding. |
| **Labour / Materials / Associates / Bills / Other expenses** | Project costs; bills can be payable or receivable. Receivable bill **totals** add to Overview **total income** and profit. |
| **Reports** | Five report types with PDF/Excel export (see USER_GUIDE for names and parameters). |
| **Settings** | Sidebar link for all users; **only Super Admin** manages users and branches. |
| **Help** | `/guide`, `/guide/detailed`, `/guide/workflow` (fictional step-by-step example), and project **Guide** tab. |

---

## Who can use it

```mermaid
flowchart LR
  subgraph roles [Roles]
    Admin[Super Admin]
    Manager[Branch manager]
    Staff[Staff]
  end
  Admin -->|"All branches"| A1[Users branches reports filter]
  Manager -->|"One branch"| M1[Full project data entry]
  Staff -->|"One branch"| S1[Entry limited deletes]
```

| Role | Sees | Can do |
|------|------|--------|
| **Super Admin** | All branches and projects | Everything operational; **Settings** (users, branches); filter Dashboard/Reports by branch; **delete projects** (API). |
| **Branch manager** | Own branch and its projects | Add and edit project data; **delete** payment stages, labour, material items, and other expenses on projects; **delete clients** with no projects; **cannot** delete projects or manage Settings content. |
| **Staff** | Own branch and its projects | Add and edit project data; **cannot delete** payment stages, labour, material items, or other expenses; **can delete clients** with no projects; **cannot** manage Settings content. |

**Settings menu:** Visible to everyone; configuration is **Super Admin only**.

**Bills:** No delete in the MVP—create bills and record payments only.

Detailed permission matrix: **[WORKFLOW.md §9](WORKFLOW.md#9-permissions-quick-reference-delete)**.

---

## In this version vs not in this version

```mermaid
flowchart LR
  subgraph inScope [In this version]
    I1[Web app in browser]
    I2[Clients projects dashboard reports]
    I3[Payment stages labour materials]
    I4[Associates bills expenses]
    I5[Users and branches in Settings]
    I6[In-app Guide]
  end
  subgraph notInScope [Not in this version]
    N1[No mobile app]
    N2[No automated payment reminders]
    N3[No inventory alerts beyond low stock]
    N4[No approval workflows]
  end
```

**In this version:** Everything in the table above. You use the app in a web browser.

**Not in this version:** No separate mobile app, no automatic payment reminders, and no multi-step approval workflows. Low-stock warning is the main inventory alert.

**Internal note:** `/dashboard-preview` is an authenticated design gallery for the dashboard UI; it is not part of end-user training docs.

---

## Related documentation

| Document | Use when |
|----------|----------|
| **[WORKFLOW.md](WORKFLOW.md)** | You want flows: money in/out, roles, Overview vs Dashboard vs Reports |
| **[USER_GUIDE.md](USER_GUIDE.md)** | You want step-by-step instructions with diagrams |
| **[QUICK_START.md](QUICK_START.md)** | You want a 5-minute first run |
| **[PROJECT_TABS_AND_CALCULATIONS_SUMMARY.md](PROJECT_TABS_AND_CALCULATIONS_SUMMARY.md)** | You need formulas and calculation rules |
