import React from 'react';
import { fmtTgl, fmtDur, recDisplay, RCALABEL } from '../utils/helpers';
import { Edit2, Trash2 } from 'lucide-react';

export default function Table({ data, onEdit, onDelete }) {
  return (
    <div className="tablewrap">
      <table>
        <thead>
          <tr>
            <th width="30">#</th>
            <th width="110">Tanggal</th>
            <th>Insiden / Kronologi</th>
            <th width="120">Kategori</th>
            <th width="90">Severity</th>
            <th width="210">Waktu &amp; Durasi</th>
            <th width="110">RCA</th>
            <th width="90">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>Tidak ada data insiden.</td></tr>
          ) : (
            data.map((r, i) => (
              <tr key={r.id || i} className={`sev-${r.sev}`}>
                <td>{r.no}</td>
                <td className="mn">{fmtTgl(r.iso)}</td>
                <td className="kron">{r.kron}</td>
                <td>{r.kat}</td>
                <td><span className={`sd ${r.sev}`}></span>{r.sev}</td>
                <td>
                  {r.mulai || '?'} — {recDisplay(r.iso, r.iso_resolve, r.resolve)}<br/>
                  <b style={{ color: '#0B3C5D' }}>{r.dur_min ? fmtDur(r.dur_min) : '?'}</b>
                </td>
                <td>
                  <span className={`badge ${r.rca_key}`}>
                    {RCALABEL[r.rca_key] || r.rca_label}
                  </span>
                </td>
                <td>
                  <div className="data-actions">
                    <button className="btn mini" onClick={() => onEdit(r)}><Edit2 size={12}/></button>
                    <button className="btn mini danger" onClick={() => onDelete(r.id)}><Trash2 size={12}/></button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
