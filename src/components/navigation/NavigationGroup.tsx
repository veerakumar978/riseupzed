import React, { useState, useEffect } from 'react';
import { useLocation, NavLink as RouterNavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { NavigationSubItem } from '../../config/navigation';
import { cn } from '../../lib/cn';
import { useTheme } from '../../context/ThemeContext';

export interface NavigationGroupProps {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children: NavigationSubItem[];
  onItemClick?: () => void;
  className?: string;
}

export const NavigationGroup: React.FC<NavigationGroupProps> = ({
  label,
  icon: Icon,
  badge,
  children,
  onItemClick,
  className,
}) => {
  const location = useLocation();
  const { isReducedMotion } = useTheme();

  // Check if any child route is active
  const hasActiveChild = children.some(child => location.pathname === child.path);

  const [isOpen, setIsOpen] = useState(hasActiveChild);

  // Keep expanded if child route is navigated to
  useEffect(() => {
    if (hasActiveChild) {
      setIsOpen(true);
    }
  }, [hasActiveChild]);

  return (
    <div className={cn('flex flex-col space-y-1', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-expanded={isOpen}
        className={cn(
          'w-full group relative flex items-center justify-between px-3 py-2.5 rounded-standard text-sm font-medium transition-all duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-brand-bright-violet',
          hasActiveChild
            ? 'text-themeText-primary bg-panel-elevated/40 font-semibold'
            : 'text-themeText-secondary hover:text-themeText-primary hover:bg-panel-elevated/30'
        )}
      >
        <div className="flex items-center gap-3">
          <Icon
            className={cn(
              'w-4 h-4 shrink-0 transition-colors',
              hasActiveChild ? 'text-brand-bright-violet' : 'text-themeText-muted group-hover:text-themeText-primary'
            )}
          />
          <span className="truncate">{label}</span>
        </div>

        <div className="flex items-center gap-2">
          {badge && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-panel-elevated text-themeText-muted border border-themeBorder">
              {badge}
            </span>
          )}
          <ChevronDown
            className={cn(
              'w-4 h-4 text-themeText-muted transition-transform duration-200',
              isOpen && 'rotate-180 text-themeText-primary'
            )}
          />
        </div>
      </button>

      {/* Collapsible Sub-Items */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={isReducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={isReducedMotion ? undefined : { height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pl-6 pr-1 py-1 space-y-1 border-l-2 border-themeBorder ml-4">
              {children.map(child => (
                <RouterNavLink
                  key={child.id}
                  to={child.path}
                  onClick={onItemClick}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center justify-between px-3 py-2 rounded-control text-xs font-medium transition-colors select-none outline-none focus-visible:ring-1 focus-visible:ring-brand-bright-violet',
                      isActive
                        ? 'bg-brand-bright-violet/15 text-brand-soft-lavender font-semibold border border-brand-bright-violet/30 shadow-sm'
                        : 'text-themeText-muted hover:text-themeText-primary hover:bg-panel-elevated/40'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="truncate">{child.label}</span>
                      {child.badge && (
                        <span
                          className={cn(
                            'text-[9px] font-semibold px-1.5 py-0.2 rounded-full font-mono',
                            isActive
                              ? 'bg-brand-cyber-cyan/20 text-brand-cyber-cyan'
                              : 'bg-panel-primary text-themeText-muted border border-themeBorder'
                          )}
                        >
                          {child.badge}
                        </span>
                      )}
                    </>
                  )}
                </RouterNavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
