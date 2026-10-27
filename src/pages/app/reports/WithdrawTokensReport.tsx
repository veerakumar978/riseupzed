import React, { useState, useEffect, useCallback } from 'react';
import { Breadcrumb } from '../../../components/ui/Breadcrumb';
import { Badge } from '../../../components/ui/Badge';
import { ReportSummaryCards } from '../../../components/reports/ReportSummaryCards';
import { ReportFilterBar } from '../../../components/reports/ReportFilterBar';
import { ReportTable } from '../../../components/reports/ReportTable';
import { reportsApi, ReportResponse, ReportFilterParams } from '../../../lib/api-client';
import { ROUTES } from '../../../config/routes';

export const WithdrawTokensReport: React.FC = () => {
  const [data, setData] = useState<ReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [filters, setFilters] = useState<ReportFilterParams>({
    page: 1,
    page_size: 10,
  });

  const loadReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await reportsApi.getReport('withdraw-tokens', filters);
      setData(res);
    } catch (err) {
      console.error('Failed to load withdrawal report:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      await reportsApi.downloadCsv('withdraw-tokens', filters, 'riseupzed_withdrawals.csv');
    } catch (err) {
      console.error('Export CSV failed:', err);
    } finally {
      setIsExporting(false);
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
            { label: 'Withdraw Tokens Report' },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-themeText-primary tracking-tight">
                Withdraw Tokens Report
              </h1>
              <Badge variant="warning" size="sm">Settlement Audit</Badge>
            </div>
            <p className="text-xs sm:text-sm text-themeText-secondary mt-1 max-w-2xl">
              Historical ledger of requested, pending, approved, and settled token withdrawals with wallet addresses.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {data && <ReportSummaryCards summary={data.summary} tokenLabel="Withdrawn Tokens" />}

      {/* Filters */}
      <ReportFilterBar
        filters={filters}
        onFilterChange={newFilters => setFilters(prev => ({ ...prev, ...newFilters }))}
        onRefresh={loadReport}
        isLoading={isLoading}
      />

      {/* Report Table */}
      <ReportTable
        title="Withdrawal Requests & History"
        items={data?.items || []}
        total={data?.total || 0}
        page={data?.page || 1}
        pageSize={data?.page_size || 10}
        totalPages={data?.total_pages || 1}
        isLoading={isLoading}
        onPageChange={newPage => setFilters(prev => ({ ...prev, page: newPage }))}
        onPageSizeChange={newPageSize => setFilters(prev => ({ ...prev, page_size: newPageSize, page: 1 }))}
        onExportCsv={handleExportCsv}
        isExporting={isExporting}
        emptyTitle="No Withdrawal Records"
        emptyDescription="You have no recorded token withdrawal requests matching these filter parameters."
      />
    </div>
  );
};
