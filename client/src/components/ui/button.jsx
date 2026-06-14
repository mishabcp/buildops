import { cn } from '../../lib/utils.js';

export function Button({ className, variant = 'default', size = 'default', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-bold tracking-tight transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]';
  const variants = {
    default: 'bg-brand-800 text-white hover:bg-brand-900 shadow-brand focus-visible:ring-brand-500/30',
    accent: 'bg-accent-400 text-white hover:bg-accent-500 shadow-accent focus-visible:ring-accent-400/30',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/30',
    outline:
      'border border-slate-200 bg-white text-brand-800 hover:bg-slate-50 hover:border-slate-300 focus-visible:ring-brand-500/20',
    secondary: 'bg-slate-100 text-brand-900 hover:bg-slate-200 focus-visible:ring-slate-400/30',
    ghost: 'text-brand-700 hover:bg-slate-100 focus-visible:ring-slate-400/20',
  };
  const sizes = {
    default: 'h-11 px-5 text-sm',
    sm: 'h-9 rounded-lg px-3.5 text-sm',
    lg: 'h-12 rounded-xl px-8 text-base',
    icon: 'h-10 w-10',
  };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props} />
  );
}
