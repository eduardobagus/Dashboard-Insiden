import React, { useRef } from 'react';
import { Download, PlusCircle, Search, Upload, Database, RefreshCw, RotateCcw } from 'lucide-react';
import { SEV, download, fmtTgl, fmtDur } from '../utils/helpers';

export default function Toolbar({ 
  filterSev, 
  setFilterSev, 
  searchQuery, 
  setSearchQuery, 
  filteredView,
  allData,
  onAdd,
  onImport,
  onRefresh,
  onReset,
  showAlert
}) {
  const fileInputRef = useRef(null);

  const handleExport = () => {
    if (!filteredView.length) return showAlert('Tidak ada data untuk diexport');
    const head = ['No', 'Tanggal', 'Insiden / Kronologi', 'Kategori', 'Severity', 'Waktu Mulai', 'Waktu Resolve', 'Durasi', 'Dampak', 'Action', 'RCA'];
    const rows = filteredView.map((r, i) => [
      i + 1,
      fmtTgl(r.iso),
      (r.kron || '').replace(/"/g, '""'),
      r.kat || '',
      r.sev || '',
      r.mulai || '',
      r.resolve || '',
      r.dur_min ? fmtDur(r.dur_min) : '',
      (r.dampak || '').replace(/"/g, '""'),
      (r.action || '').replace(/"/g, '""'),
      r.rca_label || ''
    ]);
    
    const csv = [
      head.join(','),
      ...rows.map(r => r.map(c => `"${c}"`).join(','))
    ].join('\n');
    
    download(csv, `Export_Insiden_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (Array.isArray(parsed)) {
          onImport(parsed);
          showAlert('Data berhasil diimpor!');
        } else {
          showAlert('Format JSON tidak valid (harus array dari insiden)');
        }
      } catch (err) {
        showAlert('Gagal membaca file JSON');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input file
  };

  // handleReset removed as confirm is now in App.jsx

  return (
    <div className="toolbar">
      <div className="filters">
        <span 
          className={`chip ${filterSev === 'all' ? 'active' : ''}`}
          onClick={() => setFilterSev('all')}
        >
          Semua Sev
        </span>
        {SEV.map(s => (
          <span 
            key={s}
            className={`chip ${filterSev === s ? 'active' : ''}`}
            onClick={() => setFilterSev(s)}
          >
            <span className={`dot ${s}`}></span> {s}
          </span>
        ))}
      </div>
      
      <div className="search">
        <Search size={16} />
        <input 
          type="text" 
          placeholder="Cari kronologi, kategori, atau impact..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="count">Menampilkan <b>{filteredView.length}</b> insiden</div>
      
      <div className="data-actions">
        <button className="btn primary" onClick={onAdd}>
          <PlusCircle size={15} /> Input Insiden Baru
        </button>
        <button className="btn" onClick={() => fileInputRef.current?.click()}>
          <Upload size={15} /> Import File
        </button>

        <button className="btn" onClick={handleExport}>
          <Download size={15} /> Export CSV
        </button>
        <button className="btn" onClick={onRefresh}>
          <RefreshCw size={15} /> Refresh
        </button>
        <button className="btn" onClick={onReset} style={{ color: '#d32f2f', borderColor: '#d32f2f' }}>
          <RotateCcw size={15} /> Reset All
        </button>
        <input 
          type="file" 
          ref={fileInputRef}
          accept="application/json,.json"
          style={{ display: 'none' }}
          onChange={handleImportFile}
        />
      </div>
    </div>
  );
}
