import { useEffect, useMemo, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db, hasFirebaseEnv } from './firebase';
import { ACCESS_SESSION_KEY, verifyAccess } from './access';

const currency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const today = new Date().toISOString().slice(0, 10);

const emptyForm = {
  type: 'Pemasukan',
  category: '',
  amount: '',
  date: today,
  note: '',
};

const emptyAccessForm = {
  name: '',
  password: '',
};

function formatCurrency(value) {
  return currency.format(value || 0);
}

function formatAmountInput(value) {
  if (!value) {
    return '';
  }

  return new Intl.NumberFormat('id-ID').format(Number(value));
}

function sanitizeAmountInput(value) {
  return value.replace(/\D/g, '');
}

function formatDate(dateString) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString));
}

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [accessForm, setAccessForm] = useState(emptyAccessForm);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeUser, setActiveUser] = useState('');
  const [accessError, setAccessError] = useState('');
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [lastSync, setLastSync] = useState('');
  const [status, setStatus] = useState(
    hasFirebaseEnv ? 'Firebase aktif. Data transaksi tersinkron realtime.' : 'Mode demo aktif. Hubungkan Firebase untuk sinkronisasi realtime.',
  );

  useEffect(() => {
    const savedSession = window.localStorage.getItem(ACCESS_SESSION_KEY);

    if (!savedSession) {
      return;
    }

    try {
      const session = JSON.parse(savedSession);
      if (session?.name) {
        setIsAuthenticated(true);
        setActiveUser(session.name);
      }
    } catch {
      window.localStorage.removeItem(ACCESS_SESSION_KEY);
    }
  }, []);

  useEffect(() => {
    if (!hasFirebaseEnv || !db) {
      return undefined;
    }

    setStatus('Firebase aktif. Data transaksi tersinkron realtime.');
    const financeQuery = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(financeQuery, (snapshot) => {
      const remoteTransactions = snapshot.docs.map((entry) => {
        const data = entry.data();
        return {
          id: entry.id,
          type: data.type,
          category: data.category,
          amount: data.amount,
          date: data.date,
          note: data.note,
          source: 'Firebase',
        };
      });

      setTransactions(remoteTransactions);
      setLastSync(
        new Intl.DateTimeFormat('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(new Date()),
      );
    });

    return () => unsubscribe();
  }, []);

  const summary = useMemo(() => {
    const income = transactions
      .filter((item) => item.type === 'Pemasukan')
      .reduce((total, item) => total + Number(item.amount), 0);
    const expense = transactions
      .filter((item) => item.type === 'Pengeluaran')
      .reduce((total, item) => total + Number(item.amount), 0);

    return {
      income,
      expense,
      balance: income - expense,
      count: transactions.length,
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const matchesFilter = filter === 'Semua' || item.type === filter;
      const keyword = search.trim().toLowerCase();
      const matchesSearch =
        keyword === '' ||
        item.category.toLowerCase().includes(keyword) ||
        item.note.toLowerCase().includes(keyword);

      return matchesFilter && matchesSearch;
    });
  }, [filter, search, transactions]);

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      ...form,
      category: form.category.trim(),
      note: form.note.trim(),
      amount: Number(form.amount),
    };

    if (!payload.category || !payload.note || !payload.amount) {
      setStatus('Lengkapi kategori, nominal, dan keterangan transaksi.');
      return;
    }

    if (hasFirebaseEnv && db) {
      await addDoc(collection(db, 'transactions'), {
        ...payload,
        createdAt: serverTimestamp(),
      });
      setStatus('Transaksi berhasil disimpan ke Firebase.');
    } else {
      setTransactions((current) => [
        {
          id: `local-${Date.now()}`,
          ...payload,
          source: 'Manual',
        },
        ...current,
      ]);
      setStatus('Transaksi tersimpan di mode demo lokal.');
    }

    setForm(emptyForm);
  }

  async function handleDelete(id) {
    if (hasFirebaseEnv && db && !String(id).startsWith('local-')) {
      await deleteDoc(doc(db, 'transactions', id));
      setStatus('Transaksi dihapus dari Firebase.');
      return;
    }

    setTransactions((current) => current.filter((item) => item.id !== id));
    setStatus('Transaksi dihapus dari daftar.');
  }

  async function handleResetAll() {
    if (transactions.length === 0) {
      setStatus('Data sudah kosong. Saldo saat ini Rp0.');
      return;
    }

    if (hasFirebaseEnv && db) {
      await Promise.all(
        transactions.map((item) => deleteDoc(doc(db, 'transactions', item.id))),
      );
      setStatus('Semua transaksi di Firebase berhasil dihapus. Saldo kembali Rp0.');
      return;
    }

    setTransactions([]);
    setStatus('Semua transaksi lokal dihapus. Saldo kembali Rp0.');
  }

  async function handleAccessSubmit(event) {
    event.preventDefault();

    const isValid = await verifyAccess(accessForm.name, accessForm.password);

    if (!isValid) {
      setAccessError('Nama atau password tidak cocok.');
      return;
    }

    const session = {
      name: accessForm.name.trim().toLowerCase(),
      loggedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(ACCESS_SESSION_KEY, JSON.stringify(session));
    setIsAuthenticated(true);
    setActiveUser(session.name);
    setAccessError('');
    setAccessForm(emptyAccessForm);
  }

  function handleLogout() {
    window.localStorage.removeItem(ACCESS_SESSION_KEY);
    setIsAuthenticated(false);
    setActiveUser('');
    setAccessForm(emptyAccessForm);
    setAccessError('');
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-shell">
        <section className="auth-card">
          <span className="eyebrow">Akses Rotation</span>
          <h1>Masuk dulu sebelum membuka dashboard kas.</h1>
          <p>
            Sistem kas dan Firebase tetap sama. Halaman ini hanya menambah pembatas nama
            dan password supaya aksesnya lebih terbatas.
          </p>

          <form className="auth-form" onSubmit={handleAccessSubmit}>
            <label>
              Nama
              <input
                type="text"
                placeholder="Masukkan nama akses"
                value={accessForm.name}
                onChange={(event) => setAccessForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>

            <label>
              Password
              <input
                type="password"
                placeholder="Masukkan password"
                value={accessForm.password}
                onChange={(event) => setAccessForm((current) => ({ ...current, password: event.target.value }))}
              />
            </label>

            {accessError ? <div className="auth-error">{accessError}</div> : null}

            <button type="submit">Masuk ke Dashboard</button>
          </form>
        </section>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div className="hero__copy">
          <span className="eyebrow">Rotation Finance</span>
          <h1>Dashboard Kas Organisasi yang rapi, hijau, dan mudah dipakai bendahara.</h1>
          <p>
            Catat pemasukan dan pengeluaran, lihat saldo berjalan, lalu siapkan data
            untuk organisasi Rotation secara lebih tertib.
          </p>
          <div className="hero__badges">
            <span>Realtime Ready</span>
            <span>Firebase Ready</span>
            <span>GitHub Deployable</span>
          </div>
          <div className="sync-banner">
            <strong>{hasFirebaseEnv ? 'Sinkron lintas perangkat aktif' : 'Sinkron lintas perangkat belum aktif'}</strong>
            <span>
              {hasFirebaseEnv
                ? 'Perubahan pemasukan dan pengeluaran di laptop atau HP lain akan muncul dari Firebase yang sama.'
                : 'Isi Firebase agar data di laptop dan HP lain tetap sama.'}
            </span>
            {lastSync ? <small>Sinkron terakhir {lastSync}</small> : null}
            <small>Akses masuk sebagai {activeUser}</small>
          </div>
        </div>

        <div className="hero__card">
          <div className="hero__card-header">
            <span>Saldo Saat Ini</span>
            <strong>{formatCurrency(summary.balance)}</strong>
          </div>
          <button type="button" className="logout-button" onClick={handleLogout}>
            Keluar
          </button>
          <div className="hero__mini-grid">
            <article>
              <label>Pemasukan</label>
              <strong>{formatCurrency(summary.income)}</strong>
            </article>
            <article>
              <label>Pengeluaran</label>
              <strong>{formatCurrency(summary.expense)}</strong>
            </article>
            <article>
              <label>Transaksi</label>
              <strong>{summary.count} data</strong>
            </article>
            <article>
              <label>Status</label>
              <strong>{hasFirebaseEnv ? 'Online' : 'Demo'}</strong>
            </article>
          </div>
        </div>
      </header>

      <main className="content-grid">
        <section className="panel panel--form">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">Input Bendahara</span>
              <h2>Catat transaksi baru</h2>
            </div>
            <span className="status-pill">{status}</span>
          </div>

          <form className="finance-form" onSubmit={handleSubmit}>
            <label>
              Jenis Transaksi
              <select
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
              >
                <option value="Pemasukan">Pemasukan</option>
                <option value="Pengeluaran">Pengeluaran</option>
              </select>
            </label>

            <label>
              Kategori
              <input
                type="text"
                placeholder="Contoh: Iuran, Donasi, Konsumsi"
                value={form.category}
                onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
              />
            </label>

            <label>
              Nominal
              <input
                type="text"
                inputMode="numeric"
                placeholder="Contoh: 100.000"
                value={formatAmountInput(form.amount)}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    amount: sanitizeAmountInput(event.target.value),
                  }))
                }
              />
            </label>

            <label>
              Tanggal
              <input
                type="date"
                value={form.date}
                onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
              />
            </label>

            <label className="finance-form__full">
              Keterangan
              <textarea
                rows="4"
                placeholder="Tambahkan catatan singkat transaksi"
                value={form.note}
                onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
              />
            </label>

            <button type="submit">Simpan Transaksi</button>
          </form>
        </section>

        <section className="panel panel--summary">
          <div className="panel__header">
            <div>
              <span className="panel__eyebrow">Ringkasan</span>
              <h2>Kondisi kas organisasi</h2>
            </div>
          </div>

          <div className="stats-grid">
            <article className="stat-card stat-card--income">
              <span>Total Pemasukan</span>
              <strong>{formatCurrency(summary.income)}</strong>
              <small>Dana masuk dari iuran, donasi, dan kegiatan.</small>
            </article>
            <article className="stat-card stat-card--expense">
              <span>Total Pengeluaran</span>
              <strong>{formatCurrency(summary.expense)}</strong>
              <small>Belanja kegiatan, konsumsi, operasional, dan lain-lain.</small>
            </article>
            <article className="stat-card stat-card--balance">
              <span>Saldo Akhir</span>
              <strong>{formatCurrency(summary.balance)}</strong>
              <small>Posisi kas aktif yang tersedia saat ini.</small>
            </article>
          </div>

          <div className="insight-card">
            <h3>Catatan cepat bendahara</h3>
            <p>
              Gunakan kategori yang konsisten supaya laporan lebih mudah dibaca. Saat Firebase
              aktif, seluruh transaksi akan disimpan di cloud dan bisa dipakai lintas perangkat.
            </p>
            <button type="button" className="secondary-action" onClick={handleResetAll}>
              Reset Semua Data
            </button>
          </div>
        </section>

        <section className="panel panel--table">
          <div className="panel__header panel__header--table">
            <div>
              <span className="panel__eyebrow">Buku Kas</span>
              <h2>Daftar pemasukan dan pengeluaran</h2>
            </div>

            <div className="toolbar">
              <select value={filter} onChange={(event) => setFilter(event.target.value)}>
                <option value="Semua">Semua</option>
                <option value="Pemasukan">Pemasukan</option>
                <option value="Pengeluaran">Pengeluaran</option>
              </select>

              <input
                type="search"
                placeholder="Cari kategori atau keterangan"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Jenis</th>
                  <th>Kategori</th>
                  <th>Keterangan</th>
                  <th>Nominal</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.date)}</td>
                    <td>
                      <span className={`type-pill ${item.type === 'Pemasukan' ? 'type-pill--income' : 'type-pill--expense'}`}>
                        {item.type}
                      </span>
                    </td>
                    <td>{item.category}</td>
                    <td>{item.note}</td>
                    <td>{formatCurrency(item.amount)}</td>
                    <td>
                      <button type="button" className="table-action" onClick={() => handleDelete(item.id)}>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mobile-transactions">
              {filteredTransactions.map((item) => (
                <article key={`mobile-${item.id}`} className="mobile-transaction-card">
                  <div className="mobile-transaction-card__top">
                    <span className={`type-pill ${item.type === 'Pemasukan' ? 'type-pill--income' : 'type-pill--expense'}`}>
                      {item.type}
                    </span>
                    <strong>{formatCurrency(item.amount)}</strong>
                  </div>
                  <h3>{item.category}</h3>
                  <p>{item.note}</p>
                  <div className="mobile-transaction-card__meta">
                    <span>{formatDate(item.date)}</span>
                    <span>{item.source}</span>
                  </div>
                  <button type="button" className="table-action mobile-transaction-card__action" onClick={() => handleDelete(item.id)}>
                    Hapus
                  </button>
                </article>
              ))}
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="empty-state">
                <strong>Tidak ada transaksi.</strong>
                <p>Ubah filter atau tambahkan transaksi baru dari panel input.</p>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
