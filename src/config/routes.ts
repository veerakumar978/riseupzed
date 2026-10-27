/**
 * Riseupzed Centralized Route Paths
 */

export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',

  // App Shell / Authenticated
  APP: '/app',
  DASHBOARD: '/app/dashboard',
  PROFILE: '/app/profile',
  DEPOSITS: '/app/deposits',
  UPGRADE_RANKS: '/app/upgrade-ranks',

  // Users & Organization
  USERS: '/app/users',
  USERS_LEFT: '/app/users/left',
  USERS_RIGHT: '/app/users/right',
  USERS_TREE: '/app/users/tree',

  // Wallet & Settlement
  WITHDRAWAL: '/app/withdrawal',
  TRANSFERS: '/app/transfers',

  // Reports
  REPORTS: '/app/reports',
  REPORTS_MATCHING: '/app/reports/matching',
  REPORTS_REPURCHASE: '/app/reports/repurchase',
  REPORTS_WITHDRAWALS: '/app/reports/withdrawals',
  REPORTS_TRANSFERS: '/app/reports/transfers',
  REPORTS_CASHBACK: '/app/reports/cashback',
  REPORTS_DEDUCTIONS: '/app/reports/deductions',
  REPORTS_GENERAL: '/app/reports/general',
  REPORTS_TRIMMING: '/app/reports/trimming',

  // Support
  SUPPORT: '/app/support',

  // Development & System
  DEV_DESIGN_SYSTEM: '/dev/design-system',
  DEV_BACKEND_STATUS: '/dev/backend-status',
} as const;
