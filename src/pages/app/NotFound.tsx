import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ROUTES } from '../../config/routes';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card
        variant="standard"
        padding="lg"
        className="max-w-md w-full text-center space-y-6 border-brand-bright-violet/30 shadow-card-hover"
      >
        <div className="w-16 h-16 rounded-full bg-panel-elevated border border-brand-bright-violet/40 flex items-center justify-center mx-auto text-brand-soft-lavender shadow-glow-purple">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl font-extrabold text-themeText-primary font-mono tracking-wider">
            404
          </span>
          <h2 className="text-xl font-bold text-themeText-primary">Screen Not Found</h2>
          <p className="text-xs text-themeText-secondary leading-relaxed max-w-xs mx-auto">
            The requested route does not exist or has not been configured in the Riseupzed navigation system.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to={ROUTES.DASHBOARD} className="w-full sm:w-auto">
            <Button variant="primary" size="md" className="w-full" leftIcon={<Home className="w-4 h-4" />}>
              Return to Dashboard
            </Button>
          </Link>
          <Link to={ROUTES.HOME} className="w-full sm:w-auto">
            <Button variant="secondary" size="md" className="w-full" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Landing Page
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
