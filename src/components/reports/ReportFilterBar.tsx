import React, { useState } from 'react';
import { Filter, RotateCcw, RefreshCw, AlertTriangle, Calendar } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { ReportFilterParams } from '../../lib/api-client';

interface ReportFilterBarProps {
  filters: ReportFilterParams;
  onFilterChange: (newFilters: ReportFilterParams) => void;
  onRefresh: () => void;
  isLoading?: boolean;
  showDirection?: boolean;
  showUserId?: boolean;
  showRemark?: boolean;
}

export const ReportFilterBar: React.FC<ReportFilterBarProps> = ({
  filters,
  onFilterChange,
  onRefresh,
  isLoading = false,
  showDirection = false,
  showUserId = true,
  showRemark = true,
}) => {
  const [localUserId, setLocalUserId] = useState(filters.user_id || '');
  const [localRemark, setLocalRemark] = useState(filters.remark || '');
  const [localFromDate, setLocalFromDate] = useState(filters.from_date || '');
  const [localToDate, setLocalToDate] = useState(filters.to_date || '');
  const [localStatus, setLocalStatus] = useState(filters.status || '');
  const [localDirection, setLocalDirection] = useState(filters.direction || '');
  const [dateError, setDateError] = useState<string | null>(null);

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setDateError(null);

    if (localFromDate && localToDate && localFromDate > localToDate) {
      setDateError('From date cannot be later than To date.');
      return;
    }

    onFilterChange({
      user_id: localUserId.trim() || undefined,
      remark: localRemark.trim() || undefined,
      from_date: localFromDate || undefined,
      to_date: localToDate || undefined,
      status: localStatus || undefined,
      direction: localDirection || undefined,
      page: 1, // Reset pagination when new filters are applied
    });
  };

  const handleClear = () => {
    setLocalUserId('');
    setLocalRemark('');
    setLocalFromDate('');
    setLocalToDate('');
    setLocalStatus('');
    setLocalDirection('');
    setDateError(null);

    onFilterChange({
      user_id: undefined,
      remark: undefined,
      from_date: undefined,
      to_date: undefined,
      status: undefined,
      direction: undefined,
      page: 1,
    });
  };

  return (
    <Card variant="standard" padding="none" className="mb-6 border border-themeBorder overflow-hidden">
      <form onSubmit={handleApply} className="p-4 sm:p-5 bg-panel-secondary/30">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {/* User ID / Member Code */}
          {showUserId && (
            <div>
              <label className="block text-[11px] font-semibold text-themeText-secondary uppercase tracking-wider mb-1">
                User ID
              </label>
              <Input
                type="text"
                placeholder="e.g. RZ-8942"
                value={localUserId}
                onChange={e => setLocalUserId(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          )}

          {/* Remark / Keyword */}
          {showRemark && (
            <div>
              <label className="block text-[11px] font-semibold text-themeText-secondary uppercase tracking-wider mb-1">
                Remark / Memo
              </label>
              <Input
                type="text"
                placeholder="Search remark..."
                value={localRemark}
                onChange={e => setLocalRemark(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          )}

          {/* From Date */}
          <div>
            <label className="block text-[11px] font-semibold text-themeText-secondary uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-brand-bright-cyan" />
              From Date
            </label>
            <input
              type="date"
              value={localFromDate}
              onChange={e => {
                setLocalFromDate(e.target.value);
                setDateError(null);
              }}
              className="w-full h-9 rounded-control px-2.5 bg-input-bg border border-themeBorder text-xs text-themeText-primary focus:border-brand-bright-violet focus:ring-1 focus:ring-brand-bright-violet outline-none transition-colors"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-[11px] font-semibold text-themeText-secondary uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-brand-bright-cyan" />
              To Date
            </label>
            <input
              type="date"
              value={localToDate}
              onChange={e => {
                setLocalToDate(e.target.value);
                setDateError(null);
              }}
              className="w-full h-9 rounded-control px-2.5 bg-input-bg border border-themeBorder text-xs text-themeText-primary focus:border-brand-bright-violet focus:ring-1 focus:ring-brand-bright-violet outline-none transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-themeText-secondary uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={localStatus}
              onChange={e => setLocalStatus(e.target.value)}
              className="w-full h-9 rounded-control px-2.5 bg-input-bg border border-themeBorder text-xs text-themeText-primary focus:border-brand-bright-violet focus:ring-1 focus:ring-brand-bright-violet outline-none transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="REJECTED">Rejected</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          {/* Direction Filter (if enabled) */}
          {showDirection && (
            <div>
              <label className="block text-[11px] font-semibold text-themeText-secondary uppercase tracking-wider mb-1">
                Direction
              </label>
              <select
                value={localDirection}
                onChange={e => setLocalDirection(e.target.value)}
                className="w-full h-9 rounded-control px-2.5 bg-input-bg border border-themeBorder text-xs text-themeText-primary focus:border-brand-bright-violet focus:ring-1 focus:ring-brand-bright-violet outline-none transition-colors"
              >
                <option value="">All Transfers</option>
                <option value="OUTGOING">Outgoing (Sent)</option>
                <option value="INCOMING">Incoming (Received)</option>
              </select>
            </div>
          )}
        </div>

        {/* Date Validation Error Banner */}
        {dateError && (
          <div className="mt-3 p-2 px-3 bg-semantic-error/15 border border-semantic-error/30 rounded-control flex items-center gap-2 text-xs text-semantic-error">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{dateError}</span>
          </div>
        )}

        {/* Filter Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-themeBorder-subtle">
          <div className="flex items-center gap-2">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading}
              leftIcon={<Filter className="w-3.5 h-3.5" />}
            >
              Apply Filters
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={isLoading}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Clear
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </form>
    </Card>
  );
};
