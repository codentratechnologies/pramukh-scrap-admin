import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Search, 
  Plus, 
  Calendar, 
  ChevronDown, 
  FilterX,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  Download
} from 'lucide-react';
import Loader from './Loader';
import { apiFetch } from '../utils/api';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [supervisorFilter, setSupervisorFilter] = useState('');
  const [workTypeFilter, setWorkTypeFilter] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/labor');
      const json = await res.json();
      if (json.success) {
        // Transform backend data to table format
        const formattedData = json.data.map(entry => {
          // Extract unique work types across all employees
          const allTypes = new Set();
          entry.employees?.forEach(emp => {
            emp.workTypes?.forEach(wt => allTypes.add(wt.type));
          });

          return {
            id: entry.id,
            rawDate: entry.entryDate,
            date: new Date(entry.entryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            supervisor: entry.supervisorName,
            types: Array.from(allTypes),
            weight: entry.grandTotalWeight,
            amount: entry.grandTotalAmount,
            deductions: entry.deductions,
            payable: entry.payableAmount
          };
        });
        setData(formattedData);
      }
    } catch (err) {
      console.error("Failed to fetch labor entries:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setEntryToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!entryToDelete) return;
    try {
      const res = await apiFetch(`/labor/${entryToDelete}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        setData(data.filter(row => row.id !== entryToDelete));
        setDeleteModalOpen(false);
        setEntryToDelete(null);
        toast.success('Labor entry deleted successfully');
      } else {
        toast.error('Failed to delete entry: ' + (json.detail || 'Unknown error'));
      }
    } catch (err) {
      console.error("Failed to delete labor entry:", err);
      toast.error("Connection error while deleting entry.");
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setEntryToDelete(null);
  };

  const uniqueSupervisors = [...new Set(data.map(item => item.supervisor).filter(Boolean))];
  const uniqueWorkTypes = [...new Set(data.flatMap(item => item.types || []).filter(Boolean))];

  const filteredData = data.filter(row => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || (
      (row.supervisor && row.supervisor.toLowerCase().includes(term)) ||
      (row.date && row.date.toLowerCase().includes(term)) ||
      (row.types && row.types.some(t => t.toLowerCase().includes(term)))
    );

    const matchesSupervisor = !supervisorFilter || row.supervisor === supervisorFilter;
    const matchesWorkType = !workTypeFilter || (row.types && row.types.includes(workTypeFilter));

    let matchesDate = true;
    if (fromDate || toDate) {
      const rowDateObj = new Date(row.rawDate || row.date);
      if (fromDate) {
        const fromObj = new Date(fromDate);
        if (rowDateObj < fromObj) matchesDate = false;
      }
      if (toDate) {
        const toObj = new Date(toDate);
        toObj.setHours(23, 59, 59, 999);
        if (rowDateObj > toObj) matchesDate = false;
      }
    }

    return matchesSearch && matchesSupervisor && matchesWorkType && matchesDate;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
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
          <input 
            type="text" 
            placeholder="Search by Supervisor / Date / Work Type" 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        
        <div className="date-range-box">
          <Calendar size={18} className="date-icon" />
          <DatePicker
            selected={fromDate ? new Date(fromDate) : null}
            onChange={(date) => { setFromDate(date ? date.toISOString() : ''); setCurrentPage(1); }}
            placeholderText="From Date"
            className="date-input"
            dateFormat="dd MMM yyyy"
          />
          <span className="date-separator">→</span>
          <DatePicker
            selected={toDate ? new Date(toDate) : null}
            onChange={(date) => { setToDate(date ? date.toISOString() : ''); setCurrentPage(1); }}
            placeholderText="To Date"
            className="date-input"
            dateFormat="dd MMM yyyy"
          />
        </div>

        <div className="dropdown-box filter-dropdown">
          <select 
            className="filter-select"
            value={supervisorFilter}
            onChange={(e) => { setSupervisorFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All Supervisors</option>
            {uniqueSupervisors.map(sup => (
              <option key={sup} value={sup}>{sup}</option>
            ))}
          </select>
          <ChevronDown size={16} className="select-icon" />
        </div>

        <div className="dropdown-box filter-dropdown">
          <select 
            className="filter-select"
            value={workTypeFilter}
            onChange={(e) => { setWorkTypeFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All Work Types</option>
            {uniqueWorkTypes.map(wt => (
              <option key={wt} value={wt}>{wt}</option>
            ))}
          </select>
          <ChevronDown size={16} className="select-icon" />
        </div>

        <button 
          className="btn-clear-filters" 
          onClick={() => {
            setSearchTerm('');
            setFromDate('');
            setToDate('');
            setSupervisorFilter('');
            setWorkTypeFilter('');
            setCurrentPage(1);
          }}
        >
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
            {loading ? (
              <tr><td colSpan="9" style={{padding: '2rem'}}><Loader text="Loading labor entries..." /></td></tr>
            ) : (
              <>
                {paginatedData.length === 0 ? (
                  <tr><td colSpan="9" style={{textAlign: 'center', padding: '2rem', color: '#64748B'}}>No labor entries found.</td></tr>
                ) : (
                  paginatedData.map((row, index) => (
                    <tr key={row.id}>
                      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="fw-500">{row.date}</td>
                      <td className="fw-500">{row.supervisor}</td>
                      <td>
                        <div className="types-container">
                          {row.types.map(t => (
                            <span key={t} className={`type-badge ${getTypeColor(t)}`}>{t}</span>
                          ))}
                        </div>
                      </td>
                      <td className="fw-500">{row.weight?.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Kg</td>
                      <td className="fw-500">₹ {row.amount?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td className="fw-500">₹ {row.deductions?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td className="fw-600 text-green">₹ {row.payable?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                      <td>
                        <div className="actions-container">
                          <button className="action-btn view-btn" title="View" onClick={() => onViewEntry(row.id)}><Eye size={16} /></button>
                          <button className="action-btn edit-btn" title="Edit" onClick={() => onEditEntry(row.id)}><Edit size={16} /></button>
                          <button className="action-btn delete-btn" title="Delete" onClick={() => handleDeleteClick(row.id)}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                {Array.from({ length: Math.max(0, itemsPerPage - (paginatedData.length === 0 ? 1 : paginatedData.length)) }).map((_, index) => (
                  <tr key={`filler-${index}`} className="filler-row">
                    <td colSpan="9" style={{ padding: '1.25rem', border: 'none' }}>&nbsp;</td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-section">
        <div className="pagination-info">
          Showing {filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
        </div>
        <div className="pagination-controls">
          <button className="page-btn" onClick={handlePrevPage} disabled={currentPage === 1}><ChevronLeft size={16} /></button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button 
              key={i+1} 
              className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          
          <button className="page-btn" onClick={handleNextPage} disabled={currentPage === totalPages || totalPages === 0}><ChevronRight size={16} /></button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="delete-modal-overlay">
          <div className="delete-modal-content">
            <div className="delete-modal-header">
              <div className="delete-modal-icon">
                <AlertTriangle size={24} />
              </div>
              <button className="close-modal-btn" onClick={cancelDelete}>
                <X size={20} />
              </button>
            </div>
            
            <h3 className="delete-modal-title">Delete Labor Entry</h3>
            <p className="delete-modal-text">
              Are you sure you want to delete this labor entry? This action cannot be undone and will permanently remove all associated work data.
            </p>
            
            <div className="delete-modal-actions">
              <button className="btn-secondary" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="btn-danger" onClick={confirmDelete}>
                Delete Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaborManagement;
