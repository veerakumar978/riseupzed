import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Wallet,
  Users,
  Activity,
  Terminal,
  Sparkles,
  Award,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ROUTES } from '../../config/routes';

export const LandingPlaceholder: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-20 text-left">
      {/* Hero Announcement */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-bright-violet/40 bg-brand-bright-violet/10 text-xs font-semibold text-brand-soft-lavender shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-brand-cyber-cyan" />
          <span>Module 2 & 3: Application Shell & Backend Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-themeText-primary leading-[1.1]">
          Sovereign Member & <span className="text-gradient-purple">Wallet Portal</span>
        </h1>

        <p className="text-base sm:text-lg text-themeText-secondary leading-relaxed max-w-2xl">
          RiseUpZed delivers high-assurance multi-currency vaults, binary organization tracking, and automated ledger settlement. Explore the interactive application shell and backend foundation.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <Link to={ROUTES.DASHBOARD}>
            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Open Demo Dashboard
            </Button>
          </Link>
          <Link to={ROUTES.DEV_BACKEND_STATUS}>
            <Button variant="secondary" size="lg" leftIcon={<Terminal className="w-5 h-5" />}>
              Inspect Backend Health
            </Button>
          </Link>
          <Link to={ROUTES.DEV_DESIGN_SYSTEM}>
            <Button variant="outline" size="lg" leftIcon={<Sparkles className="w-5 h-5" />}>
              Design System Preview
            </Button>
          </Link>
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="standard" padding="md" className="space-y-3">
          <div className="w-10 h-10 rounded-standard bg-brand-bright-violet/15 text-brand-bright-violet flex items-center justify-center border border-brand-bright-violet/30">
            <Wallet className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-themeText-primary">Multi-Currency Vaults</h3>
          <p className="text-xs text-themeText-secondary leading-relaxed">
            Transaction and mother wallets tracked via high-precision decimal ledgers for transparent accounting.
          </p>
          <span className="text-[11px] text-themeText-muted font-mono block pt-1">Target: Module 5</span>
        </Card>

        <Card variant="standard" padding="md" className="space-y-3">
          <div className="w-10 h-10 rounded-standard bg-brand-cyber-cyan/15 text-brand-cyber-cyan flex items-center justify-center border border-brand-cyber-cyan/30">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-themeText-primary">Binary Organization</h3>
          <p className="text-xs text-themeText-secondary leading-relaxed">
            Left and right hierarchical lineage management with strict cycle prevention and parent-child indexing.
          </p>
          <span className="text-[11px] text-themeText-muted font-mono block pt-1">Target: Module 6</span>
        </Card>

        <Card variant="standard" padding="md" className="space-y-3">
          <div className="w-10 h-10 rounded-standard bg-brand-luxury-gold/15 text-brand-luxury-gold flex items-center justify-center border border-brand-luxury-gold/30">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-themeText-primary">Tiered VIP Upgrades</h3>
          <p className="text-xs text-themeText-secondary leading-relaxed">
            Diamond, Platinum, and Gold membership tiers with audited yield schedules and verification records.
          </p>
          <span className="text-[11px] text-themeText-muted font-mono block pt-1">Target: Module 7</span>
        </Card>

        <Card variant="standard" padding="md" className="space-y-3">
          <div className="w-10 h-10 rounded-standard bg-semantic-info/15 text-semantic-info flex items-center justify-center border border-semantic-info/30">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="text-base font-semibold text-themeText-primary">FastAPI & PostgreSQL</h3>
          <p className="text-xs text-themeText-secondary leading-relaxed">
            Type-safe Pydantic models, SQLAlchemy 2.0 ORM, and Alembic migrations running locally.
          </p>
          <span className="text-[11px] text-brand-cyber-cyan font-mono block pt-1">Implemented: Module 3</span>
        </Card>
      </div>

      {/* Structural Preview Callout */}
      <Card variant="gradient-feature" padding="lg" className="border-brand-bright-violet/40">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="active" size="sm">APPLICATION SHELL READY</Badge>
              <Badge variant="success" size="sm" dot>Module 2 & 3 Live</Badge>
            </div>
            <h3 className="text-xl font-bold text-white">
              Every future screen plugs seamlessly into the new application shell.
            </h3>
            <p className="text-xs text-themeText-secondary max-w-xl leading-relaxed">
              Desktop navigation, mobile drawer, breadcrumbs, theme persistence, and typed API client have been wired up. The public landing experience will be expanded in Module 4.
            </p>
          </div>
          <Link to={ROUTES.DASHBOARD} className="shrink-0">
            <Button variant="primary" size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Enter Member Portal
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
