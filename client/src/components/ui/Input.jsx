import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  id,
  type = 'text',
  error,
  icon: Icon,
  className = '',
  textarea = false,
  rows = 4,
  ...props
}, ref) => {
  const baseInputStyles = 'w-full bg-bg-surface border border-border-subtle rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary transition-all shadow-sm';
  const paddingStyles = Icon ? 'pl-10 pr-4 py-2' : 'px-4 py-2';
  const errorStyles = error ? 'border-danger focus:ring-danger/50 focus:border-danger' : '';

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
        
        {textarea ? (
          <textarea
            id={id}
            ref={ref}
            rows={rows}
            className={`${baseInputStyles} ${Icon ? 'pl-10 pr-4 py-2' : 'px-4 py-2'} ${errorStyles} resize-y`}
            {...props}
          />
        ) : (
          <input
            id={id}
            ref={ref}
            type={type}
            className={`${baseInputStyles} ${paddingStyles} ${errorStyles}`}
            {...props}
          />
        )}
      </div>
      {error && (
        <span className="text-sm text-danger mt-1">{error}</span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
