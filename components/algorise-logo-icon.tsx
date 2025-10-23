// Logo icon only (without text) - for auth pages and other places
export function AlgoRiseLogoIcon({
  className = 'h-16 w-16',
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox='0 0 80 80'
      className={className}
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <defs>
        {/* Simple gradient */}
        <linearGradient id='logoIconGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
          <stop offset='0%' className='text-blue-500 dark:text-blue-400' stopColor='currentColor' />
          <stop offset='50%' className='text-cyan-500 dark:text-cyan-400' stopColor='currentColor' />
          <stop offset='100%' className='text-purple-500 dark:text-purple-400' stopColor='currentColor' />
        </linearGradient>
      </defs>

      {/* AR Logo with Circle - Both letters centered inside */}
      <g transform='translate(40, 40)'>
        {/* Circle around logo */}
        <circle
          cx='0'
          cy='0'
          r='34'
          stroke='url(#logoIconGradient)'
          strokeWidth='2.5'
          fill='none'
          opacity='0.7'
        />
        
        {/* Letter A - properly positioned left of center */}
        <path
          d='M -15 18 L -5 -18 L 5 18 M -10 5 L 0 5'
          stroke='url(#logoIconGradient)'
          strokeWidth='4'
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
        />
        
        {/* Letter R - properly positioned right of center */}
        <path
          d='M 8 18 L 8 -18 L 18 -18 Q 23 -18 23 -11 Q 23 -4 18 -4 L 8 -4 M 18 -4 L 24 18'
          stroke='url(#logoIconGradient)'
          strokeWidth='4'
          strokeLinecap='round'
          strokeLinejoin='round'
          fill='none'
        />
      </g>
    </svg>
  );
}
