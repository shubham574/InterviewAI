import React from 'react';
import { motion } from 'motion/react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background hover:-translate-y-0.5 active:translate-y-0';
  
  const variants = {
    primary: 'bg-gradient-primary text-white hover:opacity-95 focus:ring-accent-primary/30 shadow-lg shadow-accent-primary/25 hover:shadow-xl hover:shadow-accent-primary/30',
    secondary: 'bg-bg-surface hover:bg-surface-hover text-text-primary border border-border-subtle shadow-sm hover:shadow-md',
    danger: 'bg-danger text-white hover:bg-danger/90 shadow-lg shadow-danger/20 hover:shadow-xl hover:shadow-danger/30',
    ghost: 'hover:bg-surface-hover text-text-secondary hover:text-text-primary',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const disabledStyles = disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={!(disabled || loading) ? { scale: 0.98 } : {}}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyles} ${disabledStyles} ${className}`}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className="mr-2 h-5 w-5" />
      ) : null}
      {children}
    </motion.button>
  );
};

export default Button;
