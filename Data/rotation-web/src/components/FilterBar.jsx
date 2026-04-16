import { Activity, Filter, Search, School2 } from 'lucide-react';

export function FilterBar({
  filters,
  options,
  onChange,
  onReset,
  onExport,
  onPrint,
  filteredCount,
  totalCount,
}) {
  return (
    <section className="glass-panel">
      <div className="toolbar-heading">
        <div>
          <h2>Filter peserta</h2>
          <p>
            Menampilkan {filteredCount} dari {totalCount} peserta.
          </p>
        </div>
        <div className="toolbar-actions">
          <button className="btn btn-secondary" onClick={onReset} type="button">
            Reset Filter
          </button>
          <button
            className="btn btn-secondary"
            onClick={onPrint}
            type="button"
            disabled={filteredCount === 0}
          >
            Cetak / PDF
          </button>
          <button className="btn btn-primary" onClick={onExport} type="button" disabled={filteredCount === 0}>
            Export CSV
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="input-group">
          <Search className="input-icon" />
          <input
            type="text"
            className="input-field"
            placeholder="Cari nama atau sekolah..."
            value={filters.searchTerm}
            onChange={(event) => onChange('searchTerm', event.target.value)}
          />
        </div>

        <div className="input-group">
          <Filter className="input-icon" />
          <select
            className="input-field"
            value={filters.kategori}
            onChange={(event) => onChange('kategori', event.target.value)}
          >
            <option value="">Semua kategori</option>
            {options.kategori.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <Activity className="input-icon" />
          <select
            className="input-field"
            value={filters.lomba}
            onChange={(event) => onChange('lomba', event.target.value)}
          >
            <option value="">Semua lomba</option>
            {options.lomba.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <School2 className="input-icon" />
          <select
            className="input-field"
            value={filters.sekolah}
            onChange={(event) => onChange('sekolah', event.target.value)}
          >
            <option value="">Semua sekolah</option>
            {options.sekolah.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
