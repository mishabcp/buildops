import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { authStore } from '../../store/authStore.js';
import { 
  BookOpen, 
  ArrowLeft, 
  ChevronRight, 
  LayoutDashboard, 
  Users, 
  Layers, 
  Wallet, 
  HardHat, 
  Box, 
  Briefcase, 
  FileText, 
  PieChart, 
  ShieldCheck,
  Search,
  CheckCircle2,
  Menu,
  X,
  Plus,
  Database,
  ArrowUpRight,
  ClipboardList,
  UserPlus,
  Coins,
  ChevronLeft
} from 'lucide-react';

const SECTIONS = [
  { id: 'getting-started', label: 'Getting started', icon: BookOpen },
  { id: 'dashboard-and-reports', label: 'Dashboard & reports', icon: LayoutDashboard },
  { id: 'clients-projects-revenue', label: 'Clients, projects & revenue', icon: Layers },
  { id: 'costs-and-payables', label: 'Costs & payables', icon: HardHat },
  { id: 'roles-and-access', label: 'Roles and access', icon: ShieldCheck },
];

const sectionFadeIn = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.4, ease: [0.23, 1, 0.32, 1] }
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] }
  }
};

const diagramAnimation = {
  initial: { opacity: 0, scale: 0.98, y: 10 },
  whileInView: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  },
  viewport: { once: true }
};

/**
 * Helper components for consistent UI and animations
 */
function SectionWrapper({ children }) {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      variants={shouldReduceMotion ? {} : staggerContainer}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {children}
    </motion.div>
  );
}

function AnimatedBlock({ children, className = "" }) {
  const shouldReduceMotion = useReducedMotion();
  
  const variant = shouldReduceMotion 
    ? { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.3 } } }
    : fadeInUp;

  return (
    <motion.div 
      variants={variant} 
      className={`prose-custom ${className}`}
    >
      {children}
    </motion.div>
  );
}

function Card({ title, children, icon: Icon, variant = "light", className = "" }) {
  const shouldReduceMotion = useReducedMotion();
  const styles = {
    light: "bg-white/70 backdrop-blur-md border-slate-200/60 text-slate-900 hover:border-blue-300/50 hover:shadow-xl hover:shadow-blue-500/5",
    dark: "bg-slate-900 border-slate-800 text-white hover:bg-slate-800 hover:shadow-2xl hover:shadow-black/20",
    blue: "bg-blue-50/80 backdrop-blur-sm border-blue-100/50 text-blue-900",
    emerald: "bg-emerald-50/80 backdrop-blur-sm border-emerald-100/50 text-emerald-900",
    indigo: "bg-indigo-50/80 backdrop-blur-sm border-indigo-100/50 text-indigo-900",
    amber: "bg-amber-50/80 backdrop-blur-sm border-amber-100/50 text-amber-900",
    rose: "bg-rose-50/80 backdrop-blur-sm border-rose-100/50 text-rose-900",
  };

  const animationVariant = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.3 } } }
    : fadeInUp;

  return (
    <motion.div 
      variants={animationVariant}
      whileHover={shouldReduceMotion ? {} : { y: -6, scale: 1.01, transition: { duration: 0.2 } }}
      className={`p-5 rounded-2xl border shadow-sm transition-all group ${styles[variant]} ${className}`}
    >
      {title && (
        <h4 className="font-bold flex items-center gap-2 mb-3 text-lg tracking-tight">
          {Icon && (
            <div className="h-9 w-9 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform">
              <Icon className="h-4 w-4 opacity-80" />
            </div>
          )}
          {title}
        </h4>
      )}
      <div className={`text-base leading-relaxed ${variant === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
        {children}
      </div>
    </motion.div>
  );
}

function BenefitCallout({ children, variant = "blue" }) {
  return (
    <AnimatedBlock>
      <Card variant={variant} title="How you benefit" icon={ShieldCheck}>
        {children}
      </Card>
    </AnimatedBlock>
  );
}

function ProcessFlow({ title, items, layout = "linear", variant = "slate" }) {
  const shouldReduceMotion = useReducedMotion();
  const styles = {
    slate: "bg-white/40 border-slate-200/50",
    emerald: "bg-emerald-50/20 border-emerald-100/40",
    blue: "bg-blue-50/20 border-blue-100/40",
    indigo: "bg-indigo-50/20 border-indigo-100/40",
    amber: "bg-amber-50/20 border-amber-100/40",
    rose: "bg-rose-50/20 border-rose-100/40",
  };

  return (
    <motion.div 
      variants={diagramAnimation}
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true }}
      className={`my-8 p-6 lg:p-8 rounded-2xl border backdrop-blur-md shadow-sm ${styles[variant]} overflow-hidden relative group`}
    >
      {title && (
        <div className="flex flex-col items-center mb-6">
          <h4 className="font-semibold text-slate-600 text-[10px] tracking-wider uppercase flex items-center gap-3">
             <span className="h-px w-6 bg-slate-200" />
             {title}
             <span className="h-px w-6 bg-slate-200" />
          </h4>
        </div>
      )}

      <div className={`
        flex flex-wrap justify-center items-start gap-y-8 gap-x-4
        ${layout === 'grid' ? 'grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4' : ''}
      `}>
        {items.map((item, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-3 group relative w-24">
              <div className="relative">
                {item.active && (
                   <motion.div 
                     animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
                     transition={{ duration: 3, repeat: Infinity }}
                     className="absolute inset-[-8px] bg-blue-500/10 rounded-xl blur-lg" 
                   />
                )}
                <div className={`
                  h-16 w-16 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 relative z-10
                  ${item.active 
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-[0_15px_30px_-5px_rgba(37,99,235,0.4)]' 
                    : 'bg-white text-slate-400 border border-slate-100/80 shadow-[0_8px_20px_-5px_rgba(0,0,0,0.05)] group-hover:border-blue-400/30 group-hover:text-blue-600 group-hover:shadow-[0_15px_40px_-10px_rgba(37,99,235,0.15)]'}
                `}>
                  {item.icon && <item.icon className="h-7 w-7" />}
                </div>
                {item.active && (
                   <div className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow z-20">
                     <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                   </div>
                )}
              </div>
              <div className="text-center relative z-10 w-full">
                <span className="text-xs font-bold text-slate-900 block group-hover:text-blue-600 transition-colors uppercase tracking-tight">{item.label}</span>
                {item.desc && <span className="text-[9px] text-slate-400 uppercase tracking-wider font-medium mt-1 block">{item.desc}</span>}
              </div>
            </div>
            
            {(layout === 'linear') && i < items.length - 1 && (
              <div className="hidden xl:flex items-center text-slate-200 h-16 mx-[-15px] relative pointer-events-none">
                <svg width="40" height="12" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 10H58M58 10L50 2M58 10L50 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <motion.path 
                    d="M0 10H58" 
                    stroke="url(#glowGradient)" 
                    strokeWidth="3" 
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                  <defs>
                    <linearGradient id="glowGradient" x1="0" y1="10" x2="60" y2="10" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#3B82F6" stopOpacity="0" />
                      <stop offset="0.5" stopColor="#3B82F6" />
                      <stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </motion.div>
  );
}

function DataTable({ headers, data, className = "" }) {
  return (
    <AnimatedBlock className={`overflow-hidden rounded-xl border border-slate-200/60 bg-white/80 shadow-sm my-6 ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-500 text-[10px] uppercase tracking-wider border-b border-slate-100">
              {headers.map((h, i) => (
                <th key={i} className="px-5 py-3 font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                {Object.values(row).map((val, j) => (
                  <td key={j} className={`px-5 py-3 ${j === 0 ? 'font-semibold text-slate-900 group-hover:text-blue-600' : 'text-slate-500'}`}>
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AnimatedBlock>
  );
}

function BadgeList({ items, variant = "slate" }) {
  const shouldReduceMotion = useReducedMotion();
  const styles = {
    slate: "bg-white text-slate-500 border-slate-100 hover:border-blue-200 hover:text-blue-600",
    amber: "bg-amber-50/50 text-amber-700 border-amber-100 hover:bg-amber-100 hover:border-amber-200",
    blue: "bg-blue-50/50 text-blue-700 border-blue-100 hover:bg-blue-100 hover:border-blue-200",
  };

  return (
    <AnimatedBlock className="flex flex-wrap gap-2 my-6">
      {items.map((item, i) => (
        <motion.span
          key={i}
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.03 }}
          transition={{ delay: shouldReduceMotion ? 0 : i * 0.03 }}
          className={`px-4 py-2 rounded-lg text-[11px] font-semibold uppercase tracking-wider border shadow-sm transition-all cursor-default ${styles[variant]}`}
        >
          {item}
        </motion.span>
      ))}
    </AnimatedBlock>
  );
}

/**
 * Enhanced Detailed Guide page with sidebar navigation and single-section view.
 */
export function GuideDetailed() {
  const token = authStore((s) => s.token);
  const location = useLocation();
  const [activeSectionId, setActiveSectionId] = useState('getting-started');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Sync active section with URL hash and scroll to top
  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && SECTIONS.some(s => s.id === hash)) {
      setActiveSectionId(hash);
    } else {
      setActiveSectionId('getting-started');
    }
    // Scroll to top on section change
    window.scrollTo({ top: 0, behavior: 'auto' }); 
  }, [location.hash]);

  const handleSectionClick = (id) => {
    window.location.hash = id;
    setIsSidebarOpen(false);
  };

  // Mouse spotlight effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      document.documentElement.style.setProperty('--mouse-x', `${x}%`);
      document.documentElement.style.setProperty('--mouse-y', `${y}%`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fb] font-sans selection:bg-blue-100 selection:text-blue-900 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --mouse-x: 50%;
          --mouse-y: 50%;
        }
        .mouse-spotlight {
          background: radial-gradient(800px circle at var(--mouse-x) var(--mouse-y), rgba(37,99,235,0.04), transparent 80%);
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
      ` }} />
      
      {/* Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Mouse Spotlight */}
      <div className="fixed inset-0 pointer-events-none z-[1] mouse-spotlight" />

      {/* Dynamic Background Decorations */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] bg-blue-400/10 rounded-full blur-[160px] animate-pulse-slow" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] bg-indigo-400/10 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[80%] bg-blue-50/5 rounded-full blur-[200px]" />
      </div>

      {/* Mobile Sidebar Backdrop */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md flex-shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black text-slate-950 tracking-tighter uppercase leading-none">CBMS Guide</h1>
                <div className="flex items-center gap-2 mt-1.5 font-bold uppercase tracking-[0.2em] text-[9px] text-slate-400">
                  <span className="h-0.5 w-2 rounded-full bg-blue-500" />
                  Manual
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/guide"
              className="group inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-white transition-all active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden xs:inline">Back</span>
            </Link>
            {token && (
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden xs:inline">App</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-73px)]">
        {/* Sidebar Navigation */}
        <aside 
          className={`
            fixed lg:sticky top-[69px] left-0 z-40 w-72 sm:w-80 lg:h-[calc(100vh-69px)] bg-white/95 lg:bg-white/40 backdrop-blur-xl border-r border-slate-200/50 transition-transform duration-300 lg:translate-x-0 shadow-2xl lg:shadow-none
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            overflow-y-auto overflow-x-hidden
          `}
        >
          <nav className="p-5 space-y-1">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2 flex items-center gap-2">
              <span className="h-px flex-1 bg-slate-200" />
              Nav
              <span className="h-px flex-1 bg-slate-200" />
            </div>
            {SECTIONS.map((section) => {
              const isActive = activeSectionId === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionClick(section.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group relative
                    ${isActive 
                      ? 'text-blue-600 scale-[1.02]' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-white/60 hover:translate-x-1'
                    }
                  `}
                >
                  <div className={`
                    h-9 w-9 rounded-lg flex items-center justify-center transition-all shadow-sm
                    ${isActive 
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white' 
                      : 'bg-white text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50/50'
                    }
                  `}>
                    <section.icon className={`h-4 w-4 ${isActive ? 'animate-pulse' : ''}`} />
                  </div>
                  <span className="truncate tracking-tight uppercase text-xs">{section.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabGlow" 
                      className="absolute -left-2 top-1/2 -translate-y-1/2 h-10 w-1 bg-blue-600 rounded-r-full shadow-lg shadow-blue-500/50"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 bg-transparent min-h-screen relative z-10">
          {/* Section Progress bar */}
          <div className="sticky top-[69px] z-40 h-1 w-full bg-slate-100/50 backdrop-blur-sm pointer-events-none">
            <motion.div 
              className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]"
              initial={{ width: 0 }}
              animate={{ width: `${((SECTIONS.findIndex(s => s.id === activeSectionId) + 1) / SECTIONS.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 20 }}
            />
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
            <style dangerouslySetInnerHTML={{ __html: `
              .prose-custom p {
                font-size: 1rem;
                line-height: 1.65;
                color: #475569;
                font-weight: 500;
                letter-spacing: -0.01em;
                margin-bottom: 1rem;
              }
              .prose-custom b, .prose-custom strong {
                color: #0f172a;
                font-weight: 800;
              }
            ` }} />
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSectionId}
                variants={sectionFadeIn}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                <SectionContent id={activeSectionId} />
              </motion.div>
            </AnimatePresence>
            
            <SectionFooter currentId={activeSectionId} />
          </div>
        </main>
      </div>

      {/* Floating Back to Top */}
      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        whileInView={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 z-[60] h-12 w-12 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-lg border border-slate-700/50 hover:bg-slate-900 transition-colors"
      >
        <Plus className="h-6 w-6" />
      </motion.button>
    </div>
  );
}

/**
 * Renders the content for a specific section based on ID.
 */
function SectionContent({ id }) {
  switch (id) {
    case 'getting-started':
      return (
        <SectionWrapper>
          <SectionHeader 
            title="Getting started" 
            icon={BookOpen} 
            color="bg-blue-100 text-blue-600"
            subtitle="Centralised construction management"
          />
          <AnimatedBlock className="prose prose-slate prose-lg max-w-none prose-p:text-slate-600">
            <p>CBMS centralises your projects, client revenue, and site costs across all your office branches.</p>
          </AnimatedBlock>
          
          <ProcessFlow 
            title="Business Data Flow"
            items={[
              { label: 'Clients', icon: Users, desc: 'Sources' },
              { label: 'Projects', icon: Layers, desc: 'Workspaces', active: true },
              { label: 'Financials', icon: Wallet, desc: 'Revenue/Costs' },
              { label: 'Reports', icon: PieChart, desc: 'Insights' },
            ]}
          />

          <AnimatedBlock className="not-prose grid sm:grid-cols-2 gap-3">
             <Card variant="blue" icon={ChevronRight} title="Unified Tracking">
                Monitor all income and site costs in one central hub.
             </Card>
             <Card variant="emerald" icon={ShieldCheck} title="Profit Security">
                Data-driven insights to ensure every project stays profitable.
             </Card>
          </AnimatedBlock>

          <AnimatedBlock className="not-prose space-y-4">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-100">
               <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Demo Credentials</h3>
             </div>
             <p className="text-slate-400 text-xs font-bold uppercase tracking-widest pl-2">Use password <code className="bg-slate-100 text-slate-950 px-2 py-1 rounded font-mono font-black">admin123</code></p>
             <DataTable 
               headers={['Role', 'Email', 'Scope']}
               data={[
                 { role: 'Super Admin', email: 'admin@company.com', scope: 'All Branches' },
                 { role: 'Branch Manager', email: 'manager-a@company.com', scope: 'One Branch' },
                 { role: 'Staff', email: 'staff-a1@company.com', scope: 'One Branch' }
               ]}
             />
          </AnimatedBlock>
          
          <AnimatedBlock className="text-center pt-4 border-t border-slate-100 italic text-slate-500 text-sm">
            CBMS turns messy site data into clear financial insights.
          </AnimatedBlock>
        </SectionWrapper>
      );
    case 'dashboard-and-reports':
      return (
        <SectionWrapper>
          <SectionHeader 
            title="Dashboard & reports" 
            icon={LayoutDashboard} 
            color="bg-emerald-100 text-emerald-600"
            subtitle="At-a-glance view and exports"
          />
          <AnimatedBlock className="prose prose-slate prose-lg max-w-none prose-p:text-slate-600">
            <p>The Dashboard gives you one screen for active projects, collections, and payables; Reports turn that data into summaries and exports for analysis and sharing.</p>
          </AnimatedBlock>

          <ProcessFlow 
            variant="emerald"
            title="Command Center Overview"
            items={[
              { label: 'Numbers', icon: Database, desc: 'Key KPIs' },
              { label: 'Charts', icon: PieChart, desc: 'Trends' },
              { label: 'Alerts', icon: X, desc: 'Stock', active: true },
              { label: 'Branches', icon: Layers, desc: 'Multi-office' },
            ]}
          />

          <ProcessFlow 
            variant="blue"
            title="The Intelligence Pipeline"
            items={[
              { label: 'Data', icon: Database, desc: 'Input' },
              { label: 'Engine', icon: Search, desc: 'Analysis' },
              { label: 'Reports', icon: PieChart, desc: 'Output', active: true },
            ]}
          />

          <DataTable 
            headers={['Report Type', 'Summary']}
            data={[
              { r: 'Project P&L', i: 'Profit and loss per project' },
              { r: 'Collections', i: 'Money received from clients' },
              { r: 'Pending Bills', i: 'Outstanding payables/receivables' },
              { r: 'Labour & Materials', i: 'Resource spend analysis' },
            ]}
          />

          <AnimatedBlock className="text-center pt-4 italic text-emerald-600/70 text-sm">
            Spot patterns, manage cash flow, and make evidence-based decisions with automated summaries.
          </AnimatedBlock>
        </SectionWrapper>
      );
    case 'clients-projects-revenue':
      return (
        <SectionWrapper>
          <SectionHeader 
            title="Clients, projects & revenue" 
            icon={Layers} 
            color="bg-indigo-100 text-indigo-600"
            subtitle="Who you work for and money in"
          />
          <AnimatedBlock className="prose prose-slate prose-lg max-w-none prose-p:text-slate-600">
            <p>Clients, projects, and payment stages work together: a master client list, project workspaces for each job, and milestones to track what the client has paid and what is still due.</p>
          </AnimatedBlock>

          <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />
            Clients
          </h3>
          <ProcessFlow 
            variant="indigo"
            title="The Client Ecosystem"
            items={[
              { label: 'Registry', icon: Users, desc: 'Master List', active: true },
              { label: 'Projects', icon: Layers, desc: 'Linked Sites' },
              { label: 'History', icon: ClipboardList, desc: 'Traceability' },
            ]}
          />
          <AnimatedBlock className="not-prose grid sm:grid-cols-2 gap-3">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
               <h4 className="font-bold text-slate-900 mb-2">Centralised Data</h4>
               <p className="text-sm text-slate-500">One record for contact details across all projects.</p>
            </div>
            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
               <h4 className="font-bold text-amber-900 mb-1 flex items-center gap-2">
                 <ShieldCheck className="h-4 w-4" />
                 Traceability
               </h4>
               <p className="text-xs text-amber-700">Clients with active projects cannot be deleted.</p>
            </div>
          </AnimatedBlock>

          <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2 flex items-center gap-2">
            <Layers className="h-5 w-5 text-slate-500" />
            Projects
          </h3>
          <ProcessFlow 
            title="Project Hub & Spokes"
            items={[
              { label: 'P&L', icon: LayoutDashboard, desc: 'Overview' },
              { label: 'Stages', icon: Wallet, desc: 'Revenue' },
              { label: 'Labour', icon: HardHat, desc: 'Workforce' },
              { label: 'Materials', icon: Box, desc: 'Inventory' },
              { label: 'Associates', icon: Briefcase, desc: 'Contractors' },
              { label: 'Bills', icon: FileText, desc: 'Expenses' },
            ]}
          />
          <AnimatedBlock className="not-prose flex flex-wrap justify-center gap-4 text-sm font-medium text-slate-500">
             <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Dedicated P&L</span>
             <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Independent cost tracking</span>
             <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-500" /> Site-specific data</span>
          </AnimatedBlock>

          <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-blue-600" />
            Payment stages
          </h3>
          <ProcessFlow 
            variant="blue"
            title="Revenue Lifecycle"
            items={[
              { label: 'Milestone', icon: ClipboardList, desc: 'Schedule' },
              { label: 'Receipt', icon: Plus, desc: 'Entry' },
              { label: 'Paid', icon: CheckCircle2, desc: 'Status', active: true },
            ]}
          />
          <AnimatedBlock className="not-prose flex flex-wrap justify-center gap-4 text-sm font-medium text-slate-500">
             <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-600" /> Multi-receipt tracking</span>
             <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-600" /> Automatic status updates</span>
             <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-600" /> Clear audit trail</span>
          </AnimatedBlock>

          <AnimatedBlock className="text-center pt-4 italic text-indigo-600/70 text-sm border-t border-indigo-50">
            Keep contact details consistent, manage by project, and always know how much the client has paid and how much is still due.
          </AnimatedBlock>
        </SectionWrapper>
      );
    case 'costs-and-payables':
      return (
        <SectionWrapper>
          <SectionHeader 
            title="Costs & payables" 
            icon={HardHat} 
            color="bg-amber-100 text-amber-700"
            subtitle="Labour, materials, associates, bills and other project costs"
          />
          <AnimatedBlock className="prose prose-slate prose-lg max-w-none prose-p:text-slate-600">
            <p>All project costs live in one place: labour and wages, materials and stock, associates, bills (payables and receivables), and other expenses so nothing slips through unrecorded.</p>
          </AnimatedBlock>

          <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2 flex items-center gap-2">
            <HardHat className="h-5 w-5 text-amber-600" />
            Labour
          </h3>
          <ProcessFlow 
            variant="amber"
            title="Labour Cost Capture"
            items={[
              { label: 'Attendance', icon: UserPlus, desc: 'Entry' },
              { label: 'Rates', icon: Coins, desc: 'Calculator' },
              { label: 'Project Cost', icon: Layers, desc: 'Allocation', active: true },
            ]}
          />
          <BadgeList 
            variant="amber" 
            items={['Masons', 'Helpers', 'Carpenters', 'Electricians', 'Plumbers']} 
          />

          <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2 flex items-center gap-2">
            <Box className="h-5 w-5 text-emerald-600" />
            Materials
          </h3>
          <ProcessFlow 
            variant="emerald"
            title="Material Inventory Flow"
            items={[
              { label: 'Stock', icon: Box, desc: 'Global' },
              { label: 'Purchase', icon: Plus, desc: 'Increase' },
              { label: 'Usage', icon: ArrowUpRight, desc: 'Allocation', active: true },
            ]}
          />
          <AnimatedBlock className="not-prose flex flex-wrap justify-center gap-4 text-sm font-medium text-slate-500">
             <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Auto-updating stock</span>
             <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Low-stock warnings</span>
          </AnimatedBlock>

          <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-indigo-600" />
            Associates
          </h3>
          <ProcessFlow 
            variant="indigo"
            title="Associate Lifecycle"
            items={[
              { label: 'Contract', icon: Briefcase, desc: 'Assigned' },
              { label: 'Payment', icon: Coins, desc: 'History' },
              { label: 'Balance', icon: Wallet, desc: 'Liability', active: true },
            ]}
          />

          <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Bills
          </h3>
          <ProcessFlow 
            variant="blue"
            title="Financial Management"
            items={[
              { label: 'Payables', icon: ArrowUpRight, desc: 'Vendor' },
              { label: 'Receivables', icon: ArrowLeft, desc: 'Client' },
              { label: 'Status', icon: CheckCircle2, desc: 'Tracking', active: true },
            ]}
          />
          <AnimatedBlock className="not-prose grid sm:grid-cols-2 gap-3">
            <Card variant="blue" className="!p-4 !rounded-2xl">
               <span className="font-bold text-xs uppercase tracking-wider text-blue-600">Receivables</span>
               <p className="text-xs text-slate-500 mt-1">Invoices sent to clients for extra work.</p>
            </Card>
            <Card variant="rose" className="!p-4 !rounded-2xl">
               <span className="font-bold text-xs uppercase tracking-wider text-rose-600">Payables</span>
               <p className="text-xs text-slate-500 mt-1">Invoices from vendors for services.</p>
            </Card>
          </AnimatedBlock>

          <h3 className="text-lg font-bold text-slate-900 mt-8 mb-2 flex items-center gap-2">
            <Search className="h-5 w-5 text-slate-500" />
            Other expenses
          </h3>
          <ProcessFlow 
            title="Expense Classification"
            items={[
              { label: 'Transport', icon: Plus, desc: 'Logistics' },
              { label: 'Permits', icon: ClipboardList, desc: 'Legal' },
              { label: 'Project Hub', icon: Layers, desc: 'Registry', active: true },
            ]}
          />
          <BadgeList 
            items={['Transport', 'Permits', 'Site amenities', 'Admin fees', 'Fuel', 'Travel', 'Legal']} 
          />

          <AnimatedBlock className="text-center pt-4 italic text-amber-700/70 text-sm border-t border-amber-100">
            Accurate project P&L and cash flow planning start with capturing every cost in one place.
          </AnimatedBlock>
        </SectionWrapper>
      );
    case 'roles-and-access':
      return (
        <SectionWrapper>
          <SectionHeader 
            title="Roles and access" 
            icon={ShieldCheck} 
            color="bg-slate-900 text-white"
            subtitle="Security and permissions"
          />
          <AnimatedBlock className="prose prose-slate prose-lg max-w-none prose-p:text-slate-600">
            <p>Restrict data access and actions based on user roles and branch assignments.</p>
          </AnimatedBlock>
          
          <ProcessFlow 
            title="Permission Hierarchy"
            items={[
              { label: 'Super Admin', icon: ShieldCheck, desc: 'Full' },
              { label: 'Manager', icon: Users, desc: 'Branch', active: true },
              { label: 'Staff', icon: UserPlus, desc: 'Limited' },
            ]}
          />

          <DataTable 
             headers={['Role', 'Scope', 'Actions']}
             data={[
               { r: 'Super Admin', s: 'All Branches', a: 'Full Access' },
               { r: 'Branch Manager', s: 'Assigned Branch', a: 'Management' },
               { r: 'Staff', s: 'Assigned Branch', a: 'Data Entry Only' },
             ]}
          />

          <AnimatedBlock className="text-center pt-4 italic text-slate-500 text-sm">
            Ensure sensitive data stays visible only to the right people.
          </AnimatedBlock>
        </SectionWrapper>
      );
    default:
      return <div>Section not found.</div>;
  }
}

/**
 * Styling helper for section titles
 */
function SectionHeader({ title, icon: Icon, color, subtitle }) {
  const currentIndex = SECTIONS.findIndex(s => s.label === title) + 1;

  return (
    <motion.div variants={fadeInUp} className="space-y-3 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0 ${color}`}>
            <Icon className="h-6 w-6 relative z-10" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Section {currentIndex.toString().padStart(2, '0')}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-slate-500 mt-0.5 sm:hidden">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {subtitle && (
          <p className="text-xs text-slate-500 text-right border-l border-slate-200 pl-4 hidden sm:block max-w-[200px]">
            {subtitle}
          </p>
        )}
      </div>

      <div className="h-px w-full bg-gradient-to-r from-slate-200 to-transparent" />
    </motion.div>
  );
}

/**
 * Navigation footer between sections
 */
function SectionFooter({ currentId }) {
  const currentIndex = SECTIONS.findIndex(s => s.id === currentId);
  const prev = SECTIONS[currentIndex - 1];
  const next = SECTIONS[currentIndex + 1];

  return (
    <div className="mt-12 pt-8 border-t border-slate-200/60 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Section Nav</span>
      </div>
      
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          {prev && (
            <motion.button 
              whileHover={{ x: -4, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => window.location.hash = prev.id}
              className="group flex items-center gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all text-left w-full relative overflow-hidden"
            >
              <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </div>
              <div className="relative z-10">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Previous</div>
                <div className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">{prev.label}</div>
              </div>
            </motion.button>
          )}
        </div>
        <div>
          {next && (
            <motion.button 
              whileHover={{ x: 10, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.hash = next.id}
              className="group flex flex-row-reverse items-center justify-start gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all text-right w-full relative overflow-hidden"
            >
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ChevronRight className="h-5 w-5" />
              </div>
              <div className="relative z-10">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Next Up</div>
                <div className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">{next.label}</div>
              </div>
            </motion.button>
          )}
        </div>
      </div>
      
      <div className="mt-12 text-center">
         <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-sm mb-4">
           <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
           <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Operational</span>
         </div>
         <p className="text-[9px] text-slate-400 uppercase tracking-widest font-medium">
            CBMS PLATFORM &copy; {new Date().getFullYear()} &bull; ADVANCED MANAGEMENT SYSTEM
         </p>
      </div>
    </div>
  );
}
