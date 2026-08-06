
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
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
import Loader from './Loader';
import { apiFetch } from '../utils/api';
import CustomSelect from './common/CustomSelect';
import './StockList.css';

const StockList = ({ onAddEntry, onEditEntry, onViewEntry }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchStocks();
  }, []);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/stocks');
      const json = await res.json();
      if (json.success) {
        setStocks(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch stocks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStock = async (stockId) => {
    if (!window.confirm("Are you sure you want to delete this stock entry?")) return;
    
    try {
      const res = await apiFetch(`/stocks/${stockId}`, { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(json.message || 'Stock entry deleted successfully');
        setStocks(stocks.filter(s => s.id !== stockId));
      } else {
        toast.error('Failed to delete: ' + (json.detail || 'Unknown error'));
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Connection error while deleting.");
    }
  };

  const getStockStatus = (quantity) => {
    const qty = Number(quantity);
    if (qty === 0) return 'Out of Stock';
    if (qty < 150) return 'Low Stock';
    return 'Available';
  };

  const filteredStocks = stocks.filter(stock => {
    const term = searchTerm.toLowerCase();
    const status = getStockStatus(stock.quantity);
    
    if (statusFilter && status !== statusFilter) return false;
    
    if (!term) return true;
    
    const quantityStr = `${stock.quantity} ${stock.unit}`.toLowerCase();
    
    return (
      (stock.materialName && stock.materialName.toLowerCase().includes(term)) ||
      quantityStr.includes(term) ||
      status.toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  const paginatedStocks = filteredStocks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const getStatusBadge = (status) => {
    let className = 'status-badge ';
    if (status === 'Healthy' || status === 'Available') className += 'status-healthy';
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
      <div className="stock-card">
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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="filter-actions" style={{ position: 'relative' }} ref={filterRef}>
          <button className="btn-filter" onClick={() => setShowFilterDropdown(!showFilterDropdown)}>
            <Filter size={16} /> Filter
          </button>
          
          {showFilterDropdown && (
            <div style={{ position: 'absolute', top: '110%', right: '90px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', zIndex: 50, width: '220px' }}>
              <div style={{ marginBottom: '0.75rem', fontWeight: '600', fontSize: '0.9rem', color: '#1e293b' }}>Filter by Status</div>
              <CustomSelect
                name="statusFilter"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                options={[
                  { value: "", label: "All Statuses" },
                  { value: "Available", label: "Available" },
                  { value: "Low Stock", label: "Low Stock" },
                  { value: "Out of Stock", label: "Out of Stock" }
                ]}
              />
            </div>
          )}

          <button className="btn-reset" onClick={() => {
            setSearchTerm('');
            setStatusFilter('');
            setShowFilterDropdown(false);
            setCurrentPage(1);
          }}>
            <RotateCcw size={16} /> Reset
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="stock-table">
          <thead>
            <tr>
              <th className="text-center">#</th>
              <th>Material Name</th>
              <th className="text-center">Current Stock</th>
              <th className="text-center">Stock Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{padding: '2rem'}}><Loader text="Loading stocks..." /></td></tr>
            ) : (
              <>
                {paginatedStocks.length === 0 ? (
                  <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem', color: '#64748B'}}>No stocks found.</td></tr>
                ) : (
                  paginatedStocks.map((item, index) => (
                    <tr key={item.id}>
                      <td className="text-center">{(currentPage - 1) * itemsPerPage + index + 1}.</td>
                      <td className="fw-500">{item.materialName}</td>
                      <td className="text-center">{item.quantity} {item.unit}</td>
                      <td className="text-center">{getStatusBadge(getStockStatus(item.quantity))}</td>
                      <td className="text-center">
                        <div className="actions-container">
                          <button className="action-btn view-btn" title="View Details" onClick={() => onViewEntry(item)}>
                            <Eye size={16} />
                          </button>
                          <button className="action-btn edit-btn" title="Edit Item" onClick={() => onEditEntry(item)}>
                            <Edit2 size={16} />
                          </button>
                          <button className="action-btn delete-btn" title="Delete Item" onClick={() => handleDeleteStock(item.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                {/* Filler rows to maintain constant table height */}
                {Array.from({ length: Math.max(0, itemsPerPage - (paginatedStocks.length === 0 ? 1 : paginatedStocks.length)) }).map((_, index) => (
                  <tr key={`filler-${index}`} className="filler-row">
                    <td colSpan="5" style={{ padding: '1.25rem', border: 'none' }}>&nbsp;</td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination outside table container */}
      <div className="pagination-section" style={{ padding: '1rem 0' }}>
        <div className="pagination-info">
          Showing {filteredStocks.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredStocks.length)} of {filteredStocks.length} entries
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
      </div>
    </div>
  );
};

export default StockList;
