import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/cn';

export interface TabItem {
  id: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'pill' | 'underline';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'pill',
  className,
}) => {
  const { isReducedMotion } = useTheme();

  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 select-none',
        variant === 'pill'
          ? 'p-1 rounded-standard bg-panel-elevated/70 border border-themeBorder-subtle'
          : 'border-b border-themeBorder gap-6',
        className
      )}
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;

        if (variant === 'underline') {
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative py-2.5 px-1 text-sm font-medium transition-colors flex items-center gap-2 focus-visible:outline-none',
                isActive
                  ? 'text-brand-bright-violet font-semibold'
                  : 'text-themeText-muted hover:text-themeText-primary'
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-panel-elevated text-themeText-secondary border border-themeBorder">
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId={isReducedMotion ? undefined : 'active-tab-underline'}
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-electric-violet to-brand-cyber-cyan"
                  transition={{ duration: 0.2 }}
                />
              )}
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative px-3.5 py-1.5 text-xs md:text-sm font-medium rounded-control transition-colors flex items-center gap-2 focus-visible:outline-none z-10',
              isActive
                ? 'text-white'
                : 'text-themeText-secondary hover:text-themeText-primary hover:bg-panel-primary/30'
            )}
          >
            {isActive && (
              <motion.div
                layoutId={isReducedMotion ? undefined : 'active-tab-pill'}
                className="absolute inset-0 bg-gradient-to-r from-brand-electric-violet to-brand-bright-violet rounded-control shadow-glow-purple -z-10"
                transition={{ duration: 0.2 }}
              />
            )}
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-mono',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-panel-primary text-themeText-muted border border-themeBorder'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
