import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimateListProps {
  children: ReactNode;
}

export function AnimateList({ children }: AnimateListProps) {
  return <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.05 } } }}>{children}</motion.div>;
}