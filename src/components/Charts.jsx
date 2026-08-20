import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController,
  DoughnutController
} from 'chart.js';
import { Doughnut, Bar, Chart } from 'react-chartjs-2';
import { SEV, SEVCOL, MON } from '../utils/helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController,
  DoughnutController
);

ChartJS.defaults.font.family = "'Plus Jakarta Sans',sans-serif";
ChartJS.defaults.font.size = 11;
ChartJS.defaults.color = '#5d6b78';

export function SeverityDonut({ data }) {
  const counts = { Kritis: 0, Mayor: 0, Minor: 0, Rendah: 0 };
  data.forEach(r => { counts[r.sev] = (counts[r.sev] || 0) + 1; });

  const chartData = {
    labels: SEV,
    datasets: [{
      data: SEV.map(s => counts[s]),
      backgroundColor: SEV.map(s => SEVCOL[s]),
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const options = {
    maintainAspectRatio: false,
    cutout: '58%',
    plugins: {
      legend: {
        position: 'right',
        labels: { boxWidth: 10, boxHeight: 10, padding: 9, font: { size: 11 } }
      }
    }
  };

  return <Doughnut data={chartData} options={options} />;
}

export function TrendChart({ data, monthsPresent }) {
  const per = monthsPresent.map(ym => {
    const g = data.filter(r => r.iso.slice(0, 7) === ym);
    const c = {};
    SEV.forEach(s => c[s] = g.filter(r => r.sev === s).length);
    const dt = g.reduce((a, r) => a + (r.dur_min || 0), 0) / 60;
    return { label: MON[+ym.slice(5, 7) - 1], c, dt: +dt.toFixed(1) };
  });

  const labels = per.map(x => x.label);
  const datasets = SEV.map(s => ({
    type: 'bar',
    label: s,
    data: per.map(x => x.c[s]),
    backgroundColor: SEVCOL[s],
    stack: 'sev',
    borderRadius: 3,
    maxBarThickness: 38
  }));

  datasets.push({
    type: 'line',
    label: 'Durasi total (jam)',
    data: per.map(x => x.dt),
    borderColor: '#0B3C5D',
    backgroundColor: 'rgba(11,60,93,.08)',
    borderWidth: 2,
    tension: 0.35,
    fill: true,
    pointRadius: 3,
    pointBackgroundColor: '#0B3C5D',
    yAxisID: 'y1'
  });

  const chartData = { labels, datasets };

  const options = {
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, boxHeight: 12, padding: 12 } } },
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: { stacked: true, beginAtZero: true, position: 'left', title: { display: true, text: 'insiden' }, grid: { color: '#eef2f6' }, ticks: { precision: 0 } },
      y1: { beginAtZero: true, position: 'right', title: { display: true, text: 'jam' }, grid: { display: false } }
    }
  };

  return <Chart type="bar" data={chartData} options={options} />;
}

const CATEGORY_COLORS = [
  '#E74C3C', // merah
  '#3498DB', // biru
  '#2ECC71', // hijau
  '#F39C12', // kuning emas
  '#9B59B6', // ungu
  '#1ABC9C', // teal
  '#E67E22', // oranye
  '#34495E', // abu gelap
  '#16A085', // hijau tua
  '#D35400', // oranye tua
  '#8E44AD', // ungu tua
  '#2980B9', // biru medium
  '#27AE60', // hijau emerald
  '#C0392B', // merah tua
  '#F1C40F', // kuning cerah
];

export function CategoryBar({ data }) {
  const cc = {};
  data.forEach(r => cc[r.kat] = (cc[r.kat] || 0) + 1);
  const arr = Object.entries(cc).sort((a, b) => b[1] - a[1]);

  const colors = arr.map((_, i) => CATEGORY_COLORS[i % CATEGORY_COLORS.length]);

  const chartData = {
    labels: arr.map(x => x[0]),
    datasets: [{
      data: arr.map(x => x[1]),
      backgroundColor: colors,
      borderRadius: 6,
      barThickness: 18,
      borderSkipped: false
    }]
  };

  const options = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 10,
        cornerRadius: 8,
        titleFont: { size: 12, weight: '600' },
        bodyFont: { size: 11 }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: '#eef2f6', drawBorder: false },
        ticks: { precision: 0, font: { size: 11 } }
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 11, weight: '500' } }
      }
    }
  };

  return <Bar data={chartData} options={options} />;
}

export function DurationBar({ data }) {
  const g = {};
  SEV.forEach(s => g[s] = []);
  data.forEach(r => { if (g[r.sev]) g[r.sev].push(r.dur_min || 0); });
  const avg = SEV.map(s => g[s].length ? Math.round(g[s].reduce((a, b) => a + b, 0) / g[s].length) : 0);

  const chartData = {
    labels: SEV,
    datasets: [{
      data: avg,
      backgroundColor: SEV.map(s => SEVCOL[s]),
      borderRadius: 4,
      barThickness: 26
    }]
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: c => c.raw + ' mnt' } }
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: '#eef2f6' }, title: { display: true, text: 'menit' } }
    }
  };

  return <Bar data={chartData} options={options} />;
}
