import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authStore } from '../../store/authStore.js';
import { 
  BookOpen, 
  ArrowLeft, 
  Layers, 
  Workflow, 
  Zap, 
  Users, 
  ChevronRight, 
  Key, 
  ShieldCheck, 
  BarChart3, 
  CheckCircle2, 
  Activity, 
  Wallet, 
  HardHat, 
  Package, 
  Mail,
  Box
} from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

/**
 * Modern, animated Guide page.
 */
export function Guide() {
  const token = authStore((s) => s.token);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">CBMS Guide</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/guide/detailed"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-blue-600 text-white text-[13px] sm:text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                <span className="hidden xs:inline">View detailed guide</span>
                <span className="xs:hidden">Details</span>
              </Link>
              {token && (
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 space-y-24">
        
        {/* 1. Hero Section: What is CBMS */}
        <motion.section 
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
          className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-16 text-white shadow-2xl"
        >
          <div className="relative z-10 max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-500/30">
              Overview
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 sm:mb-6 tracking-tight leading-tight">What is CBMS?</h2>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8">
              CBMS is a <span className="text-white font-semibold">Construction Business Management System</span> that helps you track projects, see money in and out, and run multiple offices from one place. 
            </p>
            <div className="grid sm:grid-cols-2 gap-6 text-slate-300 text-sm">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-blue-400" />
                </div>
                <span>See all your project finances in one place</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-blue-400" />
                </div>
                <span>Profit and loss views and reports you can export</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-blue-400" />
                </div>
                <span>Labour, materials, and other costs per project</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-3 w-3 text-blue-400" />
                </div>
                <span>Client payments by stage, with balances updated for you</span>
              </div>
            </div>
          </div>
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 mr-10 mb-10 opacity-10">
            <Box className="h-64 w-64 text-white" />
          </div>
        </motion.section>

        {/* 2. Workflow */}
        <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 overflow-hidden shadow-sm">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <Workflow className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Standard Workflow</h2>
            </div>
            <p className="text-sm sm:text-slate-600 max-w-2xl">
              Use this order to set up and run your projects from start to finish.
            </p>
          </motion.div>

          <div className="relative">
            {/* Connection Line (Desktop) */}
            <div className="hidden lg:block absolute top-[2.25rem] left-[10%] right-[10%] h-0.5 bg-slate-100 z-0"></div>
            
            <motion.div 
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid gap-8 lg:grid-cols-5 relative z-10"
            >
              {[
                { title: 'Setup', text: 'Define clients and branches', step: '01' },
                { title: 'Initiate', text: 'Create project and budget', step: '02' },
                { title: 'Structure', text: 'Add payment stages', step: '03' },
                { title: 'Record', text: 'Log costs and receipts', step: '04' },
                { title: 'Analyze', text: 'Generate P&L reports', step: '05' },
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  variants={fadeIn}
                  className="flex lg:flex-col items-center gap-4 lg:gap-6 text-center lg:text-center"
                >
                  <div className="flex-shrink-0 h-[4.5rem] w-[4.5rem] rounded-full bg-blue-50 border-4 border-white shadow-sm flex items-center justify-center text-blue-600 font-bold text-xl relative">
                    {item.step}
                    {idx < 4 && <ChevronRight className="hidden lg:block absolute -right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />}
                  </div>
                  <div className="text-left lg:text-center">
                    <h4 className="font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 4. Features Grid */}
        <section>
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="flex items-end justify-between mb-12"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Zap className="h-6 w-6 text-amber-500" />
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Key Features</h2>
              </div>
              <p className="text-sm sm:text-slate-600 max-w-2xl">
                Everything you need to run projects, track money, and see where you stand.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { icon: Activity, title: 'Dashboard', desc: 'See active projects, money in and out, what’s still owed, and low-stock alerts at a glance.' },
              { icon: Layers, title: 'Project Tabs', desc: 'Each project has tabs for payment stages, labour, materials, associates, bills, and expenses.' },
              { icon: Wallet, title: 'Payment Stages', desc: 'Break the contract into stages; record when the client pays; balances update automatically.' },
              { icon: HardHat, title: 'Labour', desc: 'Record workers, days, rates, and payments; see who still needs to be paid.' },
              { icon: Package, title: 'Materials', desc: 'Keep a list of materials; record purchases and usage per project; stock levels update automatically.' },
              { icon: BarChart3, title: 'Reports', desc: 'View profit and loss, collections, pending bills, and more; export to PDF or Excel.' },
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                variants={fadeIn}
                whileHover={{ scale: 1.02 }}
                className="group bg-white p-8 rounded-2xl border border-slate-200 hover:border-blue-200 transition-all shadow-sm hover:shadow-md"
              >
                <div className="h-12 w-12 rounded-xl bg-slate-50 text-slate-600 mb-6 flex items-center justify-center transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* 5. Roles & Access Controls */}
        <section className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-6 w-6 text-rose-500" />
              <h2 className="text-3xl font-bold text-slate-900">Roles & Security</h2>
            </div>
            <p className="text-slate-600 mb-8 leading-relaxed">
              Who can see and do what depends on their role. Each role is set up to match how your team works.
            </p>
            <div className="space-y-4">
              {[
                { role: 'Super Admin', access: 'Sees all offices; can change settings and delete records anywhere.' },
                { role: 'Branch Manager', access: 'Sees only their office; can add, edit, and delete records there.' },
                { role: 'Staff', access: 'Sees only their office; can add and edit, but cannot delete records.' },
              ].map((role, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-xl bg-white border border-slate-100 shadow-sm">
                  <div className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{role.role}</h4>
                    <p className="text-xs text-slate-500 mt-1">{role.access}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
             initial="initial"
             whileInView="animate"
             viewport={{ once: true }}
             variants={fadeIn}
             className="relative"
          >
            <div className="aspect-square rounded-3xl bg-blue-600 p-8 shadow-2xl flex flex-col justify-center text-white overflow-hidden">
               <ShieldCheck className="h-32 w-32 mb-8 opacity-20 absolute top-4 right-4" />
               <div className="relative z-10">
                 <h3 className="text-2xl font-bold mb-4 italic">"Your data stays in your control, with access limited by role."</h3>
                 <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                     <ShieldCheck className="h-5 w-5" />
                   </div>
                   <span className="text-sm font-medium">Secure login; each user sees only what their role allows</span>
                 </div>
               </div>
            </div>
          </motion.div>
        </section>

        {/* 6. Quick Start Guide */}
        <section className="relative">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="bg-indigo-900 rounded-[3rem] p-8 sm:p-16 text-white overflow-hidden shadow-2xl"
          >
            <div className="relative z-10 grid lg:grid-cols-2 gap-12">
              <div>
                <h2 className="text-3xl font-bold mb-8">Ready to get started?</h2>
                <div className="space-y-8">
                  {[
                    { step: 1, title: 'Log in', text: 'Sign in with your email and password.' },
                    { step: 2, title: 'Add clients and offices', text: 'Add the clients you work for and your branches (offices).' },
                    { step: 3, title: 'Create a project', text: 'Start a new project; choose the client, branch, and contract value.' },
                    { step: 4, title: 'Use the project tabs', text: 'Record payment stages, labour, materials, associates, bills, and expenses in the project.' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-6 items-start">
                      <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center font-bold text-indigo-200 border border-white/20 shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-bold text-lg">{item.title}</h4>
                        <p className="text-indigo-200 text-sm mt-1">{item.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden lg:flex items-center justify-center relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full"></div>
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 w-full max-w-sm">
                  <div className="space-y-4">
                    <div className="h-3 w-3/4 rounded bg-white/20"></div>
                    <div className="h-3 w-1/2 rounded bg-white/10"></div>
                    <div className="pt-4 grid grid-cols-2 gap-3">
                      <div className="h-12 rounded-lg bg-indigo-500/20"></div>
                      <div className="h-12 rounded-lg bg-indigo-500/20"></div>
                    </div>
                    <div className="h-24 rounded-xl bg-indigo-500/20"></div>
                    <div className="h-10 w-full rounded-lg bg-blue-500 flex items-center justify-center text-xs font-bold uppercase tracking-widest">
                      Dashboard Active
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* 7. Demo Access */}
        <section id="demo">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <Key className="h-6 w-6 text-blue-600" />
              <h2 className="text-3xl font-bold text-slate-900">Demo Environment</h2>
            </div>
            <p className="text-slate-600">
              Try the system with sample data. Use password <code className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-bold tracking-tight">admin123</code> for all accounts below.
            </p>
          </motion.div>

          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { role: 'Super Admin', email: 'admin@company.com', scope: 'All offices' },
              { role: 'Branch Manager', email: 'manager-a@company.com', scope: 'Branch A only' },
              { role: 'Staff (Branch A)', email: 'staff-a1@company.com', scope: 'Branch A only (cannot delete)' },
              { role: 'Staff (Branch B)', email: 'staff-b1@company.com', scope: 'Branch B only (cannot delete)' },
            ].map((creds, idx) => (
              <motion.div 
                key={idx}
                variants={fadeIn}
                whileHover={{ y: -4 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center"
              >
                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center mb-4 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{creds.role}</span>
                <p className="font-mono text-sm text-slate-900 mb-4 truncate w-full">{creds.email}</p>
                <div className="mt-auto pt-4 border-t border-slate-50 w-full">
                   <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded">{creds.scope}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

      </main>

      <footer className="mt-24 border-t border-slate-200 py-12 text-center">
         <p className="text-sm text-slate-400">
           &copy; {new Date().getFullYear()} CBMS. All rights reserved. Professional Edition.
         </p>
      </footer>
    </div>
  );
}
