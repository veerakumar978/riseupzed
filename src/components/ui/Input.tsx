import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-themeText-secondary select-none"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-themeText-muted">
              {leftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'w-full h-11 px-3.5 text-sm bg-panel-primary text-themeText-primary placeholder:text-themeText-muted/60',
              'rounded-standard border border-themeBorder transition-all duration-200',
              'hover:border-themeBorder-hover/60',
              'focus:outline-none focus:border-brand-bright-violet focus:ring-2 focus:ring-brand-bright-violet/20',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              leftIcon && 'pl-10',
              (rightIcon || error) && 'pr-10',
              error && 'border-semantic-error focus:border-semantic-error focus:ring-semantic-error/20',
              className
            )}
            {...props}
          />

          {error ? (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-semantic-error">
              <AlertCircle className="w-4 h-4" />
            </div>
          ) : (
            rightIcon && (
              <div className="absolute right-3.5 flex items-center text-themeText-muted">
                {rightIcon}
              </div>
            )
          )}
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

Input.displayName = 'Input';
