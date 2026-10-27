import React from 'react';
import { cn } from '../../lib/cn';

export type CardVariant = 'standard' | 'elevated' | 'interactive' | 'glass' | 'gradient-feature' | 'metric';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  radius?: 'card' | 'featured' | 'hero';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  glow?: 'none' | 'purple' | 'cyan' | 'gold';
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'standard',
      radius = 'card',
      padding = 'md',
      glow = 'none',
      children,
      ...props
    },
    ref
  ) => {
    const radiusStyles = {
      card: 'rounded-card',
      featured: 'rounded-featured',
      hero: 'rounded-hero',
    };

    const paddingStyles = {
      none: 'p-0',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const variantStyles: Record<CardVariant, string> = {
      standard:
        'bg-panel-primary border border-themeBorder shadow-card-depth shadow-glass-inset text-themeText-primary',
      elevated:
        'bg-panel-elevated border border-themeBorder shadow-card-hover shadow-glass-inset text-themeText-primary',
      interactive:
        'bg-panel-primary border border-themeBorder shadow-card-depth shadow-glass-inset hover:border-brand-bright-violet/50 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 cursor-pointer text-themeText-primary',
      glass:
        'bg-panel-primary/70 backdrop-blur-xl border border-white/10 shadow-card-depth shadow-glass-inset text-themeText-primary',
      'gradient-feature':
        'bg-gradient-to-br from-panel-secondary via-panel-elevated to-panel-primary border border-brand-bright-violet/30 shadow-card-hover shadow-glass-inset text-themeText-primary relative overflow-hidden',
      metric:
        'bg-panel-primary border border-themeBorder shadow-card-depth shadow-glass-inset flex flex-col justify-between text-themeText-primary',
    };

    const glowStyles = {
      none: '',
      purple: 'hover:shadow-glow-purple',
      cyan: 'hover:shadow-glow-cyan',
      gold: 'hover:shadow-glow-gold',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative transition-all duration-200',
          radiusStyles[radius],
          paddingStyles[padding],
          variantStyles[variant],
          glowStyles[glow],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
