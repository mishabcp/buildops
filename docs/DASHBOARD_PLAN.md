# Dashboard enhancement plan

## Goal
Make the dashboard visually informative with charts and clear sections so users get a quick grasp of cash flow, project mix, and payables at a glance.

---

## What we can display (from existing data)

| Data | Source | Current | Chart / widget idea |
|------|--------|---------|---------------------|
| Active projects count | `Project` status=ACTIVE | Stat card | Keep; add **project status breakdown** (pie/donut: Active, Completed, On hold, Enquiry) |
| Received this month | `PaymentReceipt` in current month | Stat card | Keep; add **collections over last 6 months** (bar/area chart) |
| Outstanding from clients | `PaymentStage` expected − received | Stat card | Keep |
| Pending to vendors | `Bill` PAYABLE (total − paid) | Stat card | Keep; add **pending payables breakdown** (bar: Vendors vs Labour vs Associates) |
| Pending to labour | `LabourPayment` (total − paid) | Stat card | Part of breakdown above |
| Pending to associates | `AssociatePayment` (agreed − paid) | Stat card | Part of breakdown above |
| Low stock materials | `Material` currentStock < minThreshold | Alert box | Keep |
| Recent projects | `Project` last 5 | Table | Keep |

---

## New chart data (backend)

1. **Collections over time (last 6 months)**  
   - For each month: sum of `PaymentReceipt.amount` where `receivedDate` in that month, for projects in scope.  
   - Returns: `[{ month: "2025-10", received: 120000 }, ...]`.

2. **Project status breakdown**  
   - Count projects by `status` (ACTIVE, COMPLETED, ON_HOLD, ENQUIRY, CANCELLED).  
   - Returns: `[{ status: "ACTIVE", count: 5 }, ...]`.

3. **Pending payables breakdown**  
   - Already have totals; return as: `[{ name: "Vendors", value }, { name: "Labour", value }, { name: "Associates", value }]` for a single bar or donut chart.

4. **Expense breakdown (optional)**  
   - Sum by type: labour total, material items total, associate payments total, bills payable total, other expenses total (for projects in scope).  
   - Good for a “Where money went” donut chart.

---

## Layout (sections)

1. **Branch filter** (admin only) — unchanged.
2. **Stat cards** (6) — unchanged; first row.
3. **Charts row 1** (two columns on large screens):
   - **Left:** Collections over last 6 months (bar or area chart).
   - **Right:** Project status (donut or pie).
4. **Charts row 2** (one or two columns):
   - **Pending payables breakdown** (horizontal bar or donut): Vendors | Labour | Associates.
   - Optional: **Expense breakdown** (donut): Labour | Materials | Associates | Bills | Other.
5. **Low stock alert** — unchanged (only if any).
6. **Recent projects table** — unchanged.

---

## Tech choice: Recharts

- **Library:** [Recharts](https://recharts.org/) (React-friendly, composable, responsive).
- **Charts to use:** `BarChart`, `AreaChart`, `PieChart` (or `Cell` for custom colors).
- **Styling:** Tailwind-compatible; use neutral/gray axis and clear labels.

---

## Implementation steps

1. **Backend:** Extend `GET /api/dashboard` (or add `GET /api/dashboard/charts`) to return:
   - `collectionsByMonth: { month, received }[]`
   - `projectStatusCounts: { status, count }[]`
   - `pendingBreakdown: { name, value }[]`
   - Optional: `expenseBreakdown: { name, value }[]`
2. **Client:** Add `recharts` to `client/package.json`.
3. **Client:** Create small chart components (e.g. `CollectionsChart`, `StatusDonut`, `PendingBreakdownChart`) that accept the new API data.
4. **Client:** Add a “Charts” section to `Dashboard.jsx` between stat cards and low stock, with responsive grid.
5. **Client:** Handle loading/empty state for charts (skeleton or “No data” message).

---

## Summary

| Addition | Type | Data |
|----------|------|------|
| Collections over time | Bar/area | New: last 6 months receipt totals |
| Project status | Donut/pie | New: count by status |
| Pending payables | Bar/donut | Existing totals, shaped for chart |
| Expense breakdown (optional) | Donut | New: labour, materials, associates, bills, other |

This keeps the existing stats and table, and adds 2–3 charts so the dashboard looks more informative and “dashboard-like” without changing the rest of the app.
