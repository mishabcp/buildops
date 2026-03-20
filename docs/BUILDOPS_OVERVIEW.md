# Buildops — What you have (MVP overview)

Buildops is construction business management software. It helps you track projects, money coming in from clients, and money going out to labour, materials, subcontractors, and bills—across one or more offices (branches). This document describes what is in the current MVP and who can use it.

---

## How Buildops works at a glance

```mermaid
flowchart LR
  subgraph inputs [Your business]
    Clients[Clients]
    Branches[Branches and offices]
  end
  subgraph core [Projects]
    Projects[Projects]
  end
  subgraph moneyIn [Money in]
    Stages[Payment stages from client]
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
  Projects --> Labour
  Projects --> Materials
  Projects --> Associates
  Projects --> Bills
  Projects --> Expenses
```

Every project is linked to a client and a branch. You record what the client should pay (payment stages) and what you spend (labour, materials, associates, bills, other expenses). The system shows you what is received, what is outstanding, and what you still owe.

---

## What is in the MVP

```mermaid
flowchart TB
  subgraph mvp [This version includes]
    Dashboard[Dashboard - Charts and key numbers]
    Clients[Clients - Manage client list]
    Projects[Projects - Create and manage]
    Stages[Payment stages - Client payments]
    Labour[Labour - Workers and wages]
    Materials[Materials - Stock and usage]
    Associates[Associates - Subcontractors]
    Bills[Bills - Payable and receivable]
    Reports[Reports - PDF and Excel]
    Settings[Settings - Users and branches]
  end
```

| Area | What it does |
|------|----------------|
| **Clients** | Manage the client list (add, edit, delete). Required for creating projects. |
| **Dashboard** | See at a glance: active projects, money received this month, what clients owe, what you owe to vendors/labour/associates. Charts show collections over time, project status, and expense breakdown. Low-stock alert and recent projects. |
| **Projects** | Create projects (client, branch, contract value). Open any project to see tabs: Overview, Payment stages, Labour, Materials, Associates, Bills, Other expenses. |
| **Payment stages** | Break the contract into stages (e.g. Advance, Foundation). Record when the client pays; see Pending / Partially paid / Paid. |
| **Labour** | Add workers, days, rate. Record payments; see what is still due. |
| **Materials** | List material types and stock. From a project: add Purchase (stock goes up) or Usage (stock goes down). System warns when stock is low. |
| **Associates** | Add subcontractors and agreed amount per project. Record payments; see outstanding. |
| **Bills** | Record bills you need to pay or that clients need to pay you. Link to project, record payments. Only bills linked to a project appear in that project's Overview and totals. |
| **Reports** | View and download reports (e.g. profit and loss, collections, pending bills) as PDF or Excel. |
| **Settings** | Admins only: add users and manage branch names. |

---

## Who can use it

```mermaid
flowchart LR
  subgraph roles [Roles]
    Admin[Admin]
    Manager[Branch manager]
    Staff[Staff]
  end
  Admin -->|"All offices, manages users and branches"| A1[Full access]
  Manager -->|"One office only"| M1[Full use, no delete]
  Staff -->|"One office only"| S1[Use only, no delete]
```

| Role | Sees | Can do |
|------|------|--------|
| **Admin** | All branches and all projects | Everything. Add and edit users and branches in Settings. |
| **Branch manager** | Only their branch and its projects | Add and edit data; cannot delete records. |
| **Staff** | Only their branch and its projects | Add and edit data; cannot delete records. |

---

## In this version vs not in this version

```mermaid
flowchart LR
  subgraph inScope [In this version]
    I1[Web app in browser]
    I2[Clients - add, edit, delete]
    I3[Dashboard with charts]
    I4[Projects and all tabs]
    I5[Payment stages, labour, materials]
    I6[Associates, bills, other expenses]
    I7[Reports PDF and Excel]
    I8[Users and branches in Settings]
  end
  subgraph notInScope [Not in this version]
    N1[No mobile app]
    N2[No automated payment reminders]
    N3[No inventory alerts beyond low stock]
    N4[No approvals or workflows]
  end
```

**In this version:** Everything described above: clients, dashboard, projects, payment stages, labour, materials, associates, bills, reports, and settings. You use the app in a web browser.

**Not in this version:** There is no separate mobile app, no automatic reminders (e.g. for due payments), and no extra approval workflows. Low-stock warning is the only inventory alert.

---

For step-by-step how to use the system, see **[USER_GUIDE.md](USER_GUIDE.md)**. For a very short “first 5 minutes” path, see **[QUICK_START.md](QUICK_START.md)**.
