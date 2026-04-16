import { Building2, FileSpreadsheet, Trophy, Users } from 'lucide-react';

const cards = [
  { key: 'peserta', label: 'Total Peserta', icon: Users },
  { key: 'sekolah', label: 'Sekolah Aktif', icon: Building2 },
  { key: 'lomba', label: 'Cabang Lomba', icon: Trophy },
  { key: 'kategori', label: 'Kategori', icon: FileSpreadsheet },
];

export function StatsCards({ totals }) {
  return (
    <section className="stats-grid">
      {cards.map((card) => (
        <article className="stat-card glass-panel" key={card.key}>
          <div className="stat-icon">
            <card.icon size={24} />
          </div>
          <div className="stat-info">
            <h3>{card.label}</h3>
            <p>{totals[card.key] ?? 0}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
