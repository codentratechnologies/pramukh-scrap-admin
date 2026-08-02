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
import * as XLSX from 'xlsx';
import './ViewStockEntry.css';

const ViewStockEntry = ({ stock, onBack }) => {
  const materialData = stock ? {
    name: stock.materialName || 'N/A',
    description: stock.description || 'No description provided.',
    currentStock: `${stock.quantity || 0} ${stock.unit || 'kg'}`,
    createdDate: stock.stockDate || 'N/A',
    lastUpdated: stock.createdAt ? new Date(stock.createdAt).toLocaleString() : 'N/A'
  } : {
    name: 'Loading...',
    description: '',
    currentStock: '',
    createdDate: '',
    lastUpdated: ''
  };

  const rawHistory = stock?.history || {};
  
  // Fallback for old entries without history table
  const defaultLog = { 
      id: 1, 
      date: stock?.createdAt ? new Date(stock.createdAt).toLocaleString() : (stock?.stockDate || 'N/A'), 
      action: 'ADDED', 
      quantity: `${stock?.quantity || 0} ${stock?.unit || 'kg'}`, 
      remarks: 'Initial stock entry' 
  };

  const auditLogData = Object.keys(rawHistory).length > 0
    ? Object.keys(rawHistory).map(key => ({
        id: key,
        date: new Date(rawHistory[key].date).toLocaleString(),
        rawDate: new Date(rawHistory[key].date).getTime(),
        action: rawHistory[key].action,
        quantity: `${rawHistory[key].action === 'REMOVED' ? '-' : '+'}${rawHistory[key].quantity} ${rawHistory[key].unit}`,
        remarks: rawHistory[key].remarks
      })).sort((a, b) => b.rawDate - a.rawDate)
    : (stock ? [defaultLog] : []);

  const handleExport = () => {
    if (!stock) return;

    // 1. Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // 2. Combine all data into a single sheet
    const exportData = [
      ["Material Profile Summary"],
      [],
      ["Material Name", materialData.name],
      ["Description", materialData.description],
      ["Current Stock", materialData.currentStock],
      ["Created Date", materialData.createdDate],
      ["Last Updated", materialData.lastUpdated],
      [],
      [],
      ["Audit Log History"],
      [],
      ["Date & Time", "Action", "Quantity", "Remarks"]
    ];

    // Append Audit Logs
    auditLogData.forEach(log => {
      exportData.push([log.date, log.action, log.quantity, log.remarks || ""]);
    });

    const ws = XLSX.utils.aoa_to_sheet(exportData);
    
    // Set appropriate column widths
    ws['!cols'] = [{ wch: 22 }, { wch: 40 }, { wch: 15 }, { wch: 40 }];
    
    XLSX.utils.book_append_sheet(wb, ws, "Stock Report");

    // 3. Save file
    const safeName = (materialData.name || "Stock").replace(/[^a-z0-9]/gi, '_').toLowerCase();
    XLSX.writeFile(wb, `${safeName}_report.xlsx`);
  };

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
            <div className="stat-info-card" style={{ gridColumn: 'span 2' }}>
              <div className="stat-icon-circle green-light-bg">
                <Box size={20} className="green-icon" />
              </div>
              <div className="stat-text-area">
                <div className="stat-label">Current Stock</div>
                <div className="stat-value text-green">{materialData.currentStock}</div>
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
          <button className="btn-export" onClick={handleExport}>
            <Download size={18} className="green-icon" /> Export Excel
          </button>
        </div>

        <div className="audit-table-container">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th className="text-center">Action</th>
                <th className="text-center">Quantity</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {auditLogData.map((log) => (
                <tr key={log.id}>
                  <td>{log.date}</td>
                  <td className="text-center">
                    <span className={`action-badge ${log.action === 'ADDED' ? 'badge-added' : 'badge-removed'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="text-center fw-600">{log.quantity}</td>
                  <td className="text-muted">{log.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="audit-pagination">
          <div className="pagination-text">Showing 1 to {auditLogData.length} of {auditLogData.length} entries</div>
          <div className="pagination-controls">
            <button className="page-nav-btn"><ChevronsLeft size={16} /></button>
            <button className="page-num-btn active">1</button>
            <button className="page-nav-btn"><ChevronsRight size={16} /></button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ViewStockEntry;
