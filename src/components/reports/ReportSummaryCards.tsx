import React from 'react';
import { Coins, CheckCircle2, Clock, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { Card } from '../ui/Card';
import { ReportSummary } from '../../lib/api-client';

interface ReportSummaryCardsProps {
  summary: ReportSummary;
  tokenLabel?: string;
}

export const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({
  summary,
  tokenLabel = 'Tokens',
}) => {
  const formattedTokens = Number(summary.total_tokens || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Recorded Tokens */}
      <Card variant="standard" padding="md" className="border border-brand-bright-cyan/20 bg-panel-elevated/40 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-themeText-secondary">Total {tokenLabel}</p>
            <h3 className="text-xl sm:text-2xl font-bold text-brand-bright-cyan mt-1 font-mono tracking-tight">
              {formattedTokens}
            </h3>
            <p className="text-[11px] text-themeText-muted mt-1">Filtered volume sum</p>
          </div>
          <div className="w-10 h-10 rounded-control bg-brand-bright-cyan/10 border border-brand-bright-cyan/25 flex items-center justify-center text-brand-bright-cyan shrink-0">
            <Coins className="w-5 h-5" />
          </div>
        </div>
      </Card>

      {/* 2. Total Records */}
      <Card variant="standard" padding="md" className="border border-themeBorder bg-panel-elevated/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-themeText-secondary">Total Entries</p>
            <h3 className="text-xl sm:text-2xl font-bold text-themeText-primary mt-1 font-mono tracking-tight">
              {summary.total_records}
            </h3>
            <p className="text-[11px] text-themeText-muted mt-1">Recorded audit entries</p>
          </div>
          <div className="w-10 h-10 rounded-control bg-panel-secondary border border-themeBorder flex items-center justify-center text-themeText-muted shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>
      </Card>

      {/* 3. Successful Credits */}
      <Card variant="standard" padding="md" className="border border-semantic-success/20 bg-panel-elevated/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-themeText-secondary">Successful Credits</p>
            <h3 className="text-xl sm:text-2xl font-bold text-semantic-success mt-1 font-mono tracking-tight">
              {summary.successful_credits}
            </h3>
            <p className="text-[11px] text-themeText-muted mt-1">Confirmed & settled</p>
          </div>
          <div className="w-10 h-10 rounded-control bg-semantic-success/10 border border-semantic-success/25 flex items-center justify-center text-semantic-success shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </Card>

      {/* 4. Pending or Review */}
      <Card variant="standard" padding="md" className="border border-brand-warm-gold/20 bg-panel-elevated/40">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-themeText-secondary">Pending / In Review</p>
            <h3 className="text-xl sm:text-2xl font-bold text-brand-warm-gold mt-1 font-mono tracking-tight">
              {summary.pending_count}
            </h3>
            <p className="text-[11px] text-themeText-muted mt-1">
              {summary.failed_count > 0 ? `${summary.failed_count} failed` : 'Awaiting confirmation'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-control bg-brand-warm-gold/10 border border-brand-warm-gold/25 flex items-center justify-center text-brand-warm-gold shrink-0">
            {summary.failed_count > 0 ? (
              <AlertCircle className="w-5 h-5 text-semantic-error" />
            ) : (
              <Clock className="w-5 h-5" />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
