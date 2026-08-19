import React from 'react';
import { dshort } from '../utils/helpers';

export default function Header({ dateRange }) {
  return (
    <header>
      <div className="hd">
        <div>
          <div className="eyebrow">
            <span className="pulse"></span> MONITORING INSIDEN · LAYANAN TELKOMSEL (TDR10) · RTS × CNET
          </div>
          <h1>Dashboard Monitoring Insiden <span>— Severity &amp; Log</span></h1>
        </div>
        <div className="hd-right">
          Periode aktif<br/>
          <b>{dateRange.from ? `${dshort(dateRange.from)} — ${dshort(dateRange.to)} ${dateRange.to.slice(0,4)}` : '—'}</b>
        </div>
      </div>
    </header>
  );
}
