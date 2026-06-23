import React from 'react';
import { motion } from 'motion/react';

const Card = ({
  children,
  variant = 'default',
  className = '',
  padding = 'p-6',
  hover = false,
  onClick,
  ...props
}) => {
  const baseStyles = 'rounded-xl overflow-hidden relative';
  
  const variants = {
    default: 'bg-white border border-gray-100 rounded-2xl shadow-sm transition-all duration-300',
    solid: 'bg-surface border border-border rounded-2xl',
    gradient: 'bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl shadow-sm',
  };

  const hoverStyles = hover ? 'transition-all duration-300 hover:border-primary/50 hover:shadow-primary/10 hover:shadow-xl cursor-pointer group' : '';

  const CardWrapper = hover || onClick ? motion.div : 'div';
  const motionProps = (hover || onClick) ? {
    whileHover: { y: -2 },
    onClick: onClick
  } : {};

  return (
    <CardWrapper
      className={`${baseStyles} ${variants[variant]} ${hoverStyles} ${className}`}
      {...motionProps}
      {...props}
    >
      <div className={`relative z-10 ${padding}`}>
        {children}
      </div>
      
      {/* Subtle top gradient glow for hover cards */}
      {hover && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
    </CardWrapper>
  );
};

export default Card;
