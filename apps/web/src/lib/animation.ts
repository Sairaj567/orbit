export const MOTION = {
  spring: {
    button: { type: 'spring', stiffness: 450, damping: 28 },
    slide: { type: 'spring', stiffness: 300, damping: 30 },
  },
  fade: { duration: 0.15, ease: 'easeInOut' as const },
} as const;

export const pageTransition = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -12 },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
} as const;