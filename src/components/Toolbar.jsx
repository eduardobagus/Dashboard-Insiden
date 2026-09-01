import React, { useRef } from 'react';
import { Download, PlusCircle, Search, Upload, Database, RefreshCw, RotateCcw } from 'lucide-react';
import * as XLSX from 'xlsx';
import { SEV, download, fmtTgl, fmtDur, MON, RCAKEY, parseRec, computeDur, uid } from '../utils/helpers';

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

  // Helper: parse a single CSV line respecting quoted fields
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
        else if (ch === '"') { inQuotes = false; }
        else { current += ch; }
      } else {
        if (ch === '"') { inQuotes = true; }
        else if (ch === ',') { result.push(current.trim()); current = ''; }
        else { current += ch; }
      }
    }
    result.push(current.trim());
    return result;
  };

  // Helper: map a row object (from CSV/Excel headers) to incident data
  // Helper: find a value from row by trying multiple possible column names
  const getCol = (row, ...keys) => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== '') return String(row[k]);
    }
    // Fuzzy: try partial match on column headers
    const rowKeys = Object.keys(row);
    for (const k of keys) {
      const lower = k.toLowerCase();
      const found = rowKeys.find(rk => rk.toLowerCase().includes(lower));
      if (found && row[found] !== undefined && row[found] !== '') return String(row[found]);
    }
    return '';
  };

  // Helper: clean Excel error values
  const cleanVal = (val) => {
    if (!val) return '';
    const s = String(val).trim();
    if (s.startsWith('#') || s === 'undefined' || s === 'null') return '';
    return s;
  };

  const mapRowToIncident = (row) => {
    // Clean all values first (remove Excel errors like #VALUE!, #REF!, etc.)
    const clean = {};
    for (const [k, v] of Object.entries(row)) {
      clean[k] = cleanVal(v);
    }

    let isoStr = '';
    const tglRaw = getCol(clean, 'Tanggal', 'tgl', 'iso', 'Tgl Insiden', 'Date');
    if (tglRaw) {
      // Try "DD MMM YYYY" format (e.g. "12 Jun 2026")
      const parts = tglRaw.split(/[\s]+/);
      if (parts.length >= 3) {
        const dd = parts[0].padStart(2, '0');
        const mi = MON.findIndex(m => m.toLowerCase() === parts[1].toLowerCase());
        if (mi >= 0) {
          const yr = parts[2].length === 2 ? '20' + parts[2] : parts[2];
          isoStr = `${yr}-${String(mi + 1).padStart(2, '0')}-${dd}`;
        }
      }
      // Try ISO format "YYYY-MM-DD"
      if (!isoStr && /\d{4}-\d{2}-\d{2}/.test(tglRaw)) {
        isoStr = tglRaw.match(/\d{4}-\d{2}-\d{2}/)[0];
      }
      // Try generic Date parse
      if (!isoStr) {
        const dt = new Date(tglRaw);
        if (!isNaN(dt) && dt.getFullYear() > 1990) {
          isoStr = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
        } else if (!isNaN(Number(tglRaw)) && Number(tglRaw) > 30000) {
          // Excel serial number
          const dtFromExcel = new Date((Number(tglRaw) - 25569) * 86400 * 1000);
          isoStr = dtFromExcel.getFullYear() + '-' + String(dtFromExcel.getMonth() + 1).padStart(2, '0') + '-' + String(dtFromExcel.getDate()).padStart(2, '0');
        }
      }
    }
    if (!isoStr) isoStr = new Date().toISOString().split('T')[0];

    const mulaiStr = getCol(clean, 'Waktu Mulai', 'mulai', 'Start Time') || '00:00';
    let resolveStr = getCol(clean, 'Waktu Resolve', 'resolve', 'rec', 'Waktu Selesai', 'End Time');
    let trec = resolveStr;
    let irec = isoStr;

    if (resolveStr && resolveStr.includes('(')) {
      const p = parseRec(resolveStr, isoStr);
      trec = p.t;
      irec = p.irec;
    }
    const dur = computeDur(isoStr, mulaiStr, irec, trec);

    const rcaLabel = getCol(clean, 'RCA', 'rca_label', 'rca');
    const rcaKey = RCAKEY[rcaLabel] || clean['rca_key'] || 'none';

    // Kronologi: try many possible column names
    const kron = getCol(clean, 'Insiden / Kronologi', 'kron', 'Kronologi', 'Timeline', 'Kronologi (Timeline)', 'Deskripsi', 'Insiden', 'Description');
    
    // Kategori: try many possible column names
    const kat = getCol(clean, 'Kategori', 'kat', 'Kategori Insiden', 'Kategori Layanan', 'Category', 'Jenis Insiden');

    // Severity: try column names, or fallback to Minor
    const sev = getCol(clean, 'Severity', 'sev', 'Dampak Severity', 'Level') || 'Minor';

    // Dampak
    const dampak = getCol(clean, 'Dampak', 'dampak', 'Impact');

    // Action: try multiple possible column names from the Excel
    const action = getCol(clean, 'Action', 'action', 'Action / Follow Up', 'Follow Up', 'Eskalasi RTT', 'Eskalasi', 'Penanganan', 'Penanganan CNET');

    const dObj = new Date(isoStr + 'T00:00:00');
    const tglStr = String(dObj.getDate()).padStart(2, '0') + '-' + MON[dObj.getMonth()] + '-' + String(dObj.getFullYear()).slice(2);

    return {
      id: String(clean['ID'] || clean['id'] || uid()),
      iso: isoStr,
      kron,
      kat,
      sev,
      mulai: mulaiStr,
      resolve: resolveStr,
      iso_resolve: irec,
      dur_min: dur !== null ? dur : (clean['dur_min'] ? Number(clean['dur_min']) : null),
      dampak,
      action,
      rca_label: rcaLabel,
      rca_key: rcaKey,
      tgl: tglStr
    };
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const ext = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();
    
    if (ext === 'json') {
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result);
          if (Array.isArray(parsed)) {
            onImport(parsed);
            showAlert('Data JSON berhasil diimpor!');
          } else {
            showAlert('Format JSON tidak valid (harus array dari insiden)');
          }
        } catch (err) {
          showAlert('Gagal membaca file JSON');
        }
      };
      reader.readAsText(file);
    } else if (ext === 'csv') {
      // Parse CSV as plain text to avoid XLSX date auto-conversion
      reader.onload = (ev) => {
        try {
          const text = ev.target.result;
          const lines = text.split(/\r?\n/).filter(l => l.trim());
          if (lines.length < 2) return showAlert('File CSV kosong atau tidak valid');
          
          const headers = parseCSVLine(lines[0]);
          const parsed = [];
          
          for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            if (values.length < 2) continue; // skip empty lines
            const row = {};
            headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
            parsed.push(mapRowToIncident(row));
          }
          
          if (!parsed.length) return showAlert('Tidak ada data valid di dalam file CSV');
          onImport(parsed);
          showAlert(`${parsed.length} data CSV berhasil diimpor!`);
        } catch (err) {
          console.error(err);
          showAlert('Gagal membaca file CSV');
        }
      };
      reader.readAsText(file);
    } else if (ext === 'xlsx' || ext === 'xls') {
      reader.onload = (ev) => {
        try {
          const data = new Uint8Array(ev.target.result);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          
          // Smart sheet selection: find the best sheet for incident data
          let targetSheet = null;
          const sheetKeywords = ['incident', 'timeline', 'insiden', 'log', 'data', 'detail'];
          
          // 1. Try to find a sheet with a matching keyword in the name
          for (const keyword of sheetKeywords) {
            const found = workbook.SheetNames.find(name => 
              name.toLowerCase().includes(keyword)
            );
            if (found) { targetSheet = found; break; }
          }
          
          // 2. If not found by name, pick the sheet with the most rows of data
          if (!targetSheet) {
            let maxRows = 0;
            for (const name of workbook.SheetNames) {
              const ws = workbook.Sheets[name];
              const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
              if (rows.length > maxRows) {
                maxRows = rows.length;
                targetSheet = name;
              }
            }
          }
          
          if (!targetSheet) targetSheet = workbook.SheetNames[0];
          
          const worksheet = workbook.Sheets[targetSheet];
          const jsonArr = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });
          
          if (!jsonArr || !jsonArr.length) {
            return showAlert('File Excel kosong atau tidak dapat dibaca');
          }
          
          const parsed = jsonArr.map(row => mapRowToIncident(row));
          onImport(parsed);
          const sheetInfo = workbook.SheetNames.length > 1 ? ` (sheet: "${targetSheet}")` : '';
          showAlert(`${parsed.length} data Excel berhasil diimpor!${sheetInfo}`);
        } catch (err) {
          console.error(err);
          showAlert('Gagal membaca file Excel');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      showAlert('Format file tidak didukung. Gunakan JSON, CSV, atau Excel.');
    }
    
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
          accept="application/json,.json,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          style={{ display: 'none' }}
          onChange={handleImportFile}
        />
      </div>
    </div>
  );
}
