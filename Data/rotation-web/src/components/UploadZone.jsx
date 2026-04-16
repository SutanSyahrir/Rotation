import { UploadCloud } from 'lucide-react';

export function UploadZone({
  isDragging,
  isLoadingSample,
  onDragLeave,
  onDragOver,
  onDrop,
  onSelectFile,
  onOpenPicker,
  onLoadSample,
}) {
  return (
    <div
      className={`upload-zone ${isDragging ? 'active' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onOpenPicker}
    >
      <input
        type="file"
        id="file-upload"
        accept=".xlsx,.xls,.csv"
        hidden
        onChange={onSelectFile}
      />
      <UploadCloud className="upload-icon" />
      <div className="upload-title">Upload Data Excel</div>
      <div className="upload-subtitle">
        Drag & drop file dari Google Forms atau klik untuk memilih file `.xlsx`.
      </div>
      <div className="upload-hint">
        Sistem akan membaca sheet pertama dan merapikan variasi nama sekolah serta lomba.
      </div>
      <div className="upload-actions">
        <button
          className="btn btn-secondary"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onLoadSample();
          }}
          disabled={isLoadingSample}
        >
          {isLoadingSample ? 'Memuat contoh...' : 'Lihat Contoh Data'}
        </button>
      </div>
    </div>
  );
}
