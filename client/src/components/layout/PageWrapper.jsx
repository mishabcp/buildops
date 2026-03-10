export function PageWrapper({ title, children }) {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      {title && <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>}
      {children}
    </div>
  );
}
