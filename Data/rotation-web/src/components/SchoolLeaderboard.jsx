export function SchoolLeaderboard({ data, topSchool, topLomba }) {
  return (
    <section className="glass-panel leaderboard-panel">
      <div className="section-heading">
        <div>
          <h2>Sekolah teratas</h2>
          <p>Nama sekolah sudah dinormalisasi dari variasi penulisan yang mirip.</p>
        </div>
      </div>

      <div className="insight-strip">
        {topSchool ? (
          <div className="insight-card">
            <span>Sekolah terbanyak</span>
            <strong>{topSchool.name}</strong>
            <p>{topSchool.count} peserta</p>
          </div>
        ) : null}
        {topLomba ? (
          <div className="insight-card">
            <span>Lomba favorit</span>
            <strong>{topLomba.name}</strong>
            <p>{topLomba.count} peserta</p>
          </div>
        ) : null}
      </div>

      <div className="leaderboard-list">
        {data.map((item, index) => (
          <div className="leaderboard-item" key={item.name}>
            <span className="leaderboard-rank">#{index + 1}</span>
            <div className="leaderboard-copy">
              <strong>{item.name}</strong>
              <p>{item.count} peserta</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
