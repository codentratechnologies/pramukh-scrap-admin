import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Home, 
  ChevronRight, 
  Calendar, 
  ChevronDown, 
  Trash2, 
  Plus, 
  GripVertical,
  Save,
  ChevronUp
} from 'lucide-react';
import Loader from './Loader';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { apiFetch } from '../utils/api';
import './AddLaborEntry.css';

const AddLaborEntry = ({ onCancel, isEditMode, laborId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [entryDate, setEntryDate] = useState(new Date());
  const [supervisorName, setSupervisorName] = useState('');
  const [deductions, setDeductions] = useState('');
  const [remarks, setRemarks] = useState('');
  const [deductionReason, setDeductionReason] = useState('');
  
  const [employees, setEmployees] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEditMode && laborId) {
      loadLaborEntry();
    }
  }, [isEditMode, laborId]);

  const loadLaborEntry = async () => {
    setIsLoading(true);
    try {
      const res = await apiFetch(`/labor/${laborId}`);
      const json = await res.json();
      if (json.success) {
        const data = json.data;
        setEntryDate(new Date(data.entryDate));
        setSupervisorName(data.supervisorName || '');
        setDeductions(data.deductions?.toString() || '');
        setDeductionReason(data.deductionReason || '');
        setRemarks(data.remarks || '');
        
        if (data.employees) {
          setEmployees(data.employees.map(emp => ({
            id: emp.id,
            name: emp.name,
            workTypes: (emp.workTypes || []).map(wt => ({
              id: wt.id,
              type: wt.type,
              weight: wt.weight?.toString() || '',
              rate: wt.rate?.toString() || ''
            }))
          })));
        }
      }
    } catch (err) {
      console.error("Failed to load labor entry:", err);
      toast.error("Failed to load labor entry for editing.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to clear all fields?")) {
      setEntryDate(new Date());
      setSupervisorName('');
      setDeductions('');
      setRemarks('');
      setDeductionReason('');
      setEmployees([]);
      setErrors({});
      setExpandedRow(null);
    }
  };

  const handleAddEmployee = () => {
    const newId = employees.length ? Math.max(...employees.map(e => e.id)) + 1 : 1;
    setEmployees([...employees, {
      id: newId,
      name: 'New Employee ' + newId,
      workTypes: []
    }]);
    setExpandedRow(newId);
  };

  const handleDeleteEmployee = (id, e) => {
    e.stopPropagation();
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const handleAddWorkType = (empId) => {
    setEmployees(employees.map(emp => {
      if (emp.id === empId) {
        const newWtId = emp.workTypes.length ? Math.max(...emp.workTypes.map(w => w.id)) + 1 : 1;
        return {
          ...emp,
          workTypes: [...emp.workTypes, {
            id: newWtId,
            type: 'Grinding',
            weight: 0,
            rate: 0
          }]
        };
      }
      return emp;
    }));
  };

  const handleEmployeeNameChange = (id, newName) => {
    setEmployees(employees.map(emp => {
      if (emp.id === id) {
        return { ...emp, name: newName };
      }
      return emp;
    }));
  };

  const handleDeleteWorkType = (empId, wtId) => {
    setEmployees(employees.map(emp => {
      if (emp.id === empId) {
        return {
          ...emp,
          workTypes: emp.workTypes.filter(wt => wt.id !== wtId)
        };
      }
      return emp;
    }));
  };

  const handleWorkTypeChange = (empId, wtId, field, value) => {
    setEmployees(employees.map(emp => {
      if (emp.id === empId) {
        return {
          ...emp,
          workTypes: emp.workTypes.map(wt => {
            if (wt.id === wtId) {
              return { ...wt, [field]: value };
            }
            return wt;
          })
        };
      }
      return emp;
    }));
  };

  // --- Calculations ---
  const getEmpTotalWeight = (emp) => {
    return emp.workTypes.reduce((sum, wt) => sum + (parseFloat(wt.weight) || 0), 0);
  };

  const getEmpTotalAmount = (emp) => {
    return emp.workTypes.reduce((sum, wt) => sum + ((parseFloat(wt.weight) || 0) * (parseFloat(wt.rate) || 0)), 0);
  };

  const grandTotalWeight = employees.reduce((sum, emp) => sum + getEmpTotalWeight(emp), 0);
  const grandTotalAmount = employees.reduce((sum, emp) => sum + getEmpTotalAmount(emp), 0);
  const payableAmount = grandTotalAmount - (parseFloat(deductions) || 0);

  const handleSave = async () => {
    let newErrors = {};
    if (!entryDate) newErrors.entryDate = "Date is required";
    if (!supervisorName.trim()) newErrors.supervisorName = "Supervisor Name is required";
    if (employees.length === 0) newErrors.employees = "At least one employee is required";

    employees.forEach((emp) => {
      if (!emp.name.trim()) {
        newErrors[`emp_${emp.id}_name`] = "Employee name is required";
      }
      if (emp.workTypes.length === 0) {
        newErrors[`emp_${emp.id}_wt`] = "Add at least one work type";
      }
      emp.workTypes.forEach(wt => {
        if (!wt.weight || parseFloat(wt.weight) <= 0) {
          newErrors[`wt_${wt.id}_weight`] = "Invalid weight";
        }
        if (!wt.rate || parseFloat(wt.rate) <= 0) {
          newErrors[`wt_${wt.id}_rate`] = "Invalid rate";
        }
      });
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        const payload = {
          entryDate: entryDate.toISOString(),
          supervisorName: supervisorName,
          deductions: parseFloat(deductions) || 0,
          deductionReason: deductionReason,
          remarks: remarks,
          employees: employees.map(emp => ({
            id: emp.id,
            name: emp.name,
            workTypes: emp.workTypes.map(wt => ({
              id: wt.id,
              type: wt.type,
              weight: parseFloat(wt.weight) || 0,
              rate: parseFloat(wt.rate) || 0
            }))
          })),
          grandTotalWeight,
          grandTotalAmount,
          payableAmount
        };

        const endpoint = isEditMode && laborId ? `/labor/${laborId}` : '/labor';
        const method = isEditMode && laborId ? 'PUT' : 'POST';
        
        const res = await apiFetch(endpoint, {
          method: method,
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        
        if (res.ok) {
          toast.success(`Labor entry ${isEditMode ? 'updated' : 'added'} successfully`);
          onCancel(); // Back to list
        } else {
          toast.error('Failed to save labor entry: ' + (data.detail || 'Unknown error'));
        }
      } catch (err) {
        console.error("Save error:", err);
        toast.error('Connection error while saving.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const firstErrEmp = employees.find(emp => 
        newErrors[`emp_${emp.id}_name`] || 
        newErrors[`emp_${emp.id}_wt`] || 
        emp.workTypes.some(wt => newErrors[`wt_${wt.id}_weight`] || newErrors[`wt_${wt.id}_rate`])
      );
      if (firstErrEmp) setExpandedRow(firstErrEmp.id);
    }
  };

  // --- Formatting Helpers ---
  const formatMoney = (val) => val.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  const formatWeight = (val) => val.toLocaleString('en-IN', { maximumFractionDigits: 2 });

  if (isLoading) {
    return <Loader text="Loading labor entry..." />;
  }

  return (
    <div className="add-labor-container">
      {/* Section 1: Entry Details */}
      <div className="form-section">
        <div className="section-header">
          <div className="section-title-group">
            <h3>1. Entry Details</h3>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Date <span className="required">*</span></label>
            <div className="form-control-icon">
              <Calendar size={16} style={{ zIndex: 1 }} />
              <DatePicker 
                selected={entryDate} 
                onChange={(date) => { setEntryDate(date); setErrors({...errors, entryDate: null}); }} 
                className={`form-control ${errors.entryDate ? 'error-border' : ''}`}
                dateFormat="dd-MM-yyyy"
              />
            </div>
            {errors.entryDate && <span className="error-text">{errors.entryDate}</span>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Supervisor Name <span className="required">*</span></label>
            <input 
              type="text" 
              className={`form-control ${errors.supervisorName ? 'error-border' : ''}`}
              placeholder="Enter Supervisor Name"
              value={supervisorName}
              onChange={(e) => { setSupervisorName(e.target.value); setErrors({...errors, supervisorName: null}); }}
            />
            {errors.supervisorName && <span className="error-text">{errors.supervisorName}</span>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Remarks <span style={{fontWeight: 'normal', color: '#6B7280'}}>(Optional)</span></label>
          <textarea 
            className="form-control" 
            placeholder="Enter remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          ></textarea>
          <div className="char-count">{remarks.length} / 200</div>
        </div>
      </div>

      {/* Section 2: Employee & Work Details */}
      <div className="form-section">
        <div className="section-header">
          <div className="section-title-group">
            <h3>2. Employee & Work Details</h3>
            <p>Add employees and their work type details.</p>
            {errors.employees && <span className="error-text" style={{marginTop: '0.25rem', display: 'block'}}>{errors.employees}</span>}
          </div>
          <button className="btn-outline-green" onClick={() => { handleAddEmployee(); setErrors({...errors, employees: null}); }}>
            <Plus size={16} /> Add Employee
          </button>
        </div>

        <div className="employee-list">
          {employees.map((emp, index) => {
            const empTotalWeight = getEmpTotalWeight(emp);
            const empTotalAmount = getEmpTotalAmount(emp);
            const hasData = emp.workTypes.length > 0;

            return (
              <div key={emp.id} className={`employee-row ${expandedRow === emp.id ? 'expanded' : ''}`}>
                <div className="employee-row-header" onClick={() => toggleRow(emp.id)}>
                  <span className="row-index">{index + 1}.</span>
                  <ChevronRight size={16} className="row-chevron" />
                  <div className="row-emp-name" style={{ display: 'flex', flexDirection: 'column' }}>
                    <input 
                      type="text" 
                      className={`form-control ${errors[`emp_${emp.id}_name`] ? 'error-border' : ''}`}
                      style={{ padding: '0.35rem 0.75rem', width: '100%', maxWidth: '250px', fontWeight: '600', fontSize: '0.95rem' }}
                      value={emp.name}
                      onChange={(e) => { handleEmployeeNameChange(emp.id, e.target.value); setErrors({...errors, [`emp_${emp.id}_name`]: null}); }}
                      onClick={(e) => e.stopPropagation()} 
                      placeholder="Enter Employee Name"
                    />
                    {errors[`emp_${emp.id}_name`] && <span className="error-text" style={{marginTop: '2px'}}>{errors[`emp_${emp.id}_name`]}</span>}
                  </div>
                  
                  <div className="row-stats">
                    <div>
                      <span className="row-stat-label">Total Weight: </span>
                      <span className="row-stat-val">{hasData ? formatWeight(empTotalWeight) + ' Kg' : '-'}</span>
                    </div>
                    <div>
                      <span className="row-stat-label">Total Amount: </span>
                      <span className={`row-stat-val ${hasData && empTotalAmount > 0 ? 'green' : ''}`}>
                        {hasData ? `₹ ${formatMoney(empTotalAmount)}` : '-'}
                      </span>
                    </div>
                  </div>
                  
                  <button className="btn-icon-danger" onClick={(e) => handleDeleteEmployee(emp.id, e)}>
                    <Trash2 size={16} />
                  </button>
                </div>
                
                {expandedRow === emp.id && (
                  <div className="employee-row-content">
                    <div className="work-types-header">
                      <div className="work-types-title">
                        Work Types for {emp.name || 'Employee'}
                        {errors[`emp_${emp.id}_wt`] && <span className="error-text" style={{display: 'block'}}>{errors[`emp_${emp.id}_wt`]}</span>}
                      </div>
                      <button className="btn-outline-green" style={{padding: '0.4rem 0.75rem'}} onClick={() => { handleAddWorkType(emp.id); setErrors({...errors, [`emp_${emp.id}_wt`]: null}); }}>
                        <Plus size={14} /> Add Work Type
                      </button>
                    </div>
                    
                    {emp.workTypes && emp.workTypes.length > 0 ? (
                    <table className="work-types-table">
                      <thead>
                        <tr>
                          <th style={{width: '40px'}}></th>
                          <th>Work Type</th>
                          <th>Weight (Kg) <span className="required">*</span></th>
                          <th>Rate (₹ / Kg) <span className="required">*</span></th>
                          <th>Amount (₹)</th>
                          <th style={{width: '60px', textAlign: 'center'}}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {emp.workTypes.map(wt => {
                          const itemAmount = (parseFloat(wt.weight) || 0) * (parseFloat(wt.rate) || 0);
                          return (
                            <tr key={wt.id}>
                              <td>
                                <div className="drag-handle"><GripVertical size={16} /></div>
                              </td>
                              <td>
                                <div className="form-control-select">
                                  <select 
                                    className="form-control wt-input-small" 
                                    value={wt.type}
                                    onChange={(e) => handleWorkTypeChange(emp.id, wt.id, 'type', e.target.value)}
                                  >
                                    <option value="Grinding">Grinding</option>
                                    <option value="Kabadu">Kabadu</option>
                                    <option value="Patakadku">Patakadku</option>
                                  </select>
                                  <ChevronDown size={14} />
                                </div>
                              </td>
                              <td>
                                <input 
                                  type="number" 
                                  className={`form-control wt-input-small ${errors[`wt_${wt.id}_weight`] ? 'error-border' : ''}`}
                                  value={wt.weight} 
                                  onChange={(e) => { handleWorkTypeChange(emp.id, wt.id, 'weight', e.target.value); setErrors({...errors, [`wt_${wt.id}_weight`]: null}); }}
                                />
                                {errors[`wt_${wt.id}_weight`] && <div className="error-text">{errors[`wt_${wt.id}_weight`]}</div>}
                              </td>
                              <td>
                                <input 
                                  type="number" 
                                  className={`form-control wt-input-small ${errors[`wt_${wt.id}_rate`] ? 'error-border' : ''}`}
                                  value={wt.rate}
                                  onChange={(e) => { handleWorkTypeChange(emp.id, wt.id, 'rate', e.target.value); setErrors({...errors, [`wt_${wt.id}_rate`]: null}); }}
                                />
                                {errors[`wt_${wt.id}_rate`] && <div className="error-text">{errors[`wt_${wt.id}_rate`]}</div>}
                              </td>
                              <td>
                                <span className="wt-amount">₹ {formatMoney(itemAmount)}</span>
                              </td>
                              <td style={{textAlign: 'center'}}>
                                <button className="btn-icon-danger" style={{margin: '0 auto'}} onClick={() => handleDeleteWorkType(emp.id, wt.id)}>
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    ) : (
                      <div style={{padding: '2rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.9rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1'}}>
                        No work types added yet. Click "Add Work Type" to begin.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="grand-totals-bar">
          <div className="gt-group">
            <span className="gt-label">Grand Total Weight</span>
            <span className="gt-val">{formatWeight(grandTotalWeight)} Kg</span>
          </div>
          <div className="gt-group">
            <span className="gt-label">Grand Total Amount</span>
            <span className="gt-val green">₹ {formatMoney(grandTotalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Section 3: Deductions & Payable */}
      <div className="form-section" style={{marginBottom: '0'}}>
        <div className="section-header">
          <div className="section-title-group">
            <h3>3. Deductions & Payable Amount</h3>
          </div>
        </div>

        <div className="deductions-layout">
          <div className="deductions-inputs">
            <div className="form-group" style={{marginBottom: '1rem'}}>
              <label className="form-label">Deductions (₹)</label>
              <input 
                type="number" 
                className="form-control" 
                value={deductions} 
                onChange={(e) => setDeductions(e.target.value)}
              />
              <div className="hint-text">Enter total deductions if any</div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Deduction Reason <span style={{fontWeight: 'normal', color: '#6B7280'}}>(Optional)</span></label>
              <textarea 
                className="form-control"
                value={deductionReason}
                onChange={(e) => setDeductionReason(e.target.value)}
              ></textarea>
              <div className="char-count">{deductionReason.length} / 200</div>
            </div>
          </div>
          
          <div className="deductions-calc">
            <div className="calc-box">
              <span className="calc-label">Total Amount (₹)</span>
              <span className="calc-val">{formatMoney(grandTotalAmount)}</span>
            </div>
            <div className="calc-operator">-</div>
            <div className="calc-box">
              <span className="calc-label">Deductions (₹)</span>
              <span className="calc-val">{formatMoney(parseFloat(deductions) || 0)}</span>
            </div>
            <div className="calc-operator">=</div>
            <div className="calc-box">
              <span className="calc-label">Payable Amount (₹)</span>
              <span className="calc-val green">{formatMoney(payableAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="form-footer-actions">
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn-secondary" onClick={handleReset}>Reset</button>
        <button className="btn-primary" onClick={handleSave} disabled={isSubmitting}>
          <Save size={18} /> {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Labor Entry' : 'Save Labor Entry')}
        </button>
      </div>
    </div>
  );
};

export default AddLaborEntry;
