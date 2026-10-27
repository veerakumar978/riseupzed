/**
 * RiseUpZed Client-Side Demo Fallback Engine
 * Provides complete high-fidelity deterministic demo data when the backend microservice
 * is unreachable (e.g., cloud deployments like Vercel without a configured remote backend).
 */

import {
  UserSummary,
  LoginResponse,
  DashboardSummary,
  ManagerDashboardSummary,
  WalletOverview,
  FinancialConfig,
  DepositRequestItem,
  WithdrawalRequestItem,
  PackageItem,
  CurrentPackageInfo,
  TreeNodeItem,
  OrganizationListResponse,
  MemberNodeDetails,
  ProfileData,
  NomineeData,
  WalletAddressData,
  ReportResponse,
  GeneralReportOverviewResponse,
  TransferBalanceInfo,
  TransferRecipientLookupResponse,
  TokenTransferResponse,
  SupportTicketResponse,
  UnplacedMemberItem,
  ActivityItem,
  UpgradeRequestItem,
} from './api-client';

const DEMO_MEMBER: UserSummary = {
  id: 'usr-member-8942',
  member_code: 'RZ-8942',
  display_name: 'Johnathan Sterling',
  email: 'j.sterling@example.com',
  phone: '+1 (555) 234-5678',
  role: 'MEMBER',
  status: 'ACTIVE',
  package_code: 'DIAMOND',
  package_name: 'Blue Diamond VIP',
  activation_date: '2026-01-15T00:00:00Z',
};

const DEMO_MANAGER: UserSummary = {
  id: 'usr-manager-0001',
  member_code: 'RZ-0001',
  display_name: 'Alex Vance',
  email: 'alex.vance@riseupzed.com',
  phone: '+1 (555) 999-0001',
  role: 'MANAGER',
  status: 'ACTIVE',
  package_code: 'DIAMOND',
  package_name: 'Blue Diamond VIP',
  activation_date: '2025-11-01T00:00:00Z',
};

// Current active mock persona (persists across page reloads in localStorage)
const MOCK_USER_KEY = 'rz_mock_user';

export function getActiveMockUser(): UserSummary {
  try {
    const raw = localStorage.getItem(MOCK_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEMO_MEMBER;
}

export function setActiveMockUser(user: UserSummary | null): void {
  try {
    if (user) {
      localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(MOCK_USER_KEY);
    }
  } catch {
    // ignore
  }
}

export const MOCK_PACKAGES: PackageItem[] = [
  {
    id: 'pkg-1',
    code: 'STARTER',
    name: 'Starter Staker',
    display_name: 'Starter Package (100 USDT)',
    price: 100,
    upgrade_amount: 5000,
    achievement_threshold: 10000,
    description: 'Entry-tier staking and network node qualification.',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'pkg-2',
    code: 'SILVER',
    name: 'Silver Staker',
    display_name: 'Silver Package (500 USDT)',
    price: 500,
    upgrade_amount: 15000,
    achievement_threshold: 30000,
    description: 'Accelerated network yield tier with silver status.',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'pkg-3',
    code: 'GOLD',
    name: 'Gold Executive',
    display_name: 'Gold Package (1,000 USDT)',
    price: 1000,
    upgrade_amount: 45000,
    achievement_threshold: 90000,
    description: 'Executive staking node with enhanced binary volume weighting.',
    sort_order: 3,
    is_active: true,
  },
  {
    id: 'pkg-4',
    code: 'PLATINUM',
    name: 'Platinum Director',
    display_name: 'Platinum Package (2,500 USDT)',
    price: 2500,
    upgrade_amount: 100000,
    achievement_threshold: 200000,
    description: 'Director-grade vault yield with prioritized liquidity routing.',
    sort_order: 4,
    is_active: true,
  },
  {
    id: 'pkg-5',
    code: 'DIAMOND',
    name: 'Diamond Ambassador',
    display_name: 'Blue Diamond VIP Package (5,000 USDT)',
    price: 5000,
    upgrade_amount: 250000,
    achievement_threshold: 500000,
    description: 'Premier Blue Diamond ambassador tier with top staking rewards.',
    sort_order: 5,
    is_active: true,
  },
];

export const MOCK_TREE: TreeNodeItem = {
  node_id: 'node-root',
  member_id: 'usr-member-8942',
  member_code: 'RZ-8942',
  display_name: 'Johnathan Sterling',
  package_name: 'Blue Diamond VIP',
  package_price: 5000,
  status: 'ACTIVE',
  position: 'ROOT',
  is_occupied: true,
  children: [
    {
      node_id: 'node-left-1',
      member_id: 'usr-elena',
      member_code: 'RZ-5101',
      display_name: 'Elena Rostova',
      package_name: 'Platinum Package',
      package_price: 2500,
      status: 'ACTIVE',
      position: 'LEFT',
      parent_code: 'RZ-8942',
      parent_name: 'Johnathan Sterling',
      is_occupied: true,
      children: [
        {
          node_id: 'node-left-1-1',
          member_id: 'usr-sophia',
          member_code: 'RZ-3204',
          display_name: 'Sophia Al-Mansoor',
          package_name: 'Gold Package',
          package_price: 1000,
          status: 'ACTIVE',
          position: 'LEFT',
          parent_code: 'RZ-5101',
          parent_name: 'Elena Rostova',
          is_occupied: true,
          children: [],
        },
        {
          node_id: 'node-left-1-2',
          member_id: 'usr-lucas',
          member_code: 'RZ-7821',
          display_name: 'Lucas Silva',
          package_name: 'Silver Package',
          package_price: 500,
          status: 'ACTIVE',
          position: 'RIGHT',
          parent_code: 'RZ-5101',
          parent_name: 'Elena Rostova',
          is_occupied: true,
          children: [],
        },
      ],
    },
    {
      node_id: 'node-right-1',
      member_id: 'usr-marcus',
      member_code: 'RZ-4902',
      display_name: 'Marcus Chen',
      package_name: 'Platinum Package',
      package_price: 2500,
      status: 'ACTIVE',
      position: 'RIGHT',
      parent_code: 'RZ-8942',
      parent_name: 'Johnathan Sterling',
      is_occupied: true,
      children: [
        {
          node_id: 'node-right-1-1',
          member_id: 'usr-aisha',
          member_code: 'RZ-6309',
          display_name: 'Aisha Patel',
          package_name: 'Gold Package',
          package_price: 1000,
          status: 'ACTIVE',
          position: 'LEFT',
          parent_code: 'RZ-4902',
          parent_name: 'Marcus Chen',
          is_occupied: true,
          children: [],
        },
        {
          node_id: 'node-right-1-2',
          member_id: 'usr-dmitry',
          member_code: 'RZ-1198',
          display_name: 'Dmitry Volkov',
          package_name: 'Starter Package',
          package_price: 100,
          status: 'ACTIVE',
          position: 'RIGHT',
          parent_code: 'RZ-4902',
          parent_name: 'Marcus Chen',
          is_occupied: true,
          children: [],
        },
      ],
    },
  ],
};

/**
 * Main dispatcher to intercept offline requests and return rich mock responses.
 */
export function handleMockFallback<T>(endpoint: string, options: RequestInit = {}): T | undefined {
  const method = (options.method || 'GET').toUpperCase();
  const urlPath = endpoint.replace(/^https?:\/\/[^/]+/, '').split('?')[0];

  // 1. Health Checks
  if (urlPath === '/api/v1/health' || urlPath === '/api/health') {
    return {
      status: 'healthy (demo mode)',
      version: '1.0.0',
      environment: 'demo-fallback',
      timestamp: new Date().toISOString(),
    } as unknown as T;
  }

  // 2. Auth: Login
  if (urlPath === '/api/v1/auth/login' && method === 'POST') {
    let identifier = 'RZ-8942';
    try {
      if (typeof options.body === 'string') {
        const parsed = JSON.parse(options.body);
        identifier = parsed.identifier || identifier;
      }
    } catch {
      // ignore
    }

    const isManager =
      identifier.toLowerCase().includes('0001') ||
      identifier.toLowerCase().includes('alex') ||
      identifier.toLowerCase().includes('manager');

    const user = isManager ? DEMO_MANAGER : DEMO_MEMBER;
    setActiveMockUser(user);

    const loginRes: LoginResponse = {
      user,
      token: `rz_mock_token_${Date.now()}`,
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      message: 'Demo login successful',
    };
    return loginRes as unknown as T;
  }

  // 3. Auth: Current User (/me)
  if (urlPath === '/api/v1/auth/me' && method === 'GET') {
    return getActiveMockUser() as unknown as T;
  }

  // 4. Auth: Logout
  if (urlPath === '/api/v1/auth/logout') {
    setActiveMockUser(null);
    return { success: true, message: 'Logged out' } as unknown as T;
  }

  // 5. Member Dashboard Summary
  if (urlPath === '/api/v1/dashboard/summary') {
    const user = getActiveMockUser();
    const data: DashboardSummary = {
      member: user,
      package: {
        id: 'pkg-5',
        code: 'DIAMOND',
        name: 'Diamond Ambassador',
        display_name: 'Blue Diamond VIP Package',
        price: 5000,
      },
      wallets: [
        { id: 'w-1', wallet_type: 'TRANSACTION', balance: '148920.45', currency: 'USDT' },
        { id: 'w-2', wallet_type: 'MOTHER', balance: '25000.00', currency: 'USDT' },
        { id: 'w-3', wallet_type: 'STAKING', balance: '95000.00', currency: 'USDT' },
      ],
      organization: {
        left_child_code: 'RZ-5101',
        left_child_name: 'Elena Rostova',
        right_child_code: 'RZ-4902',
        right_child_name: 'Marcus Chen',
        direct_referrals_count: 8,
      },
      recent_activity: [
        {
          id: 'tx-1',
          reference: 'TXN-902148',
          tx_type: 'WEEKLY_CASHBACK',
          direction: 'CREDIT',
          amount: '1850.00',
          status: 'COMPLETED',
          remark: 'Weekly Staking Dividend (Tier 5 Blue Diamond)',
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: 'tx-2',
          reference: 'TXN-902147',
          tx_type: 'BINARY_MATCHING',
          direction: 'CREDIT',
          amount: '750.00',
          status: 'COMPLETED',
          remark: 'Matching commission on volume pair',
          created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
        },
        {
          id: 'tx-3',
          reference: 'TXN-902146',
          tx_type: 'TOKEN_TRANSFER',
          direction: 'DEBIT',
          amount: '500.00',
          status: 'COMPLETED',
          remark: 'Transfer to member RZ-5101 (Elena Rostova)',
          created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
        },
        {
          id: 'tx-4',
          reference: 'TXN-902145',
          tx_type: 'DEPOSIT',
          direction: 'CREDIT',
          amount: '10000.00',
          status: 'COMPLETED',
          remark: 'USDT TRC20 On-chain Deposit',
          created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
        },
      ],
    };
    return data as unknown as T;
  }

  // 6. Manager Dashboard Summary
  if (urlPath === '/api/v1/dashboard/manager-summary') {
    const data: ManagerDashboardSummary = {
      manager: DEMO_MANAGER,
      metrics: {
        total_members: 1420,
        active_members: 1388,
        total_packages: 1420,
        open_support_tickets: 4,
        pending_deposit_requests: 3,
        pending_withdrawal_requests: 2,
      },
      package_distribution: [
        { package_code: 'STARTER', package_name: 'Starter Package', member_count: 512 },
        { package_code: 'SILVER', package_name: 'Silver Package', member_count: 384 },
        { package_code: 'GOLD', package_name: 'Gold Package', member_count: 278 },
        { package_code: 'PLATINUM', package_name: 'Platinum Package', member_count: 164 },
        { package_code: 'DIAMOND', package_name: 'Blue Diamond VIP', member_count: 82 },
      ],
      recent_activity: [
        {
          id: 'act-1',
          reference: 'DEP-8841',
          tx_type: 'DEPOSIT_SUBMITTED',
          direction: 'CREDIT',
          amount: '2500.00',
          status: 'PENDING',
          remark: 'New deposit submitted by RZ-3204',
          created_at: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: 'act-2',
          reference: 'WTH-4102',
          tx_type: 'WITHDRAWAL_REQUESTED',
          direction: 'DEBIT',
          amount: '1200.00',
          status: 'PENDING',
          remark: 'Saturday withdrawal window request',
          created_at: new Date(Date.now() - 7200000).toISOString(),
        },
      ],
    };
    return data as unknown as T;
  }

  // 7. Packages list & Current package
  if (urlPath === '/api/v1/packages') {
    return MOCK_PACKAGES as unknown as T;
  }

  if (urlPath === '/api/v1/packages/current') {
    const user = getActiveMockUser();
    const pkgInfo: CurrentPackageInfo = {
      member_id: user.id,
      member_code: user.member_code,
      display_name: user.display_name,
      package: MOCK_PACKAGES[4], // Diamond
      activation_date: new Date(Date.now() - 3600000 * 24 * 90).toISOString(),
      status: 'ACTIVE',
      upgrade_status: 'NONE',
    };
    return pkgInfo as unknown as T;
  }

  // 8. Wallets & Financial Overview
  if (urlPath === '/api/v1/wallets') {
    const overview: WalletOverview = {
      wallets: [
        { id: 'w-1', member_id: 'usr-member-8942', wallet_type: 'TRANSACTION', balance: '148920.45', currency: 'USDT', is_frozen: false },
        { id: 'w-2', member_id: 'usr-member-8942', wallet_type: 'MOTHER', balance: '25000.00', currency: 'USDT', is_frozen: false },
        { id: 'w-3', member_id: 'usr-member-8942', wallet_type: 'STAKING', balance: '95000.00', currency: 'USDT', is_frozen: false },
      ],
      total_balance: '268920.45',
    };
    return overview as unknown as T;
  }

  if (urlPath === '/api/v1/financial/config') {
    const config: FinancialConfig = {
      min_withdrawal_amount: 50,
      saturday_only: true,
      is_saturday_today: new Date().getDay() === 6,
      demo_usdt_address: 'TX9rq...8vQ2m_TRC20_Official',
      demo_network: 'TRC-20 (Tron Network)',
    };
    return config as unknown as T;
  }

  // 9. Deposit Requests
  if (urlPath === '/api/v1/deposit-requests' || urlPath === '/api/v1/manager/deposit-requests') {
    const list: DepositRequestItem[] = [
      {
        id: 'dep-1',
        reference: 'DEP-894201',
        member_id: 'usr-member-8942',
        member_code: 'RZ-8942',
        member_name: 'Johnathan Sterling',
        amount: '5000.00',
        currency: 'USDT',
        tx_reference: '0x8f...39a1',
        status: 'APPROVED',
        note: 'Initial Staking Capital',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      },
      {
        id: 'dep-2',
        reference: 'DEP-894202',
        member_id: 'usr-member-8942',
        member_code: 'RZ-8942',
        member_name: 'Johnathan Sterling',
        amount: '10000.00',
        currency: 'USDT',
        tx_reference: '0x4c...18e7',
        status: 'PENDING',
        note: 'Tier Top-Up',
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      },
    ];
    return list as unknown as T;
  }

  // 10. Withdrawal Requests
  if (urlPath === '/api/v1/withdrawal-requests' || urlPath === '/api/v1/manager/withdrawal-requests') {
    const list: WithdrawalRequestItem[] = [
      {
        id: 'wth-1',
        reference: 'WTH-9941',
        member_id: 'usr-member-8942',
        member_code: 'RZ-8942',
        member_name: 'Johnathan Sterling',
        wallet_id: 'w-1',
        wallet_type: 'TRANSACTION',
        amount: '1500.00',
        destination_address: 'TL9b...4491_TRC20',
        status: 'APPROVED',
        created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 6).toISOString(),
      },
    ];
    return list as unknown as T;
  }

  // 11. Organization Tree & Details
  if (urlPath === '/api/v1/organization/tree') {
    return MOCK_TREE as unknown as T;
  }

  if (urlPath.includes('/api/v1/organization/members/') && urlPath.endsWith('/details')) {
    const codeMatch = urlPath.match(/\/members\/([^/]+)\/details/);
    const code = codeMatch ? decodeURIComponent(codeMatch[1]) : 'RZ-8942';
    const isRoot = code === 'RZ-8942';
    const isElena = code === 'RZ-5101';
    const isMarcus = code === 'RZ-4902';

    const details: MemberNodeDetails = {
      member_code: code,
      display_name: isRoot ? 'Johnathan Sterling' : isElena ? 'Elena Rostova' : isMarcus ? 'Marcus Chen' : `Member ${code}`,
      status: 'ACTIVE',
      role: 'MEMBER',
      activation_date: '2026-01-15T00:00:00Z',
      package_name: isRoot ? 'Blue Diamond VIP' : isElena ? 'Platinum Package' : 'Gold Package',
      package_price: isRoot ? '5,000 USDT' : isElena ? '2,500 USDT' : '1,000 USDT',
      direct_children: isRoot
        ? [
            { position: 'LEFT', member_code: 'RZ-5101', display_name: 'Elena Rostova' },
            { position: 'RIGHT', member_code: 'RZ-4902', display_name: 'Marcus Chen' },
          ]
        : [],
      team_metrics: {
        total_downline: isRoot ? 142 : isElena ? 78 : 64,
        left_organization: isRoot ? 78 : isElena ? 42 : 36,
        right_organization: isRoot ? 64 : isElena ? 36 : 28,
      },
    };
    return details as unknown as T;
  }

  if (urlPath === '/api/v1/organization/left' || urlPath === '/api/v1/organization/list') {
    const list: OrganizationListResponse = {
      side: 'LEFT',
      parent_code: 'RZ-8942',
      parent_name: 'Johnathan Sterling',
      total_members: 78,
      active_members: 75,
      inactive_members: 3,
      page: 1,
      page_size: 10,
      total_pages: 8,
      items: [
        {
          s_no: 1,
          id: 'elena',
          member_code: 'RZ-5101',
          display_name: 'Elena Rostova',
          position: 'LEFT',
          package_name: 'Platinum Package',
          status: 'ACTIVE',
          placement_date: '2026-01-20',
        },
        {
          s_no: 2,
          id: 'sophia',
          member_code: 'RZ-3204',
          display_name: 'Sophia Al-Mansoor',
          position: 'LEFT',
          package_name: 'Gold Package',
          status: 'ACTIVE',
          placement_date: '2026-01-25',
        },
        {
          s_no: 3,
          id: 'lucas',
          member_code: 'RZ-7821',
          display_name: 'Lucas Silva',
          position: 'LEFT',
          package_name: 'Silver Package',
          status: 'ACTIVE',
          placement_date: '2026-02-01',
        },
        {
          s_no: 4,
          id: 'vikram',
          member_code: 'RZ-6209',
          display_name: 'Vikram Malhotra',
          position: 'LEFT',
          package_name: 'Gold Package',
          status: 'ACTIVE',
          placement_date: '2026-02-08',
        },
        {
          s_no: 5,
          id: 'hanna',
          member_code: 'RZ-4411',
          display_name: 'Hanna Schmidt',
          position: 'LEFT',
          package_name: 'Starter Package',
          status: 'ACTIVE',
          placement_date: '2026-02-14',
        },
      ],
    };
    return list as unknown as T;
  }

  if (urlPath === '/api/v1/organization/right') {
    const list: OrganizationListResponse = {
      side: 'RIGHT',
      parent_code: 'RZ-8942',
      parent_name: 'Johnathan Sterling',
      total_members: 64,
      active_members: 62,
      inactive_members: 2,
      page: 1,
      page_size: 10,
      total_pages: 7,
      items: [
        {
          s_no: 1,
          id: 'marcus',
          member_code: 'RZ-4902',
          display_name: 'Marcus Chen',
          position: 'RIGHT',
          package_name: 'Platinum Package',
          status: 'ACTIVE',
          placement_date: '2026-01-21',
        },
        {
          s_no: 2,
          id: 'aisha',
          member_code: 'RZ-6309',
          display_name: 'Aisha Patel',
          position: 'RIGHT',
          package_name: 'Gold Package',
          status: 'ACTIVE',
          placement_date: '2026-01-26',
        },
        {
          s_no: 3,
          id: 'dmitry',
          member_code: 'RZ-1198',
          display_name: 'Dmitry Volkov',
          position: 'RIGHT',
          package_name: 'Starter Package',
          status: 'ACTIVE',
          placement_date: '2026-02-03',
        },
        {
          s_no: 4,
          id: 'chloe',
          member_code: 'RZ-5510',
          display_name: 'Chloe Dupont',
          position: 'RIGHT',
          package_name: 'Silver Package',
          status: 'ACTIVE',
          placement_date: '2026-02-10',
        },
        {
          s_no: 5,
          id: 'mateo',
          member_code: 'RZ-3382',
          display_name: 'Mateo Rossi',
          position: 'RIGHT',
          package_name: 'Gold Package',
          status: 'ACTIVE',
          placement_date: '2026-02-18',
        },
      ],
    };
    return list as unknown as T;
  }

  if (urlPath === '/api/v1/organization/unplaced-members') {
    const unplaced: UnplacedMemberItem[] = [
      { id: 'unp-1', member_code: 'RZ-9102', display_name: 'Liam Gallagher', package_name: 'Gold Package', status: 'PENDING_PLACEMENT' },
      { id: 'unp-2', member_code: 'RZ-9103', display_name: 'Amara Okafor', package_name: 'Silver Package', status: 'PENDING_PLACEMENT' },
    ];
    return unplaced as unknown as T;
  }

  if (urlPath === '/api/v1/organization/place-member') {
    return {
      success: true,
      message: 'Member successfully placed on network tree',
      placement: { parent_code: 'RZ-8942', child_code: 'RZ-9102', position: 'LEFT' },
    } as unknown as T;
  }

  if (urlPath === '/api/v1/wallets/transactions') {
    const txs: ActivityItem[] = [
      { id: 'tx-1', reference: 'TXN-902148', tx_type: 'WEEKLY_CASHBACK', direction: 'CREDIT', amount: '1850.00', status: 'COMPLETED', remark: 'Weekly Staking Dividend', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
      { id: 'tx-2', reference: 'TXN-902147', tx_type: 'BINARY_MATCHING', direction: 'CREDIT', amount: '750.00', status: 'COMPLETED', remark: 'Matching commission', created_at: new Date(Date.now() - 3600000 * 18).toISOString() },
      { id: 'tx-3', reference: 'TXN-902146', tx_type: 'TOKEN_TRANSFER', direction: 'DEBIT', amount: '500.00', status: 'COMPLETED', remark: 'Transfer to member RZ-5101', created_at: new Date(Date.now() - 3600000 * 36).toISOString() },
      { id: 'tx-4', reference: 'TXN-902145', tx_type: 'DEPOSIT', direction: 'CREDIT', amount: '10000.00', status: 'COMPLETED', remark: 'USDT TRC20 On-chain Deposit', created_at: new Date(Date.now() - 3600000 * 72).toISOString() },
    ];
    return txs as unknown as T;
  }

  if (urlPath === '/api/v1/packages/upgrade-requests' || urlPath.startsWith('/api/v1/manager/packages/upgrade-requests')) {
    const upgReqs: UpgradeRequestItem[] = [
      {
        id: 'upg-1',
        reference: 'UPG-8942-01',
        member_id: 'usr-member-8942',
        member_code: 'RZ-8942',
        member_name: 'Johnathan Sterling',
        target_package_id: 'pkg-5',
        target_package_name: 'Blue Diamond VIP',
        upgrade_amount: 2500,
        status: 'APPROVED',
        review_note: 'Verified qualification threshold.',
        created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
        updated_at: new Date(Date.now() - 86400000 * 13).toISOString(),
      },
    ];
    return upgReqs as unknown as T;
  }

  // 12. Transfers
  if (urlPath === '/api/v1/transfers/balance') {
    const bal: TransferBalanceInfo = {
      wallet_id: 'w-1',
      wallet_type: 'TRANSACTION',
      available_balance: '148920.45',
      currency: 'USDT',
    };
    return bal as unknown as T;
  }

  if (urlPath.includes('/api/v1/transfers/lookup-recipient')) {
    const lookup: TransferRecipientLookupResponse = {
      member_id: 'usr-elena',
      member_code: 'RZ-5101',
      display_name: 'Elena Rostova',
      is_valid: true,
    };
    return lookup as unknown as T;
  }

  if (urlPath === '/api/v1/transfers/history') {
    const history: TokenTransferResponse[] = [
      {
        id: 'trf-1',
        reference: 'TRF-88192',
        sender_id: 'usr-member-8942',
        sender_code: 'RZ-8942',
        sender_name: 'Johnathan Sterling',
        receiver_id: 'usr-elena',
        receiver_code: 'RZ-5101',
        receiver_name: 'Elena Rostova',
        transfer_type: 'USER_TO_USER',
        amount: '500.00',
        status: 'COMPLETED',
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
    ];
    return history as unknown as T;
  }

  // 13. Reports
  if (urlPath.startsWith('/api/v1/reports/overview')) {
    const overview: GeneralReportOverviewResponse = {
      categories: [
        { key: 'weekly-cashback', title: 'Weekly Cashback Report', path: '/app/reports/weekly-cashback', description: 'Staking dividends distribution', record_count: 148, total_tokens: '24,500.00' },
        { key: 'rebuy-matching', title: 'Re-Buy Matching Report', path: '/app/reports/rebuy-matching', description: 'Re-purchase pairing credits', record_count: 94, total_tokens: '12,800.00' },
        { key: 'multiple-matching', title: 'Multiple Matching Report', path: '/app/reports/multiple-matching', description: 'Direct referral binary matching', record_count: 62, total_tokens: '8,400.00' },
        { key: 'deductions', title: 'Deduction Report', path: '/app/reports/deductions', description: 'Administrative fee ledger', record_count: 31, total_tokens: '1,250.00' },
        { key: 'transfers', title: 'Token Transfers Report', path: '/app/reports/transfers', description: 'Peer-to-peer token movements', record_count: 55, total_tokens: '9,800.00' },
        { key: 'withdrawals', title: 'Withdraw Tokens Report', path: '/app/reports/withdraw-tokens', description: 'External USDT withdrawals', record_count: 24, total_tokens: '18,500.00' },
        { key: 'trimming', title: 'Trimming Report', path: '/app/reports/trimming', description: 'Network capping adjustments', record_count: 12, total_tokens: '3,100.00' },
      ],
      total_records: 426,
      total_tokens: '78,350.00',
      recent_items: [
        {
          s_no: 1,
          id: 'rep-1',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          reference: 'REP-9921',
          user_id: 'RZ-8942',
          user_name: 'Johnathan Sterling',
          amount: '1850.00',
          status: 'PROCESSED',
          remark: 'Weekly Cashback Allocation (Diamond)',
        },
      ],
    };
    return overview as unknown as T;
  }

  if (urlPath.startsWith('/api/v1/reports/')) {
    const report: ReportResponse = {
      report_type: 'SAMPLE_REPORT',
      title: 'Historical Ledger Report',
      total: 3,
      page: 1,
      page_size: 10,
      total_pages: 1,
      summary: {
        total_tokens: '7,450.00',
        total_records: 3,
        successful_credits: 3,
        pending_count: 0,
        failed_count: 0,
      },
      items: [
        {
          s_no: 1,
          id: 'row-1',
          date: '2026-10-25',
          reference: 'REF-77102',
          user_id: 'RZ-8942',
          user_name: 'Johnathan Sterling',
          amount: '3500.00',
          status: 'SUCCESS',
          remark: 'Scheduled Yield Credited',
        },
        {
          s_no: 2,
          id: 'row-2',
          date: '2026-10-18',
          reference: 'REF-77095',
          user_id: 'RZ-8942',
          user_name: 'Johnathan Sterling',
          amount: '2450.00',
          status: 'SUCCESS',
          remark: 'Binary Team Volume Yield',
        },
        {
          s_no: 3,
          id: 'row-3',
          date: '2026-10-11',
          reference: 'REF-77088',
          user_id: 'RZ-8942',
          user_name: 'Johnathan Sterling',
          amount: '1500.00',
          status: 'SUCCESS',
          remark: 'Tier Staking Reward',
        },
      ],
    };
    return report as unknown as T;
  }

  // 14. Support Tickets
  if (urlPath === '/api/v1/support/tickets') {
    const tickets: SupportTicketResponse[] = [
      {
        id: 'tkt-1',
        ticket_number: 'TK-89421',
        member_id: 'usr-member-8942',
        member_code: 'RZ-8942',
        member_name: 'Johnathan Sterling',
        subject: 'Inquiry regarding Saturday withdrawal cycle',
        category: 'FINANCIAL',
        description: 'Verifying TRC-20 address whitelist requirements.',
        priority: 'MEDIUM',
        status: 'ANSWERED',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
        updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        messages: [
          {
            id: 'msg-1',
            ticket_id: 'tkt-1',
            sender_id: 'usr-member-8942',
            sender_name: 'Johnathan Sterling',
            sender_role: 'MEMBER',
            message_body: 'Hello, is my TRC-20 wallet address verified for this Saturday cycle?',
            is_internal_note: false,
            created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
          {
            id: 'msg-2',
            ticket_id: 'tkt-1',
            sender_id: 'usr-manager-0001',
            sender_name: 'Alex Vance (Support)',
            sender_role: 'MANAGER',
            message_body: 'Hello Johnathan. Yes, your address is whitelisted and active.',
            is_internal_note: false,
            created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
          },
        ],
      },
    ];
    return tickets as unknown as T;
  }

  // 15. Profile
  if (urlPath === '/api/v1/profile') {
    const user = getActiveMockUser();
    const profile: ProfileData = {
      id: user.id,
      member_code: user.member_code,
      display_name: user.display_name,
      email: user.email,
      phone: '+1 (555) 234-5678',
      role: user.role,
      status: 'ACTIVE',
      package_code: 'DIAMOND',
      package_name: 'Blue Diamond VIP',
      activation_date: '2026-01-15T00:00:00Z',
      nominee: {
        id: 'nom-1',
        member_id: user.id,
        full_name: 'Eleanor Sterling',
        relationship: 'Spouse',
        contact_number: '+1 (555) 987-6543',
        created_at: '2026-01-16T00:00:00Z',
        updated_at: '2026-01-16T00:00:00Z',
      },
      wallet_address: {
        id: 'wal-1',
        member_id: user.id,
        network: 'TRC-20',
        wallet_address: 'TL9bTRC208942vQ2mSterling',
        masked_address: 'TL9b...ling',
        status: 'VERIFIED',
        created_at: '2026-01-16T00:00:00Z',
        updated_at: '2026-01-16T00:00:00Z',
      },
      has_riseup_key: true,
    };
    return profile as unknown as T;
  }

  if (urlPath === '/api/v1/profile/nominee') {
    const nominee: NomineeData = {
      id: 'nom-1',
      member_id: 'usr-member-8942',
      full_name: 'Eleanor Sterling',
      relationship: 'Spouse',
      contact_number: '+1 (555) 987-6543',
      created_at: '2026-01-16T00:00:00Z',
      updated_at: '2026-01-16T00:00:00Z',
    };
    return nominee as unknown as T;
  }

  if (urlPath === '/api/v1/profile/wallet-address') {
    const wa: WalletAddressData = {
      id: 'wal-1',
      member_id: 'usr-member-8942',
      network: 'TRC-20',
      wallet_address: 'TL9bTRC208942vQ2mSterling',
      masked_address: 'TL9b...ling',
      status: 'VERIFIED',
      created_at: '2026-01-16T00:00:00Z',
      updated_at: '2026-01-16T00:00:00Z',
    };
    return wa as unknown as T;
  }

  return undefined;
}
