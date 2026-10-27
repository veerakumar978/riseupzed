import React, { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/cn';

export interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // degrees, default 3.5
  glare?: boolean;
  id?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className,
  maxTilt = 3.5,
  glare = true,
  id,
  style,
  onClick,
}) => {
  const { isReducedMotion } = useTheme();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse normalized coordinates (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for resting return
  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]), springConfig);

  // Glare position
  const glareX = useTransform(x, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(y, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / rect.width - 0.5);
    y.set(mouseY / rect.height - 0.5);
  }, [isReducedMotion, x, y]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  if (isReducedMotion) {
    return (
      <div
        id={id}
        ref={cardRef}
        style={style}
        onClick={onClick}
        className={cn('relative rounded-card transition-shadow duration-200', className)}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      style={{ perspective: 1200 }}
      className="inline-block w-full select-none"
    >
      <motion.div
        id={id}
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          ...style,
        }}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
        className={cn(
          'relative overflow-hidden rounded-card transition-shadow duration-300',
          isHovered && 'shadow-card-hover',
          className
        )}
      >
        {children}

        {/* Dynamic Holographic Glare Sheen */}
        {glare && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-full opacity-0 transition-opacity duration-300"
            style={{
              opacity: isHovered ? 0.12 : 0,
              background: `radial-gradient(circle at ${glareX} ${glareY}, rgba(255, 255, 255, 0.8) 0%, rgba(34, 211, 238, 0.2) 30%, transparent 70%)`,
            }}
          />
        )}
      </motion.div>
    </div>
  );
};
