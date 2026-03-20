# Project Tabs: How Everything Works & What Needs Modification

This document summarizes how each project tab works, how the Overview is calculated, and what modifications are recommended.

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

### 4.1 Material cost: include USAGE, not just PURCHASE (bug)

**Current:** `totalMaterialCost` only sums `MaterialItem` where `type === 'PURCHASE'`.

**Issue:** When material is **used** from stock on the project (type USAGE), the item has `totalCost` (cost allocated to the project). That cost is not counted in Overview, so project expense is understated.

**Change:** In `server/src/controllers/project.controller.js` (getSummary), change material cost to sum **both** PURCHASE and USAGE:

```js
const totalMaterialCost = project.materialItems
  .reduce((s, i) => s + toNum(i.totalCost ?? 0), 0);
```

(Remove the `.filter((i) => i.type === 'PURCHASE')` or use a comment that “material cost” = all items. If you prefer a separate label, you could expose totalMaterialPurchase and totalMaterialUsage and sum them in totalExpenses.)

**Also update:** Reports/dashboard that use the same “PURCHASE only” logic for project material cost (e.g. `report.controller.js` and any dashboard aggregates) so they stay consistent.

**Status: Implemented.** Project summary and reports now sum all material items (PURCHASE + USAGE). Dashboard material aggregate already used all items.

---

### 4.2 Bills receivables: not in revenue or profit (design gap)

**Current:** Receivables (bills type RECEIVABLE) are not part of contract value, total received, or profit. They’re only listed in the Bills tab.

**Issue:** Extra invoices you send to the client (e.g. variation orders) are additional income. For a complete P&L they should affect revenue and profit.

**Options:**

- **A) Add to Overview revenue:**  
  - `totalReceivables` = sum of (bill.totalAmount − bill.paidAmount) for project’s RECEIVABLE bills.  
  - Show “Outstanding from client” = current totalOutstanding + totalReceivables, or show “Contract value” and “Other receivables” separately.  
  - Optionally: `revenueForProfit` = totalContractValue + totalReceivablesAmount (full receivable amount), and profit = revenueForProfit − totalExpenses. Then document that “received” is still only from payment stages.

- **B) Keep current formula but add a line:**  
  - e.g. “Other receivables (not in profit)” so the user sees the number without changing profit math until product decision is made.

Recommendation: implement A (or a variant) so profit reflects all billable revenue (contract + receivables); document the definition in USER_GUIDE or BUILDOPS_OVERVIEW.

**Status: Implemented.** totalReceivables and totalIncome added; profit and margin use totalIncome. Overview shows "Other receivables" and "Total income" when applicable.

---

### 4.3 Labour: only one payment date (limitation)

**Current:** One `paymentDate` (and one `paidAmount`) per LabourPayment. Multiple real-world payments are represented by editing the same row and updating paid amount/date.

**Limitation:** No history of “payment 1 on date A, payment 2 on date B” for labour.

**Options:** Keep as-is and document; or introduce LabourPaymentTransaction (similar to AssociateTransaction / BillPayment) and derive paidAmount and status from that. The former is simpler; the latter gives audit trail and multiple dates.

**Status: Documented.** Single paidAmount and paymentDate per entry; multiple real-world payments are reflected by updating the same entry. Optional future enhancement: LabourPaymentTransaction for full history.

---

### 4.4 Contract value vs sum of stage expected amounts

**Status: Implemented.** Documented that outstanding (contract) = contract value − total received; stages need not sum to contract value. Dashboard totalOutstandingFromClients now uses this definition (sum over projects of max(0, contractValue − totalReceived)).

**Current:** totalOutstanding = contractValue − totalReceived. Payment stages have their own expectedAmount per stage; the dashboard sometimes uses sum(stage expected − stage received) for “outstanding”.

**Risk:** If stages’ expected amounts don’t add up to contract value, project Overview and dashboard “outstanding” can diverge.

**Recommendation:** Either (1) enforce in UI/API that sum(stage.expectedAmount) = contractValue, or (2) document clearly that “Contract value” is the single source of truth for revenue and outstanding, and stage expected amounts are for tracking only. If (2), ensure dashboard “outstanding” uses the same definition (contract value − total received) where it’s meant to show “client owes on main contract”.

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

**Recommendation:** After changing project summary (material cost, receivables), align:

- **Reports** (e.g. project P&L, labour cost, material usage) so material cost and revenue definitions match.
- **Dashboard** (payables, outstanding, collections) so “outstanding” and any profit-related metrics use the same rules as project Overview.

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

§4.1, §4.2, §4.4, §4.5, §4.6 are implemented or documented as above; §4.3 (labour) is documented with optional future payment history. Implementing §4.1 and §4.2 (and the corresponding report/dashboard alignment) will make the project tabs and Overview consistent and complete for P&L and cash-flow tracking.
