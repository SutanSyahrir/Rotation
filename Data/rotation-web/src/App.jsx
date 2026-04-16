import { useCallback, useEffect, useMemo, useState } from 'react';
import { DataTable } from './components/DataTable';
import { FilterBar } from './components/FilterBar';
import { Header } from './components/Header';
import { InsightHighlights } from './components/InsightHighlights';
import { KategoriChart } from './components/KategoriChart';
import { LombaChart } from './components/LombaChart';
import { SchoolLeaderboard } from './components/SchoolLeaderboard';
import { StatsCards } from './components/StatsCards';
import { UploadZone } from './components/UploadZone';
import { exportParticipantsCsv } from './utils/exportData';
import { buildFilteredInsights } from './utils/insights';
import { parseExcel, parseExcelBuffer } from './utils/parseExcel';
import './index.css';

const INITIAL_FILTERS = {
  searchTerm: '',
  kategori: '',
  lomba: '',
  sekolah: '',
};

function App() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingSample, setIsLoadingSample] = useState(false);

  const applyParsedResult = (result, sourceName, message = '') => {
    setFileName(sourceName);
    setData(result.data);
    setStats(result.stats);
    setCurrentPage(1);
    setFilters(INITIAL_FILTERS);
    setErrorMessage('');
    setStatusMessage(message || result.stats.warnings?.[0] || '');
  };

  const processFile = async (file) => {
    try {
      const result = await parseExcel(file);
      applyParsedResult(result, file.name);
    } catch (error) {
      setErrorMessage(
        error.message ||
          'File gagal dibaca. Pastikan file yang di-upload adalah hasil ekspor Excel dari Google Forms.'
      );
      console.error(error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleFilterChange = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setCurrentPage(1);
  };

  const loadSampleData = useCallback(async () => {
    try {
      setIsLoadingSample(true);
      setErrorMessage('');
      const response = await fetch('./sample.xlsx');

      if (!response.ok) {
        throw new Error('File contoh `sample.xlsx` tidak ditemukan di folder public.');
      }

      const buffer = await response.arrayBuffer();
      const result = await parseExcelBuffer(buffer);
      applyParsedResult(result, 'sample.xlsx', 'Contoh data berhasil dimuat otomatis dari file sampel.');
    } catch (error) {
      setErrorMessage(error.message || 'Contoh data tidak bisa dimuat.');
      console.error(error);
    } finally {
      setIsLoadingSample(false);
    }
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const searchValue = filters.searchTerm.toLowerCase();
      const matchesSearch =
        !searchValue ||
        item.nama.toLowerCase().includes(searchValue) ||
        item.sekolah.toLowerCase().includes(searchValue);
      const matchesKategori = !filters.kategori || item.kategori === filters.kategori;
      const matchesLomba = !filters.lomba || item.lombas.includes(filters.lomba);
      const matchesSekolah = !filters.sekolah || item.sekolah === filters.sekolah;

      return matchesSearch && matchesKategori && matchesLomba && matchesSekolah;
    });
  }, [data, filters]);

  const filterOptions = useMemo(() => {
    return {
      kategori: [...new Set(data.map((item) => item.kategori))].sort(),
      lomba: [...new Set(data.flatMap((item) => item.lombas))].sort(),
      sekolah: [...new Set(data.map((item) => item.sekolah))].sort(),
    };
  }, [data]);

  const summary = useMemo(() => {
    if (!stats?.insights) return '';

    const parts = [
      `${stats.totals.peserta} peserta`,
      `${stats.totals.sekolah} sekolah`,
      `${stats.totals.lomba} cabang lomba`,
    ];

    if (stats.insights.topLomba) {
      parts.push(`lomba terfavorit ${stats.insights.topLomba.name}`);
    }

    return parts.join(' | ');
  }, [stats]);

  const filteredInsights = useMemo(() => buildFilteredInsights(filteredData), [filteredData]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredData.length / 10));
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, filteredData.length]);

  useEffect(() => {
    loadSampleData();
  }, [loadSampleData]);

  const openPicker = () => {
    document.getElementById('file-upload')?.click();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <main className="container">
        <Header hasData={Boolean(data.length)} fileName={fileName} summary={summary} />

        {errorMessage ? <div className="notice notice-error">{errorMessage}</div> : null}
        {statusMessage ? <div className="notice notice-info">{statusMessage}</div> : null}

        {!data.length ? (
          <UploadZone
            isDragging={isDragging}
            isLoadingSample={isLoadingSample}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              const file = event.dataTransfer.files?.[0];
              if (file) processFile(file);
            }}
            onSelectFile={handleFileUpload}
            onOpenPicker={openPicker}
            onLoadSample={loadSampleData}
          />
        ) : (
          <div className="dashboard">
            <StatsCards totals={stats.totals} />

            <FilterBar
              filters={filters}
              options={filterOptions}
              onChange={handleFilterChange}
              onReset={resetFilters}
              onPrint={handlePrint}
              onExport={() => exportParticipantsCsv(filteredData, `rotation-filtered-${Date.now()}.csv`)}
              filteredCount={filteredData.length}
              totalCount={data.length}
            />

            <InsightHighlights insights={filteredInsights} />

            <div className="content-grid">
              <div className="content-main">
                <DataTable
                  rows={filteredData}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>

              <aside className="content-side">
                <LombaChart data={stats.lombaChartData} />
                <KategoriChart data={stats.kategoriChartData} />
                <SchoolLeaderboard
                  data={stats.sekolahChartData}
                  topSchool={stats.insights.topSchool}
                  topLomba={stats.insights.topLomba}
                />
              </aside>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
