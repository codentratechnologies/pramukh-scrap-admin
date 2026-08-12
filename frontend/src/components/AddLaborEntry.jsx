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
  ChevronUp,
  ClipboardList,
  UserPlus,
  X
} from 'lucide-react';
import Loader from './Loader';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { apiFetch } from '../utils/api';
import CustomSelect from './common/CustomSelect';
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
  const [showResetModal, setShowResetModal] = useState(false);

  // Dynamic Supervisors State
  const [supervisorsList, setSupervisorsList] = useState([]);
  const [showSupervisorModal, setShowSupervisorModal] = useState(false);
  const [newSupervisorName, setNewSupervisorName] = useState('');
  const [isAddingSupervisor, setIsAddingSupervisor] = useState(false);

  // Dynamic Employees State
  const [employeeList, setEmployeeList] = useState([]);
  const [addingNewEmpRowId, setAddingNewEmpRowId] = useState(null);
  const [newEmpName, setNewEmpName] = useState('');
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  // Dynamic Work Types State
  const [workTypeList, setWorkTypeList] = useState([]);
  const [addingNewWtId, setAddingNewWtId] = useState(null); // stores `${empId}-${wtId}`
  const [newWtName, setNewWtName] = useState('');
  const [isAddingWorkType, setIsAddingWorkType] = useState(false);
  const [showWorkTypeModal, setShowWorkTypeModal] = useState(false);

  useEffect(() => {
    fetchSupervisors();
    fetchEmployees();
    fetchWorkTypes();
    if (isEditMode && laborId) {
      loadLaborEntry();
    }
  }, [isEditMode, laborId]);

  const fetchSupervisors = async () => {
    try {
      const res = await apiFetch('/supervisors');
      const json = await res.json();
      if (json.success) {
        setSupervisorsList(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch supervisors:", err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await apiFetch('/employees');
      const json = await res.json();
      if (json.success) {
        setEmployeeList(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  const fetchWorkTypes = async () => {
    try {
      const res = await apiFetch('/worktypes');
      const json = await res.json();
      if (json.success) {
        setWorkTypeList(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch work types:", err);
    }
  };

  const handleAddNewSupervisor = async (e) => {
    e.preventDefault();
    if (!newSupervisorName.trim()) {
      toast.error('Supervisor name is required');
      return;
    }
    
    setIsAddingSupervisor(true);
    try {
      const res = await apiFetch('/supervisors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: newSupervisorName.trim() })
      });
      const json = await res.json();
      
      if (res.ok && json.success) {
        toast.success(json.message || 'Supervisor added successfully');
        setSupervisorsList([...supervisorsList, json.data]);
        setSupervisorName(json.data.name);
        setErrors({...errors, supervisorName: null});
        setShowSupervisorModal(false);
        setNewSupervisorName('');
      } else {
        toast.error(json.detail || 'Failed to add supervisor');
      }
    } catch (error) {
      console.error("Error adding supervisor:", error);
      toast.error('Failed to add supervisor');
    } finally {
      setIsAddingSupervisor(false);
    }
  };

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
    setShowResetModal(true);
  };

  const confirmReset = () => {
    setEntryDate(new Date());
    setSupervisorName('');
    setDeductions('');
    setRemarks('');
    setDeductionReason('');
    setEmployees([]);
    setErrors({});
    setExpandedRow(null);
    setShowResetModal(false);
  };

  const handleAddEmployee = () => {
    const newId = employees.length ? Math.max(...employees.map(e => e.id)) + 1 : 1;
    setEmployees([...employees, {
      id: newId,
      name: '',
      workTypes: []
    }]);
    setExpandedRow(newId);
  };

  const handleDeleteEmployee = (id, e) => {
    e.stopPropagation();
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const handleEmployeeNameChange = (empId, value) => {
    if (value === '__add_new__') {
      setAddingNewEmpRowId(empId);
      setNewEmpName('');
      setShowEmployeeModal(true);
      return;
    }
    const updated = employees.map(emp => 
      emp.id === empId ? { ...emp, name: value } : emp
    );
    setEmployees(updated);
  };

  const handleSaveNewEmployee = async () => {
    const empId = addingNewEmpRowId;
    if (!empId) return;
    
    if (!newEmpName.trim()) {
      toast.error('Employee name is required');
      return;
    }
    setIsAddingEmployee(true);
    try {
      const res = await apiFetch('/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newEmpName.trim() })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Employee added successfully');
        setEmployeeList([...employeeList, json.data]);
        const updated = employees.map(emp => 
          emp.id === empId ? { ...emp, name: json.data.name } : emp
        );
        setEmployees(updated);
        setAddingNewEmpRowId(null);
        setNewEmpName('');
        setShowEmployeeModal(false);
        setErrors({...errors, [`emp_${empId}_name`]: null});
      } else {
        toast.error(json.detail || 'Failed to add employee');
      }
    } catch (err) {
      console.error('Error adding employee:', err);
      toast.error('Failed to add employee');
    } finally {
      setIsAddingEmployee(false);
    }
  };

  const handleAddWorkType = (empId) => {
    setEmployees(employees.map(emp => {
      if (emp.id === empId) {
        const newWtId = emp.workTypes.length ? Math.max(...emp.workTypes.map(w => w.id)) + 1 : 1;
        return {
          ...emp,
          workTypes: [...emp.workTypes, {
            id: newWtId,
            type: workTypeList.length > 0 ? workTypeList[0].name : '',
            weight: 0,
            rate: 0
          }]
        };
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
    if (field === 'type' && value === '__add_new__') {
      setAddingNewWtId(`${empId}-${wtId}`);
      setNewWtName('');
      setShowWorkTypeModal(true);
      return;
    }
    
    setEmployees(employees.map(emp => {
      if (emp.id === empId) {
        return {
          ...emp,
          workTypes: emp.workTypes.map(wt => 
            wt.id === wtId ? { ...wt, [field]: value } : wt
          )
        };
      }
      return emp;
    }));
  };

  const handleSaveNewWorkType = async () => {
    if (!addingNewWtId) return;
    const [empIdStr, wtIdStr] = addingNewWtId.split('-');
    const empId = Number(empIdStr);
    const wtId = Number(wtIdStr);

    if (!newWtName.trim()) {
      toast.error('Work type is required');
      return;
    }
    setIsAddingWorkType(true);
    try {
      const res = await apiFetch('/worktypes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWtName.trim() })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        toast.success('Work type added successfully');
        setWorkTypeList([...workTypeList, json.data]);
        
        // Update the work type for this row automatically
        setEmployees(employees.map(emp => {
          if (emp.id === empId) {
            return {
              ...emp,
              workTypes: emp.workTypes.map(wt => 
                wt.id === wtId ? { ...wt, type: json.data.name } : wt
              )
            };
          }
          return emp;
        }));
        
        setAddingNewWtId(null);
        setNewWtName('');
        setShowWorkTypeModal(false);
        setErrors({...errors, [`wt_${wtId}_type`]: null});
      } else {
        toast.error(json.detail || 'Failed to add work type');
      }
    } catch (err) {
      console.error('Error adding work type:', err);
      toast.error('Failed to add work type');
    } finally {
      setIsAddingWorkType(false);
    }
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
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <span className="breadcrumb-item active" onClick={onCancel}>
          <Home size={16} /> Labor Management
        </span>
        <span className="breadcrumb-separator"><ChevronRight size={14} /></span>
        <span className="breadcrumb-item active" onClick={onCancel}>
          <ClipboardList size={16} /> Labor Entries
        </span>
        <span className="breadcrumb-separator"><ChevronRight size={14} /></span>
        <span className="breadcrumb-item current">{isEditMode ? 'Edit Labor Entry' : 'Add Labor Entry'}</span>
      </div>

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
            <div style={{ display: 'flex', gap: '10px' }}>
              <div className="form-control-select" style={{ flex: 1 }}>
                <CustomSelect
                  name="supervisorName"
                  value={supervisorName}
                  onChange={(e) => { setSupervisorName(e.target.value); setErrors({...errors, supervisorName: null}); }}
                  options={supervisorsList.map(sup => ({ value: sup.name, label: sup.name }))}
                  placeholder="Select Supervisor"
                  error={!!errors.supervisorName}
                />
              </div>
              <button 
                type="button" 
                className="btn-add-supervisor"
                onClick={() => setShowSupervisorModal(true)}
                title="Add New Supervisor"
                style={{ width: '44px', flexShrink: 0, padding: 0 }}
              >
                <UserPlus size={18} />
              </button>
            </div>
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
                <div className="employee-row-header" onClick={() => toggleRow(emp.id)} style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  
                  <span className="row-index" style={{ flexShrink: 0 }}>{index + 1}.</span>
                  
                  <div className="row-emp-name" style={{ width: '280px', flex: '0 0 auto' }} onClick={(e) => e.stopPropagation()}>
                    <div className="form-control-select">
                      <CustomSelect
                        name={`emp_${emp.id}_name`}
                        value={emp.name}
                        onChange={(e) => { handleEmployeeNameChange(emp.id, e.target.value); setErrors({...errors, [`emp_${emp.id}_name`]: null}); }}
                        options={[
                          ...employeeList.map(e => ({ value: e.name, label: e.name })),
                          { value: '__add_new__', label: '+ Add New Employee' }
                        ]}
                        placeholder="Select Employee Name"
                        error={!!errors[`emp_${emp.id}_name`]}
                      />
                    </div>
                    {errors[`emp_${emp.id}_name`] && <span className="error-text" style={{marginTop: '2px'}}>{errors[`emp_${emp.id}_name`]}</span>}
                  </div>
                  
                  <div className="row-stats" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '24px', margin: 0, minWidth: 'max-content' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="row-stat-label" style={{ margin: 0 }}>Total Weight: </span>
                      <span className="row-stat-val" style={{ margin: 0 }}>{hasData ? formatWeight(empTotalWeight) + ' Kg' : '-'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="row-stat-label" style={{ margin: 0 }}>Total Amount: </span>
                      <span className={`row-stat-val ${hasData && empTotalAmount > 0 ? 'green' : ''}`} style={{ margin: 0 }}>
                        {hasData ? `₹ ${formatMoney(empTotalAmount)}` : '-'}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: 'auto' }}>
                    <div className="row-chevron" style={{ minWidth: '32px', minHeight: '32px' }}>
                      <ChevronRight size={20} />
                    </div>
                    <button className="btn-icon-danger" onClick={(e) => handleDeleteEmployee(emp.id, e)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
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
                    <div className="work-types-table-wrapper">
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
                                  <CustomSelect
                                    name="type"
                                    value={wt.type}
                                    onChange={(e) => handleWorkTypeChange(emp.id, wt.id, 'type', e.target.value)}
                                    options={[
                                      ...workTypeList.map(w => ({ value: w.name, label: w.name })),
                                      { value: '__add_new__', label: '+ Add New Work Type' }
                                    ]}
                                    className="wt-input-small"
                                  />
                                </div>
                              </td>
                              <td>
                                <input 
                                  type="number" 
                                  onWheel={(e) => e.target.blur()}
                                  className={`form-control wt-input-small ${errors[`wt_${wt.id}_weight`] ? 'error-border' : ''}`}
                                  value={wt.weight} 
                                  onChange={(e) => { handleWorkTypeChange(emp.id, wt.id, 'weight', e.target.value); setErrors({...errors, [`wt_${wt.id}_weight`]: null}); }}
                                />
                                {errors[`wt_${wt.id}_weight`] && <div className="error-text">{errors[`wt_${wt.id}_weight`]}</div>}
                              </td>
                              <td>
                                <input 
                                  type="number" 
                                  onWheel={(e) => e.target.blur()}
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
                    </div>
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
                onWheel={(e) => e.target.blur()}
                className="form-control" 
                value={deductions} 
                onChange={(e) => setDeductions(e.target.value)}
              />
              <div className="hint-text">Enter total deductions if any</div>
            </div>
          </div>
          
          <div className="deductions-calc">
            <div className="calc-box">
              <span className="calc-label">Total Amount (₹)</span>
              <span className="calc-val">{formatMoney(grandTotalAmount)}</span>
            </div>
            <div className="calc-operator">
              <span className="calc-label" style={{ visibility: 'hidden' }}>-</span>
              <span className="calc-val" style={{ color: '#9CA3AF', fontWeight: 300 }}>-</span>
            </div>
            <div className="calc-box">
              <span className="calc-label">Deductions (₹)</span>
              <span className="calc-val">{formatMoney(parseFloat(deductions) || 0)}</span>
            </div>
            <div className="calc-operator">
              <span className="calc-label" style={{ visibility: 'hidden' }}>=</span>
              <span className="calc-val" style={{ color: '#9CA3AF', fontWeight: 300 }}>=</span>
            </div>
            <div className="calc-box">
              <span className="calc-label">Payable Amount (₹)</span>
              <span className="calc-val green">{formatMoney(payableAmount)}</span>
            </div>
          </div>
        </div>

        <div className="form-group" style={{marginTop: '1.5rem'}}>
          <label className="form-label">Deduction Reason <span style={{fontWeight: 'normal', color: '#6B7280'}}>(Optional)</span></label>
          <textarea 
            className="form-control"
            value={deductionReason}
            onChange={(e) => setDeductionReason(e.target.value)}
          ></textarea>
          <div className="char-count">{deductionReason.length} / 200</div>
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

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirm Reset</h3>
              <button className="close-btn" onClick={() => setShowResetModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{padding: '24px'}}>
              <p style={{margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.5'}}>Are you sure you want to clear all fields? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowResetModal(false)}>Cancel</button>
              <button type="button" className="btn-primary" style={{backgroundColor: '#ef4444', borderColor: '#ef4444'}} onClick={confirmReset}>Yes, Reset</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Supervisor Modal */}
      {showSupervisorModal && (
        <div className="modal-overlay">
          <div className="modal-content supervisor-modal">
            <div className="modal-header">
              <h3>Add New Supervisor</h3>
              <button className="close-btn" onClick={() => setShowSupervisorModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddNewSupervisor}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Supervisor Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter full name"
                    value={newSupervisorName}
                    onChange={(e) => setNewSupervisorName(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowSupervisorModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isAddingSupervisor}>
                  {isAddingSupervisor ? 'Saving...' : 'Save Supervisor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showEmployeeModal && (
        <div className="modal-overlay">
          <div className="modal-content supervisor-modal">
            <div className="modal-header">
              <h3>Add New Employee</h3>
              <button className="close-btn" onClick={() => setShowEmployeeModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveNewEmployee(); }}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Employee Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter full name"
                    value={newEmpName}
                    onChange={(e) => setNewEmpName(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowEmployeeModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isAddingEmployee}>
                  {isAddingEmployee ? 'Saving...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Work Type Modal */}
      {showWorkTypeModal && (
        <div className="modal-overlay">
          <div className="modal-content supervisor-modal">
            <div className="modal-header">
              <h3>Add New Work Type</h3>
              <button className="close-btn" onClick={() => setShowWorkTypeModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveNewWorkType(); }}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Work Type Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter work type"
                    value={newWtName}
                    onChange={(e) => setNewWtName(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowWorkTypeModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={isAddingWorkType}>
                  {isAddingWorkType ? 'Saving...' : 'Save Work Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddLaborEntry;
