import { cn } from '../../lib/utils.js';

const STATUS_STYLES = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PARTIALLY_PAID: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  ACTIVE: 'bg-green-100 text-green-800',
  ON_HOLD: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  ENQUIRY: 'bg-gray-100 text-gray-700',
};

export function StatusBadge({ status, className }) {
  const style = STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium', style, className)}>
      {status?.replace(/_/g, ' ') ?? '—'}
    </span>
  );
}
