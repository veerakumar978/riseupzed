import React from 'react';
import { Inbox } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-10 text-center rounded-featured border border-dashed border-themeBorder bg-panel-primary/40',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-panel-elevated border border-themeBorder flex items-center justify-center text-brand-soft-lavender mb-4 shadow-sm">
        {icon || <Inbox className="w-6 h-6 stroke-[1.5]" />}
      </div>
      <h4 className="text-base font-semibold text-themeText-primary mb-1">{title}</h4>
      {description && (
        <p className="text-xs text-themeText-muted max-w-sm leading-relaxed mb-5">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};
