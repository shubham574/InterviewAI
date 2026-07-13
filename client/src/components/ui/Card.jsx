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
    default: 'bg-bg-surface/60 backdrop-blur-3xl border border-border-subtle shadow-sm flex flex-col',
    solid: 'bg-bg-elevated border border-border-subtle flex flex-col',
    gradient: 'bg-gradient-to-br from-bg-surface to-bg-elevated border border-border-subtle shadow-sm flex flex-col',
  };

  const hoverStyles = hover ? 'hover:shadow-[0_0_40px_rgba(79,70,229,0.1)] hover:border-accent-primary/40 cursor-pointer group' : '';

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
      <div className={`relative z-10 w-full flex-1 ${padding}`}>
        {children}
      </div>
      
      {/* Subtle top gradient glow for hover cards */}
      {hover && (
        <>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        </>
      )}
    </CardWrapper>
  );
};

export default Card;
