import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Shield,
  Award,
  Crown,
  Sparkles,
  Gem,
  CheckCircle2,
  Clock,
  RefreshCw,
  Check,
} from 'lucide-react';

import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Modal } from '../../components/ui/Modal';
import { Textarea } from '../../components/ui/Textarea';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../context/AuthContext';
import {
  api,
  PackageItem,
  CurrentPackageInfo,
  UpgradeRequestItem,
  ApiError,
} from '../../lib/api-client';
import { ROUTES } from '../../config/routes';

export const UpgradeRanks: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [currentInfo, setCurrentInfo] = useState<CurrentPackageInfo | null>(null);
  const [myRequests, setMyRequests] = useState<UpgradeRequestItem[]>([]);
  const [managerRequests, setManagerRequests] = useState<UpgradeRequestItem[]>([]);

  // Modals
  const [selectedTargetPackage, setSelectedTargetPackage] = useState<PackageItem | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeNote, setUpgradeNote] = useState('');
  const [submittingUpgrade, setSubmittingUpgrade] = useState(false);

  const [detailPackage, setDetailPackage] = useState<PackageItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Manager Review Modal
  const [reviewTargetRequest, setReviewTargetRequest] = useState<UpgradeRequestItem | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [reviewNote, setReviewNote] = useState('');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [pkgs, current, reqs] = await Promise.all([
        api.getPackages(),
        api.getCurrentPackage(),
        api.getUpgradeRequests(),
      ]);
      setPackages(pkgs);
      setCurrentInfo(current);
      setMyRequests(reqs);

      if (user?.role === 'MANAGER') {
        try {
          const mgrReqs = await api.getManagerUpgradeRequests();
          setManagerRequests(mgrReqs);
        } catch {
          // ignore manager error if not authorized
        }
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load package and rank upgrade data.';
      setError(msg);
      showToast({ title: 'Error', message: msg, type: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.role, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenUpgrade = (pkg: PackageItem) => {
    setSelectedTargetPackage(pkg);
    setUpgradeNote('');
    setIsUpgradeModalOpen(true);
  };

  const handleSubmitUpgrade = async () => {
    if (!selectedTargetPackage) return;
    setSubmittingUpgrade(true);
    try {
      const res = await api.createUpgradeRequest({
        target_package_id: selectedTargetPackage.id,
        note: upgradeNote.trim() || undefined,
      });
      showToast({
        title: 'Upgrade Request Submitted',
        message: `Your request to upgrade to ${res.target_package_name} (Ref: ${res.reference}) has been logged for manager verification.`,
        type: 'success',
      });
      setIsUpgradeModalOpen(false);
      loadData(true);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to submit upgrade request.';
      showToast({ title: 'Submission Failed', message: msg, type: 'error' });
    } finally {
      setSubmittingUpgrade(false);
    }
  };

  const handleOpenReview = (req: UpgradeRequestItem, action: 'APPROVED' | 'REJECTED') => {
    setReviewTargetRequest(req);
    setReviewAction(action);
    setReviewNote(action === 'APPROVED' ? 'Volume and staking requirements confirmed by manager.' : 'Insufficient qualification criteria.');
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewTargetRequest) return;
    setSubmittingReview(true);
    try {
      await api.reviewUpgradeRequest(reviewTargetRequest.id, {
        status: reviewAction,
        review_note: reviewNote.trim() || undefined,
      });
      showToast({
        title: `Request ${reviewAction === 'APPROVED' ? 'Approved' : 'Rejected'}`,
        message: `Upgrade request ${reviewTargetRequest.reference} successfully reviewed.`,
        type: 'success',
      });
      setIsReviewModalOpen(false);
      loadData(true);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Review action failed.';
      showToast({ title: 'Review Error', message: msg, type: 'error' });
    } finally {
      setSubmittingReview(false);
    }
  };

  const getPackageIcon = (code: string) => {
    switch (code.toUpperCase()) {
      case 'STARTER':
        return <Shield className="w-5 h-5 text-brand-soft-lavender" />;
      case 'SILVER':
        return <Award className="w-5 h-5 text-gray-300" />;
      case 'GOLD':
        return <Crown className="w-5 h-5 text-brand-luxury-gold" />;
      case 'PLATINUM':
        return <Sparkles className="w-5 h-5 text-brand-cyber-cyan" />;
      case 'DIAMOND':
        return <Gem className="w-5 h-5 text-brand-bright-violet" />;
      default:
        return <TrendingUp className="w-5 h-5 text-brand-cyber-cyan" />;
    }
  };

  const currentPkg = currentInfo?.package;
  const currentSortOrder = currentPkg?.sort_order ?? 0;
  const hasPendingRequest = currentInfo?.upgrade_status === 'UPGRADE_PENDING';

  if (loading) {
    return (
      <div className="py-24 text-center text-themeText-muted space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-brand-bright-violet" />
        <p className="text-sm font-semibold text-themeText-primary">Loading package & rank upgrade matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Upgrade Ranks' },
        ]}
      />


      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-themeBorder pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-bright-violet/10 border border-brand-bright-violet/30 flex items-center justify-center text-brand-bright-violet">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-themeText-primary">
                Packages & Rank Upgrades
              </h1>
              <p className="text-sm text-themeText-muted">
                Inspect VIP network packages, view configured rank requirements, and submit rank upgrade requests.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {error && (
        <Alert type="error" title="Unable to load package data">
          {error}
        </Alert>
      )}

      {/* SECTION 1: Current Package Card */}
      <div className="grid grid-cols-1 gap-6">
        <Card variant="elevated" className="relative overflow-hidden border-brand-bright-violet/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-bright-violet/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="premium">Authenticated Member Package</Badge>
                {hasPendingRequest ? (
                  <Badge variant="pending" dot>
                    Upgrade Requested
                  </Badge>
                ) : (
                  <Badge variant="success" dot>
                    Active Tier
                  </Badge>
                )}
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-luxury-gold/15 border border-brand-luxury-gold/30 flex items-center justify-center text-brand-luxury-gold shadow-glow-purple">
                    {getPackageIcon(currentPkg?.code || 'DIAMOND')}
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-themeText-primary tracking-tight">
                      {currentPkg?.display_name || currentPkg?.name || 'No Active Package'}
                    </h2>
                    <p className="text-xs text-themeText-muted">
                      Member Code: <span className="font-mono text-brand-cyber-cyan">{currentInfo?.member_code}</span> ({currentInfo?.display_name})
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-themeText-secondary max-w-2xl">
                {currentPkg?.description || 'Entry node with standard network volume weighting and staking allocation.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:border-l lg:border-themeBorder lg:pl-6 shrink-0">
              <div className="bg-panel-secondary/40 p-3.5 rounded-lg border border-themeBorder">
                <p className="text-xs text-themeText-muted font-medium">Configured Price</p>
                <p className="text-lg font-bold text-themeText-primary mt-1">
                  {currentPkg ? `${Number(currentPkg.price).toLocaleString()} USDT` : '0 USDT'}
                </p>
              </div>

              <div className="bg-panel-secondary/40 p-3.5 rounded-lg border border-themeBorder">
                <p className="text-xs text-themeText-muted font-medium">Upgrade Target Amount</p>
                <p className="text-lg font-bold text-brand-cyber-cyan mt-1">
                  {currentPkg?.upgrade_amount ? Number(currentPkg.upgrade_amount).toLocaleString() : '15,000'}
                </p>
              </div>

              <div className="bg-panel-secondary/40 p-3.5 rounded-lg border border-themeBorder col-span-2 sm:col-span-1">
                <p className="text-xs text-themeText-muted font-medium">Activation Date</p>
                <p className="text-sm font-semibold text-themeText-primary mt-1">
                  {currentInfo?.activation_date
                    ? new Date(currentInfo.activation_date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Active'}
                </p>
              </div>
            </div>
          </div>

          {hasPendingRequest && (
            <div className="mt-6 pt-4 border-t border-themeBorder/60 flex items-center justify-between gap-4 bg-brand-cyber-cyan/5 p-3 rounded-lg border border-brand-cyber-cyan/20">
              <div className="flex items-center gap-2.5 text-xs text-brand-cyber-cyan">
                <Clock className="w-4 h-4 shrink-0 animate-pulse" />
                <span>
                  <strong>Active Request:</strong> Upgrade request (Ref: {currentInfo?.active_upgrade_request_reference}) is currently pending manager approval.
                </span>
              </div>
              <Badge variant="pending">Under Review</Badge>
            </div>
          )}
        </Card>
      </div>

      {/* SECTION 2: Available Packages Cards Grid */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-themeText-primary tracking-tight">Available VIP Packages</h3>
          <p className="text-xs text-themeText-muted">
            Select a higher rank package to expand matching incentives and network thresholds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {packages.map((pkg) => {
            const isCurrent = currentPkg?.id === pkg.id;
            const isLowerOrEqual = pkg.sort_order <= currentSortOrder;
            const canUpgrade = !isLowerOrEqual && !hasPendingRequest;

            return (
              <Card
                key={pkg.id}
                variant={isCurrent ? 'elevated' : 'standard'}
                className={`flex flex-col justify-between transition-all duration-200 ${
                  isCurrent
                    ? 'border-brand-luxury-gold/50 shadow-glow-purple bg-panel-elevated'
                    : 'hover:border-themeBorder-hover'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-lg bg-panel-secondary flex items-center justify-center border border-themeBorder">
                      {getPackageIcon(pkg.code)}
                    </div>
                    {isCurrent ? (
                      <Badge variant="premium">Current</Badge>
                    ) : (
                      <Badge variant="default">Tier {pkg.sort_order}</Badge>
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-themeText-primary tracking-tight">{pkg.name}</h4>
                    <p className="text-xl font-extrabold text-themeText-primary mt-1">
                      {Number(pkg.price).toLocaleString()} <span className="text-xs font-semibold text-brand-cyber-cyan">USDT</span>
                    </p>
                  </div>

                  <p className="text-xs text-themeText-muted line-clamp-2">
                    {pkg.description || 'Configured platform staking package with accelerated rewards.'}
                  </p>

                  <div className="space-y-1.5 pt-2 border-t border-themeBorder/50 text-xs">
                    <div className="flex justify-between text-themeText-muted">
                      <span>Upgrade Target:</span>
                      <span className="font-semibold text-themeText-primary">
                        {pkg.upgrade_amount ? Number(pkg.upgrade_amount).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between text-themeText-muted">
                      <span>Achievement:</span>
                      <span className="font-semibold text-brand-luxury-gold">
                        {pkg.achievement_threshold ? Number(pkg.achievement_threshold).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-themeBorder/50 space-y-2">
                  {isCurrent ? (
                    <Button variant="outline" size="sm" disabled className="w-full text-xs">
                      <Check className="w-3.5 h-3.5 mr-1 text-semantic-success" />
                      Active Package
                    </Button>
                  ) : isLowerOrEqual ? (
                    <Button variant="outline" size="sm" disabled className="w-full text-xs opacity-60">
                      Tier Included
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={!canUpgrade}
                      onClick={() => handleOpenUpgrade(pkg)}
                      className="w-full text-xs font-semibold"
                    >
                      Request Upgrade
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDetailPackage(pkg);
                      setIsDetailModalOpen(true);
                    }}
                    className="w-full text-xs text-themeText-muted hover:text-themeText-primary"
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: Rank Upgrade Information Table (Matching Reference Screenshot) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-themeText-primary tracking-tight">Rank Upgrade Information</h3>
            <p className="text-xs text-themeText-muted">
              Official rank threshold matrix. Demonstrates the Silver Upgrade (15,000) and Achieved (30,000) baseline.
            </p>
          </div>
          <Badge variant="active">Reference Matrix</Badge>
        </div>

        <Card variant="standard" padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-panel-secondary/50 text-xs text-themeText-muted uppercase tracking-wider border-b border-themeBorder">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Rank</th>
                  <th className="py-3.5 px-4 font-semibold">Package Price</th>
                  <th className="py-3.5 px-4 font-semibold">Upgrade Amount</th>
                  <th className="py-3.5 px-4 font-semibold">Achievement Amount</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-themeBorder">
                {packages.map((pkg) => {
                  const isCurrent = currentPkg?.id === pkg.id;
                  const isLowerOrEqual = pkg.sort_order <= currentSortOrder;
                  const canUpgrade = !isLowerOrEqual && !hasPendingRequest;

                  return (
                    <tr
                      key={pkg.id}
                      className={`hover:bg-panel-secondary/30 transition-colors ${
                        isCurrent ? 'bg-brand-bright-violet/5' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded bg-panel-secondary flex items-center justify-center border border-themeBorder">
                            {getPackageIcon(pkg.code)}
                          </div>
                          <div>
                            <span className="font-bold text-themeText-primary">{pkg.name}</span>
                            <span className="block text-[11px] text-themeText-muted font-mono">{pkg.code}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-themeText-primary">
                        {Number(pkg.price).toLocaleString()} USDT
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-brand-cyber-cyan">
                          {pkg.upgrade_amount ? Number(pkg.upgrade_amount).toLocaleString() : 'Rule not configured'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-brand-luxury-gold">
                          {pkg.achievement_threshold ? Number(pkg.achievement_threshold).toLocaleString() : 'Rule not configured'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {isCurrent ? (
                          <Badge variant="premium">Current Rank</Badge>
                        ) : isLowerOrEqual ? (
                          <Badge variant="success">Achieved</Badge>
                        ) : (
                          <Badge variant="default">Target Tier</Badge>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {isCurrent ? (
                          <span className="text-xs text-semantic-success font-semibold">Active</span>
                        ) : isLowerOrEqual ? (
                          <span className="text-xs text-themeText-muted">Included</span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!canUpgrade}
                            onClick={() => handleOpenUpgrade(pkg)}
                            className="text-xs"
                          >
                            Upgrade
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* SECTION 4: Upgrade Request History Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-themeText-primary tracking-tight">Your Upgrade Requests History</h3>
            <p className="text-xs text-themeText-muted">
              Live audit history of your rank upgrade requests persisted in the backend database.
            </p>
          </div>
          <Badge variant="default">{myRequests.length} Requests</Badge>
        </div>

        {myRequests.length === 0 ? (
          <Card variant="standard" className="text-center py-10">
            <Clock className="w-8 h-8 text-themeText-muted mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-themeText-primary">No previous upgrade requests recorded</p>
            <p className="text-xs text-themeText-muted mt-1">
              Select an available tier above to submit an upgrade request for executive verification.
            </p>
          </Card>
        ) : (
          <Card variant="standard" padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-panel-secondary/50 text-xs text-themeText-muted uppercase tracking-wider border-b border-themeBorder">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Reference</th>
                    <th className="py-3.5 px-4 font-semibold">Target Package</th>
                    <th className="py-3.5 px-4 font-semibold">Upgrade Amount</th>
                    <th className="py-3.5 px-4 font-semibold">Request Date</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold">Review Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-themeBorder">
                  {myRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-panel-secondary/20">
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-brand-cyber-cyan">
                        {req.reference}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-themeText-primary">
                        {req.target_package_name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-themeText-primary">
                        {Number(req.upgrade_amount).toLocaleString()} USDT
                      </td>
                      <td className="py-3.5 px-4 text-xs text-themeText-muted">
                        {new Date(req.created_at).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        {req.status === 'PENDING' && (
                          <Badge variant="pending" dot>
                            Pending Review
                          </Badge>
                        )}
                        {req.status === 'APPROVED' && (
                          <Badge variant="success" dot>
                            Approved
                          </Badge>
                        )}
                        {req.status === 'REJECTED' && (
                          <Badge variant="error" dot>
                            Rejected
                          </Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-themeText-secondary max-w-xs truncate">
                        {req.review_note || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* SECTION 5: Manager Review Section (Only for MANAGER Role) */}
      {user?.role === 'MANAGER' && (
        <div className="space-y-4 pt-6 border-t border-themeBorder">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-luxury-gold/15 border border-brand-luxury-gold/30 flex items-center justify-center text-brand-luxury-gold">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-themeText-primary tracking-tight">
                  Manager Upgrade Review Panel
                </h3>
                <p className="text-xs text-themeText-muted">
                  Executive administrative queue. Approving an upgrade atomically elevates the member's rank in PostgreSQL.
                </p>
              </div>
            </div>
            <Badge variant="premium">Executive Access</Badge>
          </div>

          {managerRequests.length === 0 ? (
            <Card variant="standard" className="text-center py-8">
              <CheckCircle2 className="w-8 h-8 text-semantic-success mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold text-themeText-primary">No pending upgrade requests in the queue</p>
            </Card>
          ) : (
            <Card variant="standard" padding="none" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-panel-secondary/50 text-xs text-themeText-muted uppercase tracking-wider border-b border-themeBorder">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Reference</th>
                      <th className="py-3.5 px-4 font-semibold">Member</th>
                      <th className="py-3.5 px-4 font-semibold">Current Rank</th>
                      <th className="py-3.5 px-4 font-semibold">Target Rank</th>
                      <th className="py-3.5 px-4 font-semibold">Upgrade Amount</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-themeBorder">
                    {managerRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-panel-secondary/20">
                        <td className="py-3.5 px-4 font-mono text-xs font-semibold text-brand-cyber-cyan">
                          {req.reference}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-themeText-primary block">{req.member_name}</span>
                          <span className="font-mono text-xs text-themeText-muted">{req.member_code}</span>
                        </td>
                        <td className="py-3.5 px-4 text-xs text-themeText-secondary">
                          {req.current_package_name || 'Standard'}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-brand-bright-violet">
                          {req.target_package_name}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-themeText-primary">
                          {Number(req.upgrade_amount).toLocaleString()} USDT
                        </td>
                        <td className="py-3.5 px-4">
                          {req.status === 'PENDING' && <Badge variant="pending">Pending</Badge>}
                          {req.status === 'APPROVED' && <Badge variant="success">Approved</Badge>}
                          {req.status === 'REJECTED' && <Badge variant="error">Rejected</Badge>}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {req.status === 'PENDING' ? (
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleOpenReview(req, 'APPROVED')}
                                className="text-xs"
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenReview(req, 'REJECTED')}
                                className="text-xs text-semantic-error border-semantic-error/40 hover:bg-semantic-error/10"
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-xs text-themeText-muted italic">Reviewed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* MODAL 1: Upgrade Confirmation Modal */}
      <Modal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Confirm Rank Upgrade Request"
        description="Review the package upgrade terms before submitting for managerial approval."
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => setIsUpgradeModalOpen(false)} disabled={submittingUpgrade}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmitUpgrade} disabled={submittingUpgrade}>
              {submittingUpgrade ? 'Submitting...' : 'Confirm Upgrade Request'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-panel-secondary/40 p-4 rounded-lg border border-themeBorder space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-themeText-muted">Current Rank:</span>
              <span className="font-bold text-themeText-primary">{currentPkg?.name || 'Standard'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-themeText-muted">Requested Target Rank:</span>
              <span className="font-bold text-brand-bright-violet">{selectedTargetPackage?.name}</span>
            </div>
            <div className="flex justify-between items-center text-sm pt-2 border-t border-themeBorder">
              <span className="text-themeText-muted">Configured Upgrade Amount:</span>
              <span className="font-mono font-bold text-brand-cyber-cyan text-base">
                {selectedTargetPackage?.upgrade_amount
                  ? `${Number(selectedTargetPackage.upgrade_amount).toLocaleString()} USDT`
                  : 'N/A'}
              </span>
            </div>
          </div>

          <Alert type="info" title="Verification & Approval Notice">
            Submitting this request logs an upgrade intent in the platform database for executive audit. Upgrades are verified and finalized by managers. Submitting this form does not execute an immediate financial debit.
          </Alert>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-themeText-primary">
              Optional Note for Manager Review
            </label>
            <Textarea
              value={upgradeNote}
              onChange={(e) => setUpgradeNote(e.target.value)}
              placeholder="e.g., Met team staking volume requirements for this cycle..."
              rows={3}
            />
          </div>
        </div>
      </Modal>

      {/* MODAL 2: Package Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={detailPackage ? detailPackage.display_name : 'Package Details'}
        description="Comprehensive configuration and benefit metadata for this membership tier."
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end w-full">
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {detailPackage && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-panel-secondary/30 p-3 rounded-lg border border-themeBorder">
                <p className="text-xs text-themeText-muted">Tier Code</p>
                <p className="font-mono font-bold text-themeText-primary mt-1">{detailPackage.code}</p>
              </div>
              <div className="bg-panel-secondary/30 p-3 rounded-lg border border-themeBorder">
                <p className="text-xs text-themeText-muted">Standard Price</p>
                <p className="font-mono font-bold text-themeText-primary mt-1">
                  {Number(detailPackage.price).toLocaleString()} USDT
                </p>
              </div>
              <div className="bg-panel-secondary/30 p-3 rounded-lg border border-themeBorder">
                <p className="text-xs text-themeText-muted">Upgrade Target</p>
                <p className="font-mono font-bold text-brand-cyber-cyan mt-1">
                  {detailPackage.upgrade_amount ? Number(detailPackage.upgrade_amount).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div className="bg-panel-secondary/30 p-3 rounded-lg border border-themeBorder">
                <p className="text-xs text-themeText-muted">Achievement Threshold</p>
                <p className="font-mono font-bold text-brand-luxury-gold mt-1">
                  {detailPackage.achievement_threshold ? Number(detailPackage.achievement_threshold).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-themeText-muted uppercase tracking-wider">Description</p>
              <p className="text-sm text-themeText-secondary leading-relaxed bg-panel-secondary/20 p-3 rounded-lg border border-themeBorder">
                {detailPackage.description || 'Configured platform staking package with accelerated rewards.'}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-themeBorder text-xs text-themeText-muted">
              <div className="flex justify-between">
                <span>Display Order:</span>
                <span className="font-medium text-themeText-primary">Level {detailPackage.sort_order}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Status:</span>
                <span className="font-medium text-semantic-success">Active & Enrolled</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 3: Manager Review Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`${reviewAction === 'APPROVED' ? 'Approve' : 'Reject'} Upgrade Request`}
        description={`Audit and resolve request ${reviewTargetRequest?.reference} for ${reviewTargetRequest?.member_name}.`}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => setIsReviewModalOpen(false)} disabled={submittingReview}>
              Cancel
            </Button>
            <Button
              variant={reviewAction === 'APPROVED' ? 'primary' : 'outline'}
              onClick={handleSubmitReview}
              disabled={submittingReview}
              className={reviewAction === 'REJECTED' ? 'text-semantic-error border-semantic-error/40' : ''}
            >
              {submittingReview ? 'Processing...' : `Confirm ${reviewAction === 'APPROVED' ? 'Approval' : 'Rejection'}`}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-panel-secondary/40 p-4 rounded-lg border border-themeBorder space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-themeText-muted">Member:</span>
              <span className="font-bold text-themeText-primary">
                {reviewTargetRequest?.member_name} ({reviewTargetRequest?.member_code})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-themeText-muted">Target Package:</span>
              <span className="font-bold text-brand-bright-violet">{reviewTargetRequest?.target_package_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-themeText-muted">Upgrade Amount:</span>
              <span className="font-mono font-bold text-themeText-primary">
                {Number(reviewTargetRequest?.upgrade_amount || 0).toLocaleString()} USDT
              </span>
            </div>
          </div>

          {reviewAction === 'APPROVED' && (
            <Alert type="success" title="Database Action">
              Approving this request will immediately and atomically update {reviewTargetRequest?.member_name}'s membership package in PostgreSQL to {reviewTargetRequest?.target_package_name}.
            </Alert>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-themeText-primary">
              Review Remarks / Audit Note
            </label>
            <Textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Enter audit review reason..."
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
