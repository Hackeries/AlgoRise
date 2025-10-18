export function AlgoRiseLogo({
  className = 'h-8 w-auto',
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox='0 0 200 56'
      className={className}
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      {/* Gradient definitions */}
      <defs>
        <linearGradient id='logoGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' stopColor='currentColor' stopOpacity='1' />
          <stop offset='100%' stopColor='currentColor' stopOpacity='0.8' />
        </linearGradient>
      </defs>

      {/* Logo Mark - Geometric Algorithm Symbol */}
      <g>
        {/* Outer circle */}
        <circle
          cx='20'
          cy='28'
          r='16'
          stroke='currentColor'
          strokeWidth='1.5'
          opacity='0.3'
        />

        {/* Inner geometric pattern - represents algorithm/data structure */}
        <path
          d='M 20 12 L 28 20 L 20 28 L 12 20 Z'
          fill='url(#logoGradient)'
          opacity='0.9'
        />

        {/* Top accent */}
        <circle cx='20' cy='12' r='2' fill='currentColor' opacity='0.6' />

        {/* Right accent */}
        <circle cx='28' cy='20' r='2' fill='currentColor' opacity='0.6' />

        {/* Bottom accent */}
        <circle cx='20' cy='28' r='2' fill='currentColor' opacity='0.6' />

        {/* Left accent */}
        <circle cx='12' cy='20' r='2' fill='currentColor' opacity='0.6' />
      </g>

      {/* Text: AlgoRise */}
      <text
        x='48'
        y='36'
        fontFamily='Inter, sans-serif'
        fontSize='24'
        fontWeight='700'
        fill='currentColor'
        letterSpacing='-0.5'
      >
        AlgoRise
      </text>
    </svg>
  );
}