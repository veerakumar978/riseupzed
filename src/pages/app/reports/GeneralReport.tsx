import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  TrendingUp,
  RotateCw,
  ArrowUpFromLine,
  ArrowLeftRight,
  Sparkles,
  Scissors,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import { Breadcrumb } from '../../../components/ui/Breadcrumb';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Skeleton } from '../../../components/ui/Skeleton';
import { reportsApi, GeneralReportOverviewResponse } from '../../../lib/api-client';
import { ROUTES } from '../../../config/routes';

export const GeneralReport: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<GeneralReportOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    reportsApi.getOverview()
      .then(res => {
        if (mounted) setData(res);
      })
      .catch(err => {
        console.error('Failed to load general reports overview:', err);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const getCategoryIcon = (key: string) => {
    switch (key) {
      case 'multiple_matching':
        return <TrendingUp className="w-5 h-5 text-brand-bright-cyan" />;
      case 'rebuy_matching':
        return <RotateCw className="w-5 h-5 text-brand-bright-violet" />;
      case 'withdraw_tokens':
        return <ArrowUpFromLine className="w-5 h-5 text-brand-warm-gold" />;
      case 'transfer_tokens':
        return <ArrowLeftRight className="w-5 h-5 text-brand-bright-cyan" />;
      case 'weekly_cashback':
        return <Sparkles className="w-5 h-5 text-semantic-success" />;
      case 'deductions':
        return <Receipt className="w-5 h-5 text-semantic-error" />;
      case 'trimming':
        return <Scissors className="w-5 h-5 text-themeText-muted" />;
      default:
        return <FileSpreadsheet className="w-5 h-5 text-brand-bright-cyan" />;
    }
  };

  const formatTokens = (amt: number | string) => {
    const num = Number(amt);
    return isNaN(num) ? String(amt) : num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'No activity';
    try {
      const dt = new Date(dateStr);
      return dt.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Breadcrumbs */}
      <div>
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: ROUTES.DASHBOARD },
            { label: 'Reports', href: ROUTES.REPORTS_GENERAL },
            { label: 'General Report Overview' },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-themeText-primary tracking-tight">
                General Reports & Analytics
              </h1>
              <Badge variant="premium" size="sm">Master Ledger</Badge>
            </div>
            <p className="text-xs sm:text-sm text-themeText-secondary mt-1 max-w-2xl">
              Consolidated index of all audit reports, token flow categories, and verified historical statement logs.
            </p>
          </div>
        </div>
      </div>

      {/* High-Level Volume Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card variant="standard" padding="lg" className="border border-brand-bright-cyan/25 bg-panel-elevated/40">
          <p className="text-xs font-semibold uppercase tracking-wider text-themeText-secondary">Total Ledger Entries</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-2xl sm:text-3xl font-bold font-mono text-themeText-primary">
              {isLoading ? <Skeleton className="h-8 w-24" /> : data?.total_records}
            </h2>
            <span className="text-xs text-themeText-muted">persisted records across all modules</span>
          </div>
        </Card>

        <Card variant="standard" padding="lg" className="border border-brand-warm-gold/25 bg-panel-elevated/40">
          <p className="text-xs font-semibold uppercase tracking-wider text-themeText-secondary">Aggregated Audit Volume</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-2xl sm:text-3xl font-bold font-mono text-brand-bright-cyan">
              {isLoading ? <Skeleton className="h-8 w-32" /> : `${formatTokens(data?.total_tokens || 0)} Tokens`}
            </h2>
            <span className="text-xs text-themeText-muted">cumulative accounting volume</span>
          </div>
        </Card>
      </div>

      {/* Available Report Categories Grid */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-themeText-secondary mb-3">
          Available Financial & Incentive Reports
        </h3>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-44 w-full rounded-card" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data?.categories.map(cat => (
              <Card
                key={cat.key}
                variant="standard"
                padding="md"
                className="border border-themeBorder hover:border-brand-bright-cyan/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="w-10 h-10 rounded-control bg-panel-secondary border border-themeBorder flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      {getCategoryIcon(cat.key)}
                    </div>
                    <Badge variant={cat.record_count > 0 ? 'success' : 'default'} size="sm">
                      {cat.record_count} {cat.record_count === 1 ? 'record' : 'records'}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-bold text-themeText-primary group-hover:text-brand-bright-cyan transition-colors">
                    {cat.title}
                  </h4>
                  <p className="text-xs text-themeText-secondary mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-themeBorder-subtle flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-themeText-muted block">Volume</span>
                    <span className="font-mono text-xs font-bold text-brand-bright-cyan">
                      {formatTokens(cat.total_tokens)}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(cat.path)}
                    rightIcon={<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />}
                  >
                    View Report
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Ledger Transactions Table */}
      {data && data.recent_items.length > 0 && (
        <Card variant="standard" padding="none" className="overflow-hidden border border-themeBorder">
          <div className="p-4 px-6 border-b border-themeBorder bg-panel-secondary/40">
            <h4 className="text-sm font-semibold text-themeText-primary">Recent Statement Activities</h4>
            <p className="text-xs text-themeText-muted mt-0.5">Cross-category audit events recently registered on your account</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-themeBorder bg-panel-elevated/40 text-themeText-secondary uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Tokens</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-6">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-themeBorder-subtle">
                {data.recent_items.map(item => (
                  <tr key={item.id} className="hover:bg-panel-elevated/20 transition-colors">
                    <td className="py-3 px-4 font-mono text-themeText-muted whitespace-nowrap">
                      {formatDate(item.date)}
                    </td>
                    <td className="py-3 px-4 font-mono text-brand-bright-cyan/90">
                      {item.reference || '—'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-themeText-primary">
                      {item.category || 'General'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-brand-bright-cyan">
                      {formatTokens(item.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={item.status === 'COMPLETED' ? 'success' : 'pending'} size="sm" dot>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-6 text-themeText-muted max-w-xs truncate">
                      {item.remark || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
