import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency.js';

const COLORS = ['#7c3aed', '#0d9488', '#2563eb', '#d97706', '#64748b'];

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-semibold text-gray-500">{payload[0].name}</p>
      <p className="text-sm font-bold" style={{ color: payload[0].payload.fill }}>
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export function ExpenseBreakdownChart({ data }) {
  if (!data?.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl text-sm text-gray-400">
        No expense data yet
      </div>
    );
  }

  const total = data.reduce((s, d) => s + d.value, 0);
  const chartData = data.map((d, i) => ({ ...d, fill: COLORS[i % COLORS.length] }));

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={84}
              paddingAngle={3}
              dataKey="value"
              isAnimationActive
              animationBegin={150}
              animationDuration={700}
              animationEasing="ease-out"
            >
              {chartData.map((entry, i) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom legend with percentages */}
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2">
        {chartData.map((entry) => {
          const pct = total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0;
          return (
            <div key={entry.name} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.fill }}
              />
              <span className="text-xs text-gray-500">
                {entry.name}{' '}
                <strong className="text-gray-700">({pct}%)</strong>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
