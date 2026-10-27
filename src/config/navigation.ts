import {
  LayoutDashboard,
  User,
  ArrowDownToLine,
  TrendingUp,
  Users,
  ArrowUpFromLine,
  FileBarChart,
  LifeBuoy,
  GitBranch,
  Sparkles,
  ArrowLeftRight,
} from 'lucide-react';
import { ROUTES } from './routes';

export interface NavigationSubItem {
  id: string;
  label: string;
  path: string;
  badge?: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  path?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavigationSubItem[];
  isAction?: boolean;
}

export const MAIN_NAVIGATION: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    id: 'profile',
    label: 'Profile',
    path: ROUTES.PROFILE,
    icon: User,
  },
  {
    id: 'deposits',
    label: 'Deposit Requests',
    path: ROUTES.DEPOSITS,
    icon: ArrowDownToLine,
    badge: '3',
  },
  {
    id: 'upgrade-ranks',
    label: 'Upgrade Ranks',
    path: ROUTES.UPGRADE_RANKS,
    icon: TrendingUp,
    badge: 'VIP',
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    children: [
      {
        id: 'users-left',
        label: 'Left Organization',
        path: ROUTES.USERS_LEFT,
      },
      {
        id: 'users-right',
        label: 'Right Organization',
        path: ROUTES.USERS_RIGHT,
      },
      {
        id: 'users-tree',
        label: 'Tree View',
        path: ROUTES.USERS_TREE,
        badge: 'Binary',
      },
    ],
  },
  {
    id: 'withdrawal',
    label: 'Withdrawal',
    path: ROUTES.WITHDRAWAL,
    icon: ArrowUpFromLine,
  },
  {
    id: 'transfers',
    label: 'Token Transfers',
    path: ROUTES.TRANSFERS,
    icon: ArrowLeftRight,
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: FileBarChart,
    children: [
      {
        id: 'reports-matching',
        label: 'Multiple Matching Incentive',
        path: ROUTES.REPORTS_MATCHING,
      },
      {
        id: 'reports-repurchase',
        label: 'Re-Buy Matching Incentive',
        path: ROUTES.REPORTS_REPURCHASE,
      },
      {
        id: 'reports-withdrawals',
        label: 'Withdraw Tokens Report',
        path: ROUTES.REPORTS_WITHDRAWALS,
      },
      {
        id: 'reports-transfers',
        label: 'Transfer Tokens',
        path: ROUTES.REPORTS_TRANSFERS,
      },
      {
        id: 'reports-cashback',
        label: 'Weekly Cashback Tokens',
        path: ROUTES.REPORTS_CASHBACK,
      },
      {
        id: 'reports-deductions',
        label: 'Deduction Report',
        path: ROUTES.REPORTS_DEDUCTIONS,
      },
      {
        id: 'reports-general',
        label: 'General Report',
        path: ROUTES.REPORTS_GENERAL,
      },
      {
        id: 'reports-trimming',
        label: 'Trimming Report',
        path: ROUTES.REPORTS_TRIMMING,
      },
    ],
  },
  {
    id: 'support',
    label: 'Support',
    path: ROUTES.SUPPORT,
    icon: LifeBuoy,
  },
];

export const DEV_NAVIGATION: NavigationItem[] = [
  {
    id: 'dev-design-system',
    label: 'Design System Preview',
    path: ROUTES.DEV_DESIGN_SYSTEM,
    icon: Sparkles,
  },
  {
    id: 'dev-backend-status',
    label: 'Backend & DB Status',
    path: ROUTES.DEV_BACKEND_STATUS,
    icon: GitBranch,
  },
];
