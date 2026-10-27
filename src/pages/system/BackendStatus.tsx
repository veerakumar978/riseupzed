import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  RefreshCw,
  XCircle,
  AlertTriangle,
  Clock,
  Package as PackageIcon,
  Users,
} from 'lucide-react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { api, HealthStatus, DbHealthStatus } from '../../lib/api-client';
import { useToast } from '../../components/ui/Toast';

export const BackendStatus: React.FC = () => {
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [apiHealth, setApiHealth] = useState<HealthStatus | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const [dbHealth, setDbHealth] = useState<DbHealthStatus | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);

  const [samplePackages, setSamplePackages] = useState<Array<{ id: string; code: string; name: string; price: number }>>([]);
  const [membersCount, setMembersCount] = useState<number | null>(null);

  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const runHealthChecks = async () => {
    setIsLoading(true);
    setApiError(null);
    setDbError(null);

    // 1. Check API Health
    try {
      const healthData = await api.getHealth();
      setApiHealth(healthData);
    } catch (err) {
      setApiHealth(null);
      setApiError(err instanceof Error ? err.message : 'API unreachable');
    }

    // 2. Check Database Health
    try {
      const dbData = await api.getDbHealth();
      setDbHealth(dbData);
    } catch (err) {
      setDbHealth(null);
      setDbError(err instanceof Error ? err.message : 'Database connectivity check failed');
    }

    // 3. Fetch sample data if API is online
    try {
      const pkgs = await api.getPackages();
      setSamplePackages(pkgs);
    } catch {
      setSamplePackages([]);
    }

    try {
      const members = await api.getMembers(1, 1);
      setMembersCount(members.total);
    } catch {
      setMembersCount(null);
    }

    setLastChecked(new Date().toLocaleTimeString());
    setIsLoading(false);
  };

  useEffect(() => {
    runHealthChecks();
  }, []);

  const handleManualRefresh = () => {
    runHealthChecks();
    showToast({
      title: 'Health Checks Re-run',
      message: 'Contacting FastAPI backend and PostgreSQL database...',
      type: 'info',
    });
  };

  const isApiOnline = !!apiHealth && !apiError;
  const isDbOnline = !!dbHealth?.connected && !dbError;

  return (
    <PageContainer
      title="Backend & Database Health"
      description="Real-time connectivity monitoring between the React frontend shell, FastAPI backend, and PostgreSQL database."
      badge={
        isApiOnline && isDbOnline ? (
          <Badge variant="success" size="sm" dot>Systems Operational</Badge>
        ) : isApiOnline ? (
          <Badge variant="warning" size="sm" dot>DB Degraded</Badge>
        ) : (
          <Badge variant="error" size="sm" dot>Backend Offline</Badge>
        )
      }
      actions={
        <Button
          variant="secondary"
          size="sm"
          onClick={handleManualRefresh}
          isLoading={isLoading}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Re-test Health
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: FastAPI Service Health */}
          <Card
            variant="standard"
            padding="lg"
            className={isApiOnline ? 'border-semantic-success/30' : 'border-semantic-error/40'}
          >
            <div className="flex items-start justify-between pb-4 border-b border-themeBorder-subtle">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-standard bg-brand-bright-violet/15 text-brand-bright-violet flex items-center justify-center border border-brand-bright-violet/30">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-themeText-primary">FastAPI Service</h3>
                  <span className="text-[11px] text-themeText-muted font-mono">GET /api/v1/health</span>
                </div>
              </div>
              {isApiOnline ? (
                <Badge variant="success" size="sm" dot>Online</Badge>
              ) : (
                <Badge variant="error" size="sm" dot>Offline</Badge>
              )}
            </div>

            <div className="space-y-3 pt-4 text-xs">
              {isApiOnline && apiHealth ? (
                <>
                  <div className="flex justify-between py-1 border-b border-themeBorder-subtle">
                    <span className="text-themeText-muted">Service Status</span>
                    <span className="font-semibold text-semantic-success uppercase">{apiHealth.status}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-themeBorder-subtle">
                    <span className="text-themeText-muted">API Version</span>
                    <span className="font-mono text-themeText-primary">{apiHealth.version}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-themeBorder-subtle">
                    <span className="text-themeText-muted">Environment</span>
                    <span className="font-mono text-themeText-primary">{apiHealth.environment}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-themeText-muted">Backend Timestamp</span>
                    <span className="font-mono text-themeText-secondary">{new Date(apiHealth.timestamp).toLocaleTimeString()}</span>
                  </div>
                </>
              ) : (
                <div className="p-3 rounded bg-semantic-error/10 border border-semantic-error/20 text-semantic-error text-xs space-y-1">
                  <span className="font-semibold block flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 shrink-0" />
                    Cannot connect to backend API server
                  </span>
                  <p className="text-[11px] text-themeText-secondary leading-relaxed">
                    {apiError || 'Ensure the FastAPI backend server is running on http://localhost:8000.'}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Card 2: PostgreSQL Database Health */}
          <Card
            variant="standard"
            padding="lg"
            className={isDbOnline ? 'border-semantic-success/30' : 'border-semantic-warning/40'}
          >
            <div className="flex items-start justify-between pb-4 border-b border-themeBorder-subtle">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-standard bg-brand-cyber-cyan/15 text-brand-cyber-cyan flex items-center justify-center border border-brand-cyber-cyan/30">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-themeText-primary">PostgreSQL Engine</h3>
                  <span className="text-[11px] text-themeText-muted font-mono">GET /api/v1/health/db</span>
                </div>
              </div>
              {isDbOnline ? (
                <Badge variant="success" size="sm" dot>Connected</Badge>
              ) : (
                <Badge variant="warning" size="sm" dot>Disconnected</Badge>
              )}
            </div>

            <div className="space-y-3 pt-4 text-xs">
              {isDbOnline && dbHealth ? (
                <>
                  <div className="flex justify-between py-1 border-b border-themeBorder-subtle">
                    <span className="text-themeText-muted">Connection Status</span>
                    <span className="font-semibold text-semantic-success">ACTIVE & RESPONDING</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-themeBorder-subtle">
                    <span className="text-themeText-muted">Database Engine</span>
                    <span className="font-mono text-themeText-primary capitalize">{dbHealth.database}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-themeBorder-subtle">
                    <span className="text-themeText-muted">Query Round-Trip Latency</span>
                    <span className="font-mono text-brand-cyber-cyan font-semibold">{dbHealth.latency_ms} ms</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-themeText-muted">Server Time</span>
                    <span className="font-mono text-themeText-secondary">{new Date(dbHealth.timestamp).toLocaleTimeString()}</span>
                  </div>
                </>
              ) : (
                <div className="p-3 rounded bg-semantic-warning/10 border border-semantic-warning/20 text-semantic-warning text-xs space-y-1">
                  <span className="font-semibold block flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Database query test returned error
                  </span>
                  <p className="text-[11px] text-themeText-secondary leading-relaxed">
                    {dbError || 'PostgreSQL service is not responding to database ping.'}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Database Seed Data Verification Section */}
        {isApiOnline && (
          <Card variant="standard" padding="lg" className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-themeText-primary">Seeded Demo Records Verification</h4>
                <p className="text-xs text-themeText-muted mt-0.5">Read-only verification of Module 3 seeded database entities.</p>
              </div>
              <Badge variant="active" size="sm">Module 3 Seed</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-standard border border-themeBorder bg-panel-elevated/40 flex items-center gap-3">
                <Users className="w-8 h-8 text-brand-bright-violet" />
                <div>
                  <span className="text-xs text-themeText-muted block">Demo Members in Database</span>
                  <span className="text-lg font-bold text-themeText-primary tabular-numbers">
                    {membersCount !== null ? `${membersCount} Members` : 'Querying...'}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-standard border border-themeBorder bg-panel-elevated/40 flex items-center gap-3">
                <PackageIcon className="w-8 h-8 text-brand-luxury-gold" />
                <div>
                  <span className="text-xs text-themeText-muted block">Registered VIP Packages</span>
                  <span className="text-lg font-bold text-themeText-primary tabular-numbers">
                    {samplePackages.length > 0 ? `${samplePackages.length} Packages` : 'Querying...'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Diagnostic Metadata Footer */}
        <div className="flex items-center justify-between text-xs text-themeText-muted pt-2 border-t border-themeBorder-subtle">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Last checked: {lastChecked || 'Never'}
          </span>
          <span className="font-mono text-[11px]">
            Frontend API Endpoint: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}
          </span>
        </div>
      </div>
    </PageContainer>
  );
};
