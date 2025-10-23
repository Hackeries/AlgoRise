export function AlgoRiseLogo({
  className = 'h-10 w-auto',
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox='0 0 320 80'
      className={className}
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <defs>
        {/* Simple gradient for the logo */}
        <linearGradient id='logoGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' className='text-blue-500 dark:text-blue-400' stopColor='currentColor' />
          <stop offset='50%' className='text-cyan-500 dark:text-cyan-400' stopColor='currentColor' />
          <stop offset='100%' className='text-purple-500 dark:text-purple-400' stopColor='currentColor' />
        </linearGradient>
      </defs>

      {/* AR Logo Icon with Circle */}
      <g transform='translate(40, 40)'>
        {/* Circle around logo */}
        <circle
          cx='13'
          cy='0'
          r='32'
          stroke='url(#logoGradient)'
          strokeWidth='2.5'
          fill='none'
          opacity='0.7'
        />
        
        {/* Letter A */}
        <path
          d='M -12 20 L 0 -20 L 12 20 M -6 8 L 6 8'
          stroke='url(#logoGradient)'
          strokeWidth='4'
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
        />
        
        {/* Letter R */}
        <path
          d='M 18 20 L 18 -20 L 30 -20 Q 36 -20 36 -12 Q 36 -4 30 -4 L 18 -4 M 30 -4 L 38 20'
          stroke='url(#logoGradient)'
          strokeWidth='4'
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
        />
      </g>

      {/* Text: AlgoRise - Simple clean font */}
      <g>
        <text
          x='95'
          y='52'
          fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
          fontSize='38'
          fontWeight='600'
          letterSpacing='-0.5'
          className='text-slate-800 dark:text-gray-100'
          style={{ fill: 'currentColor' }}
        >
          AlgoRise
        </text>
      </g>
    </svg>
  );
}
