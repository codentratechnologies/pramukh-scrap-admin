import React, { useState } from 'react';
import { 
  FileText, 
  Lock, 
  Calendar, 
  Clock, 
  Box, 
  ArrowRight, 
  ArrowLeft, 
  Info, 
  X, 
  Save,
  ChevronDown,
  CircleDot,
  Circle
} from 'lucide-react';
import './EditStockEntry.css';

const EditStockEntry = ({ onCancel }) => {
  const [formData, setFormData] = useState({
    actionType: '', // 'add' or 'remove'
    quantity: '',
    unit: 'kg',
    remarks: ''
  });
  
  const [errors, setErrors] = useState({});

  // Dummy data for read-only material profile
  const materialData = {
    name: 'Copper Wire',
    description: 'High quality copper wire scrap used in recycling and melting.',
    currentStock: 450.5,
    unit: 'kg',
    createdDate: '10-Oct-23',
    lastUpdated: '25-Oct-23 10:00 AM'
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleActionTypeChange = (type) => {
    setFormData({
      ...formData,
      actionType: type
    });
    if (errors.actionType) {
      setErrors({
        ...errors,
        actionType: null
      });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.actionType) newErrors.actionType = 'Please select an action type';
    if (!formData.quantity) newErrors.quantity = 'Adjustment quantity is required';
    else if (Number(formData.quantity) <= 0) newErrors.quantity = 'Quantity must be greater than 0';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Save logic would go here
    console.log('Saving stock adjustment:', formData);
    onCancel(); // Redirect back to list
  };

  return (
    <div className="edit-stock-container">
      {/* Material Profile Section */}
      <div className="stock-section-card">
        <div className="section-header-wrapper">
          <div className="header-icon-wrapper light-green-bg">
            <FileText className="header-icon green-icon" size={24} />
          </div>
          <div>
            <h2 className="section-title">Material Profile</h2>
            <p className="section-subtitle">Overview of the selected material.</p>
          </div>
        </div>
        
        <div className="material-profile-content">
          <div className="profile-details-left">
            <div className="profile-row">
              <div className="profile-label">Material Name</div>
              <div className="profile-value fw-600">{materialData.name}</div>
            </div>
            
            <div className="profile-row">
              <div className="profile-label">Description</div>
              <div className="profile-value text-muted">{materialData.description}</div>
            </div>
            
            <div className="profile-row">
              <div className="profile-label">Current Stock (Read-Only)</div>
              <div className="profile-value">
                <div className="stock-badge">
                  {materialData.currentStock} {materialData.unit} <Lock size={14} className="lock-icon" />
                </div>
                <p className="stock-hint">This value is automatically updated based on your adjustments.</p>
              </div>
            </div>
          </div>
          
          <div className="profile-details-right">
            <div className="date-info-card">
              <div className="date-icon-box">
                <Calendar size={20} className="green-icon" />
              </div>
              <div className="date-text-box">
                <span className="date-label">Created Date</span>
                <span className="date-value">{materialData.createdDate}</span>
              </div>
            </div>
            
            <div className="date-info-card mt-3">
              <div className="date-icon-box">
                <Clock size={20} className="green-icon" />
              </div>
              <div className="date-text-box">
                <span className="date-label">Last Updated</span>
                <span className="date-value">{materialData.lastUpdated}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Adjust Stock Section */}
      <div className="stock-section-card mt-4">
        <div className="section-header-wrapper">
          <div className="header-icon-wrapper light-green-bg">
            <Box className="header-icon green-icon" size={24} />
          </div>
          <div>
            <h2 className="section-title">Adjust Stock</h2>
            <p className="section-subtitle">Choose an action and enter the details to update stock.</p>
          </div>
        </div>

        <div className="adjust-stock-content">
          {/* Left Form */}
          <div className="adjust-form-left">
            
            {/* Action Type */}
            <div className="adjust-form-row">
              <div className="adjust-label-col">
                <label>Action Type <span className="required">*</span></label>
                <span className="adjust-desc">Select the type of adjustment</span>
              </div>
              <div className="adjust-input-col">
                <div className="action-type-cards">
                  
                  {/* Add Stock Card */}
                  <div 
                    className={`action-card add-card ${formData.actionType === 'add' ? 'selected' : ''}`}
                    onClick={() => handleActionTypeChange('add')}
                  >
                    <div className="action-radio-icon">
                      {formData.actionType === 'add' ? <CircleDot size={20} className="green-icon" /> : <Circle size={20} className="text-muted" />}
                    </div>
                    <ArrowRight size={18} className={`action-arrow ${formData.actionType === 'add' ? 'green-icon' : 'text-muted'}`} />
                    <div className="action-text-content">
                      <div className={`action-title ${formData.actionType === 'add' ? 'green-text' : ''}`}>Add Stock (Inbound)</div>
                      <div className="action-subtitle">Increase current stock</div>
                    </div>
                  </div>

                  {/* Remove Stock Card */}
                  <div 
                    className={`action-card remove-card ${formData.actionType === 'remove' ? 'selected' : ''}`}
                    onClick={() => handleActionTypeChange('remove')}
                  >
                    <div className="action-radio-icon">
                      {formData.actionType === 'remove' ? <CircleDot size={20} className="red-icon" /> : <Circle size={20} className="text-muted" />}
                    </div>
                    <ArrowLeft size={18} className={`action-arrow ${formData.actionType === 'remove' ? 'red-icon' : 'text-muted'}`} />
                    <div className="action-text-content">
                      <div className={`action-title ${formData.actionType === 'remove' ? 'red-text' : ''}`}>Remove Stock (Outbound)</div>
                      <div className="action-subtitle">Decrease current stock</div>
                    </div>
                  </div>

                </div>
                {errors.actionType && <div className="field-error">{errors.actionType}</div>}
              </div>
            </div>



            {/* Quantity */}
            <div className="adjust-form-row">
              <div className="adjust-label-col">
                <label>Quantity <span className="required">*</span></label>
                <span className="adjust-desc">Enter adjustment quantity</span>
              </div>
              <div className="adjust-input-col">
                <div className={`quantity-input-group ${errors.quantity ? 'has-error' : ''}`}>
                  <input 
                    type="number" 
                    name="quantity" 
                    value={formData.quantity} 
                    onChange={handleChange}
                    className="form-input quantity-input"
                    placeholder="Enter quantity"
                  />
                  <div className="unit-select-wrapper">
                    <select 
                      name="unit" 
                      value={formData.unit} 
                      onChange={handleChange}
                      className="unit-select"
                    >
                      <option value="kg">kg</option>
                      <option value="bag">bag</option>
                      <option value="pcs">pcs</option>
                      <option value="cft">cft</option>
                    </select>
                    <ChevronDown size={14} className="unit-chevron" />
                  </div>
                </div>
                {errors.quantity && <div className="field-error">{errors.quantity}</div>}
              </div>
            </div>



            {/* Remarks */}
            <div className="adjust-form-row">
              <div className="adjust-label-col">
                <label>Remarks</label>
                <span className="adjust-desc">Enter reason for adjustment</span>
              </div>
              <div className="adjust-input-col">
                <div className="textarea-wrapper">
                  <textarea 
                    name="remarks" 
                    value={formData.remarks} 
                    onChange={handleChange}
                    className={`form-input ${errors.remarks ? 'has-error' : ''}`}
                    placeholder="Enter remarks"
                    rows="3"
                    maxLength={200}
                  ></textarea>
                  <div className="char-count">{formData.remarks.length} / 200</div>
                </div>
                {errors.remarks && <div className="field-error">{errors.remarks}</div>}
              </div>
            </div>

          </div>

          {/* Right Info Box */}
          <div className="adjust-info-right">
            <div className="important-box">
              <div className="important-header">
                <Info size={18} className="green-icon" />
                <span>Important</span>
              </div>
              <ul className="important-list">
                <li>Current Stock is read-only and cannot be edited.</li>
                <li>Select an action (Add or Remove) to proceed.</li>
                <li>New current stock will be calculated automatically after saving.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="edit-stock-footer">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            <X size={18} /> Cancel
          </button>
          <button type="button" className="btn-save" onClick={handleSave}>
            <Save size={18} /> Save Adjustment
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditStockEntry;
