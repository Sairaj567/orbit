import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/animation';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div initial={pageTransition.initial} animate={pageTransition.animate} exit={pageTransition.exit} transition={pageTransition.transition}>
      {children}
    </motion.div>
  );
}