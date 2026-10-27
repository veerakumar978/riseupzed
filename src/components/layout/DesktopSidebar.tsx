import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import { MAIN_NAVIGATION } from '../../config/navigation';
import { ROUTES } from '../../config/routes';
import { NavigationItem } from '../navigation/NavigationItem';
import { NavigationGroup } from '../navigation/NavigationGroup';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/cn';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';

interface DesktopSidebarProps {
  className?: string;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ className }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      showToast({
        title: 'Logged Out',
        message: 'Your demo session has been invalidated.',
        type: 'info',
      });
      navigate(ROUTES.LOGIN);
    } catch {
      navigate(ROUTES.LOGIN);
    }
  };

  return (
    <aside
      className={cn(
        'w-[280px] shrink-0 h-screen sticky top-0 flex flex-col justify-between',
        'border-r border-themeBorder bg-panel-primary text-themeText-primary',
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-18 px-5 border-b border-themeBorder flex items-center justify-between shrink-0">
        <Link to={ROUTES.DASHBOARD} className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-black/60 border border-brand-luxury-gold/40 flex items-center justify-center shadow-[0_0_15px_rgba(245,197,65,0.3)] group-hover:border-brand-luxury-gold group-hover:shadow-[0_0_20px_rgba(245,197,65,0.5)] transition-all overflow-hidden p-1 shrink-0">
            <img src="/logo-emblem.png" alt="RiseUpZed Logo" className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-white group-hover:text-brand-luxury-gold transition-colors">
                RISEUP<span className="text-brand-luxury-gold">ZED</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-luxury-gold/15 text-brand-luxury-gold border border-brand-luxury-gold/30 font-bold">
                VAULT
              </span>
            </div>
            <p className="text-[11px] text-themeText-muted font-medium">
              {user?.role === 'MANAGER' ? 'Executive Portal' : 'Member Portal'}
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {MAIN_NAVIGATION.map((item) => {
          if (item.children && item.children.length > 0) {
            return (
              <NavigationGroup
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                badge={item.badge}
                children={item.children}
              />
            );
          }

          return (
            <NavigationItem
              key={item.id}
              id={item.id}
              label={item.label}
              path={item.path || '#'}
              icon={item.icon}
              badge={item.badge}
            />
          );
        })}
      </div>

      {/* Footer Profile & Logout Area */}
      <div className="p-3 border-t border-themeBorder shrink-0 bg-panel-secondary/30 space-y-2">
        {/* User Card */}
        <div className="p-2.5 rounded-standard border border-themeBorder-subtle bg-panel-elevated/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-brand-bright-violet/20 text-brand-bright-violet flex items-center justify-center shrink-0 font-bold text-xs">
              {user?.display_name ? user.display_name.charAt(0) : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-white block truncate">
                {user?.display_name || 'Demo Member'}
              </span>
              <span className="text-[10px] text-themeText-muted font-mono block">
                {user?.member_code || 'RZ-8942'}
              </span>
            </div>
          </div>
          <Badge variant={user?.role === 'MANAGER' ? 'premium' : 'active'} size="sm">
            {user?.role || 'MEMBER'}
          </Badge>
        </div>

        {/* Sign Out Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-3 py-2 rounded-standard text-xs font-medium text-themeText-muted hover:text-semantic-error hover:bg-semantic-error/10 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-semantic-error"
        >
          <div className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            <span>Sign Out Session</span>
          </div>
          <span className="text-[10px] font-mono text-themeText-muted">Active</span>
        </button>
      </div>
    </aside>
  );
};
