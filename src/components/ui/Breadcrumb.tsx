import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-xs select-none', className)}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1 || item.isCurrent;
          return (
            <li key={index} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <a
                  href={item.href}
                  className="text-themeText-muted hover:text-brand-bright-violet transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={cn(isLast ? 'font-medium text-themeText-primary' : 'text-themeText-muted')}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <ChevronRight className="w-3.5 h-3.5 text-themeText-muted/60 shrink-0" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
