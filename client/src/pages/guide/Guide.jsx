import { Link } from 'react-router-dom';
import { authStore } from '../../store/authStore.js';
import { 
  BookOpen, ArrowLeft, LayoutDashboard, Layers, Users, PackageOpen, 
  Handshake, Receipt, Banknote, FileText, Settings, ShieldAlert, 
  BadgeInfo, Building2, FolderKanban, Key, ArrowRight, ArrowDown, CircleDollarSign, 
  CheckCircle2, BarChart3, ChevronRight, ArrowDownRight 
} from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { motion } from 'framer-motion';

const fadeUpVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: "spring", bounce: 0.4 } }
};

const drawLineVariant = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 1, 
    transition: { duration: 1, ease: "easeInOut", delay: 0.5 } 
  }
};

function PlatformAccessFlow() {
  return (
    <div className="w-full mt-4 py-12 px-8 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden">
      <motion.div 
        variants={{ visible: { transition: { staggerChildren: 0.4 } } }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="flex flex-col md:flex-row items-center gap-6 md:gap-4 relative w-full max-w-3xl justify-between"
      >
        
        {/* Step 1 */}
        <motion.div variants={fadeUpVariant} className="flex flex-col items-center gap-2 text-center z-10 w-32">
           <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-2">
              <Key className="h-6 w-6 text-slate-400" />
           </div>
           <span className="font-bold text-slate-900">Sign In</span>
           <span className="text-xs font-medium text-slate-500">Email & Password</span>
        </motion.div>
        
        {/* Animated Connector 1 */}
        <div className="hidden md:block absolute left-[12%] right-[55%] top-7 -translate-y-1/2 -z-10">
           <svg className="w-full h-8" preserveAspectRatio="none" viewBox="0 0 100 24" fill="none">
             <motion.path 
               variants={drawLineVariant}
               d="M0,12 L100,12" 
               stroke="url(#gradient-line-1)" 
               strokeWidth="3" 
               strokeDasharray="6 4"
               strokeLinecap="round"
             />
             <defs>
               <linearGradient id="gradient-line-1" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="#e2e8f0" />
                 <stop offset="100%" stopColor="#94a3b8" />
               </linearGradient>
             </defs>
           </svg>
        </div>
        <ArrowDown className="h-6 w-6 text-slate-300 block md:hidden" />

        {/* Step 2 */}
        <motion.div variants={fadeUpVariant} className="flex flex-col items-center gap-2 text-center z-10 w-32">
           <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20 flex items-center justify-center mb-2 cursor-pointer"
           >
              <LayoutDashboard className="h-6 w-6 text-white" />
           </motion.div>
           <span className="font-bold text-slate-900">Dashboard</span>
           <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600/80 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Authenticated</span>
        </motion.div>

        {/* Animated Connector 2 */}
        <div className="hidden md:block absolute left-[55%] right-[12%] top-7 -translate-y-1/2 -z-10">
           <svg className="w-full h-8" preserveAspectRatio="none" viewBox="0 0 100 24" fill="none">
             <motion.path 
               variants={drawLineVariant}
               d="M0,12 L100,12" 
               stroke="url(#gradient-line-2)" 
               strokeWidth="3" 
               strokeDasharray="6 4"
               strokeLinecap="round"
             />
             <defs>
               <linearGradient id="gradient-line-2" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="#94a3b8" />
                 <stop offset="100%" stopColor="#64748b" />
               </linearGradient>
             </defs>
           </svg>
        </div>
        <ArrowDown className="h-6 w-6 text-slate-300 block md:hidden" />

        {/* Step 3 */}
        <motion.div variants={fadeUpVariant} className="flex flex-col items-center gap-2 text-center z-10 w-32">
           <motion.div 
             whileHover={{ scale: 1.05 }}
             className="h-14 w-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-2 cursor-pointer"
           >
              <BookOpen className="h-6 w-6 text-blue-500" />
           </motion.div>
           <span className="font-bold text-slate-900">System Guide</span>
           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Available</span>
        </motion.div>
      </motion.div>
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
    <div className="w-full mt-4 p-8 bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
      <motion.div 
        variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="flex flex-wrap justify-center gap-x-2 gap-y-8"
      >
        {LIFECYCLE_STEPS.map((step, idx) => (
          <div key={idx} className="flex items-center">
             <motion.div variants={fadeUpVariant} className="flex flex-col items-center gap-3">
                <motion.div 
                  whileHover={{ scale: 1.1, y: -4 }}
                  className="h-14 w-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center cursor-pointer hover:border-blue-200 hover:shadow-md transition-all group"
                >
                  <step.icon className="h-6 w-6 text-slate-500 group-hover:text-blue-600 transition-colors" />
                </motion.div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center w-24 leading-tight">
                  {step.label}
                </span>
             </motion.div>
             {idx < LIFECYCLE_STEPS.length - 1 && (
               <motion.div 
                 variants={{ hidden: { opacity: 0, scale: 0 }, visible: { opacity: 1, scale: 1 } }}
                 className="mx-3 mt-[-36px] hidden sm:block relative w-8 h-px bg-slate-200"
               >
                 <ChevronRight className="absolute -right-3 -top-2.5 h-5 w-5 text-slate-300" />
               </motion.div>
             )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function TransactionStateFlow() {
  return (
    <div className="w-full mt-4 py-16 px-8 bg-slate-50/50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden">
      <motion.div 
        variants={{ visible: { transition: { staggerChildren: 0.3 } } }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="flex flex-col md:flex-row items-center gap-6 md:gap-8 lg:gap-12 relative w-full max-w-4xl justify-center"
      >
        {/* Not Paid State */}
        <motion.div variants={fadeUpVariant} className="flex flex-col items-center w-40 z-10">
           <div className="w-full py-3 bg-white border border-slate-200 text-center rounded-xl font-bold text-slate-600 shadow-sm mb-3">
              Not Paid
           </div>
        </motion.div>

        {/* Transition 1 */}
        <motion.div variants={fadeUpVariant} className="flex flex-col items-center gap-2 z-10 w-24">
           <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 text-center">Record Payment</span>
           <div className="relative w-full h-2 hidden md:block">
              <svg className="absolute w-full h-full top-0 left-0 overflow-visible" fill="none">
                 <motion.path variants={drawLineVariant} d="M0,4 L100%,4" stroke="#cbd5e1" strokeWidth="2" />
                 <motion.polygon variants={fadeUpVariant} points="100%,0 100%,8 100%+8,4" fill="#cbd5e1" />
              </svg>
           </div>
           <ArrowDown className="h-5 w-5 text-slate-300 block md:hidden" />
        </motion.div>

        {/* Some Paid State */}
        <motion.div variants={fadeUpVariant} className="flex flex-col items-center w-40 relative group z-10">
           <motion.div 
             whileHover={{ y: -2 }}
             className="w-full py-3 bg-amber-50 border border-amber-200/60 text-center rounded-xl font-bold text-amber-700 shadow-sm mb-3 flex justify-center items-center gap-2 relative z-20"
           >
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="h-2 w-2 rounded-full bg-amber-500" 
              />
              Some Paid
           </motion.div>
           
           {/* Animated Self-loop visualization */}
           <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="absolute -top-[52px] left-1/2 -translate-x-1/2 w-32 h-14 hidden xl:block z-0"
           >
              <svg className="w-full h-full overflow-visible" fill="none">
                 <motion.path 
                   d="M16,56 Q16,0 64,0 Q112,0 112,56" 
                   stroke="#fcd34d" 
                   strokeWidth="2" 
                   strokeDasharray="4 4" 
                   fill="none"
                   animate={{ strokeDashoffset: -20 }}
                   transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                 />
                 <polygon points="108,52 116,52 112,60" fill="#fcd34d" />
              </svg>
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-[9px] rounded uppercase font-bold text-amber-600 whitespace-nowrap shadow-sm border border-amber-100 z-10">Partial Pay</span>
           </motion.div>
        </motion.div>

        {/* Transition 2 */}
        <motion.div variants={fadeUpVariant} className="flex flex-col items-center gap-2 z-10 w-24">
           <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600/70 text-center">Full Amount</span>
           <div className="relative w-full h-2 hidden md:block">
              <svg className="absolute w-full h-full top-0 left-0 overflow-visible" fill="none">
                 <motion.path variants={drawLineVariant} d="M0,4 L100%,4" stroke="#86efac" strokeWidth="2" />
                 <motion.polygon variants={fadeUpVariant} points="100%,0 100%,8 100%+8,4" fill="#86efac" />
              </svg>
           </div>
           <ArrowDown className="h-5 w-5 text-slate-300 block md:hidden" />
        </motion.div>

        {/* Fully Paid State */}
        <motion.div variants={fadeUpVariant} className="flex flex-col items-center w-40 z-10">
           <motion.div 
             whileHover={{ scale: 1.05 }}
             className="w-full py-3 bg-emerald-50 border border-emerald-200/60 text-center rounded-xl font-bold text-emerald-700 shadow-sm mb-3 flex items-center justify-center gap-2 cursor-pointer relative overflow-hidden"
           >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full skew-x-12"
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 1.2, bounce: 0.6 }}
              >
                 <CheckCircle2 className="h-4 w-4" />
              </motion.div>
              Fully Paid
           </motion.div>
        </motion.div>
      </motion.div>
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
