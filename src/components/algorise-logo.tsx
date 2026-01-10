'use client';

import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'wordmark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeMap = {
  sm: { icon: 24, full: 120, wordmark: 100 },
  md: { icon: 32, full: 160, wordmark: 130 },
  lg: { icon: 40, full: 200, wordmark: 160 },
  xl: { icon: 48, full: 240, wordmark: 190 },
};

export function AlgoRiseLogo({
  className,
  variant = 'full',
  size = 'md',
}: LogoProps) {
  const dimensions = sizeMap[size];

  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 48 48"
        width={dimensions.icon}
        height={dimensions.icon}
        className={cn('flex-shrink-0', className)}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="AlgoRise"
        role="img"
      >
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="logoGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle 
          cx="24" 
          cy="24" 
          r="22" 
          className="fill-primary/10 dark:fill-primary/20"
        />
        
        {/* Rising arrow/graph representing growth */}
        <path
          d="M12 32 L18 26 L24 30 L36 16"
          stroke="url(#logoGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="dark:hidden"
        />
        <path
          d="M12 32 L18 26 L24 30 L36 16"
          stroke="url(#logoGradientDark)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="hidden dark:block"
        />
        
        {/* Arrow head */}
        <path
          d="M30 16 L36 16 L36 22"
          stroke="url(#logoGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="dark:hidden"
        />
        <path
          d="M30 16 L36 16 L36 22"
          stroke="url(#logoGradientDark)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="hidden dark:block"
        />
        
        {/* Code brackets hint */}
        <path
          d="M16 12 L12 16 L16 20"
          stroke="url(#logoGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.6"
          className="dark:hidden"
        />
        <path
          d="M16 12 L12 16 L16 20"
          stroke="url(#logoGradientDark)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.6"
          className="hidden dark:block"
        />
      </svg>
    );
  }

  if (variant === 'wordmark') {
    return (
      <svg
        viewBox="0 0 140 32"
        width={dimensions.wordmark}
        height={(dimensions.wordmark / 140) * 32}
        className={cn('flex-shrink-0', className)}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="AlgoRise"
        role="img"
      >
        <defs>
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <text
          x="0"
          y="24"
          fontFamily="var(--font-bricolage), Inter, system-ui, sans-serif"
          fontSize="26"
          fontWeight="700"
          letterSpacing="-0.5"
          className="fill-foreground"
        >
          Algo
        </text>
        <text
          x="62"
          y="24"
          fontFamily="var(--font-bricolage), Inter, system-ui, sans-serif"
          fontSize="26"
          fontWeight="700"
          letterSpacing="-0.5"
          fill="url(#textGradient)"
        >
          Rise
        </text>
      </svg>
    );
  }

  // Full logo (icon + wordmark)
  return (
    <svg
      viewBox="0 0 200 48"
      width={dimensions.full}
      height={(dimensions.full / 200) * 48}
      className={cn('flex-shrink-0', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="AlgoRise"
      role="img"
    >
      <defs>
        <linearGradient id="fullLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="50%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id="fullLogoGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="50%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#c084fc" />
        </linearGradient>
        <linearGradient id="fullTextGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      
      {/* Icon part */}
      <g transform="translate(0, 0)">
        {/* Background circle */}
        <circle 
          cx="24" 
          cy="24" 
          r="22" 
          className="fill-primary/10 dark:fill-primary/20"
        />
        
        {/* Rising graph */}
        <path
          d="M12 32 L18 26 L24 30 L36 16"
          stroke="url(#fullLogoGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="dark:hidden"
        />
        <path
          d="M12 32 L18 26 L24 30 L36 16"
          stroke="url(#fullLogoGradientDark)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="hidden dark:block"
        />
        
        {/* Arrow head */}
        <path
          d="M30 16 L36 16 L36 22"
          stroke="url(#fullLogoGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="dark:hidden"
        />
        <path
          d="M30 16 L36 16 L36 22"
          stroke="url(#fullLogoGradientDark)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="hidden dark:block"
        />
        
        {/* Code bracket hint */}
        <path
          d="M16 12 L12 16 L16 20"
          stroke="url(#fullLogoGradient)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.6"
          className="dark:hidden"
        />
        <path
          d="M16 12 L12 16 L16 20"
          stroke="url(#fullLogoGradientDark)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.6"
          className="hidden dark:block"
        />
      </g>
      
      {/* Wordmark part */}
      <text
        x="56"
        y="32"
        fontFamily="var(--font-bricolage), Inter, system-ui, sans-serif"
        fontSize="28"
        fontWeight="700"
        letterSpacing="-0.5"
        className="fill-foreground"
      >
        Algo
      </text>
      <text
        x="122"
        y="32"
        fontFamily="var(--font-bricolage), Inter, system-ui, sans-serif"
        fontSize="28"
        fontWeight="700"
        letterSpacing="-0.5"
        fill="url(#fullTextGradient)"
      >
        Rise
      </text>
    </svg>
  );
}

// Simple favicon component for generating favicon
export function AlgoRiseFavicon({ size = 32 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="faviconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      
      {/* Background */}
      <rect width="32" height="32" rx="8" fill="#0f0f23" />
      
      {/* Rising graph - simplified for small size */}
      <path
        d="M6 24 L12 18 L16 21 L26 10"
        stroke="url(#faviconGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Arrow head */}
      <path
        d="M21 10 L26 10 L26 15"
        stroke="url(#faviconGradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
