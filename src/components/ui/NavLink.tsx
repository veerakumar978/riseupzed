import React from 'react';
import { cn } from '../../lib/cn';

export interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children: React.ReactNode;
}

export const NavLink: React.FC<NavLinkProps> = ({
  active = false,
  icon,
  badge,
  children,
  className,
  ...props
}) => {
  return (
    <a
      className={cn(
        'group relative flex items-center justify-between px-3.5 py-2.5 rounded-standard text-sm font-medium transition-all duration-150 select-none',
        active
          ? 'bg-brand-royal-purple/30 text-white border border-brand-bright-violet/40 shadow-glow-purple/20'
          : 'text-themeText-secondary hover:text-themeText-primary hover:bg-panel-elevated/50 border border-transparent',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        {icon && (
          <span
            className={cn(
              'shrink-0 transition-colors',
              active ? 'text-brand-cyber-cyan' : 'text-themeText-muted group-hover:text-themeText-primary'
            )}
          >
            {icon}
          </span>
        )}
        <span>{children}</span>
      </div>

      {badge && <span className="ml-auto">{badge}</span>}

      {/* Active Indicator Glow Pip */}
      {active && (
        <span
          aria-hidden="true"
          className="absolute -left-[1px] top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-brand-cyber-cyan shadow-glow-cyan"
        />
      )}
    </a>
  );
};
