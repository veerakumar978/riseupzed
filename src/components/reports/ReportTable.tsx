import React from 'react';
import { Download, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge, BadgeVariant } from '../ui/Badge';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { ReportRowItem } from '../../lib/api-client';

interface ReportTableProps {
  title: string;
  items: ReportRowItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newPageSize: number) => void;
  onExportCsv?: () => void;
  isExporting?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  customColumns?: {
    hideReference?: boolean;
    hideCategory?: boolean;
    extraColumnHeader?: string;
    renderExtraColumn?: (item: ReportRowItem) => React.ReactNode;
  };
}

export const ReportTable: React.FC<ReportTableProps> = ({
  title,
  items,
  total,
  page,
  pageSize,
  totalPages,
  isLoading,
  onPageChange,
  onPageSizeChange,
  onExportCsv,
  isExporting = false,
  emptyTitle = 'No records found',
  emptyDescription = 'No matching report records were found for the selected filter parameters.',
  customColumns,
}) => {
  const getStatusBadgeVariant = (status: string): BadgeVariant => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
      case 'APPROVED':
        return 'success';
      case 'PENDING':
        return 'pending';
      case 'PROCESSING':
        return 'active';
      case 'REJECTED':
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateStr: string) => {
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

  const formatAmount = (amt: number | string) => {
    const num = Number(amt);
    return isNaN(num) ? String(amt) : num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <Card variant="standard" padding="none" className="overflow-hidden border border-themeBorder">
      {/* Table Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 border-b border-themeBorder gap-3 bg-panel-secondary/40">
        <div>
          <h4 className="text-sm font-semibold text-themeText-primary">{title}</h4>
          <p className="text-xs text-themeText-muted mt-0.5">
            {total > 0 ? (
              <span>Showing <span className="font-semibold text-themeText-primary">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}</span> of <span className="font-semibold text-themeText-primary">{total}</span> total entries</span>
            ) : (
              '0 records in current view'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Page Size Selector */}
          <div className="flex items-center gap-1.5 text-xs text-themeText-muted mr-1">
            <span>Show:</span>
            <select
              value={pageSize}
              onChange={e => onPageSizeChange(Number(e.target.value))}
              className="h-8 rounded-control px-2 bg-input-bg border border-themeBorder text-xs text-themeText-primary focus:border-brand-bright-violet outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          {/* CSV Export Button */}
          {onExportCsv && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExportCsv}
              disabled={isLoading || isExporting || total === 0}
              leftIcon={<Download className={`w-3.5 h-3.5 ${isExporting ? 'animate-bounce' : ''}`} />}
            >
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </Button>
          )}
        </div>
      </div>

      {/* Table Area */}
      {isLoading ? (
        <div className="p-6 space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-12 px-4">
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            icon={<FileSpreadsheet className="w-6 h-6 stroke-[1.5]" />}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-themeBorder bg-panel-elevated/40 text-themeText-secondary uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 text-center w-14">S.No</th>
                <th className="py-3.5 px-4">Date</th>
                {!customColumns?.hideReference && <th className="py-3.5 px-4">Reference</th>}
                <th className="py-3.5 px-4">User ID / Member</th>
                <th className="py-3.5 px-4 text-right">Tokens</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                {!customColumns?.hideCategory && <th className="py-3.5 px-4">Category</th>}
                <th className="py-3.5 px-6">Remark / Details</th>
                {customColumns?.extraColumnHeader && (
                  <th className="py-3.5 px-4">{customColumns.extraColumnHeader}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-themeBorder-subtle">
              {items.map(item => (
                <tr
                  key={item.id}
                  className="hover:bg-panel-elevated/30 transition-colors group"
                >
                  <td className="py-3.5 px-4 text-center font-mono text-themeText-muted">
                    {item.s_no}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-themeText-primary whitespace-nowrap">
                    {formatDate(item.date)}
                  </td>
                  {!customColumns?.hideReference && (
                    <td className="py-3.5 px-4 font-mono text-brand-bright-cyan/90 group-hover:text-brand-bright-cyan transition-colors">
                      {item.reference || '—'}
                    </td>
                  )}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-themeText-primary">{item.user_id}</div>
                    <div className="text-[11px] text-themeText-muted truncate max-w-[140px]">{item.user_name}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-brand-bright-cyan tabular-numbers whitespace-nowrap">
                    {formatAmount(item.amount)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge variant={getStatusBadgeVariant(item.status)} size="sm" dot>
                      {item.status}
                    </Badge>
                  </td>
                  {!customColumns?.hideCategory && (
                    <td className="py-3.5 px-4 text-themeText-secondary">
                      {item.category || '—'}
                    </td>
                  )}
                  <td className="py-3.5 px-6 text-themeText-muted max-w-xs truncate">
                    {item.remark || item.extra_info || '—'}
                  </td>
                  {customColumns?.renderExtraColumn && (
                    <td className="py-3.5 px-4">
                      {customColumns.renderExtraColumn(item)}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 px-6 border-t border-themeBorder gap-3 text-xs text-themeText-muted bg-panel-secondary/30">
          <span className="tabular-numbers">
            Page <span className="font-semibold text-themeText-primary">{page}</span> of <span className="font-semibold text-themeText-primary">{totalPages}</span>
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => onPageChange(page - 1)}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Prev
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let p = i + 1;
                if (totalPages > 5 && page > 3) {
                  p = page - 2 + i;
                  if (p > totalPages) p = totalPages - (4 - i);
                }
                return (
                  <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    disabled={isLoading}
                    className={`w-7 h-7 rounded-control font-medium flex items-center justify-center transition-colors ${
                      page === p
                        ? 'bg-brand-bright-violet text-white font-semibold shadow-sm'
                        : 'text-themeText-muted hover:text-themeText-primary hover:bg-panel-elevated'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
            <Button
              variant="ghost"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => onPageChange(page + 1)}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
