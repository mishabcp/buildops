import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  LayoutDashboard,
  Layers,
  Users,
  Package,
  Handshake,
  FileText,
  Receipt,
  WalletCards,
  TrendingDown,
  Percent,
  Calculator,
} from 'lucide-react';

/* ─── Animation presets ─────────────────────────────────────────────────────── */
const sectionFade = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] },
};

/* ─── Data ──────────────────────────────────────────────────────────────────── */

// Equation terms
const INCOME_TERMS = [
  { label: 'Contract', source: 'Project details', desc: 'The agreed project value', icon: FileText, type: 'input' },
  { label: 'Receivables', source: 'Bills tab (RECEIVABLE)', desc: 'Invoices to the client', icon: Receipt, type: 'input' },
];

const EXPENSE_TERMS = [
  { label: 'Labour',     source: 'Labour tab',          desc: 'Worker wages & payments',    icon: Users,     type: 'input' },
  { label: 'Materials',  source: 'Materials tab',       desc: 'Purchase + usage costs',     icon: Package,   type: 'input' },
  { label: 'Associates', source: 'Associates tab',      desc: 'Subcontractor fees',         icon: Handshake, type: 'input' },
  { label: 'Bills',      source: 'Bills tab (PAYABLE)', desc: 'Vendor bills for project',   icon: FileText,  type: 'input' },
  { label: 'Other',      source: 'Other Expenses tab',  desc: 'Permits, transport, misc',   icon: Receipt,   type: 'input' },
];

// Tab explorer data
const TABS = [
  { id: 'overview',    title: 'Overview',       icon: LayoutDashboard, desc: "Computed from all other tabs. Shows money in, money out, profit and margin. You don't enter data here — it's auto-calculated.", feeds: 'All metrics' },
  { id: 'stages',      title: 'Payment Stages', icon: Layers,          desc: 'Break the contract into milestones (Advance, Foundation, etc). Record receipts when the client pays; stage status updates automatically.', feeds: 'Total received, Outstanding balance' },
  { id: 'labour',      title: 'Labour',         icon: Users,           desc: 'Add workers, days, rate, and total amount. Record payments per entry.', feeds: 'Labour costs' },
  { id: 'materials',   title: 'Materials',      icon: Package,         desc: 'Log purchases (stock goes up) or usage from stock (stock goes down). Both count toward material cost in the Overview.', feeds: 'Material cost' },
  { id: 'associates',  title: 'Associates',     icon: Handshake,       desc: 'Add subcontractors with agreed amounts. Record payments; multiple payments per associate are supported.', feeds: 'Associate fees' },
  { id: 'bills',       title: 'Bills',          icon: FileText,        desc: 'Add bills you owe (PAYABLE) or that the client owes you (RECEIVABLE). Only project-linked bills appear in totals.', feeds: 'Bills payable, Total income' },
  { id: 'expenses',    title: 'Other Expenses', icon: Receipt,         desc: 'Miscellaneous costs (permits, transport, etc.) with description, amount, and payment mode.', feeds: 'Other expenses' },
];

// Formula reference table
// Formula data with parsed parts for visual rendering
const FORMULA_CARDS = [
  {
    metric: 'Total Income',
    icon: WalletCards,
    accent: { border: 'border-l-emerald-500', bg: 'bg-emerald-50/40', badge: 'bg-emerald-500', text: 'text-emerald-700', pill: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    parts: [
      { label: 'Contract', type: 'term' },
      { label: '+', type: 'op' },
      { label: 'Receivables', type: 'term' },
    ],
    source: 'Project, Bills',
  },
  {
    metric: 'Outstanding',
    icon: TrendingDown,
    accent: { border: 'border-l-amber-500', bg: 'bg-amber-50/40', badge: 'bg-amber-500', text: 'text-amber-700', pill: 'bg-amber-50 border-amber-200 text-amber-700' },
    parts: [
      { label: 'Contract', type: 'term' },
      { label: '−', type: 'op' },
      { label: 'Total Received', type: 'term' },
    ],
    source: 'Stages',
  },
  {
    metric: 'Total Expenses',
    icon: Receipt,
    accent: { border: 'border-l-rose-500', bg: 'bg-rose-50/40', badge: 'bg-rose-500', text: 'text-rose-700', pill: 'bg-rose-50 border-rose-200 text-rose-700' },
    parts: [
      { label: 'Labour', type: 'term' },
      { label: '+', type: 'op' },
      { label: 'Materials', type: 'term' },
      { label: '+', type: 'op' },
      { label: 'Associates', type: 'term' },
      { label: '+', type: 'op' },
      { label: 'Bills', type: 'term' },
      { label: '+', type: 'op' },
      { label: 'Other', type: 'term' },
    ],
    source: 'All cost tabs',
  },
  {
    metric: 'Profit',
    icon: Calculator,
    accent: { border: 'border-l-blue-500', bg: 'bg-blue-50/40', badge: 'bg-blue-500', text: 'text-blue-700', pill: 'bg-blue-50 border-blue-200 text-blue-700' },
    parts: [
      { label: 'Total Income', type: 'result' },
      { label: '−', type: 'op' },
      { label: 'Total Expenses', type: 'result' },
    ],
    source: 'Overview',
  },
  {
    metric: 'Margin %',
    icon: Percent,
    accent: { border: 'border-l-indigo-500', bg: 'bg-indigo-50/40', badge: 'bg-indigo-500', text: 'text-indigo-700', pill: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
    parts: [
      { label: 'Profit', type: 'result' },
      { label: '÷', type: 'op' },
      { label: 'Total Income', type: 'result' },
      { label: '×', type: 'op' },
      { label: '100', type: 'literal' },
    ],
    source: 'Overview',
  },
];

/* ─── Formula Diagram Cards ─────────────────────────────────────────────────── */
function FormulaPill({ label, type, accent }) {
  if (type === 'op') {
    return <span className="text-slate-300 text-[13px] font-light select-none shrink-0 px-0.5">{label}</span>;
  }
  if (type === 'literal') {
    return <span className="text-[11px] font-mono font-bold text-slate-600 px-1">{label}</span>;
  }
  if (type === 'result') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-800 text-white text-[10px] font-bold whitespace-nowrap">
        {label}
      </span>
    );
  }
  // Default: input term
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-semibold whitespace-nowrap ${accent.pill}`}>
      {label}
    </span>
  );
}

function FormulaCard({ card, index }) {
  const reduced = useReducedMotion();
  const { metric, icon: Icon, accent, parts, source } = card;

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.07, duration: 0.4 }}
      whileHover={reduced ? {} : { y: -2, transition: { duration: 0.15 } }}
      className={`rounded-xl border border-slate-200/60 bg-white shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border-l-[3px] ${accent.border}`}
    >
      <div className="p-3.5 sm:p-4 space-y-2.5">
        {/* Header: metric name + icon */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`h-6 w-6 shrink-0 rounded-md ${accent.bg} flex items-center justify-center ${accent.text}`}>
              <Icon className="h-3 w-3" />
            </div>
            <span className="text-[12px] sm:text-[13px] font-bold text-slate-900 truncate">{metric}</span>
          </div>
          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider shrink-0">{source}</span>
        </div>

        {/* Visual formula: colored pills with operators */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
          {parts.map((p, i) => (
            <FormulaPill key={i} {...p} accent={accent} />
          ))}
          <span className="text-slate-300 text-[13px] font-light select-none px-0.5">=</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-white text-[10px] font-bold whitespace-nowrap ${accent.badge}`}>
            {metric}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function FormulaGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
      {FORMULA_CARDS.map((card, i) => (
        <FormulaCard key={card.metric} card={card} index={i} />
      ))}
    </div>
  );
}
function Term({ label, source, desc, icon: Icon, type = 'input', delay = 0 }) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const isResult = type === 'result';

  return (
    <motion.span
      initial={reduced ? false : { opacity: 0, scale: 0.9, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 20 }}
      className="relative inline-flex"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-[11px] sm:text-[12px] font-semibold whitespace-nowrap cursor-default transition-all duration-200
        ${isResult
          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200/50 hover:shadow-lg hover:shadow-blue-300/50 hover:scale-[1.03]'
          : 'bg-white border border-slate-200/80 text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-700 hover:shadow-md hover:scale-[1.03]'}
      `}>
        {Icon && <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 opacity-70" />}
        {label}
      </span>

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && source && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 sm:w-52 pointer-events-none"
          >
            <div className="bg-slate-900 text-white rounded-xl px-3.5 py-2.5 shadow-xl text-left">
              {desc && <p className="text-[11px] text-slate-300 leading-snug">{desc}</p>}
              <p className="text-[10px] text-blue-300 font-semibold mt-1.5 uppercase tracking-wider">↳ {source}</p>
              <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-slate-900 rotate-45" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.span>
  );
}

/* ─── Operator ──────────────────────────────────────────────────────────────── */
function Op({ children }) {
  return (
    <span className="text-slate-300 text-sm sm:text-base font-light select-none px-0.5 sm:px-1 shrink-0">{children}</span>
  );
}

/* ─── Result Term (solid colored) ───────────────────────────────────────────── */
function ResultTerm({ label, color = 'blue', delay = 0 }) {
  const reduced = useReducedMotion();
  const colors = {
    green:  'from-emerald-500 to-teal-600 shadow-emerald-200/50',
    red:    'from-rose-500 to-red-600 shadow-rose-200/50',
    blue:   'from-blue-500 to-indigo-600 shadow-blue-200/50',
    indigo: 'from-indigo-500 to-violet-600 shadow-indigo-200/50',
  };
  return (
    <motion.span
      initial={reduced ? false : { opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 180, damping: 18 }}
      className={`inline-flex items-center px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[11px] sm:text-[12px] font-bold text-white whitespace-nowrap bg-gradient-to-r ${colors[color]} shadow-md hover:shadow-lg hover:scale-[1.03] transition-all duration-200 cursor-default`}
    >
      {label}
    </motion.span>
  );
}

/* ─── Hero Equation Block ───────────────────────────────────────────────────── */
function EquationBlock() {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur-md shadow-sm overflow-hidden"
    >
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle, #64748b 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }} />

      {/* Header */}
      <div className="relative border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center gap-2.5 bg-slate-50/60">
        <Calculator className="h-4 w-4 text-slate-400" />
        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">How it all adds up</span>
      </div>

      {/* Equation Lines */}
      <div className="relative px-4 sm:px-6 py-5 sm:py-6 space-y-5 sm:space-y-6">

        {/* Line 1: Income */}
        <div className="space-y-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 pl-1">Revenue</p>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {INCOME_TERMS.map((t, i) => (
              <React.Fragment key={t.label}>
                {i > 0 && <Op>+</Op>}
                <Term {...t} delay={0.05 + i * 0.08} />
              </React.Fragment>
            ))}
            <Op>=</Op>
            <ResultTerm label="Total Income" color="green" delay={0.25} />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        {/* Line 2: Expenses */}
        <div className="space-y-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-600 pl-1">Costs</p>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {EXPENSE_TERMS.map((t, i) => (
              <React.Fragment key={t.label}>
                {i > 0 && <Op>+</Op>}
                <Term {...t} delay={0.3 + i * 0.06} />
              </React.Fragment>
            ))}
            <Op>=</Op>
            <ResultTerm label="Total Expenses" color="red" delay={0.7} />
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

        {/* Line 3: Profit & Margin */}
        <div className="space-y-2">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 pl-1">Bottom Line</p>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <ResultTerm label="Total Income" color="green" delay={0.8} />
            <Op>−</Op>
            <ResultTerm label="Total Expenses" color="red" delay={0.86} />
            <Op>=</Op>
            <ResultTerm label="Profit" color="blue" delay={0.95} />
            <span className="hidden sm:inline"><Op>→</Op></span>
            <ResultTerm label="Margin %" color="indigo" delay={1.05} />
          </div>
        </div>

        {/* Hint */}
        <p className="text-[10px] text-slate-400 italic pt-1 pl-1">Hover any term to see where the data comes from.</p>
      </div>
    </motion.div>
  );
}

/* ─── Tab Card ──────────────────────────────────────────────────────────────── */
const TAB_ACCENTS = {
  overview:   { bg: 'bg-indigo-50',  color: 'text-indigo-600',  bar: 'from-indigo-500 to-violet-500' },
  stages:     { bg: 'bg-emerald-50', color: 'text-emerald-600', bar: 'from-emerald-500 to-teal-500' },
  labour:     { bg: 'bg-blue-50',    color: 'text-blue-600',    bar: 'from-blue-500 to-sky-500' },
  materials:  { bg: 'bg-amber-50',   color: 'text-amber-600',   bar: 'from-amber-500 to-orange-500' },
  associates: { bg: 'bg-violet-50',  color: 'text-violet-600',  bar: 'from-violet-500 to-purple-500' },
  bills:      { bg: 'bg-rose-50',    color: 'text-rose-600',    bar: 'from-rose-500 to-pink-500' },
  expenses:   { bg: 'bg-slate-100',  color: 'text-slate-600',   bar: 'from-slate-500 to-slate-600' },
};

function TabCard({ tab, index }) {
  const reduced = useReducedMotion();
  const accent = TAB_ACCENTS[tab.id] ?? TAB_ACCENTS.expenses;
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.06, duration: 0.4 }}
      whileHover={reduced ? {} : { y: -3, transition: { duration: 0.15 } }}
      className="group relative rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${accent.bar}`} />
      <div className="flex items-start gap-3 sm:gap-3.5 pt-0.5">
        <div className={`h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-lg ${accent.bg} flex items-center justify-center ${accent.color} group-hover:scale-105 transition-transform duration-150`}>
          <tab.icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-[13px] sm:text-sm font-bold text-slate-900">{tab.title}</h4>
          <p className="text-[12px] sm:text-[13px] text-slate-500 mt-1 leading-relaxed">{tab.desc}</p>
          <div className="mt-2.5 sm:mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Feeds</span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              {tab.feeds}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}



/* ─── Page ─────────────────────────────────────────────────────────────────── */
export function ProjectDetailGuide() {
  return (
    <div className="space-y-10 sm:space-y-14 pb-6 sm:pb-8">

      {/* Section 1: The Equation */}
      <motion.section
        initial={sectionFade.initial}
        animate={sectionFade.animate}
        transition={sectionFade.transition}
        className="space-y-5 sm:space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Calculator className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-[15px] sm:text-[17px] font-bold text-slate-900 tracking-tight">How the Overview is calculated</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Every number on the Overview comes from these formulas.</p>
          </div>
        </div>

        <EquationBlock />

        <FormulaGrid />
      </motion.section>

      {/* Section 2: Tab Explorer */}
      <motion.section
        initial={sectionFade.initial}
        animate={sectionFade.animate}
        transition={{ ...sectionFade.transition, delay: 0.1 }}
        className="space-y-5 sm:space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-[15px] sm:text-[17px] font-bold text-slate-900 tracking-tight">What each tab does</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Where to enter data and which metrics each tab feeds.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
          {TABS.map((tab, i) => <TabCard key={tab.id} tab={tab} index={i} />)}
        </div>
      </motion.section>

    </div>
  );
}
