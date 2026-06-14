import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency.js';

const GRADIENT_IDS = ['pendingGrad0', 'pendingGrad1', 'pendingGrad2'];
const GRADIENT_COLORS = [
  ['#fb7185', '#e11d48'],
  ['#fbbf24', '#d97706'],
  ['#4d86bf', '#1f5288'],
];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-semibold text-gray-500">{payload[0].payload.name}</p>
      <p className="text-sm font-bold" style={{ color: payload[0].fill }}>
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export function PendingBreakdownChart({ data }) {
  if (!data?.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl text-sm text-gray-400">
        No pending payables
      </div>
    );
  }

  return (
    <div className="h-72 w-full">
      <svg width="0" height="0">
        <defs>
          {GRADIENT_COLORS.map(([start, end], i) => (
            <linearGradient key={i} id={GRADIENT_IDS[i]} x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor={start} stopOpacity={1} />
              <stop offset="100%" stopColor={end} stopOpacity={0.7} />
            </linearGradient>
          ))}
        </defs>
      </svg>
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 20, left: 8, bottom: 8 }}
          barSize={20}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: '#475569' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${(v / 1e5).toFixed(0)}L`}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={80}
            tick={{ fontSize: 11, fill: '#334155' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)', radius: 4 }} />
          <Bar
            dataKey="value"
            radius={[0, 6, 6, 0]}
            isAnimationActive
            animationDuration={700}
            animationEasing="ease-out"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={`url(#${GRADIENT_IDS[i % GRADIENT_IDS.length]})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
