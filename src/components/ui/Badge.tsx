import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '../../lib/cn';

export type BadgeVariant = 'default' | 'active' | 'success' | 'pending' | 'warning' | 'error' | 'premium';
export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  icon,
  children,
  ...props
}) => {
  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  };

  const variantStyles: Record<BadgeVariant, string> = {
    default:
      'bg-panel-elevated text-themeText-secondary border border-themeBorder',
    active:
      'bg-brand-bright-violet/15 text-brand-soft-lavender border border-brand-bright-violet/40',
    success:
      'bg-semantic-success/15 text-semantic-success border border-semantic-success/30',
    pending:
      'bg-brand-cyber-cyan/15 text-brand-cyber-cyan border border-brand-cyber-cyan/30',
    warning:
      'bg-semantic-warning/15 text-semantic-warning border border-semantic-warning/30',
    error:
      'bg-semantic-error/15 text-semantic-error border border-semantic-error/30',
    premium:
      'bg-gradient-to-r from-brand-luxury-gold/20 via-brand-luxury-gold/30 to-brand-luxury-gold/15 text-brand-luxury-gold border border-brand-luxury-gold/50 shadow-sm',
  };

  const dotColors: Record<BadgeVariant, string> = {
    default: 'bg-themeText-muted',
    active: 'bg-brand-bright-violet',
    success: 'bg-semantic-success',
    pending: 'bg-brand-cyber-cyan',
    warning: 'bg-semantic-warning',
    error: 'bg-semantic-error',
    premium: 'bg-brand-luxury-gold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full tracking-wide select-none transition-colors duration-150',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant], {
            'animate-pulse': variant === 'active' || variant === 'pending',
          })}
        />
      )}
      {icon ? (
        <span className="shrink-0">{icon}</span>
      ) : (
        variant === 'premium' && <Sparkles className="w-3 h-3 shrink-0" />
      )}
      <span>{children}</span>
    </span>
  );
};
