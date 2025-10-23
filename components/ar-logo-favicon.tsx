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
        {/* Simple gradient */}
        <linearGradient id='faviconGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#3B82F6' />
          <stop offset='50%' stopColor='#06B6D4' />
          <stop offset='100%' stopColor='#8B5CF6' />
        </linearGradient>
      </defs>

      {/* AR Logo with Circle */}
      <g transform='translate(50, 50)'>
        {/* Circle around logo */}
        <circle
          cx='8'
          cy='0'
          r='45'
          stroke='url(#faviconGradient)'
          strokeWidth='3.5'
          fill='none'
          opacity='0.7'
        />
        
        {/* Letter A */}
        <path
          d='M -18 30 L 0 -30 L 18 30 M -10 12 L 10 12'
          stroke='url(#faviconGradient)'
          strokeWidth='6'
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
        />
        
        {/* Letter R */}
        <path
          d='M 26 30 L 26 -30 L 42 -30 Q 52 -30 52 -18 Q 52 -6 42 -6 L 26 -6 M 42 -6 L 54 30'
          stroke='url(#faviconGradient)'
          strokeWidth='6'
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
        />
      </g>
    </svg>
  );
}
