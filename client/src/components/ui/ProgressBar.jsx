import React from 'react';
import { motion } from 'motion/react';

const ProgressBar = ({ progress = 0, label, showValue = true, colorClass = 'bg-primary' }) => {
  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1 text-sm font-medium">
          {label && <span className="text-text-secondary">{label}</span>}
          {showValue && <span className="text-text-primary">{progress}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-full ${colorClass} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
