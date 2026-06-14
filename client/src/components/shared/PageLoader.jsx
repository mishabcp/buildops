export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-brand-700" />
        <p className="text-sm font-semibold text-slate-500">Loading…</p>
      </div>
    </div>
  );
}
