import type { ComponentPropsWithoutRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { MOTION } from '@/lib/animation';

type MotionDivProps = ComponentPropsWithoutRef<'div'> & HTMLMotionProps<'div'>;

export function MotionDiv(props: MotionDivProps) {
  return <motion.div {...props} transition={props.transition ?? MOTION.spring.button} />;
}