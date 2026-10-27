import React from 'react';
import { cn } from '../../lib/cn';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  label,
  className,
  disabled = false,
}) => {
  return (
    <div className={cn('flex flex-col gap-2.5 text-left', className)}>
      {label && (
        <span className="text-xs font-medium text-themeText-secondary select-none">
          {label}
        </span>
      )}

      <div className="space-y-2">
        {options.map(opt => {
          const isSelected = value === opt.value;
          return (
            <label
              key={opt.value}
              className={cn(
                'flex items-start gap-3 p-3.5 rounded-standard border transition-all duration-150 cursor-pointer select-none',
                isSelected
                  ? 'border-brand-bright-violet/60 bg-brand-bright-violet/10 shadow-glow-purple/20'
                  : 'border-themeBorder bg-panel-primary hover:border-themeBorder-hover/60 hover:bg-panel-elevated/40',
                disabled && 'opacity-40 cursor-not-allowed'
              )}
            >
              <div className="relative flex items-center justify-center h-5 mt-0.5">
                <input
                  type="radio"
                  name={name}
                  value={opt.value}
                  checked={isSelected}
                  onChange={() => onChange(opt.value)}
                  disabled={disabled}
                  className="sr-only"
                />
                <div
                  className={cn(
                    'w-4 h-4 rounded-full border flex items-center justify-center transition-colors',
                    isSelected
                      ? 'border-brand-bright-violet'
                      : 'border-themeBorder'
                  )}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-brand-bright-violet" />
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-themeText-primary">
                    {opt.label}
                  </span>
                  {opt.badge && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand-cyber-cyan/15 text-brand-cyber-cyan border border-brand-cyber-cyan/30">
                      {opt.badge}
                    </span>
                  )}
                </div>
                {opt.description && (
                  <p className="text-xs text-themeText-muted mt-0.5">
                    {opt.description}
                  </p>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};
