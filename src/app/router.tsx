import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '../components/layout/PublicLayout';
import { AuthenticatedLayout } from '../components/layout/AuthenticatedLayout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';

import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/public/LoginPage';
import { Dashboard } from '../pages/app/Dashboard';
import { Profile } from '../pages/app/Profile';
import { Deposits } from '../pages/app/Deposits';
import { Withdrawal } from '../pages/app/Withdrawal';
import { UpgradeRanks } from '../pages/app/UpgradeRanks';
import { OrganizationList } from '../pages/app/OrganizationList';
import { OrganizationTree } from '../pages/app/OrganizationTree';
import { NotFound } from '../pages/app/NotFound';
import { BackendStatus } from '../pages/system/BackendStatus';
import { DesignSystemPreview } from '../pages/DesignSystemPreview';
import { MultipleMatchingReport } from '../pages/app/reports/MultipleMatchingReport';
import { ReBuyMatchingReport } from '../pages/app/reports/ReBuyMatchingReport';
import { WithdrawTokensReport } from '../pages/app/reports/WithdrawTokensReport';
import { TransferTokensReport } from '../pages/app/reports/TransferTokensReport';
import { WeeklyCashbackReport } from '../pages/app/reports/WeeklyCashbackReport';
import { DeductionReport } from '../pages/app/reports/DeductionReport';
import { GeneralReport } from '../pages/app/reports/GeneralReport';
import { TrimmingReport } from '../pages/app/reports/TrimmingReport';
import { TokenTransfers } from '../pages/app/transfers/TokenTransfers';
import { SupportPage } from '../pages/app/support/SupportPage';
import { ROUTES } from '../config/routes';


export const router = createBrowserRouter([
  // Public Landing Page (Clean, standalone with its own premium header & footer)
  {
    path: '/',
    element: <LandingPage />,
  },

  // Public Login Page (Clean, centered authentication view)
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },

  // Dev & Diagnostic Tools (Preserved under diagnostic layout)
  {
    element: <PublicLayout />,
    children: [
      {
        path: ROUTES.DEV_BACKEND_STATUS,
        element: <BackendStatus />,
      },
      {
        path: ROUTES.DEV_DESIGN_SYSTEM,
        element: <DesignSystemPreview />,
      },
    ],
  },

  // Protected Authenticated Application Routes
  {
    path: ROUTES.APP,
    element: <ProtectedRoute />,
    children: [
      {
        element: <AuthenticatedLayout />,
        children: [
          {
            index: true,
            element: <Navigate to={ROUTES.DASHBOARD} replace />,
          },
          {
            path: ROUTES.DASHBOARD,
            element: <Dashboard />,
          },
          {
            path: ROUTES.PROFILE,
            element: <Profile />,
          },
          {
            path: ROUTES.DEPOSITS,
            element: <Deposits />,
          },
          {
            path: ROUTES.UPGRADE_RANKS,
            element: <UpgradeRanks />,
          },

          // Organization / Users (Module 9)
          {
            path: ROUTES.USERS_LEFT,
            element: <OrganizationList side="LEFT" />,
          },
          {
            path: ROUTES.USERS_RIGHT,
            element: <OrganizationList side="RIGHT" />,
          },
          {
            path: ROUTES.USERS_TREE,
            element: <OrganizationTree />,
          },

          // Settlement
          {
            path: ROUTES.WITHDRAWAL,
            element: <Withdrawal />,
          },
          {
            path: ROUTES.TRANSFERS,
            element: <TokenTransfers />,
          },


          // Reports
          {
            path: ROUTES.REPORTS,
            element: <Navigate to={ROUTES.REPORTS_GENERAL} replace />,
          },
          {
            path: ROUTES.REPORTS_MATCHING,
            element: <MultipleMatchingReport />,
          },
          {
            path: ROUTES.REPORTS_REPURCHASE,
            element: <ReBuyMatchingReport />,
          },
          {
            path: ROUTES.REPORTS_WITHDRAWALS,
            element: <WithdrawTokensReport />,
          },
          {
            path: ROUTES.REPORTS_TRANSFERS,
            element: <TransferTokensReport />,
          },
          {
            path: ROUTES.REPORTS_CASHBACK,
            element: <WeeklyCashbackReport />,
          },
          {
            path: ROUTES.REPORTS_DEDUCTIONS,
            element: <DeductionReport />,
          },
          {
            path: ROUTES.REPORTS_GENERAL,
            element: <GeneralReport />,
          },
          {
            path: ROUTES.REPORTS_TRIMMING,
            element: <TrimmingReport />,
          },

          // Support
          {
            path: ROUTES.SUPPORT,
            element: <SupportPage />,
          },
        ],
      },
    ],
  },

  // 404 Catch-All
  {
    path: '*',
    element: <PublicLayout />,
    children: [
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
