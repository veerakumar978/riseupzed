import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogOut, User as UserIcon } from 'lucide-react';
import { MAIN_NAVIGATION } from '../../config/navigation';
import { NavigationItem } from '../navigation/NavigationItem';
import { NavigationGroup } from '../navigation/NavigationGroup';
import { Badge } from '../ui/Badge';
import { ROUTES } from '../../config/routes';
import { useToast } from '../ui/Toast';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/cn';

export interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { isReducedMotion } = useTheme();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    onClose();
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Slide-out Drawer */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
            initial={isReducedMotion ? false : { x: '-100%' }}
            animate={{ x: 0 }}
            exit={isReducedMotion ? undefined : { x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={cn(
              'relative z-10 w-[85%] max-w-xs h-full flex flex-col justify-between',
              'bg-panel-primary border-r border-themeBorder text-themeText-primary shadow-2xl'
            )}
          >
            {/* Header */}
            <div className="h-18 px-5 border-b border-themeBorder flex items-center justify-between shrink-0">
              <Link to={ROUTES.DASHBOARD} onClick={onClose} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black/60 border border-brand-luxury-gold/40 flex items-center justify-center shadow-[0_0_12px_rgba(245,197,65,0.3)] overflow-hidden p-1 shrink-0">
                  <img src="/logo-emblem.png" alt="RiseUpZed Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="font-extrabold text-base tracking-tight text-white">
                    RISEUP<span className="text-brand-luxury-gold">ZED</span>
                  </span>
                  <p className="text-[11px] text-themeText-muted">
                    {user?.role === 'MANAGER' ? 'Executive Portal' : 'Member Portal'}
                  </p>
                </div>
              </Link>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-control text-themeText-muted hover:text-themeText-primary hover:bg-panel-elevated transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Body */}
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
                      onItemClick={onClose}
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
                    onClick={onClose}
                  />
                );
              })}
            </div>

            {/* Footer Profile & Sign Out */}
            <div className="p-3 border-t border-themeBorder shrink-0 bg-panel-secondary/30 space-y-2">
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

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-standard text-xs font-medium text-semantic-error/90 hover:text-semantic-error hover:bg-semantic-error/10 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out Session</span>
                </div>
                <span className="text-[10px] font-mono text-themeText-muted">Active</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
