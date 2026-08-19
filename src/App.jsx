import React, { useState } from 'react';
import Header from './components/Header';
import Controls from './components/Controls';
import KPICards from './components/KPICards';
import { SeverityDonut, TrendChart, CategoryBar, DurationBar } from './components/Charts';
import Toolbar from './components/Toolbar';
import Table from './components/Table';
import IncidentModal from './components/IncidentModal';
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
    importData
  } = useIncidents();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);

  const handleAddClick = () => {
    setEditingData(null);
    setModalOpen(true);
  };

  const handleEditClick = (incident) => {
    setEditingData(incident);
    setModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    if (window.confirm('Yakin ingin menghapus insiden ini?')) {
      deleteIncident(id);
    }
  };

  const handleSaveModal = (data) => {
    if (editingData) {
      updateIncident(editingData.id, data);
    } else {
      addIncident(data);
    }
  };

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
        <KPICards viewData={view} />

        <div className="grid g-trend">
          <div className="panel">
            <div className="ph">
              <div>
                <h2>Distribusi Severity</h2>
                <div className="cap">Komposisi berdasarkan dampak insiden</div>
              </div>
            </div>
            <div className="chartbox sm">
              <SeverityDonut data={view} />
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
              <TrendChart data={view} monthsPresent={monthsPresent} />
            </div>
          </div>
        </div>

        <div className="grid g-two section-gap">
          <div className="panel">
            <div className="ph">
              <h2>Top Kategori Layanan</h2>
            </div>
            <div className="chartbox">
              <CategoryBar data={view} />
            </div>
          </div>
          
          <div className="panel">
            <div className="ph">
              <h2>Rata-rata Durasi (menit)</h2>
            </div>
            <div className="chartbox">
              <DurationBar data={view} />
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
            onReset={resetData}
            onImport={importData}
          />
          
          <Table 
            data={filteredView} 
            onEdit={handleEditClick} 
            onDelete={handleDeleteClick} 
          />
        </div>

        <div className="foot">
          <b>Dashboard Monitoring Insiden</b> — TDR10 Division<br/>
          Internal use only. Data displayed is based on local storage.
        </div>
      </div>

      <IncidentModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={handleSaveModal}
        editingData={editingData}
      />
    </>
  );
}
