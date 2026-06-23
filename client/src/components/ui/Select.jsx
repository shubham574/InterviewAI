import React, { forwardRef } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const Select = forwardRef(({
  label,
  id,
  options = [],
  error,
  className = '',
  icon: Icon,
  ...props
}, ref) => {
  const baseSelectStyles = 'w-full appearance-none bg-white border border-gray-200 rounded-xl text-text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all';
  const paddingStyles = Icon ? 'pl-10 pr-10 py-2' : 'px-4 py-2 pr-10';
  const errorStyles = error ? 'border-error focus:ring-error/50 focus:border-error' : '';

  return (
    <div className={`flex flex-col space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
            <Icon className="h-5 w-5" />
          </div>
        )}
        
        <select
          id={id}
          ref={ref}
          className={`${baseSelectStyles} ${paddingStyles} ${errorStyles}`}
          {...props}
        >
          {options.map((opt, index) => (
            <option key={index} value={opt.value || opt} className="bg-white text-text-primary">
              {opt.label || opt}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-text-muted">
          <FiChevronDown className="h-5 w-5" />
        </div>
      </div>
      {error && (
        <span className="text-sm text-error mt-1">{error}</span>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
