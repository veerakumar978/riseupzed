import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useTheme } from '../../context/ThemeContext';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const { isReducedMotion } = useTheme();

    const baseStyles =
      'relative inline-flex items-center justify-center font-medium transition-all select-none rounded-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-bright-violet/80 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'h-9 px-3.5 text-xs gap-1.5',
      md: 'h-11 px-5 text-sm gap-2',
      lg: 'h-13 px-6 text-base gap-2.5',
    };

    const iconOnlySizes: Record<ButtonSize, string> = {
      sm: 'h-9 w-9 p-0',
      md: 'h-11 w-11 p-0',
      lg: 'h-13 w-13 p-0',
    };

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-gradient-to-r from-brand-electric-violet to-brand-bright-violet text-white shadow-glow-purple hover:brightness-110 active:brightness-95 border border-brand-bright-violet/30',
      secondary:
        'bg-panel-elevated text-themeText-primary hover:bg-panel-strong border border-themeBorder hover:border-brand-bright-violet/40 shadow-sm',
      outline:
        'bg-transparent text-themeText-primary hover:bg-panel-elevated/60 border border-themeBorder hover:border-brand-bright-violet hover:text-brand-soft-lavender',
      ghost:
        'bg-transparent text-themeText-secondary hover:text-themeText-primary hover:bg-panel-elevated/40 border border-transparent',
      destructive:
        'bg-semantic-error/15 text-semantic-error border border-semantic-error/30 hover:bg-semantic-error/25 active:bg-semantic-error/35',
      icon:
        'bg-panel-elevated/60 text-themeText-secondary hover:text-themeText-primary hover:bg-panel-elevated border border-themeBorder/60 hover:border-brand-bright-violet/40',
    };

    const isIconOnly = variant === 'icon' || (!children && (leftIcon || rightIcon));

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        whileTap={isReducedMotion ? undefined : { scale: 0.98 }}
        whileHover={isReducedMotion ? undefined : { scale: 1.01 }}
        transition={{ duration: 0.12 }}
        className={cn(
          baseStyles,
          isIconOnly ? iconOnlySizes[size] : sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0 text-current" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}

        {children && <span>{children}</span>}

        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
