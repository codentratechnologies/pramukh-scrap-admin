import React, { useState, useEffect } from 'react';
import { 
  Home, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  Calendar,
  User,
  MessageSquare,
  FileText,
  Wallet,
  Percent,
  ClipboardList
} from 'lucide-react';
import Loader from './Loader';
import { apiFetch } from '../utils/api';
import './ViewLaborEntry.css';

const ViewLaborEntry = ({ onBack, laborId }) => {
  const [expandedRow, setExpandedRow] = useState(null);
  const [entryData, setEntryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (laborId) {
      fetchLaborEntry();
    }
  }, [laborId]);

  const fetchLaborEntry = async () => {
    try {
      setLoading(true);
      const res = await apiFetch(`/labor/${laborId}`);
      const json = await res.json();
      if (json.success) {
        const data = json.data;
        
        // Transform for UI
        setEntryData({
          date: new Date(data.entryDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          supervisor: data.supervisorName || 'N/A',
          remarks: data.remarks || 'No remarks provided.',
          entryNo: `LE-${new Date(data.entryDate).getTime().toString().slice(-6)}`,
          totalAmount: data.grandTotalAmount?.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
          deductions: data.deductions?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '0',
          payableAmount: data.payableAmount?.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
          employees: data.employees?.map((emp) => {
            const empTotalWeight = emp.workTypes?.reduce((sum, wt) => sum + (parseFloat(wt.weight) || 0), 0) || 0;
            const empTotalAmount = emp.workTypes?.reduce((sum, wt) => sum + ((parseFloat(wt.weight) || 0) * (parseFloat(wt.rate) || 0)), 0) || 0;
            
            return {
              id: emp.id,
              name: emp.name,
              totalWeight: empTotalWeight.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
              totalAmount: empTotalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 }),
              workTypes: emp.workTypes?.map(wt => ({
                type: wt.type,
                weight: parseFloat(wt.weight).toLocaleString('en-IN', { maximumFractionDigits: 2 }),
                rate: parseFloat(wt.rate).toLocaleString('en-IN', { maximumFractionDigits: 2 }),
                amount: ((parseFloat(wt.weight) || 0) * (parseFloat(wt.rate) || 0)).toLocaleString('en-IN', { maximumFractionDigits: 2 })
              })) || []
            };
          }) || []
        });
      }
    } catch (err) {
      console.error("Failed to fetch labor entry details:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (loading) {
    return <Loader text="Loading labor entry details..." />;
  }

  if (!entryData) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Entry not found.</p>
        <button onClick={onBack} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Back</button>
      </div>
    );
  }

  return (
    <div className="view-labor-container">
      {/* Page Header - Breadcrumbs */}
      <div className="breadcrumbs" style={{ marginBottom: '1.5rem' }}>
        <span className="breadcrumb-item active" onClick={onBack}>
          <Home size={16} /> Labor Management
        </span>
        <span className="breadcrumb-separator"><ChevronRight size={14} /></span>
        <span className="breadcrumb-item active" onClick={onBack}>
          <ClipboardList size={16} /> Labor Entries
        </span>
        <span className="breadcrumb-separator"><ChevronRight size={14} /></span>
        <span className="breadcrumb-item current">View Labor Entry</span>
      </div>

      {/* Top Info Cards */}
      <div className="info-cards-row">
        <div className="info-card">
          <div className="info-icon-box icon-blue">
            <Calendar size={24} />
          </div>
          <div className="info-details">
            <span className="info-label">Date</span>
            <span className="info-value">{entryData.date}</span>
          </div>
        </div>
        
        <div className="info-card">
          <div className="info-icon-box icon-green">
            <User size={24} />
          </div>
          <div className="info-details">
            <span className="info-label">Supervisor</span>
            <span className="info-value">{entryData.supervisor}</span>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon-box icon-purple">
            <MessageSquare size={24} />
          </div>
          <div className="info-details">
            <span className="info-label">Remarks</span>
            <span className="info-value">{entryData.remarks}</span>
          </div>
        </div>

        <div className="info-card">
          <div className="info-icon-box icon-orange">
            <FileText size={24} />
          </div>
          <div className="info-details">
            <span className="info-label">Entry No.</span>
            <span className="info-value">{entryData.entryNo}</span>
          </div>
        </div>
      </div>

      {/* Details Table */}
      <div className="details-section" style={{ height: 'max-content', minHeight: '0', flex: 'none' }}>
        <div className="section-header">Employee & Work Details</div>
        <div className="employee-details-list" style={{ minHeight: '0', height: 'auto' }}>
          {entryData.employees.map((emp, index) => (
            <div className="employee-detail-card" key={emp.id}>
              <div className="employee-card-header">
                <div className="emp-info">
                  <span className="emp-index">#{index + 1}</span>
                  <span className="emp-name fw-600">{emp.name}</span>
                </div>
                <div className="emp-totals">
                  <div className="emp-total-item">
                    <span className="label">Total Weight:</span>
                    <span className="value">{emp.totalWeight} Kg</span>
                  </div>
                  <div className="emp-total-item">
                    <span className="label">Total Amount:</span>
                    <span className="value text-green fw-600">₹ {emp.totalAmount}</span>
                  </div>
                  <button 
                    className={`expand-icon-btn ${expandedRow === emp.id ? 'expanded' : ''}`}
                    onClick={() => toggleRow(emp.id)}
                    style={{ marginLeft: '1rem' }}
                  >
                    <ChevronDown size={20} />
                  </button>
                </div>
              </div>
              
              {expandedRow === emp.id && (
                <div className="employee-card-body">
                  {emp.workTypes && emp.workTypes.length > 0 ? (
                    <table className="nested-table">
                      <thead>
                        <tr>
                          <th style={{ width: '40%' }}>Work Type</th>
                          <th style={{ width: '20%', textAlign: 'center' }}>Weight (Kg)</th>
                          <th style={{ width: '20%', textAlign: 'center' }}>Rate (₹ / Kg)</th>
                          <th style={{ width: '20%', textAlign: 'right', paddingRight: '1rem' }}>Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emp.workTypes.map((work, idx) => (
                          <tr key={idx}>
                            <td>{work.type}</td>
                            <td style={{ textAlign: 'center' }}>{work.weight}</td>
                            <td style={{ textAlign: 'center' }}>{work.rate}</td>
                            <td style={{ textAlign: 'right', paddingRight: '1rem' }} className="text-green">₹ {work.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="no-work-data">No work details recorded for this employee.</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>

      {/* Summary Section */}
      <div className="summary-section">
        <h3 className="summary-title">Summary</h3>
        <div className="summary-cards">
          
          <div className="summary-card">
            <div className="summary-icon-box purple">
              <Wallet size={24} />
            </div>
            <div className="summary-details">
              <span className="summary-label">Total Amount (₹)</span>
              <span className="summary-value">₹ {entryData.totalAmount}</span>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon-box orange">
              <Percent size={24} />
            </div>
            <div className="summary-details">
              <span className="summary-label">Deductions (₹)</span>
              <span className="summary-value">₹ {entryData.deductions}</span>
            </div>
          </div>
          
          <div className="summary-card">
            <div className="summary-icon-box green">
              <Wallet size={24} />
            </div>
            <div className="summary-details">
              <span className="summary-label">Payable Amount (₹)</span>
              <span className="summary-value text-green">₹ {entryData.payableAmount}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ViewLaborEntry;
