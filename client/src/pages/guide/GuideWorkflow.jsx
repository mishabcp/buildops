import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  BookOpen,
  Workflow,
  MapPin,
  ChevronRight,
  ChevronDown,
  BarChart3,
  UserCircle,
  Clock,
  Target,
  Settings,
  FolderKanban,
  Layers,
  HardHat,
  LineChart,
  Users,
  Package,
  Handshake,
  FileText,
  Receipt,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { authStore } from '../../store/authStore.js';
import { formatCurrency } from '../../utils/formatCurrency.js';
import { cn } from '../../lib/utils.js';

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: 'easeOut' },
};

const EXAMPLE = {
  projectName: 'Lakeside Residences — Tower C',
  client: 'Harborline Developers Pvt Ltd',
  branch: 'Main Office (Pune)',
  location: 'Baner, Pune',
  contractValue: 10_000_000,
  status: 'Active',
};

const EXAMPLE_OVERVIEW = {
  received: 4_000_000,
  outstanding: 6_000_000,
  expenses: 1_250_000,
  profit: 8_750_000,
  margin: '87.5%',
};

const JOURNEY = [
  { step: '01', title: 'Setup', short: 'Clients & materials' },
  { step: '02', title: 'Initiate', short: 'New project' },
  { step: '03', title: 'Structure', short: 'Payment stages' },
  { step: '04', title: 'Record', short: 'Site costs' },
  { step: '05', title: 'Analyze', short: 'Reports' },
];

const PHASE_META = {
  '01': { icon: Settings, accent: 'brand', minutes: '~5 min', outcome: 'Your company lists are ready for real projects.' },
  '02': { icon: FolderKanban, accent: 'emerald', minutes: '~3 min', outcome: 'A job exists with a contract value and client.' },
  '03': { icon: Layers, accent: 'accent', minutes: '~5 min', outcome: 'You know what the client paid and what is still due.' },
  '04': { icon: HardHat, accent: 'amber', minutes: '~10 min', outcome: 'Wages, materials, and bills show on the project summary.' },
  '05': { icon: LineChart, accent: 'brand', minutes: '~5 min', outcome: 'You can explain profit and export a report.' },
};

const ACCENT = {
  brand: { border: 'border-l-brand-500', chip: 'bg-brand-50 text-brand-800', icon: 'bg-brand-100 text-brand-700' },
  emerald: { border: 'border-l-emerald-500', chip: 'bg-emerald-50 text-emerald-800', icon: 'bg-emerald-100 text-emerald-700' },
  accent: { border: 'border-l-accent-500', chip: 'bg-accent-50 text-accent-800', icon: 'bg-accent-100 text-accent-700' },
  amber: { border: 'border-l-amber-500', chip: 'bg-amber-50 text-amber-900', icon: 'bg-amber-100 text-amber-800' },
};

const RECORD_CARDS = [
  { icon: Users, label: 'Labour', example: 'Ravi Kumar — ₹16,200 wages, ₹10,000 paid' },
  { icon: Package, label: 'Materials', example: '80 bags cement — ₹32,000 purchase' },
  { icon: Handshake, label: 'Associates', example: 'Cool Air HVAC — ₹2L agreed, ₹75k paid' },
  { icon: FileText, label: 'Bills', example: 'Metro Steel invoice — ₹1,10,000' },
  { icon: Receipt, label: 'Other', example: 'Site power connection — ₹12,000' },
];

const STATUS_STYLES = {
  Paid: 'bg-emerald-100 text-emerald-800',
  'Partially paid': 'bg-amber-100 text-amber-900',
  Pending: 'bg-slate-100 text-slate-600',
};

const PHASES = [
  {
    step: '01',
    title: 'Setup',
    tagline: 'Define clients and branches',
    summary: 'Set up offices, users, clients, and material types once—then reuse them on every job.',
    who: 'Usually your company administrator.',
    actions: [
      { where: 'Settings', path: '/settings', detail: 'Add offices and user accounts.' },
      { where: 'Clients', path: '/clients', detail: `Add "${EXAMPLE.client}".` },
      { where: 'Materials', path: '/materials', detail: 'Add cement, steel, sand—set low-stock alerts.' },
    ],
    tip: 'You only do this once per company.',
  },
  {
    step: '02',
    title: 'Initiate',
    tagline: 'Create project and budget',
    summary: 'Create the job, pick the client and office, and enter the agreed contract amount.',
    who: 'Office managers and administrators.',
    actions: [
      { where: 'New Project', path: '/projects/new', detail: 'Save the form with the details in the table below.' },
      { where: 'Project list', path: '/projects', detail: 'Open the project to see tabs for money in and out.' },
    ],
    exampleFields: [
      ['Project name', EXAMPLE.projectName],
      ['Client', EXAMPLE.client],
      ['Office', EXAMPLE.branch],
      ['Location', EXAMPLE.location],
      ['Contract value', formatCurrency(EXAMPLE.contractValue)],
      ['Status', EXAMPLE.status],
    ],
  },
  {
    step: '03',
    title: 'Structure',
    tagline: 'Add payment stages',
    summary: 'Add milestones (advance, slab, finishing). Record each client payment against the right stage.',
    who: 'Whoever handles client billing.',
    actions: [
      { where: 'Payment Stages tab', path: '/projects', detail: 'Add stage → name, amount, due date.' },
      { where: 'Record Receipt', path: null, detail: 'Amount, date, and payment mode when money arrives.' },
    ],
    table: {
      headers: ['Stage', 'Expected', 'Status', 'Recorded'],
      rows: [
        ['Booking advance', formatCurrency(2_000_000), 'Paid', formatCurrency(2_000_000) + ' · bank · 5 Apr'],
        ['Foundation complete', formatCurrency(3_000_000), 'Partially paid', formatCurrency(2_000_000) + ' so far'],
        ['Structure complete', formatCurrency(2_500_000), 'Pending', '—'],
      ],
    },
    tryIt: 'Record one receipt on a pending stage, then open Overview—received and outstanding should update.',
  },
  {
    step: '04',
    title: 'Record',
    tagline: 'Log costs and receipts',
    summary: 'Enter site spending on the project tabs. Client payments stay on Payment Stages.',
    who: 'Site and accounts team.',
    useRecordGrid: true,
    actions: [
      { where: 'All company bills', path: '/bills', detail: 'Bills without a project still appear on the home page payables.' },
    ],
    expenseBuckets: [
      ['Labour', formatCurrency(320_000), 26],
      ['Materials', formatCurrency(280_000), 22],
      ['Associates', formatCurrency(400_000), 32],
      ['Bills', formatCurrency(180_000), 14],
      ['Other', formatCurrency(70_000), 6],
    ],
    tip: 'Overview totals use invoice amounts, not only cash paid so far.',
  },
  {
    step: '05',
    title: 'Analyze',
    tagline: 'Generate P&L reports',
    summary: 'Check the project Overview, then the home page and Reports for the whole company.',
    who: 'Managers; administrators can include all offices.',
    actions: [
      { where: 'Project Overview', path: '/projects', detail: `Sample profit about ${formatCurrency(EXAMPLE_OVERVIEW.profit)} (${EXAMPLE_OVERVIEW.margin}).` },
      { where: 'Reports', path: '/reports', detail: 'Profit by project, collections, pending bills—PDF or Excel.' },
      { where: 'Dashboard', path: '/', detail: 'Active jobs, collections, and payables at a glance.' },
    ],
    caveat:
      'Reports “Project Dashboard (P&L)” uses contract minus costs. Overview also includes extra client invoices—use Overview for the full job picture.',
  },
];

function StatusPill({ status }) {
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold', STATUS_STYLES[status] ?? STATUS_STYLES.Pending)}>
      {status}
    </span>
  );
}

function PhaseSection({ phase, isOpen, onToggle }) {
  const meta = PHASE_META[phase.step];
  const style = ACCENT[meta.accent];
  const Icon = meta.icon;

  return (
    <section
      id={`phase-${phase.step}`}
      className={cn('scroll-mt-28 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm border-l-4', style.border)}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-4 p-5 text-left transition hover:bg-slate-50/80 sm:p-6"
        aria-expanded={isOpen}
      >
        <span className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', style.icon)}>
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Step {phase.step}</span>
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase', style.chip)}>
              <Clock className="mr-1 inline h-3 w-3" />
              {meta.minutes}
            </span>
          </div>
          <h2 className="mt-1 text-xl font-bold text-slate-900">{phase.title}</h2>
          <p className="text-sm font-medium text-brand-600">{phase.tagline}</p>
          <p className="mt-2 flex items-start gap-2 text-sm text-slate-600">
            <Target className="mt-0.5 h-4 w-4 shrink-0 text-accent-500" />
            <span>{meta.outcome}</span>
          </p>
        </div>
        <ChevronDown className={cn('h-6 w-6 shrink-0 text-slate-400 transition', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 px-5 pb-6 pt-4 sm:px-6">
              <p className="text-sm text-slate-600">{phase.summary}</p>

              <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <UserCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <span>{phase.who}</span>
              </div>

              {phase.useRecordGrid ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {RECORD_CARDS.map((card) => {
                    const CardIcon = card.icon;
                    return (
                      <div key={card.label} className="rounded-2xl border border-slate-100 bg-gradient-to-br from-white to-slate-50 p-4">
                        <div className="flex items-center gap-2">
                          <CardIcon className="h-5 w-5 text-brand-600" />
                          <span className="font-bold text-slate-900">{card.label}</span>
                        </div>
                        <p className="mt-2 text-xs leading-relaxed text-slate-600">{card.example}</p>
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Project tab → {card.label}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {phase.actions.map((action) => (
                    <li key={action.where} className="flex flex-col rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                      <p className="font-bold text-slate-900">{action.where}</p>
                      <p className="mt-1 flex-1 text-xs text-slate-600">{action.detail}</p>
                      {action.path && (
                        <Link
                          to={action.path}
                          className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:text-brand-900"
                        >
                          Open in app <ChevronRight className="h-4 w-4" />
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {phase.useRecordGrid && phase.actions.length > 0 && (
                <div className="mt-4">
                  {phase.actions.map((action) => (
                    <Link
                      key={action.where}
                      to={action.path}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-800 px-4 py-2 text-sm font-bold text-white hover:bg-brand-900"
                    >
                      {action.where} <ChevronRight className="h-4 w-4" />
                    </Link>
                  ))}
                </div>
              )}

              {phase.exampleFields && (
                <div className="mt-6 grid gap-2 sm:grid-cols-2">
                  {phase.exampleFields.map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-slate-100 bg-white px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>
              )}

              {phase.table && (
                <div className="mt-6 space-y-2">
                  {phase.table.rows.map((row) => (
                    <div key={row[0]} className="flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{row[0]}</p>
                        <p className="text-sm text-slate-500 tabular">Expected {row[1]}</p>
                      </div>
                      <StatusPill status={row[2]} />
                      <p className="text-sm text-slate-600 sm:text-right">{row[3]}</p>
                    </div>
                  ))}
                </div>
              )}

              {phase.expenseBuckets && (
                <div className="mt-6 space-y-3">
                  {phase.expenseBuckets.map(([label, value, pct]) => (
                    <div key={label}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="font-medium text-slate-700">{label}</span>
                        <span className="font-bold tabular text-slate-900">{value}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                  <p className="pt-2 text-right text-sm font-bold text-brand-900 tabular">
                    Total {formatCurrency(EXAMPLE_OVERVIEW.expenses)}
                  </p>
                </div>
              )}

              {phase.tryIt && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-accent-200 bg-accent-50/80 p-4">
                  <Play className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-accent-800">Try it yourself</p>
                    <p className="mt-1 text-sm text-accent-950">{phase.tryIt}</p>
                  </div>
                </div>
              )}

              {phase.tip && <p className="mt-4 text-sm text-slate-500">{phase.tip}</p>}

              {phase.caveat && (
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                  {phase.caveat}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export function GuideWorkflow() {
  const token = authStore((s) => s.token);
  const [openStep, setOpenStep] = useState('01');

  const toggle = (step) => setOpenStep((prev) => (prev === step ? '' : step));

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans selection:bg-brand-100 selection:text-brand-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white shadow-lg shadow-brand-200">
              <Workflow className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-slate-900">Detailed workflow</h1>
              <p className="text-xs text-slate-500">Interactive walkthrough</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/guide"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Guide
            </Link>
            {token ? (
              <Link
                to="/projects/new"
                className="hidden items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 sm:inline-flex"
              >
                Start a project
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 sm:inline-flex"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 pt-8 sm:px-6 sm:pt-10">
        <motion.div initial="initial" animate="animate" variants={fadeIn} className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">What you will learn</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Run a project from setup to reports in five steps
          </h2>
          <p className="mt-3 text-slate-600">
            Follow one made-up example—or jump to the step you need. Tap each step below to expand. About{' '}
            <strong className="text-slate-900">25 minutes</strong> if you read everything; each step works on its own.
          </p>
          <ul className="mt-5 grid gap-2 sm:grid-cols-3">
            {['See money in and out on one screen', 'Know what clients still owe', 'Export reports for your team'].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        <div className="relative hidden lg:block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">The journey</p>
          <div className="flex items-center justify-between gap-2">
            {JOURNEY.map((j, idx) => (
              <div key={j.step} className="flex flex-1 items-center">
                <a
                  href={`#phase-${j.step}`}
                  onClick={() => setOpenStep(j.step)}
                  className="group flex flex-1 flex-col items-center text-center"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-sm font-black text-brand-700 ring-2 ring-white transition group-hover:bg-brand-600 group-hover:text-white">
                    {j.step}
                  </span>
                  <span className="mt-2 text-sm font-bold text-slate-900">{j.title}</span>
                  <span className="text-[11px] text-slate-500">{j.short}</span>
                </a>
                {idx < JOURNEY.length - 1 && <ChevronRight className="h-5 w-5 shrink-0 text-slate-200" />}
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeIn}
          className="rounded-3xl bg-brand-950 p-6 text-white shadow-xl sm:p-8"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-accent-300">Fictional example</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <MapPin className="h-6 w-6 shrink-0 text-accent-400" />
              <div>
                <h3 className="text-lg font-bold">{EXAMPLE.projectName}</h3>
                <p className="mt-1 text-sm text-brand-100">
                  {EXAMPLE.client} · {EXAMPLE.branch}
                </p>
              </div>
            </div>
            <p className="text-2xl font-black tabular sm:text-right">{formatCurrency(EXAMPLE.contractValue)}</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/10 pt-6 sm:grid-cols-4">
            {[
              ['Received', EXAMPLE_OVERVIEW.received],
              ['Still due', EXAMPLE_OVERVIEW.outstanding],
              ['Expenses', EXAMPLE_OVERVIEW.expenses],
              ['Est. profit', EXAMPLE_OVERVIEW.profit],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-xs text-brand-200">{label}</p>
                <p className="font-bold tabular">{formatCurrency(val)}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <nav className="sticky top-[4.5rem] z-20 flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white/95 p-1 shadow-sm backdrop-blur">
          {PHASES.map((p) => (
            <button
              key={p.step}
              type="button"
              onClick={() => {
                setOpenStep(p.step);
                document.getElementById(`phase-${p.step}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={cn(
                'whitespace-nowrap rounded-xl px-3 py-2 text-xs font-bold transition',
                openStep === p.step ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {p.step} {p.title}
            </button>
          ))}
        </nav>

        <div className="space-y-4">
          {PHASES.map((phase) => (
            <PhaseSection
              key={phase.step}
              phase={phase}
              isOpen={openStep === phase.step}
              onToggle={() => toggle(phase.step)}
            />
          ))}
        </div>

        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-brand-50 to-white p-6 text-center shadow-sm sm:p-8">
          <h3 className="text-lg font-bold text-slate-900">Ready to try it in your account?</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            Use your own project name and amounts—the steps stay the same.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {token ? (
              <>
                <Link to="/projects/new" className="inline-flex items-center gap-2 rounded-xl bg-brand-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-900">
                  Create a project <ChevronRight className="h-4 w-4" />
                </Link>
                <Link to="/" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <Link to="/login" className="inline-flex items-center gap-2 rounded-xl bg-brand-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-900">
                Sign in to Buildops <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <BarChart3 className="h-5 w-5 text-brand-600" />
            Keep learning
          </div>
          <p className="mt-2">
            <Link to="/guide/detailed" className="font-semibold text-brand-700 hover:underline">
              Detailed guide
            </Link>{' '}
            — every screen explained.
          </p>
          <p className="mt-4 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-brand-600" />
            <Link to="/guide" className="font-semibold text-brand-700 hover:underline">
              Back to Buildops Guide
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
