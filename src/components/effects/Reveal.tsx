import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { DURATION, EASING } from '../../lib/motion';
import { cn } from '../../lib/cn';

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'down' | 'none';
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  delay = 0,
  className,
  direction = 'up',
}) => {
  const { isReducedMotion } = useTheme();

  if (isReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const offset = direction === 'up' ? 16 : direction === 'down' ? -16 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration: DURATION.standard,
        delay,
        ease: EASING.out,
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};
