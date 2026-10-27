import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sun, Moon, ArrowRight, ShieldCheck, Sparkles, Terminal } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { AmbientBackground } from '../effects/AmbientBackground';
import { Button } from '../ui/Button';
import { ROUTES } from '../../config/routes';
import { ConnectionStatus } from '../feedback/ConnectionStatus';

export const PublicLayout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <AmbientBackground>
      {/* Public Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-themeBorder bg-panel-primary/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          <Link to={ROUTES.HOME} className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-black/70 border border-brand-luxury-gold/40 flex items-center justify-center shadow-[0_0_15px_rgba(245,197,65,0.35)] group-hover:border-brand-luxury-gold group-hover:shadow-[0_0_20px_rgba(245,197,65,0.5)] transition-all overflow-hidden p-1 shrink-0">
              <img src="/logo-emblem.png" alt="RiseUpZed Logo" className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white group-hover:text-brand-luxury-gold transition-colors">
                RISEUP<span className="text-brand-luxury-gold">ZED</span>
              </span>
              <p className="text-[11px] text-themeText-muted hidden sm:block">Member & Wealth Platform</p>
            </div>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-2 sm:gap-4">
            <ConnectionStatus showText={false} className="hidden md:inline-flex" />

            <Link
              to={ROUTES.DEV_BACKEND_STATUS}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-medium text-themeText-secondary hover:text-themeText-primary hover:bg-panel-elevated transition-colors"
            >
              <Terminal className="w-3.5 h-3.5 text-brand-cyber-cyan" />
              <span>Backend Status</span>
            </Link>

            <Link
              to={ROUTES.DEV_DESIGN_SYSTEM}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-control text-xs font-medium text-themeText-secondary hover:text-themeText-primary hover:bg-panel-elevated transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-bright-violet" />
              <span>Design System</span>
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle visual theme"
              className="p-2 rounded-standard text-themeText-secondary hover:text-themeText-primary hover:bg-panel-elevated transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-brand-luxury-gold" />
              ) : (
                <Moon className="w-4 h-4 text-brand-bright-violet" />
              )}
            </button>

            <Link to={ROUTES.DASHBOARD}>
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Launch Demo App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Public Page Slot */}
      <main className="w-full">
        <Outlet />
      </main>

      {/* Public Footer */}
      <footer className="w-full border-t border-themeBorder bg-panel-primary/40 py-8 text-center text-xs text-themeText-muted">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-cyber-cyan" />
            <span className="font-semibold text-themeText-primary">RISEUPZED PROTOCOL</span>
            <span>•</span>
            <span>Module 2 & 3 Interactive Demo Foundation</span>
          </div>
          <p className="max-w-md mx-auto text-themeText-muted leading-relaxed">
            Demonstration environment backed by FastAPI and PostgreSQL. Simulated financial and organizational data.
          </p>
        </div>
      </footer>
    </AmbientBackground>
  );
};
