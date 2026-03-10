import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const STATUS_COLORS = {
  ACTIVE: '#059669',
  COMPLETED: '#64748b',
  ON_HOLD: '#d97706',
  ENQUIRY: '#2563eb',
  CANCELLED: '#94a3b8',
};

export function StatusDonut({ data }) {
  if (!data?.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-gray-50/50 text-sm text-gray-500">
        No projects yet
      </div>
    );
  }
  const chartData = data.map((d) => ({ name: d.status.replace(/_/g, ' '), value: d.count }));
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            label={({ name, value }) => `${name}: ${value}`}
          >
            {chartData.map((entry, i) => (
              <Cell key={entry.name} fill={STATUS_COLORS[data[i]?.status] ?? '#94a3b8'} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [value, 'Projects']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
