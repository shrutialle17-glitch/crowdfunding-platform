import React from 'react';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-surface rounded-2xl shadow-warm-sm border border-border overflow-hidden ${className}`} {...props}>
      {children}
    </div>
  );
};
