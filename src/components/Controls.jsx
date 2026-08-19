import React from 'react';
import { MON } from '../utils/helpers';

export default function Controls({ 
  dateRange, 
  setDateRange, 
  MIND, 
  MAXD, 
  monthsPresent 
}) {
  const handlePresetClick = (ym) => {
    if (ym === 'all') {
      setDateRange({ from: MIND, to: MAXD });
    } else {
      const y = +ym.slice(0, 4);
      const mo = +ym.slice(5, 7);
      setDateRange({
        from: `${ym}-01`,
        to: `${ym}-${String(new Date(y, mo, 0).getDate()).padStart(2, '0')}`
      });
    }
  };

  const isAllActive = dateRange.from === MIND && dateRange.to === MAXD;

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
      <div className="presets">
        <span 
          className={`pchip ${isAllActive ? 'active' : ''}`} 
          onClick={() => handlePresetClick('all')}
        >
          Semua
        </span>
        {monthsPresent.map(ym => {
          const isActive = dateRange.from.startsWith(ym) && !isAllActive;
          return (
            <span 
              key={ym}
              className={`pchip ${isActive ? 'active' : ''}`}
              onClick={() => handlePresetClick(ym)}
            >
              {MON[+ym.slice(5, 7) - 1]} {ym.slice(2, 4)}
            </span>
          );
        })}
      </div>
    </div>
  );
}
