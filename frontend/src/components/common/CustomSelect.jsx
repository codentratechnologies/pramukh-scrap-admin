import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './CustomSelect.css';

const CustomSelect = ({ 
  options, 
  value, 
  onChange, 
  name, 
  placeholder = 'Select an option', 
  className = '',
  disabled = false,
  error = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelect = (option) => {
    if (disabled) return;
    
    // Simulate event object for onChange
    onChange({ 
      target: { 
        name, 
        value: option.value 
      } 
    });
    
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => String(opt.value) === String(value));
  
  let containerClasses = `custom-select-container ${className}`;
  if (disabled) containerClasses += ' disabled';
  
  let triggerClasses = `custom-select-trigger ${isOpen ? 'open' : ''}`;
  if (error) triggerClasses += ' has-error';

  return (
    <div className={containerClasses} ref={containerRef} onClick={(e) => e.stopPropagation()}>
      <div 
        className={triggerClasses}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) setIsOpen(!isOpen);
          }
        }}
      >
        <span className={selectedOption ? 'selected-text' : 'placeholder-text'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className={`select-chevron-wrapper ${isOpen ? 'open' : ''}`}>
          <ChevronDown size={16} className="select-chevron" />
        </div>
      </div>
      
      {isOpen && (
        <div className="custom-select-dropdown">
          {options.map((option, index) => (
            <div 
              key={index} 
              className={`custom-select-option ${String(option.value) === String(value) ? 'selected' : ''}`}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
