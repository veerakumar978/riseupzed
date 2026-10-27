import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  description?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      label,
      description,
      checked = false,
      onChange,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const checkboxId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.checked);
    };

    return (
      <div className={cn('flex items-start gap-3 text-left', className)}>
        <div className="relative flex items-center h-5">
          <input
            id={checkboxId}
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled}
            className="peer sr-only"
            {...props}
          />
          <label
            htmlFor={checkboxId}
            className={cn(
              'w-5 h-5 rounded-control flex items-center justify-center cursor-pointer transition-all duration-150',
              'border border-themeBorder bg-panel-primary peer-focus-visible:ring-2 peer-focus-visible:ring-brand-bright-violet',
              'hover:border-brand-bright-violet/50',
              checked && 'bg-gradient-to-br from-brand-electric-violet to-brand-bright-violet border-brand-bright-violet text-white shadow-glow-purple',
              disabled && 'opacity-40 cursor-not-allowed'
            )}
          >
            {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </label>
        </div>

        {(label || description) && (
          <label
            htmlFor={checkboxId}
            className={cn('cursor-pointer select-none text-left', disabled && 'opacity-40 cursor-not-allowed')}
          >
            {label && <span className="block text-sm font-medium text-themeText-primary">{label}</span>}
            {description && <span className="block text-xs text-themeText-muted mt-0.5">{description}</span>}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
