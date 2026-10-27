import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/cn';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
  className,
}) => {
  const { isReducedMotion } = useTheme();
  const switchId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const toggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div className={cn('flex items-start justify-between gap-3 text-left', className)}>
      {(label || description) && (
        <label
          htmlFor={switchId}
          onClick={toggle}
          className={cn('cursor-pointer select-none', disabled && 'opacity-40 cursor-not-allowed')}
        >
          {label && <span className="block text-sm font-medium text-themeText-primary">{label}</span>}
          {description && <span className="block text-xs text-themeText-muted mt-0.5">{description}</span>}
        </label>
      )}

      <button
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={toggle}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright-violet focus-visible:ring-offset-2 focus-visible:ring-offset-midnight',
          'disabled:cursor-not-allowed disabled:opacity-40',
          checked ? 'bg-gradient-to-r from-brand-electric-violet to-brand-bright-violet shadow-glow-purple' : 'bg-panel-elevated border border-themeBorder'
        )}
      >
        <motion.span
          layout={!isReducedMotion}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
};
