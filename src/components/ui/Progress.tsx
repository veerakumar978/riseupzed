import React from 'react';
import { cn } from '../../lib/cn';

export interface ProgressProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showPercentage?: boolean;
  variant?: 'purple' | 'cyan' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  label,
  showPercentage = false,
  variant = 'gradient',
  size = 'md',
  className,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variantStyles = {
    purple: 'bg-brand-bright-violet',
    cyan: 'bg-brand-cyber-cyan',
    gradient: 'bg-gradient-to-r from-brand-bright-violet to-brand-cyber-cyan',
  };

  return (
    <div className={cn('w-full flex flex-col gap-1.5 text-left', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="font-medium text-themeText-secondary">{label}</span>}
          {showPercentage && (
            <span className="font-semibold text-themeText-primary tabular-nums">
              {percentage}%
            </span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(
          'w-full bg-panel-elevated rounded-full overflow-hidden border border-themeBorder-subtle',
          sizeStyles[size]
        )}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-300 ease-out', variantStyles[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'purple' | 'cyan' | 'gradient';
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 56,
  strokeWidth = 6,
  className,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-panel-elevated"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progress-gradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-300 ease-out"
        />
        <defs>
          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#22D3EE" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute text-xs font-semibold tabular-nums text-themeText-primary">
        {Math.round(value)}%
      </span>
    </div>
  );
};
