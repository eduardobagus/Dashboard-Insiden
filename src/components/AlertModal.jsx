import React from 'react';
import { X, Info } from 'lucide-react';

export default function AlertModal({ isOpen, onClose, message, title = "Informasi" }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay open" style={{ zIndex: 9999 }}>
      <div className="modal" style={{ maxWidth: '400px' }}>
        <div className="modal-hd">
          <h3><Info size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} /> {title}</h3>
          <button className="x" onClick={onClose}><X size={20}/></button>
        </div>
        <div className="modal-body" style={{ padding: '24px 20px', textAlign: 'center', fontSize: '15px' }}>
          {message}
        </div>
        <div className="modal-ft" style={{ justifyContent: 'center' }}>
          <button className="btn primary" onClick={onClose}>
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
