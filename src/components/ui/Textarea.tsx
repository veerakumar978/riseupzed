import React from 'react';
import { cn } from '../../lib/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      id,
      disabled,
      rows = 3,
      ...props
    },
    ref
  ) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-xs font-medium text-themeText-secondary select-none"
          >
            {label}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          rows={rows}
          disabled={disabled}
          className={cn(
            'w-full p-3.5 text-sm bg-panel-primary text-themeText-primary placeholder:text-themeText-muted/60',
            'rounded-standard border border-themeBorder transition-all duration-200 resize-y min-h-[90px]',
            'hover:border-themeBorder-hover/60',
            'focus:outline-none focus:border-brand-bright-violet focus:ring-2 focus:ring-brand-bright-violet/20',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            error && 'border-semantic-error focus:border-semantic-error focus:ring-semantic-error/20',
            className
          )}
          {...props}
        />

        {error ? (
          <p className="text-xs text-semantic-error font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-themeText-muted">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
