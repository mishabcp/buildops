import { Link } from 'react-router-dom';
import { authStore } from '../../store/authStore.js';
import { MermaidDiagram } from '../../components/guide/MermaidDiagram.jsx';

const AUTH_FLOW = `flowchart LR
  subgraph before [Before sign in]
    Login["Sign in page"]
    Guide["This guide"]
  end
  subgraph after [After sign in]
    Dashboard["Home"]
    Projects["Projects"]
  end
  Login -->|"Enter email and password"| Dashboard
  Login --> Guide
  Dashboard --> Guide
  Guide -->|"Back to app"| Dashboard`;

const PROJECT_LIFECYCLE = `flowchart TD
  Create["Create a project"] --> Stages["Add payment stages from client"]
  Stages --> Labour["Add labour and wages"]
  Labour --> Materials["Add materials bought and used"]
  Materials --> Associates["Add subcontractors"]
  Associates --> Bills["Add bills to pay or receive"]
  Bills --> Expenses["Add other expenses"]
  Expenses --> Payments["Record all payments"]
  Payments --> Reports["View and download reports"]`;

const PAYMENT_STATUS = `stateDiagram-v2
  state "Not paid" as NotPaid
  state "Some paid" as SomePaid
  state "Fully paid" as FullyPaid
  [*] --> NotPaid
  NotPaid --> SomePaid: you record a payment
  SomePaid --> SomePaid: another payment
  SomePaid --> FullyPaid: full amount received
  NotPaid --> FullyPaid: client pays in full
  FullyPaid --> [*]`;

export function Guide() {
  const token = authStore((s) => s.token);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">CBMS User Guide</h1>
            <p className="mt-1 text-gray-600">
              Learn what you can do in CBMS and how to get started—no technical knowledge needed.
            </p>
          </div>
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
          <h2 className="mb-3 text-xl font-semibold text-gray-900">What you can do</h2>
          <ul className="list-inside list-disc space-y-2 text-gray-700">
            <li><strong>Home (Dashboard)</strong> — See at a glance: how many projects are active, how much money came in this month, what clients still owe you, and what you owe to vendors. Get alerts when material stock is low, and see your latest projects.</li>
            <li><strong>Projects</strong> — Create and manage construction projects. Each project has a client, contract value, and location. Open any project to track payments from the client, labour costs, materials, subcontractors, bills, and other expenses—all in one place.</li>
            <li><strong>Payment stages</strong> — Break the contract into stages (e.g. &quot;Advance&quot;, &quot;Foundation complete&quot;). Set how much the client should pay at each stage and when. When the client pays, record it here; the system shows how much is still due.</li>
            <li><strong>Labour</strong> — Record who worked on the project, for how many days, and at what rate. Track how much you&apos;ve paid them and how much is still due.</li>
            <li><strong>Materials</strong> — Keep a list of materials (cement, steel, etc.) and their stock levels. When you buy materials for a project, add a purchase; when you use them on site, add usage. The system updates stock automatically and warns you when it&apos;s low.</li>
            <li><strong>Associates (subcontractors)</strong> — Add electricians, plumbers, or other subcontractors and the amount agreed for each project. Record payments as you pay them; see what&apos;s still outstanding.</li>
            <li><strong>Bills</strong> — Record bills you need to pay (to suppliers) or that clients need to pay you. Link bills to a project, record payments, and see what&apos;s pending.</li>
            <li><strong>Other expenses</strong> — Add any other project costs (e.g. permits, transport) with a short description and amount.</li>
            <li><strong>Reports</strong> — See project profit and loss, how much was collected in a month, unpaid bills, labour and material costs. Download reports as PDF or Excel.</li>
            <li><strong>Settings</strong> — Company admins can add users and manage office locations (branches).</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold text-gray-900">How to get started</h2>
          <ol className="list-inside list-decimal space-y-3 text-gray-700">
            <li><strong>Log in</strong> with your email and password. If your company has just set up CBMS, use one of the sample logins in the table below.</li>
            <li>From the <strong>Home</strong> page, click <strong>Projects</strong> in the left menu. Click <strong>New Project</strong> to create one—you&apos;ll need the client name, which office it belongs to, contract value, and optional start/end dates.</li>
            <li><strong>Open a project</strong> by clicking it. You&apos;ll see tabs: Overview (summary of money in and out), Payment Stages, Labour, Materials, Associates, Bills, Other expenses. Use each tab to add and track that type of information.</li>
            <li>To <strong>record a payment from a client</strong>: open the project → Payment Stages tab → add a stage if needed (e.g. &quot;Advance&quot;, amount, due date) → click &quot;Record payment&quot; on that stage and enter the amount received, date, and how they paid (cash, bank transfer, etc.).</li>
            <li>To track <strong>labour, materials, subcontractors, or bills</strong>: open the project, go to the right tab, and use &quot;Add&quot; or &quot;Record payment&quot; as needed.</li>
            <li>The <strong>Materials</strong> item in the left menu shows all materials and stock levels. Add new material types here; add purchases and usage from inside each project.</li>
            <li>The <strong>Bills</strong> item in the left menu lists all bills (ones you need to pay and ones clients need to pay you). You can filter by type and record payments.</li>
            <li>Use <strong>Reports</strong> to see summaries and download PDF or Excel. Pick a date range and, if you have access to more than one office, choose which one to report on.</li>
            <li>If you&apos;re a <strong>company admin</strong>, use Settings to add or edit users and manage office names.</li>
          </ol>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Example: Recording a client payment</h2>
          <p className="mb-3 text-gray-700">
            Create or open a project → go to the <strong>Payment Stages</strong> tab → add a stage (e.g. &quot;Advance&quot;, ₹5,00,000, due in one week). When the client pays, click <strong>Record payment</strong> on that stage and enter the amount and date. The stage will show as &quot;Partially paid&quot; or &quot;Paid&quot; depending on how much has been received.
          </p>
          <h3 className="mb-2 text-lg font-medium text-gray-900">Example: Adding materials to a project</h3>
          <p className="text-gray-700">
            Open the project → <strong>Materials</strong> tab → <strong>Add purchase</strong>: choose Cement, 100 bags, rate per bag, supplier name, date. Stock for cement goes up. When you use 50 bags on site, add a <strong>usage</strong> entry: Cement, 50 bags, date. The system deducts from stock and shows the cost.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold text-gray-900">Sample logins</h2>
          <p className="mb-3 text-gray-600">
            If your company has just set up CBMS, these accounts may be available so you can try the system. Everyone uses the same password (<strong>admin123</strong>). <strong>Admin</strong> sees all offices; <strong>Branch Managers</strong> and <strong>Staff</strong> see only their own office. Staff cannot delete records.
          </p>
          <div className="overflow-x-auto rounded border border-gray-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-2 font-medium text-gray-900">Who</th>
                  <th className="px-4 py-2 font-medium text-gray-900">Email</th>
                  <th className="px-4 py-2 font-medium text-gray-900">Password</th>
                  <th className="px-4 py-2 font-medium text-gray-900">Sees</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-2">Admin (all offices)</td>
                  <td className="px-4 py-2">admin@company.com</td>
                  <td className="px-4 py-2">admin123</td>
                  <td className="px-4 py-2">All offices</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-2">Branch Manager</td>
                  <td className="px-4 py-2">manager-a@company.com</td>
                  <td className="px-4 py-2">admin123</td>
                  <td className="px-4 py-2">Branch A - Main Office</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-2">Branch Manager</td>
                  <td className="px-4 py-2">manager-b@company.com</td>
                  <td className="px-4 py-2">admin123</td>
                  <td className="px-4 py-2">Branch B - Site Office</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-2">Staff (Branch A)</td>
                  <td className="px-4 py-2">staff-a1@company.com</td>
                  <td className="px-4 py-2">admin123</td>
                  <td className="px-4 py-2">Branch A - Main Office</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Staff (Branch B)</td>
                  <td className="px-4 py-2">staff-b1@company.com</td>
                  <td className="px-4 py-2">admin123</td>
                  <td className="px-4 py-2">Branch B - Site Office</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            An admin can add more users (including staff for a single office) from Settings.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold text-gray-900">How it all fits together</h2>
          <p className="mb-4 text-gray-600">
            These pictures show the main flows: signing in, managing a project from start to finish, and how payment status works when you record payments.
          </p>
          <div className="space-y-8">
            <div>
              <h3 className="mb-2 font-medium text-gray-900">Signing in and opening the app</h3>
              <MermaidDiagram chart={AUTH_FLOW} className="my-2" />
            </div>
            <div>
              <h3 className="mb-2 font-medium text-gray-900">Typical project flow</h3>
              <MermaidDiagram chart={PROJECT_LIFECYCLE} className="my-2" />
            </div>
            <div>
              <h3 className="mb-2 font-medium text-gray-900">How payment status works</h3>
              <p className="mb-2 text-sm text-gray-600">
                When you haven&apos;t recorded any payment, the status is &quot;Not paid&quot;. After you record some (but not the full amount), it becomes &quot;Some paid&quot;. When the full amount is received, it shows &quot;Fully paid&quot;.
              </p>
              <MermaidDiagram chart={PAYMENT_STATUS} className="my-2" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
