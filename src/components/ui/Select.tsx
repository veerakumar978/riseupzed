import React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      options,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-medium text-themeText-secondary select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full h-11 pl-3.5 pr-10 text-sm bg-panel-primary text-themeText-primary appearance-none cursor-pointer',
              'rounded-standard border border-themeBorder transition-all duration-200',
              'hover:border-themeBorder-hover/60',
              'focus:outline-none focus:border-brand-bright-violet focus:ring-2 focus:ring-brand-bright-violet/20',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              error && 'border-semantic-error focus:border-semantic-error focus:ring-semantic-error/20',
              className
            )}
            {...props}
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-panel-primary text-themeText-primary py-1">
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3.5 flex items-center pointer-events-none text-themeText-muted">
            {error ? <AlertCircle className="w-4 h-4 text-semantic-error" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>

        {error ? (
          <p className="text-xs text-semantic-error font-medium flex items-center gap-1 mt-0.5">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-themeText-muted mt-0.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
