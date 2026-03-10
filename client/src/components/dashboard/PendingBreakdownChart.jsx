import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency.js';

const COLORS = ['#e11d48', '#7c3aed', '#0d9488'];

export function PendingBreakdownChart({ data }) {
  if (!data?.length) {
    return (
      <div className="flex h-56 items-center justify-center rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-500">
        No pending payables
      </div>
    );
  }
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
          <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `${(v / 1e5).toFixed(0)}L`} />
          <YAxis type="category" dataKey="name" width={72} tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <Tooltip formatter={(value) => [formatCurrency(value), 'Pending']} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
