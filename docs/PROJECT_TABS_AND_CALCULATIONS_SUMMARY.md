# Project Tabs: How Everything Works & What Needs Modification

This document summarizes how each project tab works, how the Overview is calculated, and what modifications are recommended.

**Audience:** Maintainers and implementers. End users should start with **[WORKFLOW.md](WORKFLOW.md)** and **[USER_GUIDE.md](USER_GUIDE.md)**.

**Project detail tabs (UI order):** Overview, Payment Stages, Labour, Materials, Associates, Bills, Other Expenses, **Guide** (in-context help—not a data source for Overview).

---

## 1. Data flow overview

```
Project (contractValue, client, branch)
  ├── Payment Stages (expectedAmount, receipts[])  → Total Received, Outstanding
  ├── Labour (totalAmount, paidAmount)             → Labour Costs
  ├── Material Items (type PURCHASE/USAGE, totalCost) → Material Cost
  ├── Associate Payments (agreedAmount, paidAmount)   → Associate Fees
  ├── Bills (type PAYABLE/RECEIVABLE, totalAmount)   → Bills Payable (expenses)
  └── Other Expenses (amount)                         → Other Expenses

Overview: totalContractValue, totalReceived, totalOutstanding, totalReceivables, totalIncome (contract + receivables), totalExpenses (sum of 5 cost buckets), estimatedProfit, profitMargin (profit and margin use totalIncome).
```

---

## 2. Tab-by-tab: source of truth & what feeds Overview

| Tab | Backend model | What user enters | What Overview uses |
|-----|----------------|------------------|--------------------|
| **Payment Stages** | PaymentStage + PaymentReceipt | Stages (name, expected amount); Receipts (amount, date, mode) per stage | totalReceived = sum(all receipts); totalOutstanding = contractValue − totalReceived |
| **Labour** | LabourPayment | Worker, work type, days, rate, total amount, paid amount, payment date/mode | totalLabourCost = sum(labourPayments.totalAmount) |
| **Materials** | MaterialItem (PURCHASE / USAGE) | Purchase: qty, rate, supplier, project. Usage: qty, rate, project (from stock) | totalMaterialCost = sum of **all** material items (PURCHASE + USAGE) |
| **Associates** | AssociatePayment + AssociateTransaction | Associate, scope, agreed amount; then “Record payment” (amount, date, mode) | totalAssociateCost = sum(associatePayments.agreedAmount) |
| **Bills** | Bill + BillPayment | Bill: type (PAYABLE/RECEIVABLE), party, total, dates. Then “Record payment” per bill | totalBillsPayable = sum(bills where type=PAYABLE). totalReceivables = sum(bills where type=RECEIVABLE, totalAmount). Only **project-linked** bills (projectId set) included; see §4.6. |
| **Other Expenses** | OtherExpense | Description, amount, date, payment mode | totalOtherExpenses = sum(amount) |

**Overview formulas (backend `getSummary`):**

- `totalReceivables` = sum of RECEIVABLE bills' totalAmount for the project  
- `totalIncome` = totalContractValue + totalReceivables  
- `totalExpenses` = totalLabourCost + totalMaterialCost + totalAssociateCost + totalBillsPayable + totalOtherExpenses  
- `estimatedProfit` = totalIncome − totalExpenses  
- `profitMargin` = totalIncome > 0 ? (estimatedProfit / totalIncome) × 100 : 0  

---

## 3. Calculation details

### 3.1 Payment Stages

- **Total received:** Sum of `PaymentReceipt.amount` for all stages of the project.
- **Stage status:** Derived when a receipt is created: PENDING / PARTIALLY_PAID / PAID based on sum(receipts) vs expectedAmount. Stored on PaymentStage.
- **Outstanding (contract):** Always **contractValue − totalReceived**. Payment stages are for tracking milestones; stage expected amounts do not need to sum to contract value. The dashboard uses this same definition (sum over projects of max(0, contractValue − totalReceived)).

### 3.2 Labour

- **Cost in Overview:** Sum of `LabourPayment.totalAmount` (committed wage cost).
- **Status:** Derived from totalAmount vs paidAmount (PENDING / PARTIALLY_PAID / PAID); updated on create/update.
- **Only one payment date** per entry: each labour entry has a single `paidAmount` and one `paymentDate`. Multiple real-world payments are reflected by updating the same entry (cumulative paid amount and latest date; optionally add a note). There is no payment history table; a future enhancement could add a LabourPaymentTransaction model for full audit trail.

### 3.3 Materials

- **Cost in Overview:** Sum of `MaterialItem.totalCost` for **all** material items (both PURCHASE and USAGE).
- Purchase: adds to stock, creates item with totalCost. Usage: deducts from stock, creates item with totalCost (rate × qty or provided totalCost).

### 3.4 Associates

- **Cost in Overview:** Sum of `AssociatePayment.agreedAmount` (committed subcontract cost).
- **Payments:** Stored as AssociateTransaction; AssociatePayment.paidAmount is updated when a payment is recorded. Multiple payments per associate are supported.

### 3.5 Bills

- **Payables (you owe):** type = PAYABLE. Included in Overview as totalBillsPayable = sum(bill.totalAmount) for project’s bills.
- **Receivables (client owes you):** type = RECEIVABLE. Included in Overview as totalReceivables = sum(bill.totalAmount); totalIncome = totalContractValue + totalReceivables; profit and margin use totalIncome.
- Only bills **linked to the project** (projectId set) are included in that project's Overview and expense totals; bills with projectId null are company-level and do not affect any project Overview (§4.6).
- **Bill paidAmount:** Updated when a BillPayment is created; status (PENDING / PARTIALLY_PAID / PAID) is derived from paidAmount vs totalAmount.

### 3.6 Other Expenses

- **Cost in Overview:** Sum of `OtherExpense.amount` for the project.

---

## 4. Modifications recommended

### 4.1 Material cost: PURCHASE + USAGE

**Status: Implemented (fixed).** `totalMaterialCost` sums **all** `MaterialItem` rows (PURCHASE and USAGE) via `totalCost`.

```js
const totalMaterialCost = project.materialItems
  .reduce((s, i) => s + toNum(i.totalCost ?? 0), 0);
```

Reports that aggregate project material **cost** use the same rule. The **Material Usage Log** report is quantity-based (USAGE lines), not this rupee total.

---

### 4.2 Bills receivables in revenue and profit

**Status: Implemented.** `totalReceivables` = sum of RECEIVABLE bills' `totalAmount` on the project. `totalIncome` = contract + receivables; `estimatedProfit` and `profitMargin` use `totalIncome`. Overview shows **Other receivables** and **Total income** when applicable.

**Note:** Bill amounts use **full invoice totals** for income/expense buckets, not `totalAmount − paidAmount`.

**Report gap:** `GET` project P&L report (`report.controller.js`) still uses `profitLoss = contractValue - totalExpenses` without receivables. Treat **Overview / getSummary** as canonical for project profit until the report is aligned.

---

### 4.3 Labour: only one payment date (limitation)

**Current:** One `paymentDate` (and one `paidAmount`) per LabourPayment. Multiple real-world payments are represented by editing the same row and updating paid amount/date.

**Limitation:** No history of “payment 1 on date A, payment 2 on date B” for labour.

**Options:** Keep as-is and document; or introduce LabourPaymentTransaction (similar to AssociateTransaction / BillPayment) and derive paidAmount and status from that. The former is simpler; the latter gives audit trail and multiple dates.

**Status: Documented.** Single paidAmount and paymentDate per entry; multiple real-world payments are reflected by updating the same entry. Optional future enhancement: LabourPaymentTransaction for full history.

---

### 4.4 Contract value vs sum of stage expected amounts

**Status: Implemented and documented.** Contract outstanding = **contract value − total received**. Payment stage expected amounts are for milestones only; they need not sum to contract value. Dashboard **outstanding from clients** uses sum over projects of `max(0, contractValue − totalReceived)`.

Overview **totalOutstanding** is not floored—over-payment can show negative contract outstanding.

---

### 4.5 Overview label: “Material Procurement”

**Current:** Breakdown row is “Material Procurement”; backend now (after fix) can include both purchase and usage.

**Recommendation:** If you include USAGE in the sum, rename to “Material Cost” or “Materials (purchase + usage)” so the label matches the calculation.

**Status: Implemented.** Overview expense breakdown label is now "Material Cost".

---

### 4.6 Bills with no project (projectId null)

**Current:** Bills can have projectId null (company-level). Project summary only uses `project.bills`, so unlinked bills don’t affect any project Overview. Dashboard includes all payables (projectId null or in projectIds) for “pending to vendors”.

**Recommendation:** Document that project Overview only includes bills linked to that project. If you want project-level “pending payables” to match Bills tab, ensure the Bills tab only shows bills for that project (or show a warning when projectId is null).

**Status: Documented.** Project summary uses project.bills; only project-linked bills (projectId set) affect that project's Overview and totals. See §3.5 and USER_GUIDE / BUILDOPS_OVERVIEW.

---

### 4.7 Consistency: Reports and Dashboard

**Overview / getSummary:** Canonical for per-project profit (`totalIncome`, receivables, expense buckets).

**Dashboard:**

- Client outstanding: contract − received (floored per project).
- Collections: payment stage receipts.
- **Expense breakdown chart:** mixes paid labour/associate/bill payments with committed material line costs and full other-expense amounts—not identical to Overview expense totals.

**Reports:**

- **Project Dashboard (P&L):** `contractValue - totalExpenses` per project—**does not** add receivable bills to income (differs from Overview).
- **Material Usage Log:** USAGE quantities, not rupee material cost from Overview.

**Future work:** Align P&L export with `getSummary` if product owners want one profit definition everywhere.

---

## 5. Quick reference: “Where does this go?”

| Entry type | Tab | In Overview as |
|------------|-----|-----------------|
| Client pays against contract milestone | Payment Stages | Total received; Outstanding |
| Worker wages | Labour | Labour costs |
| Material bought for project | Materials (Purchase) | Material cost |
| Material used from stock for project | Materials (Usage) | Material cost |
| Subcontractor agreed amount & payments | Associates | Associate fees |
| Vendor invoice (you owe) | Bills (Payable) | Bills payable |
| Your invoice to client (extra work) | Bills (Receivable) | Other receivables; Total income; profit/margin |
| Misc (transport, permits, etc.) | Other expenses | Other expenses |

---

## 6. Summary of modifications

| Priority | Item | Action |
|----------|------|--------|
| High | Material cost excludes USAGE | **Done.** §4.1 implemented; reports aligned. |
| Medium | Receivables not in profit | **Done.** §4.2 implemented; totalReceivables, totalIncome, profit/margin. |
| Medium | Overview label “Material Procurement” | **Done.** Renamed to “Material Cost” (§4.5). |
| Low | Labour single payment date | **Documented.** §4.3; optional future LabourPaymentTransaction. |
| Low | Contract value vs sum(stages) | **Done.** Documented; dashboard outstanding aligned (§4.4). |
| Low | Bills without project | **Documented.** §4.6; only project-linked bills in Overview. |
| Open | P&L report vs Overview profit | **Documented.** §4.7; Overview uses `totalIncome`; report uses contract only. |

User-facing workflow and permissions: **`docs/WORKFLOW.md`**. Step-by-step UI: **`docs/USER_GUIDE.md`**.
