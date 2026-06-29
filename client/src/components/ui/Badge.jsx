import React from 'react';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-border text-text-primary',
    success: 'bg-accent/10 text-accent', // assuming we want some opacity, or text-accent
    warning: 'bg-highlight/10 text-highlight',
    primary: 'bg-primary/10 text-primary',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
