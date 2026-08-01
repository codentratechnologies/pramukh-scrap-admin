import React from 'react';
import { 
  FileText, 
  ArrowLeft, 
  Box, 
  Banknote, 
  Calendar, 
  Clock, 
  ClipboardList, 
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown
} from 'lucide-react';
import './ViewStockEntry.css';

const ViewStockEntry = ({ onBack }) => {
  // Dummy data
  const materialData = {
    name: 'Copper Wire',
    description: 'High quality copper wire scrap used in recycling and melting.',
    currentStock: '450.5 kg',
    stockValue: '₹54,060.00',
    createdDate: '10-Oct-23',
    lastUpdated: '25-Oct-23 10:00 AM'
  };

  const auditLogData = [
    { id: 1, date: '25-Oct-23 10:00 AM', action: 'ADDED', quantity: '50.0 kg', remarks: 'Furnace melting' },
    { id: 2, date: '24-Oct-23 04:30 PM', action: 'REMOVED', quantity: '-20.0 kg', remarks: 'Damaged material removed' },
    { id: 3, date: '23-Oct-23 11:20 AM', action: 'ADDED', quantity: '100.0 kg', remarks: 'New stock purchase' },
    { id: 4, date: '20-Oct-23 03:15 PM', action: 'REMOVED', quantity: '-10.5 kg', remarks: 'Sample testing' },
    { id: 5, date: '18-Oct-23 09:45 AM', action: 'ADDED', quantity: '80.0 kg', remarks: 'Supplier delivery' },
    { id: 6, date: '15-Oct-23 02:10 PM', action: 'ADDED', quantity: '60.0 kg', remarks: 'Opening stock' },
  ];

  return (
    <div className="view-stock-container">
      <div className="view-stock-top-actions">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={18} /> Back to Stock List
        </button>
      </div>

      {/* Material Profile Section */}
      <div className="stock-section-card">
        <div className="view-section-header">
          <div className="header-left">
            <div className="header-icon-wrapper light-green-bg">
              <FileText className="header-icon green-icon" size={24} />
            </div>
            <div>
              <h2 className="section-title">Material Profile</h2>
              <p className="section-subtitle">Overview of the selected material.</p>
            </div>
          </div>
        </div>
        
        <div className="material-profile-grid">
          {/* Left Details */}
          <div className="profile-text-details">
            <div className="profile-row">
              <div className="profile-label">Material Name</div>
              <div className="profile-value fw-600 dark-text">{materialData.name}</div>
            </div>
            <div className="profile-row mt-4">
              <div className="profile-label">Description</div>
              <div className="profile-value">{materialData.description}</div>
            </div>
          </div>

          {/* Right Stat Cards */}
          <div className="profile-stat-cards">
            {/* Current Stock */}
            <div className="stat-info-card">
              <div className="stat-icon-circle green-light-bg">
                <Box size={20} className="green-icon" />
              </div>
              <div className="stat-text-area">
                <div className="stat-label">Current Stock</div>
                <div className="stat-value text-green">{materialData.currentStock}</div>
              </div>
            </div>

            {/* Stock Value */}
            <div className="stat-info-card">
              <div className="stat-icon-circle green-light-bg">
                <Banknote size={20} className="green-icon" />
              </div>
              <div className="stat-text-area">
                <div className="stat-label">Stock Value</div>
                <div className="stat-value">{materialData.stockValue}</div>
              </div>
            </div>

            {/* Created Date */}
            <div className="stat-info-card">
              <div className="stat-icon-circle gray-light-bg">
                <Calendar size={20} className="text-muted" />
              </div>
              <div className="stat-text-area">
                <div className="stat-label">Created Date</div>
                <div className="stat-value font-medium">{materialData.createdDate}</div>
              </div>
            </div>

            {/* Last Updated */}
            <div className="stat-info-card">
              <div className="stat-icon-circle gray-light-bg">
                <Clock size={20} className="text-muted" />
              </div>
              <div className="stat-text-area">
                <div className="stat-label">Last Updated</div>
                <div className="stat-value font-medium">{materialData.lastUpdated}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Log Section */}
      <div className="stock-section-card mt-4">
        <div className="view-section-header">
          <div className="header-left">
            <div className="header-icon-wrapper light-green-bg">
              <ClipboardList className="header-icon green-icon" size={24} />
            </div>
            <div>
              <h2 className="section-title">Audit Log</h2>
              <p className="section-subtitle">Chronological ledger of all stock adjustments.</p>
            </div>
          </div>
          <button className="btn-export">
            <Download size={18} className="green-icon" /> Export
          </button>
        </div>

        <div className="audit-table-container">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Action</th>
                <th>Quantity</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {auditLogData.map((log) => (
                <tr key={log.id}>
                  <td>{log.date}</td>
                  <td>
                    <span className={`action-badge ${log.action === 'ADDED' ? 'badge-added' : 'badge-removed'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.quantity}</td>
                  <td className="text-muted">{log.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="audit-pagination">
          <div className="pagination-text">Showing 1 to 6 of 12 entries</div>
          <div className="pagination-controls">
            <button className="page-nav-btn"><ChevronsLeft size={16} /></button>
            <button className="page-num-btn active">1</button>
            <button className="page-num-btn">2</button>
            <button className="page-num-btn">3</button>
            <span className="page-dots">...</span>
            <button className="page-nav-btn"><ChevronsRight size={16} /></button>
          </div>
          <div className="page-size-selector">
            <select className="size-select">
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
            </select>
            <ChevronDown size={14} className="size-chevron" />
          </div>
        </div>

      </div>
    </div>
  );
};

export default ViewStockEntry;
