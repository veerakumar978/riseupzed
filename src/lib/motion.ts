import { type Variants, type Transition } from 'framer-motion';

/**
 * Riseupzed Motion Tokens & Presets
 */

export const DURATION = {
  fast: 0.14,
  standard: 0.22,
  emphasis: 0.36,
  ambient: 12,
} as const;

export const EASING = {
  standard: [0.2, 0.0, 0, 1.0] as const,
  out: [0, 0, 0.2, 1] as const,
  in: [0.4, 0, 1, 1] as const,
  spring: { type: 'spring', damping: 25, stiffness: 350 },
} as const;

export const defaultTransition: Transition = {
  duration: DURATION.standard,
  ease: EASING.out,
};

export const pageEntranceVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.emphasis,
      ease: EASING.out,
      when: 'beforeChildren',
      staggerChildren: 0.08,
    },
  },
};

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

export const cardEntranceVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DURATION.standard,
      ease: EASING.out,
    },
  },
};

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: DURATION.standard,
      ease: EASING.out,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 4,
    transition: {
      duration: DURATION.fast,
      ease: EASING.in,
    },
  },
};

export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.fast } },
  exit: { opacity: 0, transition: { duration: DURATION.fast } },
};

export const buttonTapMotion = {
  whileHover: { scale: 1.015 },
  whileTap: { scale: 0.975 },
  transition: { duration: DURATION.fast },
};

/**
 * Returns accessible variants that replace transform animations with simple opacity
 * when reduced motion is requested.
 */
export function getAccessibleVariants(variants: Variants, shouldReduceMotion: boolean): Variants {
  if (!shouldReduceMotion) return variants;

  const accessible: Variants = {};
  for (const [key, val] of Object.entries(variants)) {
    if (typeof val === 'object' && val !== null) {
      accessible[key] = {
        ...val,
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
        transition: { duration: DURATION.fast },
      };
    } else {
      accessible[key] = val;
    }
  }
  return accessible;
}
