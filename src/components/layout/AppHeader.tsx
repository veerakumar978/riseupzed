import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Sun, Moon, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { ConnectionStatus } from '../feedback/ConnectionStatus';
import { Breadcrumbs } from './Breadcrumbs';
import { Tooltip } from '../ui/Tooltip';
import { ROUTES } from '../../config/routes';
import { cn } from '../../lib/cn';

export interface AppHeaderProps {
  onOpenMobileMenu: () => void;
  className?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onOpenMobileMenu,
  className,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  const getInitials = (name?: string) => {
    if (!name) return 'RZ';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-30 w-full h-18 border-b border-themeBorder bg-panel-primary/85 backdrop-blur-xl transition-colors',
        className
      )}
    >
      <div className="h-full px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left Section: Mobile Menu Button & Breadcrumbs */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open navigation menu"
            className="lg:hidden p-2 rounded-control text-themeText-secondary hover:text-themeText-primary hover:bg-panel-elevated transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright-violet"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Breadcrumbs Context */}
          <div className="hidden sm:block">
            <Breadcrumbs />
          </div>

          {/* Mobile Monogram fallback when sidebar is hidden */}
          <div className="sm:hidden flex items-center gap-2">
            <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-black/60 border border-brand-luxury-gold/40 flex items-center justify-center shadow-sm overflow-hidden p-0.5 shrink-0">
                <img src="/logo-emblem.png" alt="RiseUpZed Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-extrabold text-sm tracking-tight text-white">
                RISEUP<span className="text-brand-luxury-gold">ZED</span>
              </span>
            </Link>
          </div>
        </div>

        {/* Right Section: Connection Status, Notifications, Theme Toggle, Profile */}
        <div className="flex items-center gap-2.5">
          {/* Real-time Backend Connection Status Indicator */}
          <ConnectionStatus showText={false} className="sm:inline-flex" />

          {/* Notifications Placeholder */}
          <Tooltip content="Notification Center">
            <button
              type="button"
              className="relative p-2 rounded-standard text-themeText-secondary hover:text-themeText-primary hover:bg-panel-elevated transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright-violet"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-cyber-cyan shadow-glow-cyan" />
            </button>
          </Tooltip>

          {/* Theme Toggle Button */}
          <Tooltip content={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle visual theme"
              className="p-2 rounded-standard text-themeText-secondary hover:text-themeText-primary hover:bg-panel-elevated transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright-violet"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-brand-luxury-gold" />
              ) : (
                <Moon className="w-4 h-4 text-brand-bright-violet" />
              )}
            </button>
          </Tooltip>

          <div className="h-6 w-px bg-themeBorder mx-1 hidden sm:block" />

          {/* Authenticated User Profile Chip */}
          <Link
            to={ROUTES.PROFILE}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-standard hover:bg-panel-elevated transition-colors group select-none"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-electric-violet to-brand-bright-violet flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-white/20">
              {getInitials(user?.display_name)}
            </div>
            <div className="hidden md:block text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-themeText-primary group-hover:text-brand-bright-violet transition-colors">
                  {user?.display_name || 'Johnathan Sterling'}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-luxury-gold/20 text-brand-luxury-gold font-semibold uppercase tracking-wider">
                  {user?.role === 'MANAGER' ? 'MANAGER' : 'VIP'}
                </span>
              </div>
              <span className="text-[11px] text-themeText-muted block font-mono">
                {user?.member_code || 'RZ-8942'}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};
