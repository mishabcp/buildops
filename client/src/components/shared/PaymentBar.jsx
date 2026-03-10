import { cn } from '../../lib/utils.js';

/**
 * Visual progress bar for paid vs total (e.g. stage payment).
 * @param {number} paid
 * @param {number} total
 * @param {string} className
 */
export function PaymentBar({ paid = 0, total = 0, className }) {
  const totalNum = Number(total) || 0;
  const paidNum = Number(paid) || 0;
  const pct = totalNum > 0 ? Math.min(100, (paidNum / totalNum) * 100) : 0;
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-gray-200', className)}>
      <div
        className="h-full rounded-full bg-green-500 transition-all"
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
