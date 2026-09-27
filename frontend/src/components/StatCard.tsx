import React from 'react';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
  colorVariant?: 'blue' | 'emerald' | 'violet' | 'amber' | 'rose';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  colorVariant = 'blue',
  onClick,
}) => {
  const iconColors = {
    blue: 'text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700',
    emerald: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    violet: 'text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
    amber: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    rose: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
  };

  return (
    <div 
      onClick={onClick}
      className={`glass-card rounded-xl p-5 relative overflow-hidden transition-all border border-aura-border group ${
        onClick ? 'cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md active:scale-[0.99]' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] font-semibold tracking-wider text-aura-muted uppercase">{title}</p>
            {onClick && (
              <ArrowUpRight className="w-3 h-3 text-aura-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-aura-text">{value}</h3>
          {subtitle && <p className="text-xs text-aura-secondary">{subtitle}</p>}
          
          {trend && (
            <div className="pt-1.5 flex items-center gap-1.5">
              <span className={`inline-flex items-center text-[11px] font-semibold px-1.5 py-0.5 rounded border ${
                trendPositive 
                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' 
                  : 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
              }`}>
                {trendPositive ? '↑' : '↓'} {trend}
              </span>
              <span className="text-[11px] text-aura-muted">vs yesterday</span>
            </div>
          )}
        </div>

        <div className={`p-2.5 rounded-lg border ${iconColors[colorVariant]} transition-transform group-hover:scale-105`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
