import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown, Filter } from 'lucide-react';
import { Badge, BadgeVariant } from './Badge';
import { Card } from './Card';
import { Button } from './Button';
import { cn } from '../../lib/cn';

export interface DataRow {
  id: string;
  reference: string;
  member: string;
  tier: 'Diamond' | 'Platinum' | 'Gold' | 'Silver';
  amount: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Processing' | 'Failed';
}

const SAMPLE_ROWS: DataRow[] = [
  {
    id: 'tx-1',
    reference: 'TX-8921-948',
    member: 'Evelyn Vance',
    tier: 'Diamond',
    amount: '+2,450.00 USDT',
    date: 'Today, 10:45 AM',
    status: 'Completed',
  },
  {
    id: 'tx-2',
    reference: 'TX-8921-947',
    member: 'Marcus Chen',
    tier: 'Platinum',
    amount: '+1,120.00 USDT',
    date: 'Today, 09:12 AM',
    status: 'Completed',
  },
  {
    id: 'tx-3',
    reference: 'TX-8921-946',
    member: 'Sarah Al-Mansoor',
    tier: 'Gold',
    amount: '-450.00 USDT',
    date: 'Yesterday, 04:30 PM',
    status: 'Pending',
  },
  {
    id: 'tx-4',
    reference: 'TX-8921-945',
    member: 'David K. O’Connor',
    tier: 'Silver',
    amount: '+890.50 USDT',
    date: 'Yesterday, 02:15 PM',
    status: 'Processing',
  },
  {
    id: 'tx-5',
    reference: 'TX-8921-944',
    member: 'Aria Thorne',
    tier: 'Diamond',
    amount: '+4,200.00 USDT',
    date: '25 Oct, 11:20 AM',
    status: 'Completed',
  },
];

export const DataTablePreview: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const getStatusBadgeVariant = (status: DataRow['status']): BadgeVariant => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Pending':
        return 'pending';
      case 'Processing':
        return 'active';
      case 'Failed':
        return 'error';
    }
  };

  const getTierBadgeVariant = (tier: DataRow['tier']): BadgeVariant => {
    switch (tier) {
      case 'Diamond':
        return 'premium';
      case 'Platinum':
        return 'active';
      case 'Gold':
        return 'warning';
      case 'Silver':
        return 'default';
    }
  };

  return (
    <Card variant="standard" padding="none" className="overflow-hidden border border-themeBorder">
      {/* Table Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 px-6 border-b border-themeBorder gap-3 bg-panel-secondary/40">
        <div>
          <h4 className="text-sm font-semibold text-themeText-primary">Recent Transactions & Member Activity</h4>
          <p className="text-xs text-themeText-muted mt-0.5">Foundational table typography and cell alignment demo</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" leftIcon={<Filter className="w-3.5 h-3.5" />}>
            Filter
          </Button>
          <Button variant="secondary" size="sm" leftIcon={<ArrowUpDown className="w-3.5 h-3.5" />}>
            Sort
          </Button>
        </div>
      </div>

      {/* Table Container with Horizontal Scroll for Small Screens */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-themeBorder bg-panel-elevated/40 text-themeText-secondary uppercase tracking-wider font-semibold">
              <th className="py-3.5 px-6">Transaction Ref</th>
              <th className="py-3.5 px-4">Member</th>
              <th className="py-3.5 px-4">Rank Tier</th>
              <th className="py-3.5 px-4">Amount</th>
              <th className="py-3.5 px-4">Timestamp</th>
              <th className="py-3.5 px-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-themeBorder-subtle">
            {SAMPLE_ROWS.map(row => (
              <tr
                key={row.id}
                className="hover:bg-panel-elevated/30 transition-colors group"
              >
                <td className="py-3.5 px-6 font-mono text-themeText-muted group-hover:text-themeText-primary transition-colors">
                  {row.reference}
                </td>
                <td className="py-3.5 px-4 font-medium text-themeText-primary">
                  {row.member}
                </td>
                <td className="py-3.5 px-4">
                  <Badge variant={getTierBadgeVariant(row.tier)} size="sm">
                    {row.tier}
                  </Badge>
                </td>
                <td className={cn(
                  'py-3.5 px-4 font-semibold tabular-numbers',
                  row.amount.startsWith('+') ? 'text-semantic-success' : 'text-semantic-error'
                )}>
                  {row.amount}
                </td>
                <td className="py-3.5 px-4 text-themeText-muted whitespace-nowrap">
                  {row.date}
                </td>
                <td className="py-3.5 px-6 text-right">
                  <Badge variant={getStatusBadgeVariant(row.status)} size="sm" dot>
                    {row.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-4 px-6 border-t border-themeBorder gap-3 text-xs text-themeText-muted bg-panel-secondary/30">
        <span className="tabular-numbers">
          Showing <span className="font-semibold text-themeText-primary">1–5</span> of <span className="font-semibold text-themeText-primary">128</span> entries
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Prev
          </Button>
          <div className="flex items-center gap-1">
            {[1, 2, 3].map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  'w-7 h-7 rounded-control font-medium flex items-center justify-center transition-colors',
                  currentPage === page
                    ? 'bg-brand-bright-violet text-white font-semibold shadow-sm'
                    : 'text-themeText-muted hover:text-themeText-primary hover:bg-panel-elevated'
                )}
              >
                {page}
              </button>
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(prev => prev + 1)}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
};
