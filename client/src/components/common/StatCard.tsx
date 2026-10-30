import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  color?: 'teal' | 'navy' | 'amber' | 'emerald' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendDirection = 'up',
  color = 'teal',
}) => {
  const colorMap = {
    teal: {
      bg: 'bg-teal-50',
      iconColor: 'text-teal-600',
      border: 'border-teal-100',
    },
    navy: {
      bg: 'bg-slate-100',
      iconColor: 'text-slate-800',
      border: 'border-slate-200',
    },
    amber: {
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      border: 'border-amber-100',
    },
    emerald: {
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      border: 'border-emerald-100',
    },
    rose: {
      bg: 'bg-rose-50',
      iconColor: 'text-rose-600',
      border: 'border-rose-100',
    },
  };

  const selected = colorMap[color];

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-card hover-lift flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${selected.bg} ${selected.iconColor} border ${selected.border}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{subtitle}</span>
          {trend && (
            <span
              className={`font-semibold ${
                trendDirection === 'up'
                  ? 'text-emerald-600'
                  : trendDirection === 'down'
                  ? 'text-rose-600'
                  : 'text-slate-600'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
