import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import './CustomDatePicker.css';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const parseDate = (str) => {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d) ? null : d;
};

const toYMD = (date) => {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const formatDisplay = (str) => {
  if (!str) return '';
  const d = new Date(str);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const isSameDay = (a, b) => {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
};

const isToday = (date) => isSameDay(date, new Date());

const CustomDatePicker = ({ value, onChange, placeholder = 'Select date', label }) => {
  const [open, setOpen] = useState(false);
  const selected = parseDate(value);
  const [viewYear, setViewYear] = useState((selected || new Date()).getFullYear());
  const [viewMonth, setViewMonth] = useState((selected || new Date()).getMonth());
  const wrapRef = useRef(null);

  // Update view when value changes externally
  useEffect(() => {
    if (selected) {
      setViewYear(selected.getFullYear());
      setViewMonth(selected.getMonth());
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const getDays = () => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();
    const cells = [];

    // Prev month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: daysInPrev - i, month: 'prev' });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, month: 'current' });
    }
    // Next month leading days
    const remaining = 42 - cells.length;
    for (let d = 1; d <= remaining; d++) {
      cells.push({ day: d, month: 'next' });
    }
    return cells;
  };

  const handleSelect = (cell) => {
    if (cell.month !== 'current') return;
    const date = new Date(viewYear, viewMonth, cell.day);
    onChange(toYMD(date));
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
  };

  const cells = getDays();

  return (
    <div className="cdp-wrapper" ref={wrapRef}>
      <div
        className={`cdp-trigger ${open ? 'cdp-trigger--open' : ''} ${value ? 'cdp-trigger--filled' : ''}`}
        onClick={() => setOpen(o => !o)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setOpen(o => !o)}
      >
        <Calendar size={14} className="cdp-icon" />
        <div className="cdp-text-area">
          {label && <span className="cdp-label">{label}</span>}
          <span className={`cdp-display ${!value ? 'cdp-display--placeholder' : ''}`}>
            {value ? formatDisplay(value) : placeholder}
          </span>
        </div>
        {value && (
          <button className="cdp-clear" onClick={handleClear} title="Clear date">
            <X size={12} />
          </button>
        )}
      </div>

      {open && (
        <div className="cdp-popup">
          {/* Header */}
          <div className="cdp-header">
            <button className="cdp-nav-btn" onClick={prevMonth}>
              <ChevronLeft size={16} />
            </button>
            <span className="cdp-month-year">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button className="cdp-nav-btn" onClick={nextMonth}>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day Labels */}
          <div className="cdp-days-header">
            {DAYS.map(d => <span key={d} className="cdp-day-name">{d}</span>)}
          </div>

          {/* Calendar Grid */}
          <div className="cdp-grid">
            {cells.map((cell, i) => {
              const cellDate = cell.month === 'current'
                ? new Date(viewYear, viewMonth, cell.day)
                : null;
              const isSelected = cellDate && isSameDay(cellDate, selected);
              const isTodayCell = cellDate && isToday(cellDate);

              return (
                <button
                  key={i}
                  className={[
                    'cdp-cell',
                    cell.month !== 'current' ? 'cdp-cell--other' : '',
                    isSelected ? 'cdp-cell--selected' : '',
                    isTodayCell && !isSelected ? 'cdp-cell--today' : '',
                  ].join(' ')}
                  onClick={() => handleSelect(cell)}
                  tabIndex={cell.month === 'current' ? 0 : -1}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="cdp-footer">
            <button className="cdp-today-btn" onClick={() => {
              const now = new Date();
              setViewMonth(now.getMonth());
              setViewYear(now.getFullYear());
              onChange(toYMD(now));
              setOpen(false);
            }}>
              Today
            </button>
            {value && (
              <button className="cdp-clear-btn" onClick={() => { onChange(''); setOpen(false); }}>
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDatePicker;
