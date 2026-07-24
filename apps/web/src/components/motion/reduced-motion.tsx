import { createElement, type ComponentType } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export function ReducedMotion<TProps extends object>(Component: ComponentType<TProps>) {
  return function ReducedMotionWrapper(props: TProps) {
    const reducedMotion = useReducedMotion();

    return createElement(Component, { ...props, 'data-reduced-motion': reducedMotion ? 'true' : 'false' });
  };
}