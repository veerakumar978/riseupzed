import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Users,
  TrendingUp,
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowRight,
  Award,
  Terminal,
} from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MetricDisplay } from '../../components/ui/MetricDisplay';
import { TiltCard } from '../../components/effects/TiltCard';
import { ROUTES } from '../../config/routes';

export const DashboardPlaceholder: React.FC = () => {
  return (
    <PageContainer
      title="Member Dashboard"
      description="Welcome to your Riseupzed member portal demo. Application shell and navigation foundation."
      badge={<Badge variant="active" size="sm">DEMO SESSION</Badge>}
      actions={
        <div className="flex items-center gap-2">
          <Link to={ROUTES.DEV_BACKEND_STATUS}>
            <Button variant="outline" size="sm" leftIcon={<Terminal className="w-3.5 h-3.5 text-brand-cyber-cyan" />}>
              Backend Health
            </Button>
          </Link>
          <Link to={ROUTES.DEPOSITS}>
            <Button variant="primary" size="sm" leftIcon={<ArrowDownToLine className="w-3.5 h-3.5" />}>
              Deposit Request
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricDisplay
            label="Total Network Value"
            value="$14,892,100"
            change="+18.4%"
            trend="up"
            timeframe="vs last month"
            icon={<Wallet className="w-4 h-4" />}
            accent="violet"
          />
          <MetricDisplay
            label="Active Staking Nodes"
            value="2,480"
            change="+52 nodes"
            trend="up"
            timeframe="this week"
            icon={<Users className="w-4 h-4" />}
            accent="cyan"
          />
          <MetricDisplay
            label="24h Yield Distributed"
            value="$48,250.00"
            change="-2.1%"
            trend="down"
            timeframe="vs yesterday"
            icon={<TrendingUp className="w-4 h-4" />}
            accent="gold"
          />
          <MetricDisplay
            label="Global Rank Standing"
            value="Diamond II"
            change="Top 0.8%"
            trend="neutral"
            timeframe="leaderboard"
            icon={<Award className="w-4 h-4" />}
            accent="violet"
          />
        </div>

        {/* Hero Card & Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Member Card Preview (3D Tilt) */}
          <div className="lg:col-span-5">
            <TiltCard maxTilt={3.5} className="w-full">
              <Card variant="standard" padding="lg" className="border-brand-bright-violet/30 shadow-card-hover space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-themeBorder-subtle">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-standard bg-gradient-to-br from-brand-electric-violet to-brand-bright-violet flex items-center justify-center text-white font-bold shadow-glow-purple">
                      RZ
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-themeText-primary">Johnathan Sterling</h4>
                      <span className="text-[11px] text-themeText-muted font-mono">Member ID: RZ-8942</span>
                    </div>
                  </div>
                  <Badge variant="premium" size="sm">DIAMOND VIP</Badge>
                </div>

                <div>
                  <span className="text-xs uppercase font-medium tracking-wider text-themeText-muted">Vault Balance (USDT)</span>
                  <div className="text-3xl font-bold tracking-tight text-themeText-primary tabular-numbers mt-1">
                    $148,920.45
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-semibold text-semantic-success bg-semantic-success/10 px-2 py-0.5 rounded">
                      +14.2% Monthly
                    </span>
                    <span className="text-xs text-themeText-muted">Simulated yield return</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link to={ROUTES.DEPOSITS} className="w-full">
                    <Button variant="primary" size="sm" className="w-full" leftIcon={<ArrowDownToLine className="w-3.5 h-3.5" />}>
                      Deposit
                    </Button>
                  </Link>
                  <Link to={ROUTES.WITHDRAWAL} className="w-full">
                    <Button variant="secondary" size="sm" className="w-full" leftIcon={<ArrowUpFromLine className="w-3.5 h-3.5" />}>
                      Withdraw
                    </Button>
                  </Link>
                </div>
              </Card>
            </TiltCard>
          </div>

          {/* Quick Submodule Navigation Links */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
            <Card variant="standard" padding="lg" className="space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-themeText-primary">Application Shell Navigation Hub</h3>
                  <p className="text-xs text-themeText-secondary mt-0.5">
                    Explore all configured routes supported by the new Module 2 layout.
                  </p>
                </div>
                <Badge variant="active" size="sm">18+ Routes</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Link to={ROUTES.USERS_TREE} className="p-3 rounded-standard border border-themeBorder bg-panel-elevated/40 hover:border-brand-bright-violet/50 hover:bg-panel-elevated/80 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-brand-cyber-cyan" />
                    <div>
                      <span className="text-xs font-semibold text-themeText-primary group-hover:text-brand-bright-violet block">Tree View</span>
                      <span className="text-[11px] text-themeText-muted">Binary organization map</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-themeText-muted group-hover:text-brand-bright-violet transition-transform group-hover:translate-x-0.5" />
                </Link>

                <Link to={ROUTES.UPGRADE_RANKS} className="p-3 rounded-standard border border-themeBorder bg-panel-elevated/40 hover:border-brand-bright-violet/50 hover:bg-panel-elevated/80 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-brand-luxury-gold" />
                    <div>
                      <span className="text-xs font-semibold text-themeText-primary group-hover:text-brand-bright-violet block">Upgrade Ranks</span>
                      <span className="text-[11px] text-themeText-muted">VIP membership packages</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-themeText-muted group-hover:text-brand-bright-violet transition-transform group-hover:translate-x-0.5" />
                </Link>

                <Link to={ROUTES.REPORTS_MATCHING} className="p-3 rounded-standard border border-themeBorder bg-panel-elevated/40 hover:border-brand-bright-violet/50 hover:bg-panel-elevated/80 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4 text-semantic-success" />
                    <div>
                      <span className="text-xs font-semibold text-themeText-primary group-hover:text-brand-bright-violet block">Matching Incentives</span>
                      <span className="text-[11px] text-themeText-muted">Audited performance logs</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-themeText-muted group-hover:text-brand-bright-violet transition-transform group-hover:translate-x-0.5" />
                </Link>

                <Link to={ROUTES.DEV_BACKEND_STATUS} className="p-3 rounded-standard border border-brand-bright-violet/30 bg-brand-bright-violet/10 hover:bg-brand-bright-violet/20 transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-2.5">
                    <Terminal className="w-4 h-4 text-brand-cyber-cyan" />
                    <div>
                      <span className="text-xs font-semibold text-brand-soft-lavender block">Backend Health API</span>
                      <span className="text-[11px] text-themeText-muted">FastAPI + PostgreSQL status</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-brand-cyber-cyan transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
