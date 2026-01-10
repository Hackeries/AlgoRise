export function ARLogoSVG({
  size = 32,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 64 64'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      className={className}
    >
      <defs>
        <linearGradient id='arGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='#00D9FF' />
          <stop offset='100%' stopColor='#00B8D4' />
        </linearGradient>
      </defs>

      {/* A - Left triangle */}
      <path
        d='M 12 48 L 28 12 L 32 12 L 48 48 M 20 32 L 40 32'
        stroke='url(#arGradient)'
        strokeWidth='3.5'
        strokeLinecap='round'
        strokeLinejoin='round'
        fill='none'
      />

      {/* R - Right side */}
      <path
        d='M 36 12 L 52 12 Q 56 12 56 18 Q 56 24 52 24 L 36 24 M 52 24 L 56 48'
        stroke='url(#arGradient)'
        strokeWidth='3.5'
        strokeLinecap='round'
        strokeLinejoin='round'
        fill='none'
      />

      {/* Accent dots */}
      <circle cx='20' cy='56' r='2' fill='url(#arGradient)' />
      <circle cx='44' cy='56' r='2' fill='url(#arGradient)' />
    </svg>
  );
}
