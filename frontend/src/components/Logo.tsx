import { motion } from 'framer-motion';
import { useId } from 'react';

interface LogoProps {
  className?: string;
  animate?: boolean;
}

export const Logo = ({ className = "h-10 w-10", animate = true }: LogoProps) => {
  const grad1Id = useId();
  const grad2Id = useId();
  const glowId = useId();

  return (
    <motion.svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      whileHover={animate ? { scale: 1.05, rotate: 5 } : {}}
      whileTap={animate ? { scale: 0.95 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <defs>
        <linearGradient id={grad1Id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" /> {/* Indigo-600 */}
          <stop offset="100%" stopColor="#A855F7" /> {/* Purple-500 */}
        </linearGradient>
        <linearGradient id={grad2Id} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#06B6D4" /> {/* Cyan-500 */}
          <stop offset="100%" stopColor="#3B82F6" /> {/* Blue-500 */}
        </linearGradient>
        <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer abstract ring/hexagon */}
      <path
        d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z"
        fill="none"
        stroke={`url(#${grad2Id})`}
        strokeWidth="6"
        strokeLinejoin="round"
        filter={`url(#${glowId})`}
        className="opacity-80"
      />

      {/* The Central 'N' representing NovaShop */}
      <path
        d="M 32 68 L 32 32 L 68 68 L 68 32"
        stroke={`url(#${grad1Id})`}
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Decorative Star/Sparkle */}
      <circle cx="68" cy="32" r="5" fill="#fff" />
    </motion.svg>
  );
};
