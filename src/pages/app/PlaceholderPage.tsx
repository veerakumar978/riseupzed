import React from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Compass, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';

export interface PlaceholderPageProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  targetModule?: string;
  category?: string;
  specs?: Array<{ label: string; value: string }>;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  title,
  description,
  icon: Icon,
  category = 'Member Portal',
}) => {
  return (
    <PageContainer
      title={title}
      description={description}
      badge={<Badge variant="active" size="sm">{category}</Badge>}
      actions={
        <Link to={ROUTES.DASHBOARD}>
          <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Back to Dashboard
          </Button>
        </Link>
      }
    >
      <div className="max-w-3xl">
        <Card variant="standard" padding="lg" className="border-themeBorder space-y-6">
          <div className="flex items-start gap-4">
            {Icon && (
              <div className="w-12 h-12 rounded-standard bg-gradient-to-br from-brand-electric-violet/20 to-brand-cyber-cyan/20 border border-brand-bright-violet/30 flex items-center justify-center text-brand-soft-lavender shrink-0 shadow-sm">
                <Icon className="w-6 h-6" />
              </div>
            )}
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="text-xs text-themeText-secondary leading-relaxed">{description}</p>
            </div>
          </div>

          <div className="p-4 rounded-standard border border-themeBorder-subtle bg-panel-elevated/40 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Compass className="w-4 h-4 text-brand-cyber-cyan" />
              <span>Section Under Scheduled Synchronization</span>
            </div>
            <p className="text-themeText-secondary leading-relaxed">
              This interactive management console is scheduled for deployment in the next release cycle.
              Your authenticated session, wallet vaults, and binary profile remain fully active and secured.
            </p>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <Link to={ROUTES.DASHBOARD}>
              <Button variant="primary" size="sm">
                View Account Overview
              </Button>
            </Link>
            <Link to={ROUTES.PROFILE}>
              <Button variant="outline" size="sm">
                Member Profile
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};
