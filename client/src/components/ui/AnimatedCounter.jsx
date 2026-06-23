import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';

const AnimatedCounter = ({ value, prefix = '', suffix = '', duration = 2 }) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const springValue = useSpring(0, {
    bounce: 0,
    duration: duration * 1000,
  });
  
  const displayValue = useTransform(springValue, (current) => {
    return Math.round(current);
  });

  useEffect(() => {
    // Small delay to ensure component is mounted before animating
    const timer = setTimeout(() => {
      springValue.set(value);
      setHasAnimated(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [value, springValue]);

  return (
    <span className="inline-flex">
      {prefix}
      <motion.span>{displayValue}</motion.span>
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
