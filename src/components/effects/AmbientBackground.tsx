import React from 'react';
import { GlowOrb } from './GlowOrb';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/cn';

interface AmbientBackgroundProps {
  showGrid?: boolean;
  showParticles?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  showGrid = true,
  showParticles = true,
  className,
  children,
}) => {
  const { isReducedMotion } = useTheme();

  return (
    <div className={cn('relative min-h-screen w-full overflow-hidden bg-midnight', className)}>
      {/* Primary Atmospheric Ambient Gradients */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
      >
        {/* Deep Ambient Base Radial Gradients */}
        <div className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-[#5520A8]/20 via-[#17112F]/15 to-transparent blur-[120px] transform-gpu" />
        
        {/* Floating Violet & Cyan Orbs */}
        <GlowOrb
          color="violet"
          size="xl"
          animate={!isReducedMotion}
          className="top-[5%] -left-[10%] opacity-40 animate-orb-1"
        />
        <GlowOrb
          color="cyan"
          size="lg"
          animate={!isReducedMotion}
          className="top-[40%] -right-[5%] opacity-30 animate-orb-2"
        />
        <GlowOrb
          color="purple"
          size="xl"
          animate={!isReducedMotion}
          className="bottom-[10%] left-[20%] opacity-35"
        />
        <GlowOrb
          color="gold"
          size="sm"
          animate={!isReducedMotion}
          className="top-[75%] right-[25%] opacity-20"
        />

        {/* Subtle Decorative Grid Pattern */}
        {showGrid && (
          <div className="absolute inset-0 bg-mesh-grid opacity-60 mask-radial" />
        )}

        {/* Sparse Ambient Micro-Particles */}
        {showParticles && !isReducedMotion && (
          <div className="absolute inset-0 pointer-events-none">
            {[
              { top: '15%', left: '20%', size: '3px', delay: '0s', dur: '12s' },
              { top: '35%', left: '80%', size: '2px', delay: '3s', dur: '14s' },
              { top: '65%', left: '15%', size: '4px', delay: '1s', dur: '16s' },
              { top: '80%', left: '70%', size: '3px', delay: '4s', dur: '11s' },
              { top: '25%', left: '60%', size: '2px', delay: '2s', dur: '15s' },
              { top: '50%', left: '40%', size: '3px', delay: '5s', dur: '13s' },
            ].map((p, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-[#C4B5FD] opacity-25"
                style={{
                  top: p.top,
                  left: p.left,
                  width: p.size,
                  height: p.size,
                  animation: `particle-drift ${p.dur} ease-in-out infinite`,
                  animationDelay: p.delay,
                  boxShadow: '0 0 8px #8B5CF6',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Layer */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};
