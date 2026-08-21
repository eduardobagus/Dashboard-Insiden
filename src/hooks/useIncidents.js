import { useState, useEffect, useMemo, useCallback } from 'react';
import { uid } from '../utils/helpers';
import * as api from '../lib/api';

export function useIncidents() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [filterSev, setFilterSev] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch from API on mount
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const incidents = await api.fetchIncidents();
      setData(incidents || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const addIncident = async (incident) => {
    try {
      const created = await api.createIncident(incident);
      setData(prev => [...prev, created]);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const updateIncident = async (id, updated) => {
    try {
      const result = await api.updateIncident(id, updated);
      setData(prev => prev.map(item => item.id === id ? { ...item, ...result } : item));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const deleteIncident = async (id) => {
    try {
      await api.deleteIncident(id);
      setData(prev => prev.filter(item => item.id !== id));
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const resetData = async () => {
    try {
      setLoading(true);
      // We need seed.json data for this. Since we removed the import to keep this clean,
      // we'll fetch it from the API's seed endpoint assuming we pass the seed array.
      // Wait, the API requires the seed data array. Let's dynamically import it here.
      const seedData = (await import('../data/seed.json')).default;
      await api.seedIncidents(seedData);
      await fetchData();
      return true;
    } catch (err) {
      console.error(err);
      setLoading(false);
      return false;
    }
  };

  const importData = async (newData) => {
    try {
      setLoading(true);
      await api.seedIncidents(newData);
      await fetchData();
      return true;
    } catch (err) {
      console.error(err);
      setLoading(false);
      return false;
    }
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
    importData,
    loading,
    error,
    fetchData
  };
}
