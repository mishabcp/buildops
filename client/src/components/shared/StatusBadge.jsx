import { cn } from '../../lib/utils.js';

const STATUS_STYLES = {
  PENDING: 'bg-accent-50 text-accent-700 ring-accent-200',
  PARTIALLY_PAID: 'bg-brand-50 text-brand-700 ring-brand-200',
  PAID: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  ACTIVE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  ON_HOLD: 'bg-amber-50 text-amber-700 ring-amber-200',
  CANCELLED: 'bg-red-50 text-red-700 ring-red-200',
  COMPLETED: 'bg-brand-50 text-brand-700 ring-brand-200',
  ENQUIRY: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export function StatusBadge({ status, className }) {
  const style = STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600 ring-slate-200';
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1 ring-inset',
        style,
        className
      )}
    >
      {status?.replace(/_/g, ' ') ?? '—'}
    </span>
  );
}
