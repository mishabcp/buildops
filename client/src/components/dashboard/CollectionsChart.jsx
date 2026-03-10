import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency.js';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-semibold text-gray-500">{label}</p>
      <p className="text-sm font-bold text-emerald-700">{formatCurrency(payload[0].value)}</p>
    </div>
  );
}

export function CollectionsChart({ data }) {
  if (!data?.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl text-sm text-gray-400">
        No collection data yet
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <svg width="0" height="0">
        <defs>
          <linearGradient id="collectionsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity={1} />
            <stop offset="100%" stopColor="#0d9488" stopOpacity={0.7} />
          </linearGradient>
        </defs>
      </svg>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 12, left: 4, bottom: 8 }} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1e5).toFixed(0)}L`}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(5,150,105,0.06)', radius: 6 }}
          />
          <Bar
            dataKey="received"
            fill="url(#collectionsGrad)"
            radius={[6, 6, 0, 0]}
            name="Received"
            isAnimationActive
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((_, i) => (
              <Cell key={i} fill="url(#collectionsGrad)" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
