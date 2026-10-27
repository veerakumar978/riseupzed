import React from 'react';
import { cn } from '../../lib/cn';

interface GlowOrbProps {
  color?: 'violet' | 'cyan' | 'gold' | 'purple';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

export const GlowOrb: React.FC<GlowOrbProps> = ({
  color = 'violet',
  size = 'md',
  className,
  animate = true,
}) => {
  const colorMap = {
    violet: 'bg-[#8B5CF6]/20',
    cyan: 'bg-[#22D3EE]/20',
    gold: 'bg-[#F5C451]/15',
    purple: 'bg-[#5520A8]/30',
  };

  const sizeMap = {
    sm: 'w-48 h-48 blur-2xl',
    md: 'w-80 h-80 blur-3xl',
    lg: 'w-[420px] h-[420px] blur-[100px]',
    xl: 'w-[560px] h-[560px] blur-[128px]',
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute rounded-full select-none transform-gpu',
        colorMap[color],
        sizeMap[size],
        animate && 'animate-pulse-subtle',
        className
      )}
    />
  );
};
