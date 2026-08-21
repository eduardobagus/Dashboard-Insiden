import React from 'react';

export default function Controls({ 
  dateRange, 
  setDateRange, 
  MIND, 
  MAXD 
}) {
  return (
    <div className="control">
      <div className="grp">
        <span className="glbl">Rentang</span>
        <input 
          type="date" 
          value={dateRange.from} 
          min={MIND} 
          max={MAXD}
          onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value || MIND }))}
        />
        <span className="dash">—</span>
        <input 
          type="date" 
          value={dateRange.to} 
          min={MIND} 
          max={MAXD}
          onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value || MAXD }))}
        />
      </div>
    </div>
  );
}
