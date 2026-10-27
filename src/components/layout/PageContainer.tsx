import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/cn';

export interface PageContainerProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  maxWidth?: 'standard' | 'wide' | 'full';
  children: React.ReactNode;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  title,
  description,
  actions,
  badge,
  maxWidth = 'standard',
  children,
  className,
}) => {
  const { isReducedMotion } = useTheme();

  const maxWidthStyles = {
    standard: 'max-w-7xl',
    wide: 'max-w-[1440px]',
    full: 'max-w-full',
  };

  return (
    <motion.div
      initial={isReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0, 0, 0.2, 1] }}
      className={cn(
        'w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6',
        maxWidthStyles[maxWidth],
        className
      )}
    >
      {(title || description || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-themeBorder-subtle">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2.5 flex-wrap">
              {title && (
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-themeText-primary">
                  {title}
                </h1>
              )}
              {badge && <div>{badge}</div>}
            </div>
            {description && (
              <p className="text-xs sm:text-sm text-themeText-secondary leading-relaxed max-w-2xl">
                {description}
              </p>
            )}
          </div>

          {actions && <div className="flex items-center gap-2.5 shrink-0 flex-wrap">{actions}</div>}
        </div>
      )}

      {/* Main Content Area */}
      <div className="w-full text-left">{children}</div>
    </motion.div>
  );
};
