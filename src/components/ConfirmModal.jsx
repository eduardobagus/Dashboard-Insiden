import React from 'react';
import { X, Trash2 } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay open">
      <div className="modal" style={{ maxWidth: '400px' }}>
        <div className="modal-hd">
          <h3>Konfirmasi Hapus</h3>
          <button className="x" onClick={onClose}><X size={20}/></button>
        </div>
        <div className="modal-body" style={{ padding: '24px 20px', textAlign: 'center', fontSize: '15px' }}>
          {message || 'Anda yakin ingin menghapus data ini?'}
        </div>
        <div className="modal-ft" style={{ justifyContent: 'center' }}>
          <button className="btn" onClick={onClose}>Batal</button>
          <button className="btn primary" style={{ backgroundColor: '#E74C3C', borderColor: '#E74C3C' }} onClick={onConfirm}>
            <Trash2 size={15}/> Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
