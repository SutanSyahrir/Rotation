export function InsightHighlights({ insights }) {
  return (
    <section className="insight-grid">
      {insights.map((item) => (
        <article className="glass-panel insight-highlight" key={item.title}>
          <span>{item.title}</span>
          <strong>{item.value}</strong>
          <p>{item.description}</p>
        </article>
      ))}
    </section>
  );
}
