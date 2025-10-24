export function AlgoRiseLogo({
  className = 'h-8 w-auto',
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <svg
      viewBox='0 0 280 64'
      className={className}
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      aria-label='AlgoRise'
      role='img'
      focusable='false'
    >
      <defs>
        <linearGradient id='arGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='currentColor' />
          <stop offset='100%' stopColor='currentColor' stopOpacity='0.85' />
        </linearGradient>
        <filter id='glow'>
          <feGaussianBlur stdDeviation='1' result='coloredBlur' />
          <feMerge>
            <feMergeNode in='coloredBlur' />
            <feMergeNode in='SourceGraphic' />
          </feMerge>
        </filter>
      </defs>

      {/* AR Logo Mark - Geometric Design */}
      <g>
        {/* Background circle with subtle glow */}
        <circle cx='32' cy='32' r='28' fill='currentColor' opacity='0.08' />

        {/* Letter A - Left triangle */}
        <path
          d='M 16 48 L 24 16 L 28 16 L 36 48 M 20 36 L 32 36'
          stroke='url(#arGradient)'
          strokeWidth='3.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
        />

        {/* Letter R - Right side */}
        <path
          d='M 40 16 L 40 48 M 40 16 L 52 16 Q 56 16 56 22 Q 56 28 52 28 L 40 28 M 52 28 L 60 48'
          stroke='url(#arGradient)'
          strokeWidth='3.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
        />

        {/* Accent dots */}
        <circle cx='24' cy='12' r='2.5' fill='currentColor' opacity='0.6' />
        <circle cx='56' cy='52' r='2.5' fill='currentColor' opacity='0.6' />
      </g>

      {/* Text: AlgoRise */}
      <text
        x='80'
        y='42'
        fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize='32'
        fontWeight='700'
        fill='currentColor'
        letterSpacing='-0.8'
      >
        AlgoRise
      </text>
    </svg>
  );
}
