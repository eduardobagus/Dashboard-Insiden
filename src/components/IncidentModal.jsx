import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { SEV, RCALABEL, RCAKEY, computeDur, fmtDur, parseRec } from '../utils/helpers';

export default function IncidentModal({ isOpen, onClose, onSave, editingData, showAlert }) {
  const [formData, setFormData] = useState({});
  
  useEffect(() => {
    if (isOpen) {
      if (editingData) {
        setFormData({ ...editingData });
      } else {
        const today = new Date();
        const iso = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
        setFormData({ iso, mulai: '00:00', resolve: '00:00', sev: 'Minor', rca_key: 'none' });
      }
    }
  }, [isOpen, editingData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.iso || !formData.kron || !formData.kat || !formData.mulai || !formData.resolve) {
      if (showAlert) showAlert('Mohon lengkapi field yang diwajibkan (*)');
      return;
    }

    let irec = formData.iso;
    let trec = formData.resolve;

    if (trec.includes('(')) {
      const p = parseRec(trec, formData.iso);
      trec = p.t;
      irec = p.irec;
    }

    const dur = computeDur(formData.iso, formData.mulai, irec, trec);
    
    const d = new Date(formData.iso + 'T00:00:00');
    const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const tglStr = String(d.getDate()).padStart(2, '0') + '-' + mon[d.getMonth()] + '-' + String(d.getFullYear()).slice(2);
    
    const payload = {
      ...formData,
      tgl: tglStr,
      resolve: trec,
      iso_resolve: irec,
      dur_min: dur,
      rca_label: RCALABEL[formData.rca_key]
    };

    onSave(payload);
    onClose();
  };

  let previewDur = '?';
  if (formData.iso && formData.mulai && formData.resolve) {
    let irec = formData.iso;
    let trec = formData.resolve;
    if (trec.includes('(')) {
      const p = parseRec(trec, formData.iso);
      trec = p.t;
      irec = p.irec;
    }
    const d = computeDur(formData.iso, formData.mulai, irec, trec);
    previewDur = fmtDur(d) + ` (${d} mnt)`;
  }

  return (
    <div className="modal-overlay open">
      <div className="modal">
        <div className="modal-hd">
          <h3>{editingData ? 'Edit Insiden' : 'Input Insiden Baru'}</h3>
          <button className="x" onClick={onClose}><X size={20}/></button>
        </div>
        <div className="modal-body">
          <div className="frow">
            <div>
              <label>Tgl Insiden <span className="req">*</span></label>
              <input type="date" name="iso" value={formData.iso || ''} onChange={handleChange} required />
            </div>
            <div>
              <label>Kategori Layanan <span className="req">*</span></label>
              <input type="text" name="kat" placeholder="Misal: Voice / Data / SMS..." value={formData.kat || ''} onChange={handleChange} required />
            </div>
          </div>
          
          <label style={{ marginTop: '14px' }}>Kronologi / Deskripsi <span className="req">*</span></label>
          <textarea name="kron" placeholder="Jelaskan insiden secara singkat..." value={formData.kron || ''} onChange={handleChange} required></textarea>
          
          <div className="frow" style={{ marginTop: '14px' }}>
            <div>
              <label>Severity <span className="req">*</span></label>
              <select name="sev" value={formData.sev || 'Minor'} onChange={handleChange}>
                {SEV.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label>Status RCA</label>
              <select name="rca_key" value={formData.rca_key || 'none'} onChange={handleChange}>
                {Object.keys(RCAKEY).map(k => (
                  <option key={RCAKEY[k]} value={RCAKEY[k]}>{k}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="frow" style={{ marginTop: '14px' }}>
            <div>
              <label>Waktu Mulai <span className="req">*</span></label>
              <input type="time" name="mulai" value={formData.mulai || ''} onChange={handleChange} required />
            </div>
            <div>
              <label>Waktu Resolve <span className="req">*</span></label>
              <input type="text" name="resolve" placeholder="HH:MM atau HH:MM (DD MMM)" value={formData.resolve || ''} onChange={handleChange} required />
              <div className="hint">Jika beda hari, gunakan format: <b>08:30 (12 Agu)</b></div>
            </div>
          </div>
          
          <div style={{ marginTop: '16px' }}>
            <label>Kalkulasi Durasi (Otomatis)</label>
            <div className="durprev">{previewDur}</div>
          </div>
          
          <label>Dampak</label>
          <textarea name="dampak" placeholder="Sebutkan site / area terdampak jika ada..." value={formData.dampak || ''} onChange={handleChange}></textarea>
          
          <label style={{ marginTop: '14px' }}>Action / Follow Up</label>
          <textarea name="action" placeholder="Tindakan perbaikan..." value={formData.action || ''} onChange={handleChange}></textarea>
        </div>
        <div className="modal-ft">
          <button className="btn" onClick={onClose}>Batal</button>
          <button className="btn primary" onClick={handleSave}>
            <Save size={15}/> Simpan Data
          </button>
        </div>
      </div>
    </div>
  );
}
