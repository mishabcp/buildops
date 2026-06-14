import { toastStore } from '../../store/toastStore.js';
import { cn } from '../../lib/utils.js';
import { CheckCircle, XCircle, X } from 'lucide-react';

export function Toaster() {
  const toasts = toastStore((s) => s.toasts);
  const dismiss = toastStore((s) => s.dismiss);

  return (
    <div className="fixed right-4 top-20 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={cn(
            'flex min-w-[280px] max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-sm',
            t.type === 'error' && 'border-red-200 bg-red-50 text-red-800',
            t.type === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-800',
            t.type === 'info' && 'border-slate-200 bg-white text-brand-950'
          )}
        >
          {t.type === 'success' && <CheckCircle className="h-5 w-5 shrink-0" />}
          {t.type === 'error' && <XCircle className="h-5 w-5 shrink-0" />}
          <p className="flex-1 text-sm font-medium">{t.message}</p>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            className="shrink-0 rounded p-1 hover:bg-black/10"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
