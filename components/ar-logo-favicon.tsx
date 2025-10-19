export function ARLogoFavicon({
  className = 'h-8 w-8',
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox='0 0 64 64'
      className={className}
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <defs>
        <linearGradient
          id='arGradientFavicon'
          x1='0%'
          y1='0%'
          x2='100%'
          y2='100%'
        >
          <stop offset='0%' stopColor='#00D9FF' />
          <stop offset='100%' stopColor='#00B8D4' />
        </linearGradient>
      </defs>

      {/* Letter A - Left triangle */}
      <path
        d='M 12 44 L 20 12 L 24 12 L 32 44 M 16 32 L 28 32'
        stroke='url(#arGradientFavicon)'
        strokeWidth='3'
        strokeLinecap='round'
        strokeLinejoin='round'
        fill='none'
      />

      {/* Letter R - Right side */}
      <path
        d='M 36 12 L 36 44 M 36 12 L 48 12 Q 52 12 52 18 Q 52 24 48 24 L 36 24 M 48 24 L 56 44'
        stroke='url(#arGradientFavicon)'
        strokeWidth='3'
        strokeLinecap='round'
        strokeLinejoin='round'
        fill='none'
      />

      {/* Accent dots */}
      <circle cx='20' cy='8' r='2' fill='#00D9FF' opacity='0.8' />
      <circle cx='52' cy='48' r='2' fill='#00D9FF' opacity='0.8' />
    </svg>
  );
}
