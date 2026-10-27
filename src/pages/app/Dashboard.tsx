import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Award,
  TrendingUp,
  Activity,
  Layers,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api, DashboardSummary, ManagerDashboardSummary } from '../../lib/api-client';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/feedback/ErrorState';
import { ROUTES } from '../../config/routes';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER';

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [memberData, setMemberData] = useState<DashboardSummary | null>(null);
  const [managerData, setManagerData] = useState<ManagerDashboardSummary | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isManager) {
        const data = await api.getManagerDashboardSummary();
        setManagerData(data);
      } else {
        const data = await api.getDashboardSummary();
        setMemberData(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve dashboard information.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [isManager]);

  const formatCurrency = (val: string | number | undefined, currency = 'USDT') => {
    if (val === undefined || val === null) return '0.00';
    const num = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(num)) return '0.00';
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Active Demo Account';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <PageContainer
        title="Account Overview"
        description="Loading real-time account balances and activity..."
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton variant="rectangular" className="h-[130px] rounded-card" />
            <Skeleton variant="rectangular" className="h-[130px] rounded-card" />
            <Skeleton variant="rectangular" className="h-[130px] rounded-card" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <Skeleton variant="rectangular" className="h-[320px] rounded-card" />
            </div>
            <div className="lg:col-span-5">
              <Skeleton variant="rectangular" className="h-[320px] rounded-card" />
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Account Overview">
        <ErrorState
          title="Unable to load dashboard data"
          message={error}
          onRetry={fetchDashboardData}
        />
      </PageContainer>
    );
  }

  // ==========================================
  // MANAGER VIEW
  // ==========================================
  if (isManager && managerData) {
    const { metrics, package_distribution, recent_activity } = managerData;
    return (
      <PageContainer
        title={`Executive Operations Console`}
        description={`Logged in as ${user?.display_name || 'System Manager'} (Role: Executive Operations). System overview and platform diagnostics.`}
        badge={<Badge variant="premium" size="sm" dot>Manager Console</Badge>}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchDashboardData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Metrics
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Top Platform Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <Card variant="standard" padding="md" className="border-brand-bright-violet/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-themeText-muted">
                <span>Total Demo Members</span>
                <Users className="w-4 h-4 text-brand-bright-violet" />
              </div>
              <div className="text-2xl font-bold font-heading text-white">
                {metrics.total_members} <span className="text-xs font-normal text-semantic-success">({metrics.active_members} Active)</span>
              </div>
              <span className="text-[11px] text-themeText-muted block font-mono">
                PostgreSQL Members Registry
              </span>
            </Card>

            <Card variant="standard" padding="md" className="border-brand-cyber-cyan/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-themeText-muted">
                <span>Pending Liquidity Requests</span>
                <Wallet className="w-4 h-4 text-brand-cyber-cyan" />
              </div>
              <div className="text-2xl font-bold font-heading text-white">
                {metrics.pending_deposit_requests + metrics.pending_withdrawal_requests}
              </div>
              <span className="text-[11px] text-themeText-muted block">
                {metrics.pending_deposit_requests} Deposits • {metrics.pending_withdrawal_requests} Withdrawals
              </span>
            </Card>

            <Card variant="standard" padding="md" className="border-brand-luxury-gold/30 space-y-2">
              <div className="flex items-center justify-between text-xs text-themeText-muted">
                <span>Active VIP Packages</span>
                <Award className="w-4 h-4 text-brand-luxury-gold" />
              </div>
              <div className="text-2xl font-bold font-heading text-white">
                {metrics.total_packages} Tiers
              </div>
              <span className="text-[11px] text-themeText-muted block font-mono">
                Starter to Diamond VIP
              </span>
            </Card>
          </div>

          {/* Two-Column Grid: Package Distribution & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Package Distribution Card */}
            <div className="lg:col-span-5">
              <Card variant="standard" padding="lg" className="space-y-4 h-full">
                <div className="flex items-center justify-between pb-3 border-b border-themeBorder-subtle">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-brand-bright-violet" />
                    Member Package Distribution
                  </h3>
                  <Badge variant="active" size="sm">Catalog</Badge>
                </div>

                <div className="space-y-3 pt-1">
                  {package_distribution.map((pkg) => (
                    <div
                      key={pkg.package_code}
                      className="p-3 rounded-standard border border-themeBorder-subtle bg-panel-elevated/40 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white block">{pkg.package_name}</span>
                        <span className="text-[10px] text-themeText-muted font-mono">{pkg.package_code}</span>
                      </div>
                      <Badge variant="default" size="sm">
                        {pkg.member_count} {pkg.member_count === 1 ? 'Member' : 'Members'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* System-wide Activity */}
            <div className="lg:col-span-7">
              <Card variant="standard" padding="lg" className="space-y-4 h-full">
                <div className="flex items-center justify-between pb-3 border-b border-themeBorder-subtle">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-brand-cyber-cyan" />
                    Recent System Ledger Entries
                  </h3>
                  <Link to={ROUTES.REPORTS_GENERAL} className="text-xs text-brand-cyber-cyan hover:underline">
                    View Full Reports
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {recent_activity.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-standard border border-themeBorder-subtle bg-panel-elevated/30 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded ${
                            tx.direction === 'CREDIT'
                              ? 'bg-semantic-success/10 text-semantic-success'
                              : 'bg-semantic-warning/10 text-semantic-warning'
                          }`}
                        >
                          {tx.direction === 'CREDIT' ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">
                              {tx.tx_type.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] text-themeText-muted font-mono">
                              {tx.reference}
                            </span>
                          </div>
                          <span className="text-[11px] text-themeText-secondary block mt-0.5">
                            {tx.remark || 'Ledger event'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-mono font-bold block ${
                            tx.direction === 'CREDIT'
                              ? 'text-semantic-success'
                              : 'text-themeText-primary'
                          }`}
                        >
                          {tx.direction === 'CREDIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                        <span className="text-[10px] text-themeText-muted block mt-0.5">
                          {formatDate(tx.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  // ==========================================
  // MEMBER VIEW (Johnathan Sterling)
  // ==========================================
  const member = memberData?.member || user;
  const wallets = memberData?.wallets || [];
  const org = memberData?.organization;
  const pkg = memberData?.package;
  const recentActivity = memberData?.recent_activity || [];

  // Find individual wallets
  const txWallet = wallets.find((w) => w.wallet_type === 'TRANSACTION');
  const motherWallet = wallets.find((w) => w.wallet_type === 'MOTHER');
  const stakingWallet = wallets.find((w) => w.wallet_type === 'STAKING');

  return (
    <PageContainer
      title={`Welcome back, ${member?.display_name || 'Member'}`}
      description="Real-time multi-vault balances, network hierarchy, and transaction summary."
      badge={<Badge variant="active" size="sm" dot>Active Member</Badge>}
      actions={
        <div className="flex items-center gap-2">
          <Link to={ROUTES.DEPOSITS}>
            <Button variant="secondary" size="sm">
              Deposit
            </Button>
          </Link>
          <Link to={ROUTES.WITHDRAWAL}>
            <Button variant="primary" size="sm">
              Withdraw
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Account Info Pill Card */}
        <Card variant="standard" padding="md" className="border-brand-bright-violet/20 bg-panel-base/80 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-6">
              <div>
                <span className="text-themeText-muted block text-[11px]">Member ID</span>
                <span className="font-mono font-bold text-white text-sm">
                  {member?.member_code || 'RZ-8942'}
                </span>
              </div>
              <div className="border-l border-themeBorder-subtle pl-6">
                <span className="text-themeText-muted block text-[11px]">Activation Date</span>
                <span className="font-semibold text-themeText-secondary">
                  {formatDate(member?.activation_date)}
                </span>
              </div>
              <div className="border-l border-themeBorder-subtle pl-6">
                <span className="text-themeText-muted block text-[11px]">Account Status</span>
                <Badge variant="success" size="sm" dot>Active</Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="premium" size="sm">
                {pkg?.display_name || 'Diamond VIP Package'}
              </Badge>
            </div>
          </div>
        </Card>

        {/* 1. Wallet Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Transaction Wallet */}
          <Card
            variant="standard"
            padding="lg"
            className="border-brand-cyber-cyan/30 relative overflow-hidden group hover:border-brand-cyber-cyan/60 transition-all shadow-elevation-1"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-cyber-cyan/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs font-semibold text-themeText-secondary flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-brand-cyber-cyan" />
                Transaction Wallet
              </span>
              <Badge variant="pending" size="sm">Liquid</Badge>
            </div>
            <div className="space-y-1 pt-1">
              <div className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white font-sans">
                {txWallet ? formatCurrency(txWallet.balance) : '148,920.45 USDT'}
              </div>
              <span className="text-[11px] text-themeText-muted block">
                Primary liquidity & bonus settlement wallet
              </span>
            </div>
            <div className="pt-4 mt-3 border-t border-themeBorder-subtle flex items-center justify-between text-xs">
              <Link to={ROUTES.REPORTS_MATCHING} className="text-brand-cyber-cyan hover:underline flex items-center gap-1">
                View Ledger <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </Card>

          {/* Mother Wallet */}
          <Card
            variant="standard"
            padding="lg"
            className="border-brand-lavender/30 relative overflow-hidden group hover:border-brand-lavender/60 transition-all shadow-elevation-1"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-lavender/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs font-semibold text-themeText-secondary flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-brand-lavender" />
                Mother Wallet
              </span>
              <Badge variant="active" size="sm">Reserve</Badge>
            </div>
            <div className="space-y-1 pt-1">
              <div className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white font-sans">
                {motherWallet ? formatCurrency(motherWallet.balance) : '25,000.00 USDT'}
              </div>
              <span className="text-[11px] text-themeText-muted block">
                Core capital reserve & staking allocation
              </span>
            </div>
            <div className="pt-4 mt-3 border-t border-themeBorder-subtle flex items-center justify-between text-xs">
              <Link to={ROUTES.DEPOSITS} className="text-brand-lavender hover:underline flex items-center gap-1">
                Deposit Requests <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </Card>

          {/* Staking Vault */}
          <Card
            variant="standard"
            padding="lg"
            className="border-brand-luxury-gold/30 relative overflow-hidden group hover:border-brand-luxury-gold/60 transition-all shadow-elevation-1"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-luxury-gold/10 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center justify-between pb-3">
              <span className="text-xs font-semibold text-themeText-secondary flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-brand-luxury-gold" />
                Staking Vault
              </span>
              <Badge variant="premium" size="sm">Staked</Badge>
            </div>
            <div className="space-y-1 pt-1">
              <div className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white font-sans">
                {stakingWallet ? formatCurrency(stakingWallet.balance) : '95,000.00 USDT'}
              </div>
              <span className="text-[11px] text-themeText-muted block">
                Active yielding capital producing weekly cashback
              </span>
            </div>
            <div className="pt-4 mt-3 border-t border-themeBorder-subtle flex items-center justify-between text-xs">
              <Link to={ROUTES.REPORTS_CASHBACK} className="text-brand-luxury-gold hover:underline flex items-center gap-1">
                Cashback History <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </Card>
        </div>

        {/* 2. Middle Row: Package Info & Binary Organization */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Current Package Card */}
          <div className="lg:col-span-5">
            <Card variant="standard" padding="lg" className="border-brand-bright-violet/30 h-full relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-themeBorder-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-standard bg-brand-bright-violet/15 text-brand-bright-violet">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Current VIP Package</h3>
                    <p className="text-[11px] text-themeText-muted">Active Member Privilege Tier</p>
                  </div>
                </div>
                <Badge variant="premium" size="sm">Tier 5</Badge>
              </div>

              <div className="pt-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-card bg-gradient-to-br from-brand-bright-violet via-brand-royal-purple to-brand-midnight-base p-[1px] shadow-glow-sm shrink-0">
                    <div className="w-full h-full rounded-card bg-canvas flex items-center justify-center">
                      <Award className="w-8 h-8 text-brand-luxury-gold" />
                    </div>
                  </div>
                  <div>
                    <span className="text-lg font-bold text-white block">
                      {pkg?.display_name || 'Diamond VIP Package (5,000 USDT)'}
                    </span>
                    <span className="text-xs text-themeText-secondary block mt-0.5">
                      Standard Package Reference: {pkg ? formatCurrency(pkg.price) : '5,000.00 USDT'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-standard bg-panel-elevated/40 border border-themeBorder-subtle text-xs space-y-1.5">
                  <div className="flex justify-between text-themeText-secondary">
                    <span>Direct Matching Factor</span>
                    <span className="text-white font-mono font-semibold">Maximum (100%)</span>
                  </div>
                  <div className="flex justify-between text-themeText-secondary">
                    <span>Weekly Cashback Status</span>
                    <span className="text-semantic-success font-semibold">Active & Yielding</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link to={ROUTES.UPGRADE_RANKS}>
                    <Button variant="secondary" size="sm" className="w-full" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Explore Rank Upgrades
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>

          {/* Binary Organization Overview Card */}
          <div className="lg:col-span-7">
            <Card variant="standard" padding="lg" className="border-themeBorder h-full space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-themeBorder-subtle">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-brand-cyber-cyan" />
                  <h3 className="text-sm font-bold text-white">Binary Organization Overview</h3>
                </div>
                <Link to={ROUTES.USERS_TREE} className="text-xs text-brand-cyber-cyan hover:underline flex items-center gap-1">
                  Full Tree View <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Left Placement */}
                <div className="p-4 rounded-standard border border-themeBorder-subtle bg-panel-elevated/40 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-themeText-muted uppercase tracking-wider text-[10px]">Left Placement</span>
                    <Badge variant="pending" size="sm">Active Node</Badge>
                  </div>
                  <span className="text-base font-bold text-white block">
                    {org?.left_child_name || 'Elena Rostova'}
                  </span>
                  <span className="text-xs font-mono text-brand-cyber-cyan block">
                    {org?.left_child_code || 'RZ-8943'}
                  </span>
                  <Link to={ROUTES.USERS_LEFT} className="text-[11px] text-themeText-muted hover:text-white block pt-1">
                    Inspect Left Team →
                  </Link>
                </div>

                {/* Right Placement */}
                <div className="p-4 rounded-standard border border-themeBorder-subtle bg-panel-elevated/40 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-themeText-muted uppercase tracking-wider text-[10px]">Right Placement</span>
                    <Badge variant="active" size="sm">Active Node</Badge>
                  </div>
                  <span className="text-base font-bold text-white block">
                    {org?.right_child_name || 'Marcus Chen'}
                  </span>
                  <span className="text-xs font-mono text-brand-lavender block">
                    {org?.right_child_code || 'RZ-8944'}
                  </span>
                  <Link to={ROUTES.USERS_RIGHT} className="text-[11px] text-themeText-muted hover:text-white block pt-1">
                    Inspect Right Team →
                  </Link>
                </div>
              </div>

              {/* Direct Referrals Counter */}
              <div className="p-3 rounded-standard bg-panel-elevated/30 border border-themeBorder-subtle flex items-center justify-between text-xs">
                <span className="text-themeText-secondary">Direct Binary Referrals</span>
                <span className="font-bold text-white font-mono">
                  {org?.direct_referrals_count ?? 2} Direct Nodes
                </span>
              </div>
            </Card>
          </div>
        </div>

        {/* 3. Lower Row: Recent Activity Ledger */}
        <Card variant="standard" padding="lg" className="border-themeBorder space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-themeBorder-subtle">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-bright-violet" />
              <h3 className="text-sm font-bold text-white">Recent Ledger Transactions</h3>
            </div>
            <Link to={ROUTES.REPORTS_MATCHING} className="text-xs text-brand-cyber-cyan hover:underline">
              View All Transactions
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <div className="py-8 text-center text-xs text-themeText-muted">
              No recent ledger activity recorded.
            </div>
          ) : (
            <div className="divide-y divide-themeBorder-subtle">
              {recentActivity.map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded ${
                        tx.direction === 'CREDIT'
                          ? 'bg-semantic-success/10 text-semantic-success'
                          : 'bg-semantic-warning/10 text-semantic-warning'
                      }`}
                    >
                      {tx.direction === 'CREDIT' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">
                          {tx.tx_type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-themeText-muted font-mono">
                          {tx.reference}
                        </span>
                      </div>
                      <span className="text-[11px] text-themeText-secondary block mt-0.5">
                        {tx.remark || 'Direct account settlement'}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-mono font-bold block ${
                        tx.direction === 'CREDIT'
                          ? 'text-semantic-success'
                          : 'text-themeText-primary'
                      }`}
                    >
                      {tx.direction === 'CREDIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                    <span className="text-[10px] text-themeText-muted block mt-0.5">
                      {formatDate(tx.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 4. Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link to={ROUTES.DEPOSITS} className="group">
            <Card variant="standard" padding="md" className="border-themeBorder-subtle hover:border-brand-bright-violet text-center space-y-1.5 transition-colors">
              <span className="text-xs font-bold text-white block group-hover:text-brand-bright-violet">Deposit Requests</span>
              <span className="text-[10px] text-themeText-muted block">Fund demo vaults</span>
            </Card>
          </Link>

          <Link to={ROUTES.WITHDRAWAL} className="group">
            <Card variant="standard" padding="md" className="border-themeBorder-subtle hover:border-brand-cyber-cyan text-center space-y-1.5 transition-colors">
              <span className="text-xs font-bold text-white block group-hover:text-brand-cyber-cyan">Withdrawal Queue</span>
              <span className="text-[10px] text-themeText-muted block">Token redemption</span>
            </Card>
          </Link>

          <Link to={ROUTES.USERS_TREE} className="group">
            <Card variant="standard" padding="md" className="border-themeBorder-subtle hover:border-brand-luxury-gold text-center space-y-1.5 transition-colors">
              <span className="text-xs font-bold text-white block group-hover:text-brand-luxury-gold">Binary Tree</span>
              <span className="text-[10px] text-themeText-muted block">Network structure</span>
            </Card>
          </Link>

          <Link to={ROUTES.REPORTS_MATCHING} className="group">
            <Card variant="standard" padding="md" className="border-themeBorder-subtle hover:border-brand-lavender text-center space-y-1.5 transition-colors">
              <span className="text-xs font-bold text-white block group-hover:text-brand-lavender">Incentive Reports</span>
              <span className="text-[10px] text-themeText-muted block">Dividend tracking</span>
            </Card>
          </Link>
        </div>
      </div>
    </PageContainer>
  );
};
