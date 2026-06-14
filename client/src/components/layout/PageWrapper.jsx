export function PageWrapper({ title, subtitle, actions, children }) {
  return (
    <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
      {(title || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {title && (
              <h1 className="text-2xl font-bold tracking-tight text-brand-950 sm:text-3xl">{title}</h1>
            )}
            {subtitle && <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
