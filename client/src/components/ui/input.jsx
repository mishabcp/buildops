import { cn } from '../../lib/utils.js';

export function Input({ className, type = 'text', ...props }) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-[15px] font-medium text-brand-950 transition-all placeholder:text-slate-400 placeholder:font-normal focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}
