import React from 'react';

export default function KPICards({ viewData }) {
  const counts = { Kritis: 0, Mayor: 0, Minor: 0, Rendah: 0 };
  let rcaBelum = 0;

  viewData.forEach(r => {
    counts[r.sev] = (counts[r.sev] || 0) + 1;
    if (r.rca_key === 'belum') rcaBelum++;
  });

  return (
    <div className="kpis">
      <div className="kpi">
        <div className="lbl">Total Insiden</div>
        <div className="val">{viewData.length || '–'}</div>
        <div className="sub">pada periode</div>
      </div>
      <div className="kpi k-crit">
        <div className="lbl">Kritis</div>
        <div className="val crit">{counts.Kritis || '–'}</div>
        <div className="sub">outage / gagal massal</div>
      </div>
      <div className="kpi k-mayor">
        <div className="lbl">Mayor</div>
        <div className="val mayor">{counts.Mayor || '–'}</div>
        <div className="sub">hold terkendali</div>
      </div>
      <div className="kpi k-minor">
        <div className="lbl">Minor</div>
        <div className="val minor">{counts.Minor || '–'}</div>
        <div className="sub">pending terurai cepat</div>
      </div>
      <div className="kpi k-rendah">
        <div className="lbl">Rendah</div>
        <div className="val rendah">{counts.Rendah || '–'}</div>
        <div className="sub">follow-up / maintenance</div>
      </div>
      <div className="kpi">
        <div className="lbl">RCA Belum Ditagih</div>
        <div className="val">{rcaBelum || '–'}</div>
        <div className="sub">perlu follow-up</div>
      </div>
    </div>
  );
}
