import React from 'react';

export default function Card({
  children,
  className = '',
  onClick,
  interactive = false,
  selected = false,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200
        ${selected
          ? 'border-primary ring-2 ring-primary/20 shadow-soft bg-primary-50/20'
          : 'border-slate-100 shadow-card hover:border-slate-200'
        }
        ${interactive ? 'cursor-pointer hover:shadow-soft active:scale-[0.99]' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
