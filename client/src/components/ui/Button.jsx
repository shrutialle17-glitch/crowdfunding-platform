import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = 'inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary',
    secondary: 'bg-secondary text-white hover:bg-opacity-90 focus:ring-secondary',
    outline: 'border border-border text-text-primary hover:bg-border focus:ring-border',
    ghost: 'text-text-secondary hover:bg-border hover:text-text-primary focus:ring-border'
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
