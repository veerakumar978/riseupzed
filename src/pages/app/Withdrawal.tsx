import React, { useState, useEffect } from 'react';
import {
  ArrowUpFromLine,
  Wallet,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  ShieldCheck,
  RefreshCw,
  Info,
  DollarSign,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  api,
  WalletOverview,
  FinancialConfig,
  WithdrawalRequestItem,
  ProfileData,
} from '../../lib/api-client';
import { useAuth } from '../../context/AuthContext';

export const Withdrawal: React.FC = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER';

  // State
  const [walletsOverview, setWalletsOverview] = useState<WalletOverview | null>(null);
  const [config, setConfig] = useState<FinancialConfig | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [history, setHistory] = useState<WithdrawalRequestItem[]>([]);
  const [packages, setPackages] = useState<Array<{ id: string; name: string }>>([]);
  const [managerRequests, setManagerRequests] = useState<WithdrawalRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [selectedWalletId, setSelectedWalletId] = useState('');
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [amount, setAmount] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [riseupKey, setRiseupKey] = useState('');
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Manager Review
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [managerFilter, setManagerFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [wallets, cfg, prof, userHistory, pkgs] = await Promise.all([
        api.getWallets(),
        api.getFinancialConfig(),
        api.getProfile(),
        api.getWithdrawalRequests(50),
        api.getPackages().catch(() => []),
      ]);

      setWalletsOverview(wallets);
      setConfig(cfg);
      setProfile(prof);
      setHistory(userHistory);
      setPackages(pkgs);

      // Default wallet selection to TRANSACTION wallet
      const txWallet = wallets.wallets.find((w) => w.wallet_type === 'TRANSACTION');
      if (txWallet) {
        setSelectedWalletId(txWallet.id);
      } else if (wallets.wallets.length > 0) {
        setSelectedWalletId(wallets.wallets[0].id);
      }

      // Pre-fill saved BEP20 address from profile
      if (prof.wallet_address?.wallet_address) {
        setDestinationAddress(prof.wallet_address.wallet_address);
      }

      if (isManager) {
        const mgrReqs = await api.getManagerWithdrawalRequests(
          managerFilter === 'ALL' ? undefined : managerFilter
        );
        setManagerRequests(mgrReqs);
      }
    } catch (err: unknown) {
      console.error('Failed to load withdrawal data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [managerFilter, isManager]);

  const activeWallet = walletsOverview?.wallets.find((w) => w.id === selectedWalletId);
  const availableBalance = activeWallet ? parseFloat(String(activeWallet.balance)) : 0;

  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid withdrawal amount greater than 0.');
      return;
    }

    if (config && numAmount < config.min_withdrawal_amount) {
      setFormError(`Minimum withdrawal amount is ${config.min_withdrawal_amount} tokens.`);
      return;
    }

    if (numAmount > availableBalance) {
      setFormError(
        `Requested amount (${numAmount} tokens) exceeds available balance (${availableBalance.toFixed(2)} tokens).`
      );
      return;
    }

    const cleanDest = destinationAddress.trim();
    if (!cleanDest.startsWith('0x') || cleanDest.length !== 42) {
      setFormError('Destination address must be a valid 42-character USDT BEP20 address (0x...).');
      return;
    }

    if (profile?.has_riseup_key && !riseupKey) {
      setFormError('Please enter your Riseup Key (PIN) to authorize this withdrawal.');
      return;
    }

    setIsSubmitting(true);
    setFormSuccess(null);
    setFormError(null);

    try {
      const res = await api.createWithdrawalRequest({
        wallet_id: selectedWalletId,
        package_id: selectedPackageId || undefined,
        amount: numAmount,
        destination_address: cleanDest,
        riseup_key: riseupKey || undefined,
      });

      setFormSuccess(
        `Withdrawal request ${res.reference} submitted successfully! Status is PENDING. Note: Pending requests do not represent completed payouts.`
      );
      setAmount('');
      setRiseupKey('');

      // Refresh list & balances
      const [updatedHistory, updatedWallets] = await Promise.all([
        api.getWithdrawalRequests(50),
        api.getWallets(),
      ]);
      setHistory(updatedHistory);
      setWalletsOverview(updatedWallets);

      if (isManager) {
        const mgrReqs = await api.getManagerWithdrawalRequests(
          managerFilter === 'ALL' ? undefined : managerFilter
        );
        setManagerRequests(mgrReqs);
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Withdrawal request failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manager Actions
  const handleManagerReview = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setReviewingId(id);
    setReviewError(null);
    try {
      await api.reviewWithdrawalRequest(id, {
        action,
        review_note: action === 'APPROVE' ? 'Approved by manager batch' : 'Rejected by manager',
      });
      const [userHist, mgrReqs, updatedWallets] = await Promise.all([
        api.getWithdrawalRequests(50),
        api.getManagerWithdrawalRequests(managerFilter === 'ALL' ? undefined : managerFilter),
        api.getWallets(),
      ]);
      setHistory(userHist);
      setManagerRequests(mgrReqs);
      setWalletsOverview(updatedWallets);
    } catch (err: unknown) {
      setReviewError(err instanceof Error ? err.message : 'Review action failed');
    } finally {
      setReviewingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge variant="success" className="text-[11px] flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="error" className="text-[11px] flex items-center gap-1 font-mono">
            <XCircle className="w-3 h-3" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="warning" className="text-[11px] flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3 animate-spin" /> Pending Review
          </Badge>
        );
    }
  };

  if (isLoading && !config) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 lg:col-span-2 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-themeBorder-subtle pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-themeText-primary">
              Withdrawal Requests
            </h1>
            <Badge variant="pending" className="text-[10px]">
              Disbursements
            </Badge>
          </div>
          <p className="text-sm text-themeText-secondary">
            Simulated disbursement interface. Request token withdrawals to verified USDT BEP20 destination addresses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Rules & Operational Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Minimum Amount Notice */}
        <div className="p-4 bg-themeSurface-card border border-themeBorder-subtle rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-themeBrand-gold/10 text-themeBrand-gold shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-themeText-muted block font-medium">Configured Minimum Withdrawal</span>
            <span className="text-base font-bold text-themeText-primary font-mono">
              {config?.min_withdrawal_amount || 500} Tokens (USDT)
            </span>
          </div>
        </div>

        {/* Saturday Restriction Notice */}
        <div className="p-4 bg-themeSurface-card border border-themeBorder-subtle rounded-xl flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-themeBrand-violet/10 text-themeBrand-violet shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-themeText-muted font-medium">Schedule Window</span>
              <Badge
                variant={config?.saturday_only ? 'warning' : 'success'}
                className="text-[10px] py-0"
              >
                {config?.saturday_only ? 'Saturday Only Mode' : 'Flexible Demo Mode'}
              </Badge>
            </div>
            <span className="text-xs text-themeText-secondary">
              {config?.saturday_only
                ? config.is_saturday_today
                  ? 'Withdrawals are currently OPEN (Saturday Window Active).'
                  : 'Withdrawals are CLOSED until Saturday window.'
                : 'All-day withdrawals enabled for demonstration review.'}
            </span>
          </div>
        </div>
      </div>

      {/* Simulation Integrity Alert */}
      <div className="p-4 bg-themeSurface-card border border-themeBorder-subtle rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-themeBrand-cyan shrink-0 mt-0.5" />
        <p className="text-xs text-themeText-secondary">
          <strong className="text-themeText-primary">Simulated Payout Notice:</strong> Submitting a withdrawal request places it into a <strong className="text-semantic-warning">PENDING</strong> state. No real blockchain funds or fiat payouts are disbursed.
        </p>
      </div>

      {/* Form & Available Balances Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Wallet Balance Card */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="p-6 bg-themeSurface-card border-themeBorder-subtle space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-themeBorder-subtle">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-themeBrand-cyan/10 text-themeBrand-cyan">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-themeText-primary">Available Balances</h3>
                  <span className="text-[11px] text-themeText-muted">Authoritative Database Ledger</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {walletsOverview?.wallets.map((w) => (
                <div
                  key={w.id}
                  onClick={() => setSelectedWalletId(w.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedWalletId === w.id
                      ? 'bg-themeBrand-violet/10 border-themeBrand-violet/50 shadow-sm'
                      : 'bg-themeSurface-elevated/50 border-themeBorder-subtle hover:border-themeBorder-default'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-themeText-primary">
                      {w.wallet_type} Wallet
                    </span>
                    <Badge variant={selectedWalletId === w.id ? 'active' : 'default'} className="text-[10px]">
                      {selectedWalletId === w.id ? 'Selected' : 'Select'}
                    </Badge>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-lg font-bold text-themeText-primary">
                      {parseFloat(String(w.balance)).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="font-mono text-xs text-themeText-muted">
                      {w.currency}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 text-[11px] text-themeText-muted space-y-1">
              <p>• Select wallet to withdraw from.</p>
              <p>• Only active, non-frozen balances can be withdrawn.</p>
            </div>
          </Card>
        </div>

        {/* Right Column: Withdrawal Request Form */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6 md:p-8 bg-themeSurface-card border-themeBorder-subtle space-y-6">
            <div className="flex items-center gap-2 border-b border-themeBorder-subtle pb-4">
              <div className="p-2 rounded-lg bg-themeBrand-cyan/10 text-themeBrand-cyan">
                <ArrowUpFromLine className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-themeText-primary">Withdraw Tokens</h2>
                <p className="text-xs text-themeText-muted">
                  Submit a withdrawal voucher to release tokens to your configured BEP20 address.
                </p>
              </div>
            </div>

            {formSuccess && (
              <Alert type="success" className="animate-fade-in">
                {formSuccess}
              </Alert>
            )}
            {formError && (
              <Alert type="error" className="animate-fade-in">
                {formError}
              </Alert>
            )}

            <form onSubmit={handleSubmitWithdrawal} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Select Package (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-themeText-secondary">
                    Select Package (Optional)
                  </label>
                  <select
                    value={selectedPackageId}
                    onChange={(e) => setSelectedPackageId(e.target.value)}
                    className="w-full h-10 px-3 py-2 rounded-lg bg-themeSurface-elevated border border-themeBorder-subtle text-themeText-primary text-sm focus:outline-none focus:ring-1 focus:ring-themeBrand-cyan transition-colors"
                  >
                    <option value="">— Standard Token Withdrawal —</option>
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Withdraw Tokens Amount */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-themeText-secondary">
                    Withdraw Tokens (USDT) <span className="text-semantic-error">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Min 500.00"
                    required
                    className="text-sm font-mono"
                  />
                  <div className="flex items-center justify-between text-[10px] text-themeText-muted">
                    <span>Min: {config?.min_withdrawal_amount || 500} tokens</span>
                    <span>Available: {availableBalance.toFixed(2)} tokens</span>
                  </div>
                </div>
              </div>

              {/* Destination Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-themeText-secondary">
                  Destination Address (USDT BEP20) <span className="text-semantic-error">*</span>
                </label>
                <Input
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  placeholder="0x..."
                  required
                  className="text-sm font-mono"
                />
                <p className="text-[10px] text-themeText-muted">
                  Pre-filled from your Profile settings. Must be a valid 42-character BEP20 address.
                </p>
              </div>

              {/* Riseup Key (PIN Verification) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-themeText-secondary flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-themeBrand-gold" />
                  <span>Riseup Key (Security PIN)</span>
                  {profile?.has_riseup_key && (
                    <span className="text-semantic-error text-xs">*</span>
                  )}
                </label>
                <Input
                  type="password"
                  value={riseupKey}
                  onChange={(e) => setRiseupKey(e.target.value)}
                  placeholder="Enter your security PIN"
                  className="text-sm"
                  required={profile?.has_riseup_key}
                />
                <p className="text-[10px] text-themeText-muted">
                  {profile?.has_riseup_key
                    ? 'Security PIN configured. Verified against bcrypt hash on server.'
                    : 'Security PIN optional (not yet configured in your profile).'}
                </p>
              </div>

              <div className="flex justify-end pt-3 border-t border-themeBorder-subtle">
                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  isLoading={isSubmitting}
                  leftIcon={<ArrowUpFromLine className="w-4 h-4" />}
                >
                  Submit Withdrawal Request
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Pending & Past Withdrawals Table */}
      <Card className="p-6 bg-themeSurface-card border-themeBorder-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-themeBorder-subtle pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-themeBrand-cyan" />
            <h2 className="text-lg font-bold text-themeText-primary">
              Withdrawal History & Pending Status
            </h2>
          </div>
          <span className="text-xs text-themeText-muted">
            Showing {history.length} records
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-sm text-themeText-muted">
            No withdrawal requests recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs">
              <thead className="bg-themeSurface-elevated/60 text-themeText-muted uppercase text-[10px] tracking-wider border-b border-themeBorder-subtle">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Wallet</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Destination Address</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Review Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-themeBorder-subtle">
                {history.map((req) => (
                  <tr key={req.id} className="hover:bg-themeSurface-elevated/40 transition-colors">
                    <td className="p-3 font-mono font-medium text-themeText-primary">
                      {req.reference}
                    </td>
                    <td className="p-3 text-themeText-muted">
                      {new Date(req.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 font-medium text-themeText-secondary">
                      {req.wallet_type || 'TRANSACTION'}
                    </td>
                    <td className="p-3 font-mono font-bold text-themeText-primary">
                      {parseFloat(String(req.amount)).toFixed(2)} USDT
                    </td>
                    <td className="p-3 font-mono text-themeText-secondary truncate max-w-[150px]">
                      {req.destination_address}
                    </td>
                    <td className="p-3">{getStatusBadge(req.status)}</td>
                    <td className="p-3 text-themeText-muted max-w-[180px] truncate">
                      {req.review_note || 'Awaiting scheduled review'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Manager Review Section (Manager Only) */}
      {isManager && (
        <Card className="p-6 md:p-8 bg-themeSurface-card border-themeBrand-cyan/30 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-themeBorder-subtle pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-themeBrand-cyan/10 text-themeBrand-cyan">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-themeText-primary">
                    Manager Review Portal — Withdrawal Requests
                  </h2>
                  <Badge variant="pending" className="text-[10px]">
                    Manager Only
                  </Badge>
                </div>
                <p className="text-xs text-themeText-muted">
                  Simulated review interface. Approving a withdrawal deducts balance and records ledger debit in PostgreSQL.
                </p>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-themeSurface-elevated p-1 rounded-lg border border-themeBorder-subtle text-xs">
              {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setManagerFilter(filter)}
                  className={`px-2.5 py-1 rounded-md transition-colors font-medium text-[11px] ${
                    managerFilter === filter
                      ? 'bg-themeBrand-cyan text-gray-900 shadow-sm'
                      : 'text-themeText-muted hover:text-themeText-primary'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {reviewError && (
            <Alert type="error" className="py-2 text-xs">
              {reviewError}
            </Alert>
          )}

          {managerRequests.length === 0 ? (
            <div className="p-8 text-center text-sm text-themeText-muted">
              No withdrawal requests matching filter "{managerFilter}".
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead className="bg-themeSurface-elevated/60 text-themeText-muted uppercase text-[10px] tracking-wider border-b border-themeBorder-subtle">
                  <tr>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Member</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Destination Address</th>
                    <th className="p-3">Submitted</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-themeBorder-subtle">
                  {managerRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-themeSurface-elevated/40 transition-colors">
                      <td className="p-3 font-mono font-medium text-themeText-primary">
                        {req.reference}
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-themeText-primary block">
                          {req.member_name}
                        </span>
                        <span className="font-mono text-[10px] text-themeBrand-cyan">
                          {req.member_code}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-themeText-primary">
                        {parseFloat(String(req.amount)).toFixed(2)} USDT
                      </td>
                      <td className="p-3 font-mono text-themeText-secondary truncate max-w-[150px]">
                        {req.destination_address}
                      </td>
                      <td className="p-3 text-themeText-muted">
                        {new Date(req.created_at).toLocaleString()}
                      </td>
                      <td className="p-3">{getStatusBadge(req.status)}</td>
                      <td className="p-3">
                        {req.status === 'PENDING' ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="primary"
                              className="text-[11px] py-1 px-2.5 bg-semantic-success hover:bg-semantic-success/90 text-white"
                              isLoading={reviewingId === req.id}
                              onClick={() => handleManagerReview(req.id, 'APPROVE')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[11px] py-1 px-2.5 text-semantic-error hover:bg-semantic-error/10"
                              disabled={reviewingId === req.id}
                              onClick={() => handleManagerReview(req.id, 'REJECT')}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-themeText-muted italic">
                            {req.review_note || 'Completed'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
