
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  RotateCcw, 
  Eye, 
  Edit2, 
  Trash2,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import './StockList.css';

const dummyStockData = [
  { id: 1, name: 'TMT Bar 12mm', stock: '1,250 kg', value: '₹ 85,625.00', status: 'Healthy' },
  { id: 2, name: 'Cement 53 Grade', stock: '320 bag', value: '₹ 1,31,200.00', status: 'Healthy' },
  { id: 3, name: 'Bricks (Red)', stock: '5,000 pcs', value: '₹ 31,000.00', status: 'Healthy' },
  { id: 4, name: 'Sand (Fine)', stock: '75 CFT', value: '₹ 63,750.00', status: 'Low Stock' },
  { id: 5, name: 'Aggregate 20mm', stock: '120 CFT', value: '₹ 1,38,000.00', status: 'Healthy' },
  { id: 6, name: 'Wire 18 SWG', stock: '85 kg', value: '₹ 6,120.00', status: 'Low Stock' },
  { id: 7, name: 'Paint (White)', stock: '42 ltr', value: '₹ 9,240.00', status: 'Healthy' },
  { id: 8, name: 'Shuttering Plywood', stock: '28 sheet', value: '₹ 37,800.00', status: 'Out of Stock' },
  { id: 9, name: 'Nails 2 Inch', stock: '15 kg', value: '₹ 1,170.00', status: 'Low Stock' },
  { id: 10, name: 'RMC Grade M20', stock: '18 cum', value: '₹ 93,600.00', status: 'Healthy' },
];

const StockList = ({ onAddEntry, onEditEntry, onViewEntry }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadge = (status) => {
    let className = 'status-badge ';
    if (status === 'Healthy') className += 'status-healthy';
    else if (status === 'Low Stock') className += 'status-low';
    else if (status === 'Out of Stock') className += 'status-out';

    return (
      <span className={className}>
        <span className="status-dot"></span>
        {status}
      </span>
    );
  };

  return (
    <div className="stock-container">
      <div className="stock-header-section">
        <div>
          <h2 className="stock-title">Stock List</h2>
          <p className="stock-subtitle">Manage and view all stock items.</p>
        </div>
        <button className="btn-add-stock" onClick={onAddEntry}>
          <Plus size={18} /> Add Stock Item
        </button>
      </div>

      <div className="stock-filters">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by material name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-actions">
          <button className="btn-filter">
            <Filter size={16} /> Filter
          </button>
          <button className="btn-reset">
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="stock-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Material Name <ChevronsUpDown size={14} className="sort-icon" /></th>
              <th>Current Stock <ChevronsUpDown size={14} className="sort-icon" /></th>
              <th>Stock Value <ChevronsUpDown size={14} className="sort-icon" /></th>
              <th>Stock Status <ChevronsUpDown size={14} className="sort-icon" /></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dummyStockData.map((item, index) => (
              <tr key={item.id}>
                <td>{item.id}.</td>
                <td className="fw-500">{item.name}</td>
                <td>{item.stock}</td>
                <td className="fw-500">{item.value}</td>
                <td>{getStatusBadge(item.status)}</td>
                <td>
                  <div className="actions-container">
                    <button className="action-btn view-btn" title="View Details" onClick={onViewEntry}>
                      <Eye size={16} />
                    </button>
                    <button className="action-btn edit-btn" title="Edit Item" onClick={onEditEntry}>
                      <Edit2 size={16} />
                    </button>
                    <button className="action-btn delete-btn" title="Delete Item">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-section">
        <div className="pagination-info">
          Showing 1 to 10 of 58 entries
        </div>
        <div className="pagination-controls">
          <button className="page-btn"><ChevronLeft size={16} /></button>
          <button className="page-btn active">1</button>
          <button className="page-btn">2</button>
          <button className="page-btn">3</button>
          <span className="page-dots">...</span>
          <button className="page-btn">6</button>
          <button className="page-btn"><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
};

export default StockList;
