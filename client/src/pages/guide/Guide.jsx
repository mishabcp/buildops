import { Link } from 'react-router-dom';
import { authStore } from '../../store/authStore.js';
import { MermaidDiagram } from '../../components/guide/MermaidDiagram.jsx';

const AUTH_FLOW = `flowchart LR
  subgraph public [Public]
    Login["/login"]
    Guide["/guide"]
  end
  subgraph protected [Protected]
    Dashboard["/"]
    Projects["/projects"]
  end
  Login -->|"JWT"| Dashboard
  Login --> Guide
  Dashboard --> Guide
  Guide -->|"Back to app"| Dashboard`;

const PROJECT_LIFECYCLE = `flowchart TD
  Create["Create project"] --> Stages["Add payment stages"]
  Stages --> Labour["Add labour entries"]
  Labour --> Materials["Materials: purchase / usage"]
  Materials --> Associates["Assign associates"]
  Associates --> Bills["Add bills"]
  Bills --> Expenses["Other expenses"]
  Expenses --> Payments["Record payments"]
  Payments --> Reports["Run reports / export"]`;

const PAYMENT_STATUS = `stateDiagram-v2
  [*] --> PENDING
  PENDING --> PARTIALLY_PAID: record payment
  PARTIALLY_PAID --> PARTIALLY_PAID: another payment
  PARTIALLY_PAID --> PAID: full amount
  PENDING --> PAID: full payment
  PAID --> [*]`;

export function Guide() {
  const token = authStore((s) => s.token);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold text-gray-900">CBMS User Guide</h1>
          {token && (
            <Link
              to="/"
              className="text-sm font-medium text-gray-600 underline hover:text-gray-900"
            >
              Back to app
            </Link>
          )}
        </div>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Features</h2>
          <ul className="list-inside list-disc space-y-1 text-gray-700">
            <li><strong>Dashboard</strong> — Stat cards (active projects, received this month, outstanding, pending to vendors), low-stock alerts, recent projects. Branch filter for SUPER_ADMIN.</li>
            <li><strong>Projects</strong> — List with filters (branch, status) and search; create/edit projects; detail page with tabs: Overview, Payment Stages, Labour, Materials, Associates, Bills, Other Expenses.</li>
            <li><strong>Payment stages</strong> — Per-project stages with expected amount, due date; record receipts; status (PENDING / PARTIALLY_PAID / PAID) and payment bar.</li>
            <li><strong>Labour</strong> — Add labour entries (worker, work type, days, rate); track paid vs total; edit/delete.</li>
            <li><strong>Materials</strong> — Stock list (name, unit, current stock, min threshold); per-project purchases and usage; stock updates automatically.</li>
            <li><strong>Associates</strong> — Assign associates to projects with agreed amount; record transactions; view payment history.</li>
            <li><strong>Bills</strong> — Payable and receivable bills; link to project; record payments; view history.</li>
            <li><strong>Other expenses</strong> — Miscellaneous project expenses with description, amount, date.</li>
            <li><strong>Reports</strong> — Project P&amp;L, payment collection, pending bills, labour cost, material usage; export PDF/Excel.</li>
            <li><strong>Settings</strong> — User management (SUPER_ADMIN), branch settings.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold text-gray-900">How to use</h2>
          <ol className="list-inside list-decimal space-y-2 text-gray-700">
            <li>Sign in with one of the seeded accounts (see table below).</li>
            <li>From the Dashboard, use the sidebar to go to <strong>Projects</strong> and create a project (client, branch, contract value, dates).</li>
            <li>Open a project and use the <strong>Payment Stages</strong> tab to add stages and record client payments (receipts).</li>
            <li>Use the <strong>Labour</strong>, <strong>Materials</strong>, <strong>Associates</strong>, <strong>Bills</strong>, and <strong>Other expenses</strong> tabs to log costs and payments.</li>
            <li>Go to <strong>Materials</strong> in the sidebar to manage stock and add new material types.</li>
            <li>Go to <strong>Bills</strong> to view and manage all payable/receivable bills.</li>
            <li>Use <strong>Reports</strong> to run reports (date range, branch filter) and export as PDF or Excel.</li>
            <li>SUPER_ADMIN can manage users and branches under <strong>Settings</strong>.</li>
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Examples</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="mb-1 font-medium text-gray-900">Example 1: Create project and record a client payment</h3>
              <p>Create a project (name, client, branch, contract value) → Open the project → Payment Stages tab → Add a stage (e.g. &quot;Advance&quot;, expected amount, due date) → Use &quot;Record payment&quot; on that stage to add a receipt (amount, date, mode, reference). The stage status updates to PARTIALLY_PAID or PAID based on total receipts.</p>
            </div>
            <div>
              <h3 className="mb-1 font-medium text-gray-900">Example 2: Material purchase and usage</h3>
              <p>Open a project → Materials tab → Add a purchase (select material, quantity, rate, supplier, date). Stock for that material increases. Add a usage entry (material, quantity, date) to deduct from stock; total cost is shown. Stock is global across projects.</p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Seeded users</h2>
          <p className="mb-3 text-sm text-gray-600">
            After running the seed script, these accounts are available. All use the same password. SUPER_ADMIN sees all branches; BRANCH_MANAGER and STAFF see only their assigned branch.
          </p>
          <div className="overflow-x-auto rounded border border-gray-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-2 font-medium text-gray-900">Role</th>
                  <th className="px-4 py-2 font-medium text-gray-900">Email</th>
                  <th className="px-4 py-2 font-medium text-gray-900">Password</th>
                  <th className="px-4 py-2 font-medium text-gray-900">Branch</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-2">SUPER_ADMIN</td>
                  <td className="px-4 py-2">admin@company.com</td>
                  <td className="px-4 py-2">admin123</td>
                  <td className="px-4 py-2">All</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-2">BRANCH_MANAGER</td>
                  <td className="px-4 py-2">manager-a@company.com</td>
                  <td className="px-4 py-2">admin123</td>
                  <td className="px-4 py-2">Branch A - Main Office</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">BRANCH_MANAGER</td>
                  <td className="px-4 py-2">manager-b@company.com</td>
                  <td className="px-4 py-2">admin123</td>
                  <td className="px-4 py-2">Branch B - Site Office</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-sm text-gray-500">The seed does not create a STAFF user; you can add one via Settings (SUPER_ADMIN only).</p>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Process flows</h2>

          <div className="space-y-8">
            <div>
              <h3 className="mb-2 font-medium text-gray-900">Auth and routing</h3>
              <MermaidDiagram chart={AUTH_FLOW} className="my-2" />
            </div>
            <div>
              <h3 className="mb-2 font-medium text-gray-900">Project lifecycle</h3>
              <MermaidDiagram chart={PROJECT_LIFECYCLE} className="my-2" />
            </div>
            <div>
              <h3 className="mb-2 font-medium text-gray-900">Payment status (stages, labour, associates, bills)</h3>
              <MermaidDiagram chart={PAYMENT_STATUS} className="my-2" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
