import React from 'react';

export default function MobileContainer({ children, className = '' }) {
  return (
    <div className="min-h-screen bg-slate-200/50 flex justify-center">
      <div className={`w-full max-w-md bg-background min-h-screen flex flex-col shadow-xl sm:my-3 sm:rounded-3xl sm:border sm:border-slate-200/60 overflow-x-hidden relative ${className}`}>
        {children}
      </div>
    </div>
  );
}
