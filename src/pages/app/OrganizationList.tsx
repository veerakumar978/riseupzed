import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  RefreshCw,
  ArrowRight,
  GitBranch,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Alert } from '../../components/ui/Alert';
import { Breadcrumb } from '../../components/ui/Breadcrumb';
import { useToast } from '../../components/ui/Toast';
import {
  api,
  OrganizationListResponse,
  ApiError,
} from '../../lib/api-client';
import { ROUTES } from '../../config/routes';


interface OrganizationListProps {
  side: 'LEFT' | 'RIGHT';
}

export const OrganizationList: React.FC<OrganizationListProps> = ({ side }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [data, setData] = useState<OrganizationListResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const fetchFn = side === 'LEFT' ? api.getOrganizationLeft : api.getOrganizationRight;
      const res = await fetchFn(debouncedSearch.trim() || undefined, currentPage, pageSize);
      setData(res);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : `Failed to load ${side.toLowerCase()} organization data.`;
      setError(msg);
      showToast({ title: 'Error', message: msg, type: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [side, debouncedSearch, currentPage, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const oppositeSide = side === 'LEFT' ? 'RIGHT' : 'LEFT';
  const oppositeRoute = side === 'LEFT' ? ROUTES.USERS_RIGHT : ROUTES.USERS_LEFT;

  const getPackageBadgeVariant = (name?: string) => {
    if (!name) return 'default';
    const lower = name.toLowerCase();
    if (lower.includes('diamond')) return 'premium';
    if (lower.includes('platinum')) return 'active';
    if (lower.includes('gold')) return 'warning';
    if (lower.includes('silver')) return 'default';
    return 'default';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: ROUTES.DASHBOARD },
          { label: 'Users' },
          { label: `${side === 'LEFT' ? 'Left' : 'Right'} Organization` },
        ]}
      />


      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-themeBorder pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              side === 'LEFT'
                ? 'bg-brand-bright-violet/10 border-brand-bright-violet/30 text-brand-bright-violet'
                : 'bg-brand-cyber-cyan/10 border-brand-cyber-cyan/30 text-brand-cyber-cyan'
            }`}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-themeText-primary">
                  {side === 'LEFT' ? 'Left Organization' : 'Right Organization'}
                </h1>
                <Badge variant={side === 'LEFT' ? 'active' : 'pending'}>
                  {side} Branch
                </Badge>
              </div>
              <p className="text-sm text-themeText-muted">
                Lineage of member nodes placed on your {side.toLowerCase()} binary branch.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(oppositeRoute)}
            className="flex items-center gap-2 text-xs"
          >
            <span>View {oppositeSide === 'LEFT' ? 'Left' : 'Right'} Org</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(ROUTES.USERS_TREE)}
            className="flex items-center gap-2 text-xs"
          >
            <GitBranch className="w-3.5 h-3.5 text-brand-luxury-gold" />
            <span>Tree View</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {error && (
        <Alert type="error" title="Error loading organization">
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="standard" padding="sm" className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-panel-secondary flex items-center justify-center border border-themeBorder text-brand-cyber-cyan">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-themeText-muted font-medium">Total {side} Members</p>
            <p className="text-2xl font-bold text-themeText-primary mt-0.5">
              {data ? data.total_members : '—'}
            </p>
          </div>
        </Card>

        <Card variant="standard" padding="sm" className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-semantic-success/10 flex items-center justify-center border border-semantic-success/20 text-semantic-success">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-themeText-muted font-medium">Active Stakers</p>
            <p className="text-2xl font-bold text-semantic-success mt-0.5">
              {data ? data.active_members : '—'}
            </p>
          </div>
        </Card>

        <Card variant="standard" padding="sm" className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-panel-secondary flex items-center justify-center border border-themeBorder text-themeText-muted">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-themeText-muted font-medium">Inactive Members</p>
            <p className="text-2xl font-bold text-themeText-secondary mt-0.5">
              {data ? data.inactive_members : '—'}
            </p>
          </div>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-panel-secondary/30 p-3 rounded-lg border border-themeBorder">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-themeText-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by User ID or Name..."
            className="w-full bg-panel-primary border border-themeBorder rounded-lg pl-9 pr-3 py-1.5 text-sm text-themeText-primary placeholder:text-themeText-muted focus:outline-none focus:border-brand-bright-violet"
          />
        </div>

        <span className="text-xs text-themeText-muted font-medium">
          Showing {data?.items.length || 0} of {data?.total_members || 0} members
        </span>
      </div>

      {/* Table Section */}
      <Card variant="standard" padding="none" className="overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-themeText-muted">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-bright-violet" />
            <p className="text-sm">Loading {side.toLowerCase()} organization lineage...</p>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-10 h-10 text-themeText-muted mx-auto mb-3 opacity-40" />
            <p className="text-base font-semibold text-themeText-primary">
              No members found in the {side.toLowerCase()} organization
            </p>
            <p className="text-xs text-themeText-muted mt-1 max-w-sm mx-auto">
              {debouncedSearch
                ? `No results match your search "${debouncedSearch}". Try clearing your filter.`
                : `There are currently no placed downline members on your ${side.toLowerCase()} branch.`}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(ROUTES.USERS_TREE)}
              className="mt-4 text-xs"
            >
              Explore Tree View
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-panel-secondary/50 text-xs text-themeText-muted uppercase tracking-wider border-b border-themeBorder">
                <tr>
                  <th className="py-3.5 px-4 font-semibold w-16">S.No.</th>
                  <th className="py-3.5 px-4 font-semibold">Placement Date</th>
                  <th className="py-3.5 px-4 font-semibold">User ID</th>
                  <th className="py-3.5 px-4 font-semibold">Member Details</th>
                  <th className="py-3.5 px-4 font-semibold">Package Tier</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-themeBorder">
                {data.items.map((item) => (
                  <tr key={item.id} className="hover:bg-panel-secondary/20 transition-colors">
                    <td className="py-3.5 px-4 text-themeText-muted font-mono text-xs">
                      {item.s_no}
                    </td>

                    <td className="py-3.5 px-4 text-xs text-themeText-secondary">
                      {item.placement_date
                        ? new Date(item.placement_date).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs font-semibold text-brand-cyber-cyan bg-brand-cyber-cyan/10 px-2 py-0.5 rounded border border-brand-cyber-cyan/20">
                        {item.member_code}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-themeText-primary">
                      {item.display_name}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={getPackageBadgeVariant(item.package_name)}>
                        {item.package_name || 'No Package'}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      {item.status === 'ACTIVE' ? (
                        <Badge variant="success" dot>
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="default" dot>
                          {item.status}
                        </Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`${ROUTES.USERS_TREE}?root_code=${item.member_code}`)}
                        className="text-xs text-brand-bright-violet hover:text-brand-bright-violet hover:bg-brand-bright-violet/10"
                      >
                        <GitBranch className="w-3.5 h-3.5 mr-1" />
                        Tree View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {data && data.total_pages > 1 && (
          <div className="p-3.5 border-t border-themeBorder flex items-center justify-between bg-panel-secondary/20">
            <span className="text-xs text-themeText-muted">
              Page {data.page} of {data.total_pages}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="text-xs px-2.5 py-1"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= data.total_pages}
                onClick={() => setCurrentPage((p) => Math.min(data.total_pages, p + 1))}
                className="text-xs px-2.5 py-1"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
