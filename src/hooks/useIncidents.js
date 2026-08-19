import { useState, useEffect, useMemo } from 'react';
import seedData from '../data/seed.json';
import { uid } from '../utils/helpers';

const LSKEY = 'tsel_incidents_v1';

export function useIncidents() {
  const [data, setData] = useState(() => {
    try {
      const s = localStorage.getItem(LSKEY);
      if (s) {
        const a = JSON.parse(s);
        if (Array.isArray(a) && a.length) return a;
      }
    } catch (e) {}
    return seedData.map(x => ({ ...x, id: x.id || uid() }));
  });

  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [filterSev, setFilterSev] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Save to local storage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem(LSKEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }, [data]);

  // Derived arrays
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => 
      a.iso === b.iso ? (a.mulai || '').localeCompare(b.mulai || '') : a.iso.localeCompare(b.iso)
    ).map((r, i) => ({ ...r, no: i + 1 }));
  }, [data]);

  const { MIND, MAXD, monthsPresent } = useMemo(() => {
    if (sortedData.length === 0) return { MIND: '', MAXD: '', monthsPresent: [] };
    const isos = sortedData.map(r => r.iso);
    return {
      MIND: isos[0],
      MAXD: isos[isos.length - 1],
      monthsPresent: [...new Set(sortedData.map(r => r.iso.slice(0, 7)))].sort()
    };
  }, [sortedData]);

  // Initial setup for date range
  useEffect(() => {
    if (!dateRange.from && MIND) {
      setDateRange({ from: MIND, to: MAXD });
    }
  }, [MIND, MAXD, dateRange.from]);

  // Filtered view
  const view = useMemo(() => {
    if (!dateRange.from) return [];
    return sortedData.filter(r => r.iso >= dateRange.from && r.iso <= dateRange.to);
  }, [sortedData, dateRange]);

  const filteredView = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return view.filter(r => {
      if (filterSev !== 'all' && r.sev !== filterSev) return false;
      if (!q) return true;
      return [r.tgl, r.kat, r.kron, r.dampak, r.action].some(x => (x || '').toLowerCase().includes(q));
    });
  }, [view, filterSev, searchQuery]);

  const addIncident = (incident) => {
    setData(prev => [...prev, { ...incident, id: uid() }]);
  };

  const updateIncident = (id, updated) => {
    setData(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item));
  };

  const deleteIncident = (id) => {
    setData(prev => prev.filter(item => item.id !== id));
  };

  const resetData = () => {
    setData(seedData.map(x => ({ ...x, id: x.id || uid() })));
  };

  const importData = (newData) => {
    setData(newData);
  };

  return {
    data: sortedData,
    view,
    filteredView,
    MIND,
    MAXD,
    monthsPresent,
    dateRange,
    setDateRange,
    filterSev,
    setFilterSev,
    searchQuery,
    setSearchQuery,
    addIncident,
    updateIncident,
    deleteIncident,
    resetData,
    importData
  };
}
