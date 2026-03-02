/**
 * Hover card component with micro-interactions
 */

import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

interface HoverCardProps {
  children: ReactNode;
  className?: string;
  scale?: number;
  lift?: number;
  shadowIntensity?: 'sm' | 'md' | 'lg' | 'xl';
}

const shadowClasses = {
  sm: 'hover:shadow-sm',
  md: 'hover:shadow-md',
  lg: 'hover:shadow-lg',
  xl: 'hover:shadow-xl',
};

export function HoverCard({
  children,
  className = '',
  scale = 1.02,
  lift = -4,
  shadowIntensity = 'md',
}: HoverCardProps) {
  return (
    <motion.div
      whileHover={{
        scale,
        y: lift,
      }}
      transition={{
        duration: 0.2,
        ease: 'easeOut',
      }}
      className={`${shadowClasses[shadowIntensity]} transition-shadow duration-200 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default HoverCard;