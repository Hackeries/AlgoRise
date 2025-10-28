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
        {/* Dark metallic gradient always */}
        <linearGradient id='arGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#e0e0e0' stopOpacity='0.95' />
          <stop offset='100%' stopColor='#888888' stopOpacity='0.85' />
        </linearGradient>

        {/* Soft ambient glow */}
        <filter id='glow' x='-50%' y='-50%' width='200%' height='200%'>
          <feGaussianBlur stdDeviation='1.5' result='coloredBlur' />
          <feMerge>
            <feMergeNode in='coloredBlur' />
            <feMergeNode in='SourceGraphic' />
          </feMerge>
        </filter>
      </defs>

      {/* AR Logo Mark */}
      <g filter='url(#glow)'>
        <circle cx='32' cy='32' r='28' fill='#111' opacity='0.08' />

        {/* Letter A */}
        <path
          d='M16 48 L24 16 L28 16 L36 48 M20 36 L32 36'
          stroke='url(#arGradient)'
          strokeWidth='3.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
        />

        {/* Letter R */}
        <path
          d='M40 16 L40 48 M40 16 L52 16 Q56 16 56 22 Q 56 28 52 28 L40 28 M52 28 L60 48'
          stroke='url(#arGradient)'
          strokeWidth='3.5'
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
        />

        {/* Accent dots */}
        <circle cx='24' cy='12' r='2.5' fill='#ccc' opacity='0.6' />
        <circle cx='56' cy='52' r='2.5' fill='#ccc' opacity='0.6' />
      </g>

      {/* Text: AlgoRise (always dark gradient) */}
      <text
        x='80'
        y='42'
        fontFamily="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize='32'
        fontWeight='700'
        fill='url(#arGradient)'
        letterSpacing='-0.8'
      >
        AlgoRise
      </text>
    </svg>
  );
}
