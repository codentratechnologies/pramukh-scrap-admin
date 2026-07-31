import React, { useState } from 'react';
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
  Percent
} from 'lucide-react';
import './ViewLaborEntry.css';

const ViewLaborEntry = ({ onBack }) => {
  const [expandedRow, setExpandedRow] = useState(1);

  // Mock data to match the design screenshot
  const entryData = {
    date: '21 May 2025',
    supervisor: 'Ramesh Patel',
    remarks: 'Monthly labor entry for grinding and kabadu work.',
    entryNo: 'LE-250521-001',
    totalAmount: '1,31,450',
    deductions: '4,230',
    payableAmount: '1,27,220',
    employees: [
      {
        id: 1,
        name: 'Ramesh Patel',
        totalWeight: '1,200',
        totalAmount: '54,000',
        workTypes: [
          { type: 'Grinding', weight: '800', rate: '45.00', amount: '36,000' },
          { type: 'Kabadu', weight: '400', rate: '45.00', amount: '18,000' }
        ]
      },
      {
        id: 2,
        name: 'Mahesh Kumar',
        totalWeight: '600',
        totalAmount: '25,200',
        workTypes: []
      },
      {
        id: 3,
        name: 'Sanjay Singh',
        totalWeight: '650',
        totalAmount: '28,600',
        workTypes: []
      },
      {
        id: 4,
        name: 'Mahendra Joshi',
        totalWeight: '550',
        totalAmount: '23,650',
        workTypes: []
      }
    ]
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="view-labor-container">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <div className="breadcrumb-item active" onClick={onBack}>
          <Home size={14} /> Labor Management
        </div>
        <ChevronRight size={14} className="breadcrumb-separator" />
        <div className="breadcrumb-item active" onClick={onBack}>
          Labor Entries
        </div>
        <ChevronRight size={14} className="breadcrumb-separator" />
        <div className="breadcrumb-item current">
          View Labor Entry
        </div>
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
      <div className="details-section">
        <div className="section-header">Employee & Work Details</div>
        <div className="details-table-wrapper">
          <table className="details-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>#</th>
                <th style={{ width: '40%' }}>Employee Name</th>
                <th style={{ width: '20%', textAlign: 'center' }}>Total Weight (Kg)</th>
                <th style={{ width: '20%', textAlign: 'center' }}>Total Amount (₹)</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {entryData.employees.map((emp, index) => (
                <React.Fragment key={emp.id}>
                  <tr>
                    <td>{index + 1}</td>
                    <td className="fw-600">{emp.name}</td>
                    <td style={{ textAlign: 'center' }} className="fw-600">{emp.totalWeight}</td>
                    <td style={{ textAlign: 'center' }} className="text-green">₹ {emp.totalAmount}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className={`expand-icon-btn ${expandedRow === emp.id ? 'expanded' : ''}`}
                        onClick={() => toggleRow(emp.id)}
                      >
                        <ChevronDown size={20} />
                      </button>
                    </td>
                  </tr>
                  
                  {expandedRow === emp.id && emp.workTypes.length > 0 && (
                    <tr className="nested-table-row">
                      <td colSpan="5">
                        <div className="nested-table-container">
                          <table className="nested-table">
                            <thead>
                              <tr>
                                <th style={{ width: '60px' }}></th>
                                <th style={{ width: '40%' }}>Work Type</th>
                                <th style={{ width: '20%', textAlign: 'center' }}>Weight (Kg)</th>
                                <th style={{ width: '20%', textAlign: 'center' }}>Rate (₹ / Kg)</th>
                                <th style={{ width: '80px', textAlign: 'center' }}>Amount (₹)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {emp.workTypes.map((work, idx) => (
                                <tr key={idx}>
                                  <td></td>
                                  <td>{work.type}</td>
                                  <td style={{ textAlign: 'center' }}>{work.weight}</td>
                                  <td style={{ textAlign: 'center' }}>{work.rate}</td>
                                  <td style={{ textAlign: 'center' }} className="text-green">₹ {work.amount}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              
              <tr className="table-totals-row">
                <td colSpan="2" style={{ textAlign: 'right', paddingRight: '2rem' }}>Total Weight</td>
                <td style={{ textAlign: 'center' }}>3,000 Kg</td>
                <td style={{ textAlign: 'right', paddingRight: '1rem' }}>Total Amount</td>
                <td style={{ textAlign: 'center' }} className="text-green">₹ {entryData.totalAmount}</td>
              </tr>
            </tbody>
          </table>
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
