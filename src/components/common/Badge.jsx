import React from 'react';
import { APPOINTMENT_STATUS } from '../../data/constants';

export default function Badge({
  status,
  children,
  size = 'md',
  className = ''
}) {
  const statusConfig = APPOINTMENT_STATUS[status] || {
    label: children || 'Statut',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-400'
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs font-semibold px-2.5 py-1 gap-1.5',
    lg: 'text-sm font-semibold px-3 py-1.5 gap-2'
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${statusConfig.badgeClass} ${sizeClasses[size]} ${className}`}
    >
      <span className={`w-2 h-2 rounded-full ${statusConfig.dotClass}`} />
      <span>{children || statusConfig.label}</span>
    </span>
  );
}
