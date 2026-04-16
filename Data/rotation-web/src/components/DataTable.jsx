const PAGE_SIZE = 10;

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="btn btn-secondary"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        type="button"
      >
        Sebelumnya
      </button>

      <div className="page-indicator">
        Halaman {currentPage} dari {totalPages}
      </div>

      <button
        className="btn btn-secondary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        type="button"
      >
        Berikutnya
      </button>
    </div>
  );
}

export function DataTable({ rows, currentPage, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const currentRows = rows.slice(start, start + PAGE_SIZE);

  return (
    <section className="glass-panel">
      <div className="section-heading">
        <div>
          <h2>Daftar peserta</h2>
          <p>Data diurutkan sesuai hasil filter aktif.</p>
        </div>
        <span className="table-count">{rows.length} baris</span>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Waktu</th>
              <th>Nama Peserta</th>
              <th>Asal Sekolah</th>
              <th>Kategori</th>
              <th>Lomba Diikuti</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((item, index) => (
                <tr key={item.id}>
                  <td>{start + index + 1}</td>
                  <td className="muted-cell">{item.waktu}</td>
                  <td className="primary-cell">{item.nama}</td>
                  <td>{item.sekolah}</td>
                  <td>
                    <span className="badge kategori">{item.kategori}</span>
                  </td>
                  <td>
                    <div className="badge-row">
                      {item.lombas.map((lomba) => (
                        <span className="badge" key={`${item.id}-${lomba}`}>
                          {lomba}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">
                  <div className="empty-state">Tidak ada data yang cocok dengan filter aktif.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
    </section>
  );
}
