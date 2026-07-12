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
  const baseStyles = 'rounded-3xl overflow-hidden relative transition-all duration-300';
  
  const variants = {
    default: 'bg-bg-surface backdrop-blur-md border border-border-subtle shadow-sm',
    solid: 'bg-bg-elevated border border-border-subtle',
    gradient: 'bg-gradient-to-br from-bg-surface to-bg-elevated border border-border-subtle shadow-sm',
  };

  const hoverStyles = hover ? 'hover:-translate-y-1 hover:shadow-md hover:border-accent-primary/30 cursor-pointer group' : '';

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
