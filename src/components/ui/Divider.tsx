import React from 'react';
import { cn } from '../../lib/cn';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  label,
  className,
}) => {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn('w-px h-full bg-themeBorder self-stretch', className)}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        className={cn('relative flex items-center w-full my-4 select-none', className)}
      >
        <div className="flex-grow border-t border-themeBorder" />
        <span className="flex-shrink mx-4 text-xs font-medium uppercase tracking-wider text-themeText-muted">
          {label}
        </span>
        <div className="flex-grow border-t border-themeBorder" />
      </div>
    );
  }

  return (
    <hr
      className={cn('w-full border-t border-themeBorder my-4', className)}
    />
  );
};
