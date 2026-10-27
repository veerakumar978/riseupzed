import React, { useState, useEffect, useCallback } from 'react';
import { Breadcrumb } from '../../../components/ui/Breadcrumb';
import { Badge } from '../../../components/ui/Badge';
import { ReportSummaryCards } from '../../../components/reports/ReportSummaryCards';
import { ReportFilterBar } from '../../../components/reports/ReportFilterBar';
import { ReportTable } from '../../../components/reports/ReportTable';
import { reportsApi, ReportResponse, ReportFilterParams } from '../../../lib/api-client';
import { ROUTES } from '../../../config/routes';

export const WeeklyCashbackReport: React.FC = () => {
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
      const res = await reportsApi.getReport('weekly-cashback', filters);
      setData(res);
    } catch (err) {
      console.error('Failed to load weekly cashback report:', err);
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
      await reportsApi.downloadCsv('weekly-cashback', filters, 'riseupzed_weekly_cashback.csv');
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
            { label: 'Weekly Cashback Tokens' },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-themeText-primary tracking-tight">
                Weekly Cashback Tokens
              </h1>
              <Badge variant="premium" size="sm">Volume Dividend</Badge>
            </div>
            <p className="text-xs sm:text-sm text-themeText-secondary mt-1 max-w-2xl">
              Weekly staking volume cashback yield statements and reward settlement schedules across completed cycles.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {data && <ReportSummaryCards summary={data.summary} tokenLabel="Cashback Tokens" />}

      {/* Filter Controls */}
      <ReportFilterBar
        filters={filters}
        onFilterChange={newFilters => setFilters(prev => ({ ...prev, ...newFilters }))}
        onRefresh={loadReport}
        isLoading={isLoading}
      />

      {/* Report Table */}
      <ReportTable
        title="Weekly Cashback Dividend Statements"
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
        emptyTitle="No Cashback Records Found"
        emptyDescription="No weekly cashback dividend events match the selected dates and search filters."
      />
    </div>
  );
};
