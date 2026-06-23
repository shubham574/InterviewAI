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
    default: 'bg-white/80 backdrop-blur-md border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
    solid: 'bg-surface border border-border',
    gradient: 'bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]',
  };

  const hoverStyles = hover ? 'hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-primary/30 cursor-pointer group' : '';

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
