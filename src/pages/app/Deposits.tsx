import React, { useState, useEffect } from 'react';
import {
  ArrowDownToLine,
  ShieldAlert,
  Copy,
  Check,
  Upload,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  QrCode,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { Skeleton } from '../../components/ui/Skeleton';
import { api, DepositRequestItem, FinancialConfig } from '../../lib/api-client';
import { useAuth } from '../../context/AuthContext';

export const Deposits: React.FC = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'MANAGER';

  // State
  const [config, setConfig] = useState<FinancialConfig | null>(null);
  const [history, setHistory] = useState<DepositRequestItem[]>([]);
  const [managerRequests, setManagerRequests] = useState<DepositRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Form Fields
  const [amount, setAmount] = useState('');
  const [txReference, setTxReference] = useState('');
  const [note, setNote] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Manager Review State
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [managerFilter, setManagerFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cfg, userHistory] = await Promise.all([
        api.getFinancialConfig(),
        api.getDepositRequests(50),
      ]);
      setConfig(cfg);
      setHistory(userHistory);

      if (isManager) {
        const mgrReqs = await api.getManagerDepositRequests(
          managerFilter === 'ALL' ? undefined : managerFilter
        );
        setManagerRequests(mgrReqs);
      }
    } catch (err: unknown) {
      console.error('Failed to load deposit data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [managerFilter, isManager]);

  const handleCopyAddress = () => {
    if (config?.demo_usdt_address) {
      navigator.clipboard.writeText(config.demo_usdt_address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormError('Image size exceeds maximum limit of 5 MB.');
        return;
      }
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
      setFormError(null);
    }
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid deposit amount greater than 0.');
      return;
    }

    setIsSubmitting(true);
    setFormSuccess(null);
    setFormError(null);

    try {
      let uploadedUrl: string | undefined = undefined;
      if (selectedFile) {
        const uploadRes = await api.uploadProof(selectedFile);
        uploadedUrl = uploadRes.proof_url;
      }

      const res = await api.createDepositRequest(
        {
          amount: numAmount,
          tx_reference: txReference.trim() || undefined,
          note: note.trim() || undefined,
        },
        uploadedUrl
      );

      setFormSuccess(
        `Deposit request ${res.reference} submitted successfully! Status is PENDING verification.`
      );
      setAmount('');
      setTxReference('');
      setNote('');
      setSelectedFile(null);
      setFilePreview(null);

      // Refresh list
      const updated = await api.getDepositRequests(50);
      setHistory(updated);

      if (isManager) {
        const mgrReqs = await api.getManagerDepositRequests(
          managerFilter === 'ALL' ? undefined : managerFilter
        );
        setManagerRequests(mgrReqs);
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to submit deposit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manager Actions
  const handleManagerReview = async (id: string, action: 'APPROVE' | 'REJECT') => {
    setReviewingId(id);
    setReviewError(null);
    try {
      await api.reviewDepositRequest(id, {
        action,
        review_note: reviewNote.trim() || undefined,
      });
      setReviewNote('');
      const [userHist, mgrReqs] = await Promise.all([
        api.getDepositRequests(50),
        api.getManagerDepositRequests(managerFilter === 'ALL' ? undefined : managerFilter),
      ]);
      setHistory(userHist);
      setManagerRequests(mgrReqs);
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
              Deposit Requests
            </h1>
            <Badge variant="active" className="text-[10px]">
              USDT BEP20
            </Badge>
          </div>
          <p className="text-sm text-themeText-secondary">
            Simulated cryptocurrency funding workflow. Submit verification vouchers to credit your internal transaction wallet.
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

      {/* Demo Integrity Notice */}
      <div className="p-4 bg-themeBrand-violet/10 border border-themeBrand-violet/20 rounded-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-themeBrand-violet shrink-0 mt-0.5" />
        <div className="text-xs text-themeText-secondary space-y-1">
          <p className="font-semibold text-themeText-primary">
            Financial Simulation & Verification Notice
          </p>
          <p>
            Submitting a deposit request registers a <strong className="text-semantic-warning">PENDING</strong> verification record. It does not automatically credit your wallet. Wallets are only funded once verified by a manager. No real cryptocurrency or fiat transactions occur on this platform.
          </p>
        </div>
      </div>

      {/* Top Grid: Instructions & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Network & Demo Address & QR Code */}
        <div className="space-y-6 lg:col-span-1">
          {/* Instructions & Address Card */}
          <Card className="p-6 bg-themeSurface-card border-themeBorder-subtle space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-themeBorder-subtle">
              <div className="p-2 rounded-lg bg-themeBrand-cyan/10 text-themeBrand-cyan">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-themeText-primary">Deposit Destination</h3>
                <span className="text-[11px] font-mono text-themeText-muted">
                  Network: {config?.demo_network || 'USDT BEP20'}
                </span>
              </div>
            </div>

            {/* Simulated QR Code Box */}
            <div className="p-5 bg-white rounded-xl flex flex-col items-center justify-center gap-2 shadow-inner">
              {/* Clean SVG Mockup QR Code */}
              <div className="w-40 h-40 bg-gray-900 p-2 rounded-lg flex items-center justify-center">
                <svg
                  className="w-full h-full text-white"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="100" height="100" fill="white" />
                  <rect x="10" y="10" width="30" height="30" fill="#0F172A" />
                  <rect x="15" y="15" width="20" height="20" fill="white" />
                  <rect x="20" y="20" width="10" height="10" fill="#0F172A" />
                  <rect x="60" y="10" width="30" height="30" fill="#0F172A" />
                  <rect x="65" y="15" width="20" height="20" fill="white" />
                  <rect x="70" y="20" width="10" height="10" fill="#0F172A" />
                  <rect x="10" y="60" width="30" height="30" fill="#0F172A" />
                  <rect x="15" y="65" width="20" height="20" fill="white" />
                  <rect x="20" y="70" width="10" height="10" fill="#0F172A" />
                  <rect x="50" y="50" width="10" height="10" fill="#0F172A" />
                  <rect x="70" y="70" width="15" height="15" fill="#0F172A" />
                  <rect x="45" y="20" width="5" height="15" fill="#0F172A" />
                  <rect x="20" y="45" width="15" height="5" fill="#0F172A" />
                  <rect x="60" y="50" width="20" height="5" fill="#0F172A" />
                  <rect x="50" y="70" width="15" height="5" fill="#0F172A" />
                </svg>
              </div>
              <span className="text-[10px] text-gray-500 font-mono">Demo USDT BEP20 QR</span>
            </div>

            {/* Address Display & Copy */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-themeText-muted uppercase tracking-wider">
                Official Demo BEP20 Deposit Address
              </label>
              <div className="p-3 bg-themeSurface-elevated rounded-lg border border-themeBorder-subtle flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-themeBrand-cyan break-all select-all">
                  {config?.demo_usdt_address || '0x71C8F7965F4d55b8e9b11cf298B30e462d142B29'}
                </span>
                <button
                  onClick={handleCopyAddress}
                  className="p-1.5 text-themeText-muted hover:text-themeText-primary shrink-0 transition-colors"
                  title="Copy address"
                >
                  {copiedAddress ? (
                    <Check className="w-4 h-4 text-semantic-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-themeSurface-elevated/40 text-[11px] text-themeText-muted space-y-1">
              <p>• Send USDT only on Binance Smart Chain (BEP20).</p>
              <p>• Save your transaction hash or screenshot voucher for verification.</p>
            </div>
          </Card>
        </div>

        {/* Right Column: Deposit Request Submission Form */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6 md:p-8 bg-themeSurface-card border-themeBorder-subtle space-y-6">
            <div className="flex items-center gap-2 border-b border-themeBorder-subtle pb-4">
              <div className="p-2 rounded-lg bg-themeBrand-violet/10 text-themeBrand-violet">
                <ArrowDownToLine className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-themeText-primary">Submit Deposit Request</h2>
                <p className="text-xs text-themeText-muted">
                  Provide token amount and supporting voucher to submit for simulated managerial verification.
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

            <form onSubmit={handleSubmitDeposit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-themeText-secondary">
                    Deposit Amount (USDT) <span className="text-semantic-error">*</span>
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 500.00"
                    required
                    className="text-sm font-mono"
                  />
                  <p className="text-[10px] text-themeText-muted">
                    Unit: 1 Token = 1 USDT (Demonstration ledger value)
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-themeText-secondary">
                    Transaction Reference / Hash (Optional)
                  </label>
                  <Input
                    value={txReference}
                    onChange={(e) => setTxReference(e.target.value)}
                    placeholder="e.g. 0x8a91bc74..."
                    className="text-sm font-mono"
                  />
                  <p className="text-[10px] text-themeText-muted">
                    Blockchain explorer transaction identifier
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-themeText-secondary">
                  Deposit Note or Memo (Optional)
                </label>
                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Monthly binary portfolio funding"
                  className="text-sm"
                />
              </div>

              {/* Proof of Payment Upload */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-themeText-secondary">
                  Payment Proof Voucher / Screenshot
                </label>
                <div className="border border-dashed border-themeBorder-subtle hover:border-themeBrand-violet rounded-xl p-4 transition-colors bg-themeSurface-elevated/30">
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    <label className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-themeSurface-elevated border border-themeBorder-subtle hover:bg-themeSurface-elevated/80 rounded-lg text-xs font-medium text-themeText-primary transition-colors shrink-0">
                      <Upload className="w-4 h-4 text-themeBrand-violet" />
                      <span>Choose Voucher Image</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-[11px] text-themeText-muted truncate">
                      {selectedFile ? selectedFile.name : 'PNG, JPG, or WEBP up to 5 MB'}
                    </span>
                  </div>

                  {filePreview && (
                    <div className="mt-3 flex items-center gap-3 p-2 bg-themeSurface-card rounded-lg border border-themeBorder-subtle">
                      <img
                        src={filePreview}
                        alt="Proof Preview"
                        className="w-12 h-12 object-cover rounded-md border border-themeBorder-subtle"
                      />
                      <div className="text-xs">
                        <span className="font-semibold text-themeText-primary block">
                          Preview ready
                        </span>
                        <span className="text-[10px] text-themeText-muted">
                          File will be safely stored under server-managed UUID
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t border-themeBorder-subtle">
                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  isLoading={isSubmitting}
                  leftIcon={<ArrowDownToLine className="w-4 h-4" />}
                >
                  Submit Deposit Request
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* Member's Deposit Request History Table */}
      <Card className="p-6 bg-themeSurface-card border-themeBorder-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-themeBorder-subtle pb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-themeBrand-cyan" />
            <h2 className="text-lg font-bold text-themeText-primary">
              Your Deposit Request History
            </h2>
          </div>
          <span className="text-xs text-themeText-muted">
            Showing {history.length} records
          </span>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-sm text-themeText-muted">
            No deposit requests submitted yet. Use the form above to submit your first request.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-xs">
              <thead className="bg-themeSurface-elevated/60 text-themeText-muted uppercase text-[10px] tracking-wider border-b border-themeBorder-subtle">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Tx Hash</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Voucher</th>
                  <th className="p-3">Reviewer Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-themeBorder-subtle font-sans">
                {history.map((req) => (
                  <tr key={req.id} className="hover:bg-themeSurface-elevated/40 transition-colors">
                    <td className="p-3 font-mono font-medium text-themeText-primary">
                      {req.reference}
                    </td>
                    <td className="p-3 text-themeText-muted">
                      {new Date(req.created_at).toLocaleString()}
                    </td>
                    <td className="p-3 font-mono font-bold text-themeText-primary">
                      {parseFloat(String(req.amount)).toFixed(2)} {req.currency}
                    </td>
                    <td className="p-3 font-mono text-themeText-secondary truncate max-w-[140px]">
                      {req.tx_reference || '—'}
                    </td>
                    <td className="p-3">{getStatusBadge(req.status)}</td>
                    <td className="p-3">
                      {req.proof_url ? (
                        <a
                          href={req.proof_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-themeBrand-cyan hover:underline flex items-center gap-1 font-mono text-[11px]"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-themeText-muted font-mono">—</span>
                      )}
                    </td>
                    <td className="p-3 text-themeText-secondary max-w-[180px] truncate">
                      {req.review_note || (req.note ? `Memo: ${req.note}` : '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Manager-Side Review Controls (Protected by role on UI + verified by backend require_manager) */}
      {isManager && (
        <Card className="p-6 md:p-8 bg-themeSurface-card border-themeBrand-violet/30 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-themeBorder-subtle pb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-themeBrand-violet/10 text-themeBrand-violet">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-themeText-primary">
                    Manager Review Portal — Deposit Requests
                  </h2>
                  <Badge variant="active" className="text-[10px]">
                    Manager Only
                  </Badge>
                </div>
                <p className="text-xs text-themeText-muted">
                  Simulated review interface. Approving a request atomically credits the member's transaction wallet in PostgreSQL.
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
                      ? 'bg-themeBrand-violet text-white shadow-sm'
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
              No deposit requests matching filter "{managerFilter}".
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead className="bg-themeSurface-elevated/60 text-themeText-muted uppercase text-[10px] tracking-wider border-b border-themeBorder-subtle">
                  <tr>
                    <th className="p-3">Reference</th>
                    <th className="p-3">Member</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Submitted</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Voucher</th>
                    <th className="p-3">Review Action</th>
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
                        {parseFloat(String(req.amount)).toFixed(2)} {req.currency}
                      </td>
                      <td className="p-3 text-themeText-muted">
                        {new Date(req.created_at).toLocaleString()}
                      </td>
                      <td className="p-3">{getStatusBadge(req.status)}</td>
                      <td className="p-3">
                        {req.proof_url ? (
                          <a
                            href={req.proof_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-themeBrand-cyan hover:underline flex items-center gap-1 font-mono text-[11px]"
                          >
                            Receipt <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-themeText-muted">—</span>
                        )}
                      </td>
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
                            Reviewed ({req.review_note || 'Decision final'})
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
