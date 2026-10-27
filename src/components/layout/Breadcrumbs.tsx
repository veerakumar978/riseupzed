import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../lib/cn';
import { ROUTES } from '../../config/routes';

interface BreadcrumbSegment {
  label: string;
  path: string;
  isLast: boolean;
}

const ROUTE_LABELS: Record<string, string> = {
  app: 'App',
  dashboard: 'Dashboard',
  profile: 'Profile',
  deposits: 'Deposit Requests',
  'upgrade-ranks': 'Upgrade Ranks',
  users: 'Users',
  left: 'Left Organization',
  right: 'Right Organization',
  tree: 'Tree View',
  withdrawal: 'Withdrawal',
  reports: 'Reports',
  matching: 'Multiple Matching Incentive',
  repurchase: 'Re-Buy Matching Incentive',
  withdrawals: 'Withdraw Tokens',
  transfers: 'Transfer Tokens',
  cashback: 'Weekly Cashback Tokens',
  deductions: 'Deduction Report',
  general: 'General Report',
  trimming: 'Trimming Report',
  support: 'Support',
  dev: 'Development',
  'design-system': 'Design System',
  'backend-status': 'Backend & DB Status',
};

export const Breadcrumbs: React.FC<{ className?: string }> = ({ className }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  if (pathnames.length === 0) return null;

  const segments: BreadcrumbSegment[] = pathnames.map((segment, index) => {
    const path = `/${pathnames.slice(0, index + 1).join('/')}`;
    const label = ROUTE_LABELS[segment] || segment.replace(/-/g, ' ');
    return {
      label,
      path,
      isLast: index === pathnames.length - 1,
    };
  });

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-xs select-none', className)}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        <li>
          <Link
            to={ROUTES.DASHBOARD}
            className="flex items-center text-themeText-muted hover:text-brand-bright-violet transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {segments.map(seg => (
          <li key={seg.path} className="flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5 text-themeText-muted/50 shrink-0" />
            {seg.isLast ? (
              <span aria-current="page" className="font-semibold text-themeText-primary capitalize">
                {seg.label}
              </span>
            ) : (
              <Link
                to={seg.path}
                className="text-themeText-muted hover:text-brand-bright-violet transition-colors capitalize"
              >
                {seg.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
