import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#0ea5e9', '#ff7a3d', '#22c55e', '#facc15', '#8b5cf6'];

export function KategoriChart({ data }) {
  return (
    <section className="glass-panel chart-panel">
      <div className="section-heading">
        <div>
          <h2>Distribusi kategori</h2>
          <p>Komposisi peserta berdasarkan kategori lomba.</p>
        </div>
      </div>

      <div className="chart-body">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              innerRadius={64}
              outerRadius={104}
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e2634',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="legend-list">
        {data.map((entry, index) => (
          <div className="legend-item" key={entry.name}>
            <span className="legend-dot" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span>{entry.name}</span>
            <strong>{entry.count}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
