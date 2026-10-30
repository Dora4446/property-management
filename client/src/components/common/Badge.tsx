import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'primary';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    primary: 'bg-teal-50 text-teal-700 border-teal-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  switch (status?.toLowerCase()) {
    case 'available':
    case 'paid':
    case 'active':
    case 'resolved':
    case 'completed':
      return <Badge variant="success">{status}</Badge>;
    case 'pending':
    case 'assigned':
    case 'scheduled':
    case 'in progress':
      return <Badge variant="warning">{status}</Badge>;
    case 'occupied':
      return <Badge variant="primary">{status}</Badge>;
    case 'overdue':
    case 'urgent':
    case 'terminated':
    case 'inactive':
    case 'cancelled':
      return <Badge variant="danger">{status}</Badge>;
    case 'under maintenance':
      return <Badge variant="info">{status}</Badge>;
    default:
      return <Badge variant="default">{status || 'Unknown'}</Badge>;
  }
};
