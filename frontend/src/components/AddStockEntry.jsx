import React, { useState } from 'react';
import { 
  Box, 
  ClipboardList, 
  Package, 
  Calendar, 
  Info, 
  X, 
  Save, 
  CheckCircle2,
  ChevronDown
} from 'lucide-react';
import { apiFetch } from '../utils/api';
import './AddStockEntry.css';

const AddStockEntry = ({ onCancel }) => {
  const [formData, setFormData] = useState({
    materialName: '',
    description: '',
    quantity: '',
    unit: 'kg',
    stockDate: ''
  });
  const [errors, setErrors] = useState({});

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

  const handleSave = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.materialName) newErrors.materialName = 'Material name is required';
    if (!formData.quantity) newErrors.quantity = 'Quantity is required';
    else if (Number(formData.quantity) <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (!formData.stockDate) newErrors.stockDate = 'Stock date is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const response = await apiFetch('/stocks', {
        method: 'POST',
        body: JSON.stringify({
          materialName: formData.materialName,
          description: formData.description,
          quantity: formData.quantity,
          unit: formData.unit,
          stockDate: formData.stockDate
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save stock');
      }
      
      onCancel(); // Return to list after saving
    } catch (error) {
      console.error('Error saving stock:', error);
      alert('Failed to save stock entry. Please make sure the backend server is running.');
    }
  };

  return (
    <div className="add-stock-container">
      <div className="add-stock-header">
        <div className="header-icon-wrapper">
          <Box className="header-icon" />
          <PlusBadge />
        </div>
        <div>
          <h2 className="add-stock-title">Add New Stock Entry</h2>
          <p className="add-stock-subtitle">Fill in the details below to add a new stock entry to your inventory.</p>
        </div>
      </div>

      <div className="add-stock-content">
        {/* Left Side: Form */}
        <div className="add-stock-form-area">
          <form onSubmit={handleSave}>
            {/* Material Name */}
            <div className="form-row">
              <div className="row-info">
                <div className="row-icon-wrapper green-bg">
                  <Box className="row-icon green-icon" size={20} />
                </div>
                <div className="row-labels">
                  <label>Material Name <span className="required">*</span></label>
                  <span className="row-desc">Select the material from the list</span>
                </div>
              </div>
              <div className="row-input">
                <div className="custom-select-wrapper">
                  <select 
                    name="materialName" 
                    value={formData.materialName} 
                    onChange={handleChange}
                    className={`form-input custom-select ${errors.materialName ? 'has-error' : ''}`}
                  >
                    <option value="" disabled>Select material</option>
                    <option value="TMT Bar 12mm">TMT Bar 12mm</option>
                    <option value="Cement 53 Grade">Cement 53 Grade</option>
                    <option value="Bricks (Red)">Bricks (Red)</option>
                    <option value="Sand (Fine)">Sand (Fine)</option>
                  </select>
                  <ChevronDown size={16} className="select-chevron" />
                </div>
                {errors.materialName && <div className="field-error">{errors.materialName}</div>}
              </div>
            </div>



            {/* Description */}
            <div className="form-row">
              <div className="row-info">
                <div className="row-icon-wrapper purple-bg">
                  <ClipboardList className="row-icon purple-icon" size={20} />
                </div>
                <div className="row-labels">
                  <label>Description</label>
                  <span className="row-desc">Enter a short description</span>
                </div>
              </div>
              <div className="row-input">
                <div className="textarea-wrapper">
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter description"
                    rows="3"
                    maxLength={200}
                  ></textarea>
                  <div className="char-count">{formData.description.length} / 200</div>
                </div>
              </div>
            </div>



            {/* Quantity */}
            <div className="form-row">
              <div className="row-info">
                <div className="row-icon-wrapper blue-bg">
                  <Package className="row-icon blue-icon" size={20} />
                </div>
                <div className="row-labels">
                  <label>Quantity <span className="required">*</span></label>
                  <span className="row-desc">Enter the total quantity</span>
                </div>
              </div>
              <div className="row-input">
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



            {/* Stock Date */}
            <div className="form-row">
              <div className="row-info">
                <div className="row-icon-wrapper red-bg">
                  <Calendar className="row-icon red-icon" size={20} />
                </div>
                <div className="row-labels">
                  <label>Stock Date <span className="required">*</span></label>
                  <span className="row-desc">Select the date of stock entry</span>
                </div>
              </div>
              <div className="row-input">
                <div className="date-input-wrapper">
                  <Calendar size={18} className="date-input-icon" />
                  <input 
                    type="date" 
                    name="stockDate" 
                    value={formData.stockDate} 
                    onChange={handleChange}
                    className={`form-input date-input ${errors.stockDate ? 'has-error' : ''}`}
                  />
                </div>
                {errors.stockDate && <div className="field-error">{errors.stockDate}</div>}
              </div>
            </div>
            
          </form>
        </div>

        {/* Right Side: Illustration Card */}
        <div className="add-stock-info-card">
          <div className="illustration-wrapper">
            <img src="/stock-illustration.png" alt="Stock Organization" className="illustration-img" />
          </div>
          <h3 className="info-card-title">Add Stock, Stay Organized</h3>
          <p className="info-card-text">
            Accurate stock entries help you maintain inventory and make smarter business decisions.
          </p>
          <ul className="info-checklist">
            <li><CheckCircle2 size={16} className="check-icon" /> Keep inventory up to date</li>
            <li><CheckCircle2 size={16} className="check-icon" /> Track materials efficiently</li>
            <li><CheckCircle2 size={16} className="check-icon" /> Reduce errors</li>
            <li><CheckCircle2 size={16} className="check-icon" /> Improve reporting accuracy</li>
          </ul>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="add-stock-footer">
        <div className="info-alert">
          <Info size={18} className="info-alert-icon" />
          <span>Please ensure all details are correct before saving the stock entry.</span>
        </div>
        <div className="footer-buttons">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            <X size={18} /> Cancel
          </button>
          <button type="button" className="btn-save" onClick={handleSave}>
            <Save size={18} /> Save Stock
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper component for the little plus badge on the header icon
const PlusBadge = () => (
  <div className="header-icon-plus-badge">
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  </div>
);

export default AddStockEntry;
