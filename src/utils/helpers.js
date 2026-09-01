export const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export const SEV = ['Kritis', 'Mayor', 'Minor', 'Rendah'];
export const SEVCOL = { Kritis: '#C0392B', Mayor: '#E67E22', Minor: '#2E86C1', Rendah: '#6B7A8F' };
export const RCALABEL = { ada: 'RCA Ada', belum: 'RCA Belum', none: 'Tidak ada', planned: 'Planned', partial: 'Sebagian' };
export const RCAKEY = { 'Tidak ada': 'none', 'Ada': 'ada', 'Belum': 'belum', 'Planned': 'planned', 'Sebagian': 'partial' };
export const KATEGORI_LAYANAN = [
  'Final Status',
  'Callback Delay',
  'Final Status Delay & Pending',
  'Pending/Maintenance',
  'Planned Maintenance',
  'Monitoring',
  'Pending'
];

export const dshort = (iso) => {
  const d = new Date(iso + 'T00:00:00');
  return String(d.getDate()).padStart(2, '0') + ' ' + MON[d.getMonth()];
};

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export function fmtTgl(iso) {
  const d = new Date(iso + 'T00:00:00');
  return String(d.getDate()).padStart(2, '0') + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear();
}

export function fmtDur(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0 && m > 0) return h + 'j' + String(m).padStart(2, '0') + 'm';
  if (h > 0) return h + 'j';
  return m + 'm';
}

export function computeDur(isoS, tS, isoR, tR) {
  if (!tR) return null;
  const s = new Date(isoS + 'T' + tS + ':00');
  let e = new Date((isoR || isoS) + 'T' + tR + ':00');
  if (e < s) e = new Date(e.getTime() + 86400000);
  return Math.max(0, Math.round((e - s) / 60000));
}

export function recDisplay(isoS, isoR, tR) {
  if (!tR) return 'Belum resolve';
  if (isoR && isoR !== isoS && !tR.includes('(')) {
    const d = new Date(isoR + 'T00:00:00');
    return tR + ' (' + String(d.getDate()).padStart(2, '0') + ' ' + MON[d.getMonth()] + ')';
  }
  return tR;
}

export function parseRec(recStr, isoS) {
  const m = recStr && recStr.match(/(\d{1,2}:\d{2})/);
  let t = m ? m[1] : '';
  if (t && t.length === 4) t = '0' + t;
  let irec = isoS;
  const dm = recStr && recStr.match(/\((\d{1,2})\s+([A-Za-z]{3})/);
  if (dm) {
    const mi = MON.findIndex(x => x.toLowerCase() === dm[2].toLowerCase());
    if (mi >= 0) {
      const y = +isoS.slice(0, 4);
      irec = y + '-' + String(mi + 1).padStart(2, '0') + '-' + String(+dm[1]).padStart(2, '0');
    }
  }
  return { t, irec };
}

export function download(content, name, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
