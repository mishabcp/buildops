# Buildops — First 5 minutes

A minimal path to see the app working after [local setup](../README.md#setup). Password for all seeded users: **admin123**.

---

## 1. Sign in

Open http://localhost:5173 and log in as **Super Admin**:

| Email | Password |
|-------|----------|
| admin@company.com | admin123 |

You land on the **Dashboard**.

---

## 2. Open a project

1. Click **Projects** in the sidebar.
2. Open any seeded project (for example **Sample Project A**).
3. Skim the **Overview** tab: contract value, received, outstanding, expenses, profit.

---

## 3. Record money in (optional)

1. Go to **Payment Stages**.
2. If a stage exists, click **Record payment** and enter a small amount, date, and mode.
3. Return to **Overview** — **Total received** and outstanding should update.

---

## 4. Record a cost (optional)

1. Open **Other Expenses** (or **Labour**).
2. Add a line with description and amount.
3. Check **Overview** again — expenses and profit update.

---

## 5. Try another role (optional)

Sign out and sign in as a branch user, for example:

| Role | Email |
|------|--------|
| Branch manager (Branch A) | manager-a@company.com |
| Staff (Branch A) | staff-a1@company.com |

Notice the **Projects** list is limited to that branch. **Settings** appears in the menu but only Super Admin can change users and branches.

---

## What next?

| Goal | Read |
|------|------|
| Full workflows (money in/out, roles, reports) | **[WORKFLOW.md](WORKFLOW.md)** |
| Step-by-step with diagrams | **[USER_GUIDE.md](USER_GUIDE.md)** |
| What the MVP includes | **[BUILDOPS_OVERVIEW.md](BUILDOPS_OVERVIEW.md)** |
| In-app help | **Guide** on login page or sidebar → `/guide` |

**All seeded logins** (7 users): see the table in [USER_GUIDE.md — Logging in](USER_GUIDE.md#logging-in).
