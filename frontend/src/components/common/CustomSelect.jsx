import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
  const [dropdownCoords, setDropdownCoords] = useState({ top: 0, left: 0, width: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      // Allow clicking inside the portal dropdown
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target) &&
        !event.target.closest('.custom-select-dropdown')
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = (event) => {
      if (event.target.closest && event.target.closest('.custom-select-dropdown')) return;
      setIsOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownCoords({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    }
  }, [isOpen]);

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
          {isOpen ? (
            <ChevronUp size={16} className="select-chevron" />
          ) : (
            <ChevronDown size={16} className="select-chevron" />
          )}
        </div>
      </div>
      
      {isOpen && createPortal(
        <div 
          className="custom-select-dropdown"
          style={{ top: dropdownCoords.top, left: dropdownCoords.left, width: dropdownCoords.width }}
        >
          {options.map((option, index) => (
            <div 
              key={index} 
              className={`custom-select-option ${String(option.value) === String(value) ? 'selected' : ''}`}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect(option);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default CustomSelect;
