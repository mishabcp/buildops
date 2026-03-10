export function TableSkeleton({ rows = 5, cols = 6 }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr className="border-b border-gray-200">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="p-3 text-left">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, ri) => (
            <tr key={ri} className={`border-b border-gray-100 ${ri % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
              {Array.from({ length: cols }).map((_, ci) => (
                <td key={ci} className="p-3">
                  <div className="h-4 w-full max-w-[120px] animate-pulse rounded bg-gray-100" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
