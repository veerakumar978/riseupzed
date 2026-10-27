import React from 'react';
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';
import { cn } from '../../lib/cn';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps {
  type?: AlertType;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  className,
}) => {
  const config = {
    info: {
      icon: <Info className="w-4 h-4 shrink-0 text-semantic-info" />,
      styles: 'bg-semantic-info/10 border-semantic-info/30 text-themeText-primary',
      titleColor: 'text-semantic-info',
    },
    success: {
      icon: <CheckCircle2 className="w-4 h-4 shrink-0 text-semantic-success" />,
      styles: 'bg-semantic-success/10 border-semantic-success/30 text-themeText-primary',
      titleColor: 'text-semantic-success',
    },
    warning: {
      icon: <AlertTriangle className="w-4 h-4 shrink-0 text-semantic-warning" />,
      styles: 'bg-semantic-warning/10 border-semantic-warning/30 text-themeText-primary',
      titleColor: 'text-semantic-warning',
    },
    error: {
      icon: <XCircle className="w-4 h-4 shrink-0 text-semantic-error" />,
      styles: 'bg-semantic-error/10 border-semantic-error/30 text-themeText-primary',
      titleColor: 'text-semantic-error',
    },
  };

  const current = config[type];

  return (
    <div
      role="alert"
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-standard border shadow-sm text-sm text-left',
        current.styles,
        className
      )}
    >
      <div className="mt-0.5">{current.icon}</div>
      <div className="flex-1">
        {title && <h5 className={cn('font-semibold mb-1', current.titleColor)}>{title}</h5>}
        <div className="text-themeText-secondary leading-relaxed">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-themeText-muted hover:text-themeText-primary transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
