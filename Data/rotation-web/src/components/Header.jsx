import { FileSpreadsheet, Sparkles } from 'lucide-react';

export function Header({ hasData, fileName, summary }) {
  return (
    <header className="hero-header">
      <div className="hero-copy">
        <span className="eyebrow">
          <Sparkles size={16} />
          Rotation Organization Dashboard
        </span>
        <h1>Dashboard pendaftaran yang rapi untuk operasional panitia dan presentasi organisasi.</h1>
        <p>
          Upload file Excel dari Google Forms untuk melihat statistik peserta, distribusi lomba,
          kategori, serta daftar peserta yang bisa dicari, difilter, dan dicetak sebagai bahan rapat.
        </p>
        <div className="workflow-strip">
          <span>1. Upload / buka contoh</span>
          <span>2. Data dirapikan otomatis</span>
          <span>3. Filter dan baca dashboard</span>
        </div>

        {hasData ? (
          <div className="hero-meta">
            <div className="hero-chip">
              <FileSpreadsheet size={16} />
              {fileName}
            </div>
            {summary ? <p className="hero-summary">{summary}</p> : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
