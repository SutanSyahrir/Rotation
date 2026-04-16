import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function LombaChart({ data }) {
  return (
    <section className="glass-panel chart-panel">
      <div className="section-heading">
        <div>
          <h2>Top lomba terpopuler</h2>
          <p>10 cabang lomba dengan jumlah peserta terbanyak.</p>
        </div>
      </div>

      <div className="chart-body tall">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 20, left: 20, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(120, 134, 163, 0.16)" horizontal={false} />
            <XAxis type="number" stroke="#7b8ba8" allowDecimals={false} />
            <YAxis type="category" dataKey="name" stroke="#7b8ba8" width={130} tick={{ fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: 'rgba(255, 122, 61, 0.12)' }}
              contentStyle={{
                backgroundColor: '#1e2634',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
              }}
            />
            <Bar dataKey="count" fill="#ff7a3d" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
