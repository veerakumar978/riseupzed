import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { api } from '../../lib/api-client';
import { cn } from '../../lib/cn';
import { Tooltip } from '../ui/Tooltip';

export interface ConnectionStatusProps {
  className?: string;
  showText?: boolean;
}

export type StatusType = 'checking' | 'online' | 'offline';

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  className,
  showText = true,
}) => {
  const [status, setStatus] = useState<StatusType>('checking');
  const [latency, setLatency] = useState<number | null>(null);

  const checkConnection = async () => {
    setStatus('checking');
    const start = performance.now();
    try {
      await api.getHealth();
      const elapsed = Math.round(performance.now() - start);
      setLatency(elapsed);
      setStatus('online');
    } catch {
      setStatus('offline');
      setLatency(null);
    }
  };

  useEffect(() => {
    checkConnection();
    // Non-aggressive interval: 45 seconds
    const interval = setInterval(checkConnection, 45000);
    return () => clearInterval(interval);
  }, []);

  const config = {
    checking: {
      color: 'bg-themeText-muted',
      border: 'border-themeBorder',
      textColor: 'text-themeText-muted',
      label: 'Checking API',
      icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" />,
    },
    online: {
      color: 'bg-semantic-success',
      border: 'border-semantic-success/30 bg-semantic-success/10',
      textColor: 'text-semantic-success',
      label: latency ? `Online (${latency}ms)` : 'API Online',
      icon: <Wifi className="w-3.5 h-3.5" />,
    },
    offline: {
      color: 'bg-semantic-error',
      border: 'border-semantic-error/30 bg-semantic-error/10',
      textColor: 'text-semantic-error',
      label: 'API Offline',
      icon: <WifiOff className="w-3.5 h-3.5" />,
    },
  };

  const current = config[status];

  return (
    <Tooltip content={`Riseupzed Backend API: ${current.label}. Click to recheck.`}>
      <button
        type="button"
        onClick={checkConnection}
        className={cn(
          'inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border transition-all select-none focus:outline-none focus-visible:ring-1 focus-visible:ring-brand-bright-violet',
          current.border,
          current.textColor,
          className
        )}
      >
        <span className={cn('w-2 h-2 rounded-full shrink-0', current.color, status === 'online' && 'animate-pulse')} />
        {current.icon}
        {showText && <span>{current.label}</span>}
      </button>
    </Tooltip>
  );
};
