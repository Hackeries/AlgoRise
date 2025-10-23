export function ARLogoFavicon({
  className = 'h-12 w-12',
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox='0 0 100 100'
      className={className}
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <defs>
        <linearGradient id='faviconGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#06B6D4' />
          <stop offset='50%' stopColor='#8B5CF6' />
          <stop offset='100%' stopColor='#EC4899' />
        </linearGradient>
        
        {/* Glow effect */}
        <filter id='faviconGlow'>
          <feGaussianBlur stdDeviation='2' result='coloredBlur' />
          <feMerge>
            <feMergeNode in='coloredBlur' />
            <feMergeNode in='SourceGraphic' />
          </feMerge>
        </filter>
      </defs>

      {/* Logo Icon - Binary Tree */}
      <g transform='translate(50, 50)'>
        {/* Outer ring - larger and more prominent */}
        <circle
          cx='0'
          cy='0'
          r='42'
          stroke='url(#faviconGradient)'
          strokeWidth='2.5'
          opacity='0.4'
          fill='none'
        />

        {/* Central node */}
        <circle
          cx='0'
          cy='-16'
          r='5.5'
          fill='#63EDA1'
          filter='url(#faviconGlow)'
        />

        {/* Left branch */}
        <line
          x1='0'
          y1='-10'
          x2='-16'
          y2='8'
          stroke='#06B6D4'
          strokeWidth='4'
          strokeLinecap='round'
          filter='url(#faviconGlow)'
        />
        <circle cx='-16' cy='8' r='5' fill='#06B6D4' filter='url(#faviconGlow)' />
        
        {/* Left sub-branches */}
        <line x1='-16' y1='13' x2='-24' y2='22' stroke='#06B6D4' strokeWidth='3' strokeLinecap='round' opacity='0.8' />
        <circle cx='-24' cy='22' r='4' fill='#0EA5E9' />
        
        <line x1='-16' y1='13' x2='-8' y2='22' stroke='#06B6D4' strokeWidth='3' strokeLinecap='round' opacity='0.8' />
        <circle cx='-8' cy='22' r='4' fill='#0EA5E9' />

        {/* Right branch */}
        <line
          x1='0'
          y1='-10'
          x2='16'
          y2='8'
          stroke='#8B5CF6'
          strokeWidth='4'
          strokeLinecap='round'
          filter='url(#faviconGlow)'
        />
        <circle cx='16' cy='8' r='5' fill='#8B5CF6' filter='url(#faviconGlow)' />
        
        {/* Right sub-branches */}
        <line x1='16' y1='13' x2='8' y2='22' stroke='#8B5CF6' strokeWidth='3' strokeLinecap='round' opacity='0.8' />
        <circle cx='8' cy='22' r='4' fill='#A855F7' />
        
        <line x1='16' y1='13' x2='24' y2='22' stroke='#8B5CF6' strokeWidth='3' strokeLinecap='round' opacity='0.8' />
        <circle cx='24' cy='22' r='4' fill='#EC4899' />

        {/* Upward arrow - larger */}
        <path
          d='M 0,-24 L 0,-32 M -4,-28 L 0,-32 L 4,-28'
          stroke='#FBBF24'
          strokeWidth='3.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          filter='url(#faviconGlow)'
        />
        
        {/* Inner decorative circle */}
        <circle
          cx='0'
          cy='0'
          r='46'
          stroke='url(#faviconGradient)'
          strokeWidth='1'
          opacity='0.2'
          fill='none'
        />
      </g>
    </svg>
  );
}
