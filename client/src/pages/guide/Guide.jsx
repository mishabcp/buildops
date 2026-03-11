import { Link } from 'react-router-dom';
import { authStore } from '../../store/authStore.js';
import { 
  BookOpen, ArrowLeft, LayoutDashboard, Layers, Users, PackageOpen, 
  Handshake, Receipt, Banknote, FileText, Settings, ShieldAlert, 
  BadgeInfo, Building2, FolderKanban, Key, ArrowRight, ArrowDown, CircleDollarSign, 
  CheckCircle2, BarChart3, ChevronRight, ArrowDownRight 
} from 'lucide-react';
import { cn } from '../../lib/utils.js';

function PlatformAccessFlow() {
  return (
    <div className="w-full mt-4 p-8 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-center">
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
        <div className="flex flex-col items-center gap-2 text-center">
           <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-2">
              <Key className="h-6 w-6 text-slate-400" />
           </div>
           <span className="font-bold text-slate-900">Sign In</span>
           <span className="text-xs font-medium text-slate-500">Email & Password</span>
        </div>
        
        <ArrowRight className="h-6 w-6 text-slate-300 hidden md:block" />
        <ArrowDown className="h-6 w-6 text-slate-300 block md:hidden" />

        <div className="flex flex-col items-center gap-2 text-center">
           <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md flex items-center justify-center mb-2">
              <LayoutDashboard className="h-6 w-6 text-white" />
           </div>
           <span className="font-bold text-slate-900">Dashboard</span>
           <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600/80 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Authenticated</span>
        </div>

        <ArrowRight className="h-6 w-6 text-slate-300 hidden md:block" />
        <ArrowDown className="h-6 w-6 text-slate-300 block md:hidden" />

        <div className="flex flex-col items-center gap-2 text-center">
           <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-2">
              <BookOpen className="h-6 w-6 text-blue-500" />
           </div>
           <span className="font-bold text-slate-900">System Guide</span>
           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Available</span>
        </div>
      </div>
    </div>
  );
}

const LIFECYCLE_STEPS = [
  { icon: Building2, label: "Create Project" },
  { icon: Banknote, label: "Add Stages" },
  { icon: Users, label: "Log Labour" },
  { icon: PackageOpen, label: "Materials" },
  { icon: Handshake, label: "Associates" },
  { icon: Receipt, label: "Add Bills" },
  { icon: CircleDollarSign, label: "Expenses" },
  { icon: CheckCircle2, label: "Record Payments" },
  { icon: BarChart3, label: "Reports" }
];

function ProjectLifecycleFlow() {
  return (
    <div className="w-full mt-4 p-8 bg-slate-50/50 rounded-2xl border border-slate-100">
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-6">
        {LIFECYCLE_STEPS.map((step, idx) => (
          <div key={idx} className="flex items-center">
             <div className="flex flex-col items-center gap-2">
                <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                  <step.icon className="h-5 w-5 text-slate-500" />
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center w-20 leading-tight">
                  {step.label}
                </span>
             </div>
             {idx < LIFECYCLE_STEPS.length - 1 && (
               <ChevronRight className="h-5 w-5 text-slate-300 mx-2 mt-[-30px] hidden sm:block" />
             )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TransactionStateFlow() {
  return (
    <div className="w-full mt-4 p-8 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-center">
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Not Paid State */}
        <div className="flex flex-col items-center w-40">
           <div className="w-full py-3 bg-white border border-slate-200 text-center rounded-xl font-bold text-slate-600 shadow-sm mb-3">
              Not Paid
           </div>
        </div>

        {/* Transition */}
        <div className="flex flex-col items-center gap-1">
           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Record Payment</span>
           <ArrowRight className="h-5 w-5 text-slate-300 hidden md:block" />
           <ArrowDown className="h-5 w-5 text-slate-300 block md:hidden" />
        </div>

        {/* Some Paid State */}
        <div className="flex flex-col items-center w-40 relative group">
           <div className="w-full py-3 bg-amber-50 border border-amber-200/60 text-center rounded-xl font-bold text-amber-700 shadow-sm mb-3 flex justify-center items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500 animate-[pulse_1.5s_ease-in-out_infinite]" />
              Some Paid
           </div>
           
           {/* Self-loop visualization */}
           <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-8 border-t border-x border-amber-200 border-dashed rounded-t-xl opacity-0 xl:opacity-100 transition-opacity">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-50 px-2 text-[10px] rounded uppercase font-bold text-amber-600 whitespace-nowrap">Partial Pay</span>
              <ArrowDownRight className="absolute -bottom-1 -right-2 h-4 w-4 text-amber-300" />
           </div>
        </div>

        {/* Transition */}
        <div className="flex flex-col items-center gap-1">
           <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600/70">Full Amount</span>
           <ArrowRight className="h-5 w-5 text-slate-300 hidden md:block" />
           <ArrowDown className="h-5 w-5 text-slate-300 block md:hidden" />
        </div>

        {/* Fully Paid State */}
        <div className="flex flex-col items-center w-40">
           <div className="w-full py-3 bg-emerald-50 border border-emerald-200/60 text-center rounded-xl font-bold text-emerald-700 shadow-sm mb-3 flex items-center justify-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Fully Paid
           </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="group flex gap-4 p-5 rounded-2xl border border-slate-200/60 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
       <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-blue-600 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
          <Icon className="h-6 w-6" />
       </div>
       <div>
         <h3 className="font-bold text-slate-900 text-[16px] mb-1">{title}</h3>
         <p className="text-[14px] text-slate-500 font-medium leading-relaxed">{description}</p>
       </div>
    </div>
  )
}

export function Guide() {
  const token = authStore((s) => s.token);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Premium Header */}
      <div className="relative bg-white border-b border-slate-200/60 overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 blur-sm opacity-50" />
        <div className="mx-auto max-w-5xl px-6 py-12 relative z-10">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner border border-blue-100">
                <BookOpen className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Documentation</h1>
                <p className="mt-1.5 text-slate-500 font-medium text-lg">
                  Learn what you can do in CBMS and how to get started. No technical knowledge needed.
                </p>
              </div>
            </div>
            {token && (
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all hover:shadow-md"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to App
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-10 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Modules Section */}
        <section>
          <div className="flex items-center gap-2 mb-6 text-slate-900">
             <Layers className="h-6 w-6 text-blue-500" />
             <h2 className="text-2xl font-bold tracking-tight">Core Modules</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <FeatureCard 
               icon={LayoutDashboard}
               title="Home (Dashboard)" 
               description="See at a glance: how many projects are active, how much money came in this month, outstanding dues, and low stock alerts." 
             />
             <FeatureCard 
               icon={Building2}
               title="Clients" 
               description="Manage the list of organizations you work for. Add, edit, or remove clients. Assign a client to each project when creating it." 
             />
             <FeatureCard 
               icon={FolderKanban}
               title="Projects Directory" 
               description="Create and manage construction projects. Track client payments, labour costs, materials, subcontractors, bills, and expenses." 
             />
             <FeatureCard 
               icon={Banknote}
               title="Payment Stages" 
               description="Break contracts into stages (e.g. Advance, Foundation). Set amounts and due dates. Real-time balance tracking." 
             />
             <FeatureCard 
               icon={Users}
               title="Labour & Workforce" 
               description="Record daily logs, wages per worker, and manage periodic payments. Track outstanding amounts directly." 
             />
             <FeatureCard 
               icon={PackageOpen}
               title="Materials Inventory" 
               description="Maintain master catalog. Add project-specific material purchases and calculate usage vs existing global stock." 
             />
             <FeatureCard 
               icon={Handshake}
               title="Associates (Subcontractors)" 
               description="Manage external contractors like plumbers and electricians. Record agreed amounts and ongoing payouts." 
             />
             <FeatureCard 
               icon={Receipt}
               title="Billing Ledger" 
               description="Record accounts payable (vendors) and accounts receivable (clients). Easily link transactions to explicit projects." 
             />
             <FeatureCard 
               icon={FileText}
               title="Reports & Analytics" 
               description="Generate dynamic P&L reports, collections tracking, operational costs, and export to PDF/Excel seamlessly." 
             />
             <FeatureCard 
               icon={Settings}
               title="Configuration" 
               description="Super Admins can define dynamic organizational branches and orchestrate robust role-based user management limits." 
             />
          </div>
        </section>

        {/* Getting Started Section */}
        <section className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden text-slate-700">
          <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100 flex items-center gap-3">
             <div className="h-8 w-8 rounded-lg bg-emerald-100/50 text-emerald-600 flex items-center justify-center">
               <BadgeInfo className="h-5 w-5" />
             </div>
             <h2 className="text-xl font-bold text-slate-900 tracking-tight">Quick Start Guide</h2>
          </div>
          <div className="p-8 space-y-6">
            <ol className="list-decimal list-outside ml-5 space-y-4 font-medium text-[15px] marker:text-slate-400 marker:font-bold">
              <li className="pl-2 leading-relaxed"><strong>Log in</strong> with your email and password. Try out the system with the sample logins provided below.</li>
              <li className="pl-2 leading-relaxed">Open <strong>Clients</strong> from the sidebar to add or select the organization (client) for your project. Then click <strong>Projects</strong> and <strong>New Project</strong> to establish baseline details (client, branch, contract value).</li>
              <li className="pl-2 leading-relaxed"><strong>Open a project</strong> to unveil its workspace tabs: Overview, Stages, Labour, Materials, Associates, Bills, and Expenses.</li>
              <li className="pl-2 leading-relaxed">To <strong>record a client payment</strong>: navigate to <span className="font-semibold text-slate-900">Payment Stages</span> → Add a stage → Click Record Payment. Enter amount & payment method.</li>
              <li className="pl-2 leading-relaxed">The <strong>Materials</strong> link in the main sidebar acts as your global catalog. However, actual purchase and usage recording happens inside individual projects.</li>
              <li className="pl-2 leading-relaxed">Dive into <strong>Reports</strong> to view intelligent financial summaries and export them for your records.</li>
            </ol>
            
            <div className="mt-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100/60">
               <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                 <Building2 className="h-4 w-4" /> Usage Scenario
               </h3>
               <p className="mb-4 text-blue-800 leading-relaxed text-sm">
                 Open a project → <strong>Materials tab</strong> → <strong>Add Purchase</strong>: select Cement, 100 bags. Stock increases. When 50 bags are used on site, add an <strong>Usage form</strong>. The system deducts stock and calculates real-world cost automatically.
               </p>
            </div>
          </div>
        </section>

        {/* Credentials Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-slate-900">
             <ShieldAlert className="h-6 w-6 text-orange-500" />
             <h2 className="text-2xl font-bold tracking-tight">Demo Credentials</h2>
          </div>
          <p className="mb-5 text-slate-500 font-medium">
            Test the system capabilities securely. All accounts use <code className="bg-slate-100 text-slate-800 px-2 py-1 rounded-md font-bold tracking-tight">admin123</code> as the universal password.
          </p>
          
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200/80">
                  <tr>
                    <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-widest text-slate-500">Access Tier</th>
                    <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-widest text-slate-500">Demo Email</th>
                    <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-widest text-slate-500">Auth Password</th>
                    <th className="px-6 py-4 font-bold text-[11px] uppercase tracking-widest text-slate-500">Visibility Scope</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-purple-700">Super Admin</td>
                    <td className="px-6 py-4 text-slate-900">admin@company.com</td>
                    <td className="px-6 py-4 font-mono text-slate-500">admin123</td>
                    <td className="px-6 py-4 text-slate-600">Global (All Offices)</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-blue-700">Branch Manager</td>
                    <td className="px-6 py-4 text-slate-900">manager-a@company.com</td>
                    <td className="px-6 py-4 font-mono text-slate-500">admin123</td>
                    <td className="px-6 py-4 text-slate-600">Branch A Only</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">Standard Staff</td>
                    <td className="px-6 py-4 text-slate-900">staff-a1@company.com</td>
                    <td className="px-6 py-4 font-mono text-slate-500">admin123</td>
                    <td className="px-6 py-4 text-slate-600">Branch A Only (No deletes)</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-700">Standard Staff</td>
                    <td className="px-6 py-4 text-slate-900">staff-b1@company.com</td>
                    <td className="px-6 py-4 font-mono text-slate-500">admin123</td>
                    <td className="px-6 py-4 text-slate-600">Branch B Only (No deletes)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Architecture & Flowcharts */}
        <section className="mb-10">
          <div className="mb-8">
             <h2 className="text-2xl font-bold tracking-tight text-slate-900">Architecture Diagrams</h2>
             <p className="mt-1 text-slate-500 font-medium">Visualize process flows and system states</p>
          </div>
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 overflow-hidden flex flex-col w-full">
              <h3 className="font-bold text-slate-900 text-lg">Platform Access Flow</h3>
              <PlatformAccessFlow />
            </div>
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 overflow-hidden flex flex-col w-full">
              <h3 className="font-bold text-slate-900 text-lg">Project Lifecycle Topology</h3>
              <ProjectLifecycleFlow />
            </div>
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 overflow-hidden flex flex-col w-full">
              <div className="mb-2">
                 <h3 className="font-bold text-slate-900 text-lg">Transaction State Machine</h3>
                 <p className="text-sm font-medium text-slate-500 mt-1">Status resolves intelligently based on recorded transaction volumes.</p>
              </div>
              <TransactionStateFlow />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
