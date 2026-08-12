import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Search, 
  Plus, 
  Calendar, 
  ChevronDown, 
  FilterX,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
  Download,
  RefreshCw,
  MoreVertical,
  ChevronsUpDown,
  RotateCcw
} from 'lucide-react';
import Loader from './Loader';
import { apiFetch } from '../utils/api';
import CustomSelect from './common/CustomSelect';
import CustomDatePicker from './common/CustomDatePicker';
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

  const handleDownloadClick = async (row) => {
    try {
      const loadingToast = toast.loading('Generating PDF...');
      
      // Fetch full details for the row
      const res = await apiFetch(`/labor/${row.id}`);
      const json = await res.json();
      
      if (!json.success) {
        toast.error('Failed to fetch details for PDF.');
        toast.dismiss(loadingToast);
        return;
      }
      
      const data = json.data;
      const doc = new jsPDF();
      
      // Helper to load image
      const loadImage = (src) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };
      
      // Header Divider (Replaced solid background so logo blends cleanly)
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.5);
      doc.line(14, 38, 196, 38);
      
      let currentY = 10;
      
      // Logo (Right aligned)
      try {
        const logoImg = await loadImage('/pramukh scrap logo.png');
        const logoWidth = 45;
        const ratio = logoImg.height / logoImg.width;
        const logoHeight = logoWidth * ratio;
        doc.addImage(logoImg, 'PNG', 150, currentY + 2, logoWidth, logoHeight);
      } catch (e) {
        console.warn("Logo couldn't be loaded", e);
      }
      
      // Header Text (Left aligned)
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 124, 56); // Theme Green #1F7C38
      doc.text('LABOR RECEIPT', 14, currentY + 10);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128); // Muted
      doc.text('Pramukh Scrap Management', 14, currentY + 16);
      
      currentY = 45;
      
      // Entry Details Box
      doc.setDrawColor(229, 231, 235);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(14, currentY, 182, 25, 3, 3, 'FD');
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(107, 114, 128);
      
      // Details row 1
      doc.text('RECEIPT NO.', 20, currentY + 10);
      doc.text('DATE', 85, currentY + 10);
      doc.text('SUPERVISOR', 135, currentY + 10);
      
      // Details row 2
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42); // Dark
      doc.text(`LE-${new Date(data.entryDate).getTime().toString().slice(-6)}`, 20, currentY + 17);
      doc.text(`${new Date(data.entryDate).toLocaleDateString('en-GB')}`, 85, currentY + 17);
      doc.text(`${data.supervisorName || 'N/A'}`, 135, currentY + 17);
      
      currentY += 35;
      
      // Employee details table
      data.employees?.forEach((emp, index) => {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(31, 124, 56); // Green
        doc.text(`Employee: ${emp.name}`, 14, currentY);
        currentY += 5;
        
        const tableData = emp.workTypes?.map(wt => [
          wt.type,
          `${wt.weight} Kg`,
          `Rs. ${wt.rate}`,
          `Rs. ${((parseFloat(wt.weight) || 0) * (parseFloat(wt.rate) || 0)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
        ]) || [];
        
        autoTable(doc, {
          startY: currentY,
          head: [['Work Type', 'Weight', 'Rate', 'Total']],
          body: tableData,
          theme: 'grid',
          headStyles: { 
            fillColor: [31, 124, 56], 
            textColor: 255,
            fontStyle: 'bold'
          },
          columnStyles: {
            1: { halign: 'right' },
            2: { halign: 'right' },
            3: { halign: 'right', fontStyle: 'bold' }
          },
          alternateRowStyles: {
            fillColor: [249, 250, 251]
          },
          margin: { left: 14, right: 14 }
        });
        
        currentY = doc.lastAutoTable.finalY + 12;
      });
      
      // Summary Box (Check if we need a new page)
      if (currentY > 210) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setDrawColor(31, 124, 56); // Green border
      doc.setLineWidth(0.5);
      doc.setFillColor(245, 249, 246);
      doc.roundedRect(120, currentY, 76, 45, 3, 3, 'FD'); // Box for summary right aligned
      
      let summaryY = currentY + 8;
      
      const rightColLabel = 125;
      const rightColValue = 190;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      doc.text('Total Weight', rightColLabel, summaryY);
      doc.setTextColor(15, 23, 42);
      doc.text(`${data.grandTotalWeight} Kg`, rightColValue, summaryY, { align: 'right' });
      
      summaryY += 8;
      doc.setTextColor(107, 114, 128);
      doc.text('Total Amount', rightColLabel, summaryY);
      doc.setTextColor(15, 23, 42);
      doc.text(`Rs. ${data.grandTotalAmount?.toLocaleString('en-IN')}`, rightColValue, summaryY, { align: 'right' });
      
      summaryY += 8;
      doc.setTextColor(107, 114, 128);
      doc.text('Deductions', rightColLabel, summaryY);
      doc.setTextColor(220, 38, 38); // Red
      doc.text(`- Rs. ${data.deductions?.toLocaleString('en-IN') || 0}`, rightColValue, summaryY, { align: 'right' });
      
      // Line before total
      summaryY += 4;
      doc.setDrawColor(209, 213, 219);
      doc.line(125, summaryY, 190, summaryY);
      summaryY += 8;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 124, 56); // Green payable amount
      doc.text('Payable Amount', rightColLabel, summaryY);
      doc.text(`Rs. ${data.payableAmount?.toLocaleString('en-IN')}`, rightColValue, summaryY, { align: 'right' });
      
      // Remarks on the left side
      if (data.remarks) {
        let remarksY = currentY + 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Remarks / Notes:', 14, remarksY);
        
        remarksY += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(107, 114, 128);
        const splitRemarks = doc.splitTextToSize(`${data.remarks}`, 95);
        doc.text(splitRemarks, 14, remarksY);
      }
      
      // Footer
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(156, 163, 175);
      doc.text('Generated by Pramukh Scrap Management System', 14, pageHeight - 10);
      doc.text(new Date().toLocaleString('en-GB'), 196, pageHeight - 10, { align: 'right' });
      
      // Mobile-friendly save logic
      const filename = `Labor_Entry_${row.id}_${new Date(data.entryDate).toLocaleDateString('en-GB').replace(/\//g, '-')}.pdf`;
      const pdfBlob = doc.output('blob');

      // Try Web Share API (Great for iPhones/Mobile to "Save to Files")
      if (navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], filename, { type: 'application/pdf' })] })) {
        try {
          await navigator.share({
            files: [new File([pdfBlob], filename, { type: 'application/pdf' })],
            title: filename,
          });
        } catch (err) {
          if (err.name !== 'AbortError') {
            // User didn't just cancel the share dialog, fallback to direct download
            doc.save(filename);
          }
        }
      } else {
        // Fallback for browsers that don't support sharing files (like desktop)
        // Creating an object URL and anchor click is the most robust way to force download
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
      toast.dismiss(loadingToast);
      toast.success('PDF downloaded successfully');
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      toast.dismiss();
      toast.error("Error generating PDF");
    }
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

  const renderPagination = () => {
    let pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages = [1, 2, 3, 4, '...', totalPages];
      } else if (currentPage >= totalPages - 2) {
        pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
      }
    }

    return pages.map((page, index) => {
      if (page === '...') {
        return <span key={`dots-${index}`} className="page-dots">...</span>;
      }
      return (
        <button 
          key={page} 
          className={`page-btn ${currentPage === page ? 'active' : ''}`}
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className="lm-container">
      <div className="lm-card">
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
        
        <div className="date-range-wrapper">
          <CustomDatePicker
            value={fromDate}
            onChange={(val) => { setFromDate(val); setCurrentPage(1); }}
            placeholder="From Date"
            label="FROM"
          />
          <span className="date-range-arrow">→</span>
          <CustomDatePicker
            value={toDate}
            onChange={(val) => { setToDate(val); setCurrentPage(1); }}
            placeholder="To Date"
            label="TO"
          />
        </div>

        <div className="dropdown-box filter-dropdown">
          <CustomSelect
            name="supervisorFilter"
            value={supervisorFilter}
            onChange={(e) => { setSupervisorFilter(e.target.value); setCurrentPage(1); }}
            options={[
              { value: "", label: "All Supervisors" },
              ...uniqueSupervisors.map(sup => ({ value: sup, label: sup }))
            ]}
            className="filter-select-mode"
          />
        </div>

        <div className="dropdown-box filter-dropdown">
          <CustomSelect
            name="workTypeFilter"
            value={workTypeFilter}
            onChange={(e) => { setWorkTypeFilter(e.target.value); setCurrentPage(1); }}
            options={[
              { value: "", label: "All Work Types" },
              ...uniqueWorkTypes.map(wt => ({ value: wt, label: wt }))
            ]}
            className="filter-select-mode"
          />
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
          <RotateCcw size={16} /> Clear Filters
        </button>
      </div>

      <div className="table-container">
        <table className="lm-table">
          <thead>
            <tr>
              <th className="text-center">#</th>
              <th>Date</th>
              <th>Supervisor</th>
              <th>Work Types</th>
              <th>Total Weight</th>
              <th>Total Amount</th>
              <th>Deductions</th>
              <th>Payable Amount</th>
              <th className="text-center">Actions</th>
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
                      <td className="text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>
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
                        <div className="actions-container" style={{ justifyContent: 'center' }}>
                          <button className="action-btn view-btn" title="View" onClick={() => onViewEntry(row.id)}><Eye size={16} /></button>
                          <button className="action-btn download-btn" title="Download" onClick={() => handleDownloadClick(row)}><Download size={16} /></button>
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
          Showing {(currentPage - 1) * itemsPerPage + (paginatedData.length > 0 ? 1 : 0)} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
        </div>
        <div className="pagination-controls">
          <button className="page-btn" disabled={currentPage === 1} onClick={handlePrevPage}>
            <ChevronLeft size={16} />
          </button>
          <div className="page-numbers">
            {renderPagination()}
          </div>
          <button className="page-btn" disabled={currentPage === totalPages || totalPages === 0} onClick={handleNextPage}>
            <ChevronRight size={16} />
          </button>
        </div>
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
