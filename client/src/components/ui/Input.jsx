import React, { forwardRef } from 'react';

export const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm font-medium text-text-primary">{label}</label>}
      <input
        ref={ref}
        className={`px-3 py-2 bg-background border ${error ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-primary'} rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-shadow duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
