import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency.js';

export function CollectionsChart({ data }) {
  if (!data?.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-500">
        No collection data yet
      </div>
    );
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" tickFormatter={(v) => `${(v / 1e5).toFixed(0)}L`} />
          <Tooltip formatter={(value) => [formatCurrency(value), 'Received']} labelFormatter={(_, payload) => payload?.[0]?.payload?.label} />
          <Bar dataKey="received" fill="#059669" radius={[4, 4, 0, 0]} name="Received" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
