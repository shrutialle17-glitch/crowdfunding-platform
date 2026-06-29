import React from 'react';
import { motion } from 'framer-motion';

export const ProgressBar = ({ progress = 0, className = '' }) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className={`w-full bg-border rounded-full h-2.5 overflow-hidden ${className}`}>
      <motion.div
        className="bg-primary h-2.5 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${clampedProgress}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  );
};
