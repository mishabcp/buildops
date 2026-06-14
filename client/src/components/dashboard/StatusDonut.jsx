import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const STATUS_COLORS = {
  ACTIVE: '#059669',
  COMPLETED: '#1f5288',
  ON_HOLD: '#d97706',
  ENQUIRY: '#2c69a6',
  CANCELLED: '#94a3b8',
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-100 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-gray-500">{payload[0].name}</p>
      <p className="text-sm font-bold text-gray-800">{payload[0].value} projects</p>
    </div>
  );
}

export function StatusDonut({ data }) {
  if (!data?.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl text-sm text-gray-400">
        No projects yet
      </div>
    );
  }

  const chartData = data.map((d) => ({ name: d.status.replace(/_/g, ' '), value: d.count, rawStatus: d.status }));
  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-56 w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              isAnimationActive
              animationBegin={100}
              animationDuration={700}
              animationEasing="ease-out"
            >
              {chartData.map((entry, i) => (
                <Cell key={entry.name} fill={STATUS_COLORS[data[i]?.status] ?? '#94a3b8'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-brand-950 tabular">{total}</span>
          <span className="text-xs font-medium text-slate-500">Projects</span>
        </div>
      </div>

      {/* Custom legend */}
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-2">
        {chartData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[entry.rawStatus] ?? '#94a3b8' }}
            />
            <span className="text-xs font-medium text-slate-600">
              {entry.name} <strong className="text-slate-800">({entry.value})</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
