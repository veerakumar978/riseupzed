import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from './Card';
import { cn } from '../../lib/cn';

export interface MetricDisplayProps {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  timeframe?: string;
  icon?: React.ReactNode;
  accent?: 'violet' | 'cyan' | 'gold';
  className?: string;
}

export const MetricDisplay: React.FC<MetricDisplayProps> = ({
  label,
  value,
  change,
  trend = 'neutral',
  timeframe = 'vs last period',
  icon,
  accent = 'violet',
  className,
}) => {
  const iconBgStyles = {
    violet: 'bg-brand-bright-violet/15 text-brand-soft-lavender border-brand-bright-violet/30',
    cyan: 'bg-brand-cyber-cyan/15 text-brand-cyber-cyan border-brand-cyber-cyan/30',
    gold: 'bg-brand-luxury-gold/15 text-brand-luxury-gold border-brand-luxury-gold/30',
  };

  return (
    <Card variant="standard" padding="md" className={cn('flex flex-col justify-between gap-4', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-themeText-secondary uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div
            className={cn(
              'w-9 h-9 rounded-standard flex items-center justify-center border shrink-0',
              iconBgStyles[accent]
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div>
        <div className="text-2xl md:text-3xl font-bold tracking-tight text-themeText-primary tabular-numbers">
          {value}
        </div>

        {(change || timeframe) && (
          <div className="flex items-center gap-2 mt-2 text-xs">
            {change && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 font-medium px-1.5 py-0.5 rounded',
                  trend === 'up' && 'text-semantic-success bg-semantic-success/10',
                  trend === 'down' && 'text-semantic-error bg-semantic-error/10',
                  trend === 'neutral' && 'text-themeText-muted bg-panel-elevated'
                )}
              >
                {trend === 'up' && <TrendingUp className="w-3 h-3 stroke-[2.5]" />}
                {trend === 'down' && <TrendingDown className="w-3 h-3 stroke-[2.5]" />}
                {trend === 'neutral' && <Minus className="w-3 h-3 stroke-[2.5]" />}
                <span>{change}</span>
              </span>
            )}
            {timeframe && <span className="text-themeText-muted">{timeframe}</span>}
          </div>
        )}
      </div>
    </Card>
  );
};
