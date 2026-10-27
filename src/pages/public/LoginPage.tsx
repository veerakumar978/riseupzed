import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { GlowOrb } from '../../components/effects/GlowOrb';
import { ROUTES } from '../../config/routes';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please provide both your member identifier and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await login(identifier.trim(), password);
      const destination = (location.state as { from?: string })?.from || ROUTES.DASHBOARD;
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid member identifier or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const autofillDemoAccount = (demoId: string, demoPass: string) => {
    setIdentifier(demoId);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-midnight text-themeText-primary flex flex-col justify-center items-center px-4 sm:px-6 relative selection:bg-brand-bright-violet/30 selection:text-white py-12">
      {/* Ambient background glows - fixed background layer */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#5520A8]/20 via-[#17112F]/15 to-transparent blur-[120px] transform-gpu dark:opacity-100 opacity-20" />
        <GlowOrb color="purple" size="lg" className="-top-32 -left-32 opacity-35 dark:opacity-35 opacity-10" />
        <GlowOrb color="cyan" size="md" className="-bottom-32 -right-32 opacity-30 dark:opacity-30 opacity-10" />
        <div className="absolute inset-0 bg-mesh-grid dark:opacity-60 opacity-10 mask-radial" />
      </div>

      {/* Back to Home Link */}
      <div className="w-full max-w-md mb-4 flex justify-start z-10 relative">
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-2 text-xs font-medium text-themeText-secondary hover:text-themeText-primary transition-colors py-1 px-1 rounded focus:outline-none focus:ring-1 focus:ring-brand-bright-violet"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to homepage
        </Link>
      </div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md z-10"
      >
        <Card variant="standard" padding="lg" className="border-brand-bright-violet/30 shadow-elevation-3 relative overflow-hidden backdrop-blur-xl bg-panel-base">
          <div className="space-y-6">
            {/* Header with Official Logo */}
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-1">
                <img
                  src="/logo.png"
                  alt="RiseUpZed Logo"
                  className="w-32 h-32 object-contain filter drop-shadow-[0_0_20px_rgba(245,197,65,0.4)] hover:scale-105 transition-transform"
                />
              </div>
              <h1 className="text-xl font-heading font-extrabold text-white tracking-tight">
                Authorized Access Console
              </h1>
              <p className="text-xs text-themeText-secondary">
                Sign in to your authenticated member or manager session.
              </p>
            </div>

            {/* Active Session Indicator */}
            {isAuthenticated && user && (
              <div className="p-3 rounded-standard bg-brand-bright-violet/10 border border-brand-bright-violet/30 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-themeText-secondary block">Currently logged in:</span>
                  <span className="font-bold text-themeText-primary">{user.display_name} ({user.role})</span>
                </div>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(ROUTES.DASHBOARD)}
                >
                  Dashboard →
                </Button>
              </div>
            )}

            {/* Quick-Access Demo Account Buttons */}
            <div className="p-3.5 rounded-standard border border-brand-bright-violet/20 bg-brand-bright-violet/5 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-brand-lavender">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-bright-violet" />
                  Quick-Access Demo Personas
                </span>
                <Badge variant="active" size="sm">Pre-seeded</Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => autofillDemoAccount('RZ-8942', 'member123')}
                  className="p-2.5 rounded text-left border border-themeBorder bg-panel-elevated hover:border-brand-bright-violet transition-all group cursor-pointer"
                >
                  <span className="font-bold text-themeText-primary block group-hover:text-brand-bright-violet">
                    Member Demo
                  </span>
                  <span className="text-[11px] text-themeText-muted block font-mono">
                    RZ-8942 (Sterling)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => autofillDemoAccount('RZ-1001', 'manager123')}
                  className="p-2.5 rounded text-left border border-themeBorder bg-panel-elevated hover:border-brand-cyber-cyan transition-all group cursor-pointer"
                >
                  <span className="font-bold text-themeText-primary block group-hover:text-brand-cyber-cyan">
                    Manager Demo
                  </span>
                  <span className="text-[11px] text-themeText-muted block font-mono">
                    RZ-1001 (Alex)
                  </span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 rounded-standard bg-semantic-error/10 border border-semantic-error/30 text-semantic-error text-xs flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-themeText-primary block">
                  Member ID or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-themeText-muted">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. RZ-8942 or RZ-1001"
                    required
                    disabled={isLoading}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-standard bg-panel-elevated border border-themeBorder text-themeText-primary placeholder-themeText-muted focus:outline-none focus:border-brand-bright-violet focus:ring-1 focus:ring-brand-bright-violet transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-themeText-primary block">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-themeText-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    disabled={isLoading}
                    className="w-full pl-9 pr-10 py-2.5 text-xs rounded-standard bg-panel-elevated border border-themeBorder text-themeText-primary placeholder-themeText-muted focus:outline-none focus:border-brand-bright-violet focus:ring-1 focus:ring-brand-bright-violet transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-themeText-muted hover:text-themeText-primary"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {isLoading ? 'Authenticating...' : 'Sign In to Account'}
                </Button>
              </div>
            </form>

            {/* Security Notice */}
            <div className="pt-3 border-t border-themeBorder-subtle flex items-center justify-center gap-1.5 text-[11px] text-themeText-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-semantic-success" />
              <span>Server-validated sessions backed by PostgreSQL</span>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
