import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Calendar, 
  ChevronDown, 
  FilterX,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown
} from 'lucide-react';
import './LaborManagement.css';

const initialLaborData = [
  { id: 1, date: '21 May 2025', supervisor: 'Ramesh Patel', types: ['Grinding', 'Kabadu'], weight: '2,450 Kg', amount: '₹ 1,24,560', deductions: '₹ 4,230', payable: '₹ 1,10,340' },
  { id: 2, date: '20 May 2025', supervisor: 'Mahesh Kumar', types: ['Grinding', 'Patakadku'], weight: '2,180 Kg', amount: '₹ 1,02,350', deductions: '₹ 3,500', payable: '₹ 98,850' },
  { id: 3, date: '19 May 2025', supervisor: 'Sanjay Singh', types: ['Kabadu', 'Patakadku'], weight: '1,950 Kg', amount: '₹ 92,780', deductions: '₹ 2,880', payable: '₹ 89,900' },
  { id: 4, date: '18 May 2025', supervisor: 'Ramesh Patel', types: ['Grinding'], weight: '2,320 Kg', amount: '₹ 1,08,230', deductions: '₹ 3,920', payable: '₹ 1,04,310' },
  { id: 5, date: '17 May 2025', supervisor: 'Mahesh Kumar', types: ['Grinding', 'Kabadu', 'Patakadku'], weight: '2,650 Kg', amount: '₹ 1,28,640', deductions: '₹ 4,560', payable: '₹ 1,24,080' },
  { id: 6, date: '16 May 2025', supervisor: 'Sanjay Singh', types: ['Kabadu'], weight: '1,780 Kg', amount: '₹ 84,560', deductions: '₹ 2,450', payable: '₹ 82,110' },
  { id: 7, date: '15 May 2025', supervisor: 'Ramesh Patel', types: ['Grinding', 'Patakadku'], weight: '2,150 Kg', amount: '₹ 1,01,230', deductions: '₹ 3,310', payable: '₹ 97,920' },
];

const getTypeColor = (type) => {
  switch (type) {
    case 'Grinding': return 'type-green';
    case 'Kabadu': return 'type-blue';
    case 'Patakadku': return 'type-orange';
    default: return '';
  }
};

const LaborManagement = ({ onAddEntry, onEditEntry, onViewEntry }) => {
  const [data, setData] = useState(initialLaborData);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      setData(data.filter(row => row.id !== id));
    }
  };

  return (
    <div className="lm-container">
      <div className="lm-header-section">
        <div>
          <h2 className="lm-title">Labor Entries</h2>
          <p className="lm-subtitle">View and manage all labor entries.</p>
        </div>
        <button className="btn-add-labor" onClick={onAddEntry}>
          <Plus size={18} /> Add Labor Entry
        </button>
      </div>

      <div className="lm-filters">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search by Supervisor / Date / Work Type" />
        </div>
        
        <div className="date-range-box">
          <Calendar size={18} className="date-icon" />
          <input type="text" placeholder="From Date" className="date-input" />
          <span className="date-separator">→</span>
          <input type="text" placeholder="To Date" className="date-input" />
        </div>

        <div className="dropdown-box">
          <span>All Supervisors</span>
          <ChevronDown size={16} />
        </div>

        <div className="dropdown-box">
          <span>All Work Types</span>
          <ChevronDown size={16} />
        </div>

        <button className="btn-clear-filters">
          <FilterX size={16} /> Clear Filters
        </button>
      </div>

      <div className="table-container">
        <table className="lm-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Date <ArrowUpDown size={14} className="sort-icon" /></th>
              <th>Supervisor <ArrowUpDown size={14} className="sort-icon" /></th>
              <th>Work Types <ArrowUpDown size={14} className="sort-icon" /></th>
              <th>Total Weight <ArrowUpDown size={14} className="sort-icon" /></th>
              <th>Total Amount <ArrowUpDown size={14} className="sort-icon" /></th>
              <th>Deductions <ArrowUpDown size={14} className="sort-icon" /></th>
              <th>Payable Amount <ArrowUpDown size={14} className="sort-icon" /></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td className="fw-500">{row.date}</td>
                <td className="fw-500">{row.supervisor}</td>
                <td>
                  <div className="types-container">
                    {row.types.map(t => (
                      <span key={t} className={`type-badge ${getTypeColor(t)}`}>{t}</span>
                    ))}
                  </div>
                </td>
                <td className="fw-500">{row.weight}</td>
                <td className="fw-500">{row.amount}</td>
                <td className="fw-500">{row.deductions}</td>
                <td className="fw-600 text-green">{row.payable}</td>
                <td>
                  <div className="actions-container">
                    <button className="action-btn view-btn" title="View" onClick={() => onViewEntry(row.id)}><Eye size={16} /></button>
                    <button className="action-btn edit-btn" title="Edit" onClick={() => onEditEntry(row.id)}><Edit size={16} /></button>
                    <button className="action-btn delete-btn" title="Delete" onClick={() => handleDelete(row.id)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-section">
        <div className="pagination-info">
          Showing 1 to 7 of 86 entries
        </div>
        <div className="pagination-controls">
          <button className="page-btn">&lt;</button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <span className="page-dots">...</span>
          <button className="page-btn">9</button>
          <button className="page-btn">&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default LaborManagement;
