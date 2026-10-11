import React from 'react';

const Badge = ({
  children,
  variant = 'primary',
  className = '',
}) => {
  const variants = {
    primary: 'bg-accent-primary/15 text-accent-primary border border-accent-primary/30',
    secondary: 'bg-accent-glow/15 text-accent-glow border border-accent-glow/30',
    success: 'bg-success/15 text-success border border-success/30',
    warning: 'bg-warning/15 text-warning border border-warning/30',
    error: 'bg-danger/15 text-danger border border-danger/30',
    info: 'bg-info/15 text-info border border-info/30',
    default: 'bg-surface-hover text-text-secondary border border-border-subtle',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
