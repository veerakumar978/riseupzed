import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { cn } from '../../lib/cn';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'An unexpected error occurred',
  message = 'We encountered an issue rendering this section. Please try again or return to the dashboard.',
  onRetry,
  className,
}) => {
  return (
    <Card
      variant="standard"
      padding="lg"
      className={cn('flex flex-col items-center justify-center text-center max-w-lg mx-auto my-12 border-semantic-error/40 shadow-sm', className)}
    >
      <div className="w-12 h-12 rounded-full bg-semantic-error/15 border border-semantic-error/30 flex items-center justify-center text-semantic-error mb-4 shadow-sm">
        <AlertCircle className="w-6 h-6 stroke-[1.8]" />
      </div>
      <h3 className="text-lg font-semibold text-themeText-primary mb-1">{title}</h3>
      <p className="text-xs text-themeText-secondary leading-relaxed max-w-sm mb-6">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Try Again
        </Button>
      )}
    </Card>
  );
};
