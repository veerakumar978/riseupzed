import React from 'react';
import { cn } from '../../lib/cn';

export interface GlobalLoadingProps {
  message?: string;
  className?: string;
}

export const GlobalLoading: React.FC<GlobalLoadingProps> = ({
  message = 'Loading Riseupzed interface...',
  className,
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex flex-col items-center justify-center p-12 text-center min-h-[300px]', className)}
    >
      <div className="relative mb-4 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-brand-luxury-gold/30 border-t-brand-luxury-gold animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-9 h-9 rounded-lg bg-black/70 border border-brand-luxury-gold/40 flex items-center justify-center p-1 shadow-[0_0_12px_rgba(245,197,65,0.4)]">
            <img src="/logo-emblem.png" alt="RiseUpZed" className="w-full h-full object-contain" />
          </div>
        </div>
      </div>
      <p className="text-sm font-medium text-themeText-secondary animate-pulse">{message}</p>
    </div>
  );
};
