import React, { useState, useEffect, useCallback } from 'react';
import {
  Coins,
  ArrowLeftRight,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
  Send,
  Layers,
  Info,
  RotateCcw,
} from 'lucide-react';
import { Breadcrumb } from '../../../components/ui/Breadcrumb';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import {
  api,
  transfersApi,
  PackageItem,
  TransferBalanceInfo,
  TransferRecipientLookupResponse,
  TokenTransferResponse,
} from '../../../lib/api-client';
import { ROUTES } from '../../../config/routes';

export const TokenTransfers: React.FC = () => {
  // Balance & Package data
  const [balanceInfo, setBalanceInfo] = useState<TransferBalanceInfo | null>(null);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Self Transfer Form state
  const [selfPackageId, setSelfPackageId] = useState<string>('');
  const [selfAmount, setSelfAmount] = useState<string>('');
  const [selfKey, setSelfKey] = useState<string>('');

  // User Transfer Form state
  const [recipientCode, setRecipientCode] = useState<string>('');
  const [recipientInfo, setRecipientInfo] = useState<TransferRecipientLookupResponse | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [isLookingUp, setIsLookingUp] = useState<boolean>(false);
  const [userAmount, setUserAmount] = useState<string>('');
  const [userKey, setUserKey] = useState<string>('');
  const [remark, setRemark] = useState<string>('');

  // Interaction feedback & Confirmation Modal
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // History state
  const [historyTab, setHistoryTab] = useState<'OUTGOING' | 'INCOMING'>('OUTGOING');
  const [historyItems, setHistoryItems] = useState<TokenTransferResponse[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState<boolean>(false);
  const [selectedTx, setSelectedTx] = useState<TokenTransferResponse | null>(null);

  // 1. Initial Load: Authoritative Balance & Active Packages
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [bal, pkgs] = await Promise.all([
        transfersApi.getBalance(),
        api.getPackages().catch(() => []),
      ]);
      setBalanceInfo(bal);
      setPackages(pkgs);
      if (pkgs.length > 0) {
        setSelfPackageId(pkgs[0].id);
      }
    } catch (err) {
      console.error('Failed to load transfer initial state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Load Transfer History
  const loadHistory = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const items = await transfersApi.getHistory(historyTab);
      setHistoryItems(items);
    } catch (err) {
      console.error('Failed to load transfer history:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [historyTab]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // 3. Recipient Code Live Lookup
  const handleLookupRecipient = async () => {
    const trimmed = recipientCode.trim();
    if (!trimmed) {
      setRecipientInfo(null);
      setLookupError(null);
      return;
    }
    setIsLookingUp(true);
    setLookupError(null);
    try {
      const info = await transfersApi.lookupRecipient(trimmed);
      setRecipientInfo(info);
    } catch (err: unknown) {
      setRecipientInfo(null);
      const msg = err instanceof Error ? err.message : 'Recipient member not found';
      setLookupError(msg);
    } finally {
      setIsLookingUp(false);
    }
  };

  // 4. Validate and Open Confirmation Modal
  const handleOpenTransferConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!recipientInfo || !recipientInfo.is_valid) {
      setSubmitError('Please verify a valid recipient member code before proceeding.');
      return;
    }

    const numAmount = Number(userAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setSubmitError('Please enter a positive token transfer amount.');
      return;
    }

    const avail = Number(balanceInfo?.available_balance || 0);
    if (numAmount > avail) {
      setSubmitError(`Insufficient available balance. You have ${avail.toFixed(2)} tokens available.`);
      return;
    }

    setShowConfirmModal(true);
  };

  // 5. Execute Authoritative Transfer
  const handleExecuteTransfer = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const result = await transfersApi.executeTransfer({
        recipient_code: recipientCode.trim(),
        amount: Number(userAmount),
        riseup_key: userKey.trim() || undefined,
        remark: remark.trim() || undefined,
      });

      setSubmitSuccess(
        `Successfully transferred ${Number(result.amount).toFixed(2)} tokens to ${result.receiver_code} (${result.receiver_name}). Transaction Ref: ${result.reference}`
      );
      setShowConfirmModal(false);

      // Reset form
      setRecipientCode('');
      setRecipientInfo(null);
      setUserAmount('');
      setUserKey('');
      setRemark('');

      // Refresh authoritative balance and history
      await Promise.all([
        transfersApi.getBalance().then(setBalanceInfo),
        loadHistory(),
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Transfer execution failed';
      setSubmitError(msg);
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedBalance = Number(balanceInfo?.available_balance || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumb */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: ROUTES.DASHBOARD },
            { label: 'Token Transfers' },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-themeText-primary tracking-tight">
                Token Transfers
              </h1>
              <Badge variant="premium" size="sm">Peer Liquidity</Badge>
            </div>
            <p className="text-xs sm:text-sm text-themeText-secondary mt-1 max-w-2xl">
              Transfer demonstration tokens securely to verified network members or inspect self-allocation channels.
            </p>
          </div>
        </div>
      </div>

      {/* Available Authoritative Tokens Summary Card */}
      <Card variant="standard" padding="md" className="border border-brand-bright-cyan/25 bg-panel-elevated/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-control bg-brand-bright-cyan/10 border border-brand-bright-cyan/25 flex items-center justify-center text-brand-bright-cyan shrink-0 shadow-sm">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-themeText-secondary uppercase tracking-wider block">
                Available Authoritative Balance
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-bold font-mono text-brand-bright-cyan tracking-tight">
                  {isLoading ? <Skeleton className="h-8 w-32" /> : `${formattedBalance} Tokens`}
                </span>
                <Badge variant="active" size="sm">Transaction Wallet</Badge>
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right text-xs text-themeText-muted">
            <p className="flex items-center gap-1 sm:justify-end text-themeText-secondary">
              <Info className="w-3.5 h-3.5 text-brand-bright-cyan" />
              Simulated demonstration environment
            </p>
            <p className="text-[11px] mt-0.5">Tokens do not represent cryptocurrency or monetary legal currency.</p>
          </div>
        </div>
      </Card>

      {/* Global Alerts */}
      {submitSuccess && (
        <div className="p-3.5 px-4 bg-semantic-success/15 border border-semantic-success/30 rounded-control flex items-start gap-2.5 text-xs text-semantic-success animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Transfer Confirmed</span>
            <span>{submitSuccess}</span>
          </div>
        </div>
      )}

      {submitError && (
        <div className="p-3.5 px-4 bg-semantic-error/15 border border-semantic-error/30 rounded-control flex items-start gap-2.5 text-xs text-semantic-error animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Transfer Notice</span>
            <span>{submitError}</span>
          </div>
        </div>
      )}

      {/* Two Transfer Forms: Self Transfer vs User Transfer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Self Transfer Tokens Form */}
        <Card variant="standard" padding="lg" className="border border-themeBorder flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Layers className="w-4 h-4 text-brand-bright-violet" />
              <h3 className="text-base font-bold text-themeText-primary">Self Transfer Tokens</h3>
            </div>
            <p className="text-xs text-themeText-secondary mb-4">
              Reallocate tokens into active package nodes or internal deposit tiers.
            </p>

            <div className="space-y-4">
              {/* Select Package */}
              <div>
                <label className="block text-[11px] font-semibold text-themeText-secondary uppercase tracking-wider mb-1">
                  Select Package
                </label>
                <select
                  value={selfPackageId}
                  onChange={e => setSelfPackageId(e.target.value)}
                  className="w-full h-10 rounded-control px-3 bg-input-bg border border-themeBorder text-xs text-themeText-primary focus:border-brand-bright-violet outline-none"
                >
                  {packages.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.display_name} — {p.price} USDT
                    </option>
                  ))}
                  {packages.length === 0 && <option value="">Loading packages...</option>}
                </select>
              </div>

              {/* Transfer Tokens Amount */}
              <div>
                <label className="block text-[11px] font-semibold text-themeText-secondary uppercase tracking-wider mb-1">
                  Transfer Tokens
                </label>
                <Input
                  type="number"
                  placeholder="Enter token amount..."
                  value={selfAmount}
                  onChange={e => setSelfAmount(e.target.value)}
                  className="h-10 text-xs font-mono"
                />
              </div>

              {/* Riseup Key */}
              <div>
                <label className="block text-[11px] font-semibold text-themeText-secondary uppercase tracking-wider mb-1 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-brand-warm-gold" />
                  Riseup Key
                </label>
                <Input
                  type="password"
                  placeholder="Security PIN / Riseup Key"
                  value={selfKey}
                  onChange={e => setSelfKey(e.target.value)}
                  className="h-10 text-xs font-mono"
                />
              </div>

              {/* Mandatory Business Rule Notice */}
              <div className="p-3 bg-panel-secondary/60 border border-themeBorder-subtle rounded-control text-[11px] text-themeText-muted flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-brand-warm-gold shrink-0 mt-0.5" />
                <span>
                  <strong>Unconfigured Business Rule:</strong> Self-transfer rules between staking tiers are not established by reference specifications. This operation is disabled to prevent unsupported financial mutations.
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-themeBorder-subtle">
            <Button
              type="button"
              variant="outline"
              disabled
              className="w-full opacity-60 cursor-not-allowed"
            >
              Transfer (Rule Unconfigured)
            </Button>
          </div>
        </Card>

        {/* 2. User Transfer Tokens Form */}
        <Card variant="standard" padding="lg" className="border border-brand-bright-cyan/25 flex flex-col justify-between">
          <form onSubmit={handleOpenTransferConfirm}>
            <div className="flex items-center gap-2 mb-1">
              <Send className="w-4 h-4 text-brand-bright-cyan" />
              <h3 className="text-base font-bold text-themeText-primary">User Transfer Tokens</h3>
            </div>
            <p className="text-xs text-themeText-secondary mb-4">
              Direct peer-to-peer liquidity allocation to another verified network member.
            </p>

            <div className="space-y-4">
              {/* Recipient User ID Input with live lookup */}
              <div>
                <label className="block text-[11px] font-semibold text-themeText-secondary uppercase tracking-wider mb-1">
                  Recipient User ID
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="e.g. RZ-8943"
                    value={recipientCode}
                    onChange={e => {
                      setRecipientCode(e.target.value);
                      setRecipientInfo(null);
                      setLookupError(null);
                    }}
                    onBlur={handleLookupRecipient}
                    className="h-10 text-xs font-mono uppercase"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLookupRecipient}
                    disabled={isLookingUp || !recipientCode.trim()}
                    className="h-10 shrink-0"
                  >
                    {isLookingUp ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>

                {/* Recipient Verification Status */}
                {recipientInfo && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-semantic-success font-medium">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Verified: {recipientInfo.display_name} ({recipientInfo.member_code})</span>
                  </div>
                )}
                {lookupError && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-semantic-error">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{lookupError}</span>
                  </div>
                )}
              </div>

              {/* Transfer Tokens Amount */}
              <div>
                <label className="block text-[11px] font-semibold text-themeText-secondary uppercase tracking-wider mb-1">
                  Transfer Tokens
                </label>
                <Input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={userAmount}
                  onChange={e => setUserAmount(e.target.value)}
                  className="h-10 text-xs font-mono"
                />
              </div>

              {/* Riseup Key (PIN) */}
              <div>
                <label className="block text-[11px] font-semibold text-themeText-secondary uppercase tracking-wider mb-1 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-brand-warm-gold" />
                  Riseup Key
                </label>
                <Input
                  type="password"
                  placeholder="Security PIN (Demo default: 894200)"
                  value={userKey}
                  onChange={e => setUserKey(e.target.value)}
                  className="h-10 text-xs font-mono"
                />
              </div>

              {/* Remark */}
              <div>
                <label className="block text-[11px] font-semibold text-themeText-secondary uppercase tracking-wider mb-1">
                  Peer Remark / Memo (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Node volume allocation"
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-themeBorder-subtle">
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || !recipientInfo}
                className="w-full"
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Transfer Tokens
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Transfer History Table Section */}
      <Card variant="standard" padding="none" className="overflow-hidden border border-themeBorder">
        {/* History Header & Tabs */}
        <div className="p-4 px-6 border-b border-themeBorder bg-panel-secondary/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-themeText-primary">Token Transfer History</h3>
            <p className="text-xs text-themeText-muted mt-0.5">Authoritative audit ledger of outgoing and incoming transfers</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-control bg-panel-elevated p-1 border border-themeBorder text-xs">
              <button
                type="button"
                onClick={() => setHistoryTab('OUTGOING')}
                className={`px-3 py-1 rounded-control font-medium transition-colors ${
                  historyTab === 'OUTGOING'
                    ? 'bg-brand-bright-cyan text-brand-midnight-black font-semibold shadow-sm'
                    : 'text-themeText-muted hover:text-themeText-primary'
                }`}
              >
                Transfers Sent
              </button>
              <button
                type="button"
                onClick={() => setHistoryTab('INCOMING')}
                className={`px-3 py-1 rounded-control font-medium transition-colors ${
                  historyTab === 'INCOMING'
                    ? 'bg-brand-bright-cyan text-brand-midnight-black font-semibold shadow-sm'
                    : 'text-themeText-muted hover:text-themeText-primary'
                }`}
              >
                Transfers Received
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={loadHistory}
              disabled={isHistoryLoading}
              leftIcon={<RotateCcw className={`w-3.5 h-3.5 ${isHistoryLoading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Table Content */}
        {isHistoryLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : historyItems.length === 0 ? (
          <div className="py-12 px-4">
            <EmptyState
              title={historyTab === 'OUTGOING' ? 'No Sent Transfers' : 'No Received Transfers'}
              description={
                historyTab === 'OUTGOING'
                  ? 'You have not initiated any peer token transfers yet.'
                  : 'You have not received any peer token transfers on this account.'
              }
              icon={<ArrowLeftRight className="w-6 h-6 stroke-[1.5]" />}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-themeBorder bg-panel-elevated/40 text-themeText-secondary uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4 text-center w-14">S.No</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Reference</th>
                  <th className="py-3.5 px-4">
                    {historyTab === 'OUTGOING' ? 'Recipient Member' : 'Sender Member'}
                  </th>
                  <th className="py-3.5 px-4 text-right">Amount (Tokens)</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-themeBorder-subtle">
                {historyItems.map((tx, idx) => (
                  <tr key={tx.id} className="hover:bg-panel-elevated/30 transition-colors group">
                    <td className="py-3.5 px-4 text-center font-mono text-themeText-muted">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-mono text-themeText-primary whitespace-nowrap">
                      {new Date(tx.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-brand-bright-cyan/90 font-semibold">{tx.reference}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-themeText-primary">
                        {historyTab === 'OUTGOING' ? tx.receiver_code : tx.sender_code}
                      </div>
                      <div className="text-[11px] text-themeText-muted">
                        {historyTab === 'OUTGOING' ? tx.receiver_name : tx.sender_name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-brand-bright-cyan tabular-numbers whitespace-nowrap">
                      {Number(tx.amount).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant="success" size="sm" dot>{tx.status}</Badge>
                    </td>
                    <td className="py-3.5 px-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTx(tx)}
                      >
                        View Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title="Confirm Token Transfer"
        >
          <div className="space-y-4 text-xs">
            <p className="text-themeText-secondary">
              Please review the simulated peer token transfer details before confirming execution:
            </p>

            <div className="bg-panel-secondary/50 rounded-control p-3.5 space-y-2 border border-themeBorder-subtle">
              <div className="flex justify-between">
                <span className="text-themeText-muted">Recipient User ID:</span>
                <span className="font-mono font-bold text-themeText-primary">{recipientInfo?.member_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-themeText-muted">Recipient Name:</span>
                <span className="font-semibold text-themeText-primary">{recipientInfo?.display_name}</span>
              </div>
              <div className="flex justify-between border-t border-themeBorder-subtle pt-2">
                <span className="text-themeText-muted">Transfer Amount:</span>
                <span className="font-mono font-bold text-brand-bright-cyan text-sm">
                  {Number(userAmount).toFixed(2)} Tokens
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-themeText-muted">Remaining Balance:</span>
                <span className="font-mono text-themeText-primary">
                  {(Number(balanceInfo?.available_balance || 0) - Number(userAmount)).toFixed(2)} Tokens
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-brand-warm-gold/10 border border-brand-warm-gold/20 rounded-control text-[11px] text-brand-warm-gold flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>This is a simulated internal balance transfer. It does not initiate external blockchain transactions.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExecuteTransfer}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Transferring...' : 'Confirm & Send'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Transaction Detail Receipt Modal */}
      {selectedTx && (
        <Modal
          isOpen={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          title="Transfer Transaction Details"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-panel-secondary/50 rounded-control p-4 space-y-2.5 border border-themeBorder">
              <div className="flex justify-between">
                <span className="text-themeText-muted">Reference:</span>
                <span className="font-mono font-bold text-brand-bright-cyan">{selectedTx.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-themeText-muted">Timestamp:</span>
                <span className="font-mono text-themeText-primary">{new Date(selectedTx.created_at).toUTCString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-themeText-muted">Sender:</span>
                <span className="font-semibold text-themeText-primary">{selectedTx.sender_code} ({selectedTx.sender_name})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-themeText-muted">Recipient:</span>
                <span className="font-semibold text-themeText-primary">{selectedTx.receiver_code} ({selectedTx.receiver_name})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-themeText-muted">Amount:</span>
                <span className="font-mono font-bold text-brand-bright-cyan text-sm">{Number(selectedTx.amount).toFixed(2)} Tokens</span>
              </div>
              <div className="flex justify-between">
                <span className="text-themeText-muted">Status:</span>
                <Badge variant="success" size="sm" dot>{selectedTx.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-themeText-muted">Transfer Type:</span>
                <span className="text-themeText-secondary">{selectedTx.transfer_type}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTx(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
