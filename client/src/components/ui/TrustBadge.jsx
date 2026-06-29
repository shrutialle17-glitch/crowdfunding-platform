import React from 'react';
import { Badge } from './Badge';

export const TrustBadge = ({ score, isVerified, className = '' }) => {
  // Determine color based on score
  let colorClass = 'bg-border text-text-primary';
  if (score >= 80) colorClass = 'bg-accent/15 text-accent border-accent/30';
  else if (score >= 50) colorClass = 'bg-primary/15 text-primary border-primary/30';
  else if (score >= 20) colorClass = 'bg-highlight/15 text-highlight border-highlight/30';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isVerified && (
        <Badge variant="success" className="shadow-sm">
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
          Verified
        </Badge>
      )}
      <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-lg border shadow-sm ${colorClass}`}>
        Trust: {score}
      </span>
    </div>
  );
};
