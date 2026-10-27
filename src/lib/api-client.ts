/**
 * Riseupzed Typed Frontend API Client
 * Centralized HTTP request handling with timeouts, error parsing, session cookies, and bearer tokens.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:8000';

export interface ApiErrorResponse {
  error: string;
  detail?: string | Array<{ loc: string[]; msg: string; type: string }>;
  status?: number;
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export interface RequestOptions extends RequestInit {
  timeoutMs?: number;
}

// Token storage key
const TOKEN_STORAGE_KEY = 'rz_session_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { timeoutMs = 8000, headers, ...rest } = options;
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const authHeaders: Record<string, string> = {};
  const token = getStoredToken();
  if (token) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...rest,
      credentials: 'include', // Send cookies for cross-origin local development
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...authHeaders,
        ...headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }
      let message = `API request failed with status ${response.status}`;
      if (typeof errorBody === 'object' && errorBody !== null) {
        if ('detail' in errorBody) {
          message = String((errorBody as { detail: unknown }).detail);
        } else if ('error' in errorBody) {
          message = String((errorBody as { error: unknown }).error);
        }
      }
      throw new ApiError(message, response.status, errorBody);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError('Request timed out while contacting Riseupzed backend', 408);
    }
    if (err instanceof TypeError) {
      throw new ApiError('Unable to connect to Riseupzed backend. Service may be offline.', 503);
    }
    throw new ApiError(err instanceof Error ? err.message : 'Unknown network error', 500);
  }
}

// Health & System API Types
export interface HealthStatus {
  status: string;
  version: string;
  environment: string;
  timestamp: string;
}

export interface DbHealthStatus {
  status: string;
  database: string;
  connected: boolean;
  latency_ms: number;
  timestamp: string;
}

// Auth Types
export interface UserSummary {
  id: string;
  member_code: string;
  display_name: string;
  email: string | null;
  phone: string | null;
  role: 'MEMBER' | 'MANAGER' | string;
  status: 'ACTIVE' | 'INACTIVE' | string;
  package_code: string | null;
  package_name: string | null;
  activation_date: string | null;
}

export interface LoginResponse {
  user: UserSummary;
  token: string;
  expires_at: string;
  message: string;
}

// Dashboard Types
export interface WalletSummary {
  id: string;
  wallet_type: 'TRANSACTION' | 'MOTHER' | 'STAKING' | string;
  balance: string | number;
  currency: string;
}

export interface PackageSummary {
  id: string;
  code: string;
  name: string;
  display_name: string;
  price: string | number;
}

export interface OrganizationPlacementSummary {
  left_child_code: string | null;
  left_child_name: string | null;
  right_child_code: string | null;
  right_child_name: string | null;
  direct_referrals_count: number;
}

export interface ActivityItem {
  id: string;
  reference: string;
  tx_type: string;
  direction: 'CREDIT' | 'DEBIT' | string;
  amount: string | number;
  status: string;
  remark: string | null;
  created_at: string;
}

export interface DashboardSummary {
  member: UserSummary;
  package: PackageSummary | null;
  wallets: WalletSummary[];
  organization: OrganizationPlacementSummary;
  recent_activity: ActivityItem[];
}

export interface ManagerMetric {
  total_members: number;
  active_members: number;
  total_packages: number;
  open_support_tickets: number;
  pending_deposit_requests: number;
  pending_withdrawal_requests: number;
}

export interface ManagerPackageTierCount {
  package_code: string;
  package_name: string;
  member_count: number;
}

export interface ManagerDashboardSummary {
  manager: UserSummary;
  metrics: ManagerMetric;
  package_distribution: ManagerPackageTierCount[];
  recent_activity: ActivityItem[];
}

// ========================================================
// Module 6: Profile & Settings Types
// ========================================================
export interface NomineeData {
  id: string;
  member_id: string;
  full_name: string;
  relationship: string;
  contact_number: string;
  created_at: string;
  updated_at: string;
}

export interface WalletAddressData {
  id: string;
  member_id: string;
  network: string;
  wallet_address: string;
  masked_address: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileData {
  id: string;
  member_code: string;
  display_name: string;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
  package_code: string | null;
  package_name: string | null;
  activation_date: string | null;
  nominee: NomineeData | null;
  wallet_address: WalletAddressData | null;
  has_riseup_key: boolean;
}

// ========================================================
// Module 7: Wallets & Financial Types
// ========================================================
export interface WalletItem {
  id: string;
  member_id: string;
  wallet_type: 'TRANSACTION' | 'MOTHER' | 'STAKING' | string;
  balance: string | number;
  currency: string;
  is_frozen: boolean;
}

export interface WalletOverview {
  wallets: WalletItem[];
  total_balance: string | number;
}

export interface FinancialConfig {
  min_withdrawal_amount: number;
  saturday_only: boolean;
  is_saturday_today: boolean;
  demo_usdt_address: string;
  demo_network: string;
}

export interface DepositRequestItem {
  id: string;
  reference: string;
  member_id: string;
  member_code?: string | null;
  member_name?: string | null;
  amount: string | number;
  currency: string;
  tx_reference?: string | null;
  note?: string | null;
  proof_url?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  review_note?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WithdrawalRequestItem {
  id: string;
  reference: string;
  member_id: string;
  member_code?: string | null;
  member_name?: string | null;
  wallet_id: string;
  wallet_type?: string | null;
  package_id?: string | null;
  package_name?: string | null;
  amount: string | number;
  destination_address: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  review_note?: string | null;
  created_at: string;
  updated_at: string;
}

export const api = {
  // Health
  getHealth: () => apiClient<HealthStatus>('/api/v1/health'),
  getDbHealth: () => apiClient<DbHealthStatus>('/api/v1/health/db'),

  // Auth
  login: (credentials: { identifier: string; password: string }) =>
    apiClient<LoginResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  logout: () =>
    apiClient<{ success: boolean; message: string }>('/api/v1/auth/logout', {
      method: 'POST',
    }),
  getCurrentUser: () => apiClient<UserSummary>('/api/v1/auth/me'),

  // Dashboard
  getDashboardSummary: () => apiClient<DashboardSummary>('/api/v1/dashboard/summary'),
  getManagerDashboardSummary: () =>
    apiClient<ManagerDashboardSummary>('/api/v1/dashboard/manager-summary'),

  // Catalog & General
  getMembers: (page = 1, limit = 10) =>
    apiClient<{ items: unknown[]; total: number; page: number; pages: number }>(
      `/api/v1/members?page=${page}&limit=${limit}`
    ),
  getPackages: () => apiClient<PackageItem[]>('/api/v1/packages'),


  // Module 6: Profile & Settings
  getProfile: () => apiClient<ProfileData>('/api/v1/profile'),
  updateProfile: (data: { display_name?: string; email?: string; phone?: string }) =>
    apiClient<ProfileData>('/api/v1/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getNominee: () => apiClient<NomineeData | null>('/api/v1/profile/nominee'),
  updateNominee: (data: { full_name: string; relationship: string; contact_number: string }) =>
    apiClient<NomineeData>('/api/v1/profile/nominee', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  getWalletAddress: () => apiClient<WalletAddressData | null>('/api/v1/profile/wallet-address'),
  updateWalletAddress: (data: { network?: string; wallet_address: string }) =>
    apiClient<WalletAddressData>('/api/v1/profile/wallet-address', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  changePassword: (data: { current_password: string; new_password: string; confirm_password: string }) =>
    apiClient<{ success: boolean; message: string }>('/api/v1/profile/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateRiseupKey: (data: { current_key?: string; new_key: string }) =>
    apiClient<{ success: boolean; message: string }>('/api/v1/profile/riseup-key', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Module 7: Wallets & Financial Overview
  getWallets: () => apiClient<WalletOverview>('/api/v1/wallets'),
  getTransactions: (limit = 50) => apiClient<ActivityItem[]>(`/api/v1/wallets/transactions?limit=${limit}`),
  getFinancialConfig: () => apiClient<FinancialConfig>('/api/v1/financial/config'),

  // Deposits
  getDepositRequests: (limit = 50) => apiClient<DepositRequestItem[]>(`/api/v1/deposit-requests?limit=${limit}`),
  createDepositRequest: (
    data: { amount: number; tx_reference?: string; note?: string },
    proofUrl?: string
  ) => {
    const query = proofUrl ? `?proof_url=${encodeURIComponent(proofUrl)}` : '';
    return apiClient<DepositRequestItem>(`/api/v1/deposit-requests${query}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  uploadProof: async (file: File): Promise<{ proof_url: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const token = getStoredToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE_URL}/api/v1/deposit-requests/upload-proof`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to upload proof' }));
      throw new ApiError(err.detail || 'Upload failed', res.status);
    }
    return res.json();
  },

  // Withdrawals
  getWithdrawalRequests: (limit = 50) =>
    apiClient<WithdrawalRequestItem[]>(`/api/v1/withdrawal-requests?limit=${limit}`),
  createWithdrawalRequest: (data: {
    wallet_id: string;
    package_id?: string;
    amount: number;
    destination_address: string;
    riseup_key?: string;
  }) =>
    apiClient<WithdrawalRequestItem>('/api/v1/withdrawal-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Manager Review
  getManagerDepositRequests: (statusFilter?: string) => {
    const query = statusFilter ? `?status_filter=${statusFilter}` : '';
    return apiClient<DepositRequestItem[]>(`/api/v1/manager/deposit-requests${query}`);
  },
  reviewDepositRequest: (id: string, data: { action: 'APPROVE' | 'REJECT'; review_note?: string }) =>
    apiClient<DepositRequestItem>(`/api/v1/manager/deposit-requests/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getManagerWithdrawalRequests: (statusFilter?: string) => {
    const query = statusFilter ? `?status_filter=${statusFilter}` : '';
    return apiClient<WithdrawalRequestItem[]>(`/api/v1/manager/withdrawal-requests${query}`);
  },
  reviewWithdrawalRequest: (id: string, data: { action: 'APPROVE' | 'REJECT'; review_note?: string }) =>
    apiClient<WithdrawalRequestItem>(`/api/v1/manager/withdrawal-requests/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ==========================================
  // MODULE 8: PACKAGES & RANK UPGRADES
  // ==========================================
  getCurrentPackage: () => apiClient<CurrentPackageInfo>('/api/v1/packages/current'),

  createUpgradeRequest: (data: { target_package_id: string; note?: string }) =>
    apiClient<UpgradeRequestItem>('/api/v1/packages/upgrade-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getUpgradeRequests: () => apiClient<UpgradeRequestItem[]>('/api/v1/packages/upgrade-requests'),
  getManagerUpgradeRequests: (statusFilter?: string) => {
    const query = statusFilter ? `?status_filter=${statusFilter}` : '';
    return apiClient<UpgradeRequestItem[]>(`/api/v1/manager/packages/upgrade-requests${query}`);
  },
  reviewUpgradeRequest: (id: string, data: { status: 'APPROVED' | 'REJECTED'; review_note?: string }) =>
    apiClient<UpgradeRequestItem>(`/api/v1/manager/packages/upgrade-requests/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // ==========================================
  // MODULE 9: ORGANIZATION MANAGEMENT
  // ==========================================
  getOrganizationLeft: (search?: string, page = 1, pageSize = 10, rootCode?: string) => {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (search) params.append('search', search);
    if (rootCode) params.append('root_code', rootCode);
    return apiClient<OrganizationListResponse>(`/api/v1/organization/left?${params.toString()}`);
  },
  getOrganizationRight: (search?: string, page = 1, pageSize = 10, rootCode?: string) => {
    const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) });
    if (search) params.append('search', search);
    if (rootCode) params.append('root_code', rootCode);
    return apiClient<OrganizationListResponse>(`/api/v1/organization/right?${params.toString()}`);
  },
  getOrganizationTree: (rootCode?: string, depth = 3) => {
    const params = new URLSearchParams({ depth: String(depth) });
    if (rootCode) params.append('root_code', rootCode);
    return apiClient<TreeNodeItem>(`/api/v1/organization/tree?${params.toString()}`);
  },
  getMemberNodeDetails: (memberCode: string) =>
    apiClient<MemberNodeDetails>(`/api/v1/organization/members/${encodeURIComponent(memberCode)}/details`),
  getUnplacedMembers: () => apiClient<UnplacedMemberItem[]>('/api/v1/organization/unplaced-members'),
  placeMember: (data: { parent_code: string; position: 'LEFT' | 'RIGHT'; member_code: string }) =>
    apiClient<{ success: boolean; message: string; placement: { parent_code: string; child_code: string; position: string } }>(
      '/api/v1/organization/place-member',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    ),
};

export interface PackageItem {
  id: string;
  code: string;
  name: string;
  display_name: string;
  price: number;
  upgrade_amount?: number;
  achievement_threshold?: number;
  description?: string;
  sort_order: number;
  is_active: boolean;
}

export interface CurrentPackageInfo {
  member_id: string;
  member_code: string;
  display_name: string;
  package?: PackageItem;
  activation_date?: string;
  status: string;
  upgrade_status: string;
  active_upgrade_request_reference?: string;
}

export interface UpgradeRequestItem {
  id: string;
  reference: string;
  member_id: string;
  member_code?: string;
  member_name?: string;
  current_package_id?: string;
  current_package_name?: string;
  target_package_id: string;
  target_package_name: string;
  upgrade_amount: number;
  status: string;
  review_note?: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMemberItem {
  s_no: number;
  id: string;
  member_code: string;
  display_name: string;
  position: string;
  package_name?: string;
  status: string;
  placement_date?: string;
}

export interface OrganizationListResponse {
  side: 'LEFT' | 'RIGHT';
  parent_code: string;
  parent_name: string;
  total_members: number;
  active_members: number;
  inactive_members: number;
  items: OrganizationMemberItem[];
  page: number;
  page_size: number;
  total_pages: number;
}

export interface TreeNodeItem {
  node_id: string;
  member_id?: string;
  member_code?: string;
  display_name?: string;
  package_name?: string;
  package_price?: number;
  status?: string;
  position?: string;
  is_occupied: boolean;
  parent_id?: string;
  parent_code?: string;
  parent_name?: string;
  children: TreeNodeItem[];
}

export interface MemberNodeDetails {
  member_code: string;
  display_name: string;
  status: string;
  role: string;
  activation_date?: string;
  package_name?: string;
  package_price?: string;
  parent_code?: string;
  parent_name?: string;
  position?: string;
  placement_date?: string;
  direct_children: Array<{ position: string; member_code: string; display_name: string }>;
  team_metrics: {
    total_downline: number;
    left_organization: number;
    right_organization: number;
  };
}

export interface UnplacedMemberItem {
  id: string;
  member_code: string;
  display_name: string;
  package_name?: string;
  status: string;
}

// Module 10: Reports & Analytics
export interface ReportRowItem {
  s_no: number;
  id: string;
  date: string;
  reference?: string;
  user_id: string;
  user_name: string;
  amount: number | string;
  status: string;
  remark?: string;
  category?: string;
  extra_info?: string;
  metadata?: Record<string, unknown>;
}

export interface ReportSummary {
  total_tokens: number | string;
  total_records: number;
  successful_credits: number;
  pending_count: number;
  failed_count: number;
}

export interface ReportResponse {
  report_type: string;
  title: string;
  items: ReportRowItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  summary: ReportSummary;
}

export interface GeneralReportCategory {
  key: string;
  title: string;
  path: string;
  description: string;
  record_count: number;
  total_tokens: number | string;
  last_date?: string;
}

export interface GeneralReportOverviewResponse {
  categories: GeneralReportCategory[];
  total_records: number;
  total_tokens: number | string;
  recent_items: ReportRowItem[];
}

export interface ReportFilterParams {
  user_id?: string;
  remark?: string;
  from_date?: string;
  to_date?: string;
  status?: string;
  direction?: string;
  page?: number;
  page_size?: number;
}

export const reportsApi = {
  getReport: async (reportPath: string, params: ReportFilterParams = {}): Promise<ReportResponse> => {
    const query = new URLSearchParams();
    if (params.user_id) query.append('user_id', params.user_id);
    if (params.remark) query.append('remark', params.remark);
    if (params.from_date) query.append('from_date', params.from_date);
    if (params.to_date) query.append('to_date', params.to_date);
    if (params.status) query.append('status', params.status);
    if (params.direction) query.append('direction', params.direction);
    if (params.page) query.append('page', String(params.page));
    if (params.page_size) query.append('page_size', String(params.page_size));

    const qs = query.toString();
    const url = `/api/v1/reports/${reportPath}${qs ? `?${qs}` : ''}`;
    return apiClient<ReportResponse>(url);
  },

  getOverview: async (): Promise<GeneralReportOverviewResponse> => {
    return apiClient<GeneralReportOverviewResponse>('/api/v1/reports/overview');
  },

  downloadCsv: async (reportPath: string, params: ReportFilterParams = {}, defaultFilename = 'report.csv'): Promise<void> => {
    const query = new URLSearchParams();
    if (params.user_id) query.append('user_id', params.user_id);
    if (params.remark) query.append('remark', params.remark);
    if (params.from_date) query.append('from_date', params.from_date);
    if (params.to_date) query.append('to_date', params.to_date);
    if (params.status) query.append('status', params.status);

    const qs = query.toString();
    const token = getStoredToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const url = `${API_BASE_URL}/api/v1/reports/${reportPath}/export-csv${qs ? `?${qs}` : ''}`;
    const response = await fetch(url, {
      credentials: 'include',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to export CSV: ${response.statusText}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', defaultFilename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },
};

// Module 11: Token Transfers & Support
export interface TransferRecipientLookupResponse {
  member_id: string;
  member_code: string;
  display_name: string;
  is_valid: boolean;
}

export interface TokenTransferCreate {
  recipient_code: string;
  amount: number;
  riseup_key?: string;
  remark?: string;
}

export interface TokenTransferResponse {
  id: string;
  reference: string;
  sender_id: string;
  sender_code: string;
  sender_name: string;
  receiver_id: string;
  receiver_code: string;
  receiver_name: string;
  transfer_type: string;
  amount: number | string;
  status: string;
  created_at: string;
}

export interface TransferBalanceInfo {
  wallet_id: string;
  wallet_type: string;
  available_balance: number | string;
  currency: string;
}

export const transfersApi = {
  getBalance: async (): Promise<TransferBalanceInfo> => {
    return apiClient<TransferBalanceInfo>('/api/v1/transfers/balance');
  },

  lookupRecipient: async (code: string): Promise<TransferRecipientLookupResponse> => {
    return apiClient<TransferRecipientLookupResponse>(
      `/api/v1/transfers/lookup-recipient?recipient_code=${encodeURIComponent(code)}`
    );
  },

  executeTransfer: async (data: TokenTransferCreate): Promise<TokenTransferResponse> => {
    return apiClient<TokenTransferResponse>('/api/v1/transfers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getHistory: async (
    direction: 'OUTGOING' | 'INCOMING' | 'ALL' = 'ALL',
    limit = 50
  ): Promise<TokenTransferResponse[]> => {
    return apiClient<TokenTransferResponse[]>(
      `/api/v1/transfers/history?direction=${direction}&limit=${limit}`
    );
  },
};

export interface SupportMessageResponse {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message_body: string;
  is_internal_note: boolean;
  created_at: string;
}

export interface SupportTicketCreate {
  subject: string;
  category: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface SupportTicketResponse {
  id: string;
  ticket_number: string;
  member_id: string;
  member_code: string;
  member_name: string;
  subject: string;
  category: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  messages: SupportMessageResponse[];
}

export const supportApi = {
  createTicket: async (data: SupportTicketCreate): Promise<SupportTicketResponse> => {
    return apiClient<SupportTicketResponse>('/api/v1/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getTickets: async (statusFilter?: string, search?: string): Promise<SupportTicketResponse[]> => {
    const q = new URLSearchParams();
    if (statusFilter) q.append('status', statusFilter);
    if (search) q.append('search', search);
    const qs = q.toString();
    return apiClient<SupportTicketResponse[]>(`/api/v1/support/tickets${qs ? `?${qs}` : ''}`);
  },

  getTicketDetails: async (ticketId: string): Promise<SupportTicketResponse> => {
    return apiClient<SupportTicketResponse>(`/api/v1/support/tickets/${ticketId}`);
  },

  postMessage: async (ticketId: string, messageBody: string): Promise<SupportMessageResponse> => {
    return apiClient<SupportMessageResponse>(`/api/v1/support/tickets/${ticketId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message_body: messageBody }),
    });
  },

  updateStatus: async (
    ticketId: string,
    newStatus: string,
    internalNote?: string
  ): Promise<SupportTicketResponse> => {
    return apiClient<SupportTicketResponse>(`/api/v1/support/tickets/${ticketId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus, internal_note: internalNote }),
    });
  },
};


