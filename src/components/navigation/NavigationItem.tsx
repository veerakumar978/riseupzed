import React from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { cn } from '../../lib/cn';

export interface NavigationItemProps {
  id: string;
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  onClick?: () => void;
  className?: string;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  label,
  path,
  icon: Icon,
  badge,
  onClick,
  className,
}) => {
  return (
    <RouterNavLink
      to={path}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center justify-between px-3 py-2.5 rounded-standard text-sm font-medium transition-all duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-brand-bright-violet',
          isActive
            ? 'bg-brand-royal-purple/35 text-white font-semibold border border-brand-bright-violet/40 shadow-glow-purple/20'
            : 'text-themeText-secondary hover:text-themeText-primary hover:bg-panel-elevated/50 border border-transparent',
          className
        )
      }
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3">
            {Icon && (
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0 transition-colors',
                  isActive
                    ? 'text-brand-cyber-cyan'
                    : 'text-themeText-muted group-hover:text-themeText-primary'
                )}
              />
            )}
            <span className="truncate">{label}</span>
          </div>

          {badge && (
            <span
              className={cn(
                'text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 tracking-wide',
                isActive
                  ? 'bg-brand-cyber-cyan/20 text-brand-cyber-cyan border border-brand-cyber-cyan/40'
                  : 'bg-panel-elevated text-themeText-muted border border-themeBorder'
              )}
            >
              {badge}
            </span>
          )}

          {/* Active Indicator Glow Pip */}
          {isActive && (
            <span
              aria-hidden="true"
              className="absolute -left-[1px] top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-brand-cyber-cyan shadow-glow-cyan"
            />
          )}
        </>
      )}
    </RouterNavLink>
  );
};
