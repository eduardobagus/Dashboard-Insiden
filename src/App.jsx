import React, { useState } from 'react';
import Header from './components/Header';
import Controls from './components/Controls';
import KPICards from './components/KPICards';
import { SeverityDonut, TrendChart, CategoryBar, DurationBar } from './components/Charts';
import Toolbar from './components/Toolbar';
import Table from './components/Table';
import IncidentModal from './components/IncidentModal';
import ConfirmModal from './components/ConfirmModal';
import AlertModal from './components/AlertModal';
import { useIncidents } from './hooks/useIncidents';

export default function App() {
  const {
    data,
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
  } = useIncidents();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ message: '', action: null });

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');

  const showAlert = (msg) => {
    setAlertMsg(msg);
    setAlertOpen(true);
  };

  const handleAddClick = () => {
    setEditingData(null);
    setModalOpen(true);
  };

  const handleEditClick = (incident) => {
    setEditingData(incident);
    setModalOpen(true);
  };

  const showConfirm = (message, action) => {
    setConfirmConfig({ message, action });
    setConfirmOpen(true);
  };

  const handleDeleteClick = (id) => {
    showConfirm('Anda yakin ingin menghapus data ini?', () => deleteIncident(id));
  };

  const handleConfirmAction = () => {
    if (confirmConfig.action) {
      confirmConfig.action();
    }
    setConfirmOpen(false);
  };

  const handleSaveModal = async (data) => {
    let success = false;
    if (editingData) {
      success = await updateIncident(editingData.id, data);
    } else {
      success = await addIncident(data);
    }
    
    if (success) {
      showAlert('Data berhasil disimpan!');
    } else {
      showAlert('Terjadi kesalahan saat menyimpan data.');
    }
  };

  if (loading && !data.length) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #0052cc', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '16px', color: '#555' }}>Memuat data dari server...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <>
      <Header dateRange={dateRange} />
      
      <Controls 
        dateRange={dateRange} 
        setDateRange={setDateRange} 
        MIND={MIND} 
        MAXD={MAXD} 
        monthsPresent={monthsPresent} 
      />

      <div className="wrap">
        <KPICards viewData={filteredView} />

        <div className="grid g-trend">
          <div className="panel">
            <div className="ph">
              <div>
                <h2>Distribusi Severity</h2>
                <div className="cap">Komposisi berdasarkan dampak insiden</div>
              </div>
            </div>
            <div className="chartbox sm">
              <SeverityDonut data={filteredView} />
            </div>
          </div>
          
          <div className="panel">
            <div className="ph">
              <div>
                <h2><span className="tick"></span> Tren Insiden per Bulan</h2>
                <div className="cap">Berdasarkan severity &amp; durasi outage</div>
              </div>
            </div>
            <div className="chartbox sm">
              <TrendChart data={filteredView} monthsPresent={monthsPresent} />
            </div>
          </div>
        </div>

        <div className="grid g-two section-gap">
          <div className="panel">
            <div className="ph">
              <h2>Top Kategori Layanan</h2>
            </div>
            <div className="chartbox">
              <CategoryBar data={filteredView} />
            </div>
          </div>
          
          <div className="panel">
            <div className="ph">
              <h2>Rata-rata Durasi (menit)</h2>
            </div>
            <div className="chartbox">
              <DurationBar data={filteredView} />
            </div>
          </div>
        </div>

        <div className="panel section-gap">
          <div className="ph">
            <h2>Log Insiden Detail</h2>
          </div>
          
          <Toolbar 
            filterSev={filterSev}
            setFilterSev={setFilterSev}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filteredView={filteredView}
            allData={data}
            onAdd={handleAddClick}
            onImport={importData}
            onRefresh={() => {
              showAlert('Memperbarui data...');
              fetchData();
            }}
            showAlert={showAlert}
          />
          
          <Table 
            data={filteredView} 
            onEdit={handleEditClick} 
            onDelete={handleDeleteClick} 
          />
        </div>

        <div className="foot">
          <b>Dashboard Monitoring Insiden</b> — TDR10 Division<br/>
          Internal use only. Data tersimpan secara persisten di database server.
          {error && <div style={{ color: 'red', marginTop: '10px' }}>Error sinkronisasi: {error}</div>}
        </div>
      </div>

      <IncidentModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={handleSaveModal}
        editingData={editingData}
        showAlert={showAlert}
      />

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmAction}
        message={confirmConfig.message}
      />

      <AlertModal
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        message={alertMsg}
      />
    </>
  );
}
