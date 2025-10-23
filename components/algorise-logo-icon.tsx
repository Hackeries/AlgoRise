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
        {/* Glow for better visibility */}
        <filter id='logoIconGlow'>
          <feGaussianBlur stdDeviation='1.5' result='coloredBlur' />
          <feMerge>
            <feMergeNode in='coloredBlur' />
            <feMergeNode in='SourceGraphic' />
          </feMerge>
        </filter>
      </defs>

      {/* Logo Icon - Binary Tree & Graph Network Symbol */}
      <g transform='translate(40, 40)'>
        {/* Outer orbital ring - representing algorithms cycling */}
        <circle
          cx='0'
          cy='0'
          r='32'
          stroke='currentColor'
          strokeWidth='2'
          opacity='0.5'
          className='text-cyan-400 dark:text-cyan-300'
          strokeDasharray='5 5'
        />

        {/* Central node - represents root/starting point */}
        <circle
          cx='0'
          cy='-15'
          r='5'
          fill='currentColor'
          className='text-emerald-400 dark:text-emerald-300'
          opacity='1'
        />

        {/* Binary tree structure - left branch */}
        <g opacity='0.95' filter='url(#logoIconGlow)'>
          <line
            x1='0'
            y1='-10'
            x2='-13'
            y2='6'
            stroke='currentColor'
            strokeWidth='3.5'
            strokeLinecap='round'
            className='text-cyan-400 dark:text-cyan-300'
          />
          <circle
            cx='-13'
            cy='6'
            r='4.5'
            fill='currentColor'
            className='text-sky-400 dark:text-sky-300'
          />
          
          {/* Sub-branches left */}
          <line
            x1='-13'
            y1='10.5'
            x2='-20'
            y2='18'
            stroke='currentColor'
            strokeWidth='2.5'
            strokeLinecap='round'
            className='text-sky-300 dark:text-sky-200'
            opacity='0.9'
          />
          <circle
            cx='-20'
            cy='18'
            r='3.5'
            fill='currentColor'
            className='text-teal-400 dark:text-teal-300'
          />
          
          <line
            x1='-13'
            y1='10.5'
            x2='-6'
            y2='18'
            stroke='currentColor'
            strokeWidth='2.5'
            strokeLinecap='round'
            className='text-sky-300 dark:text-sky-200'
            opacity='0.9'
          />
          <circle
            cx='-6'
            cy='18'
            r='3.5'
            fill='currentColor'
            className='text-teal-400 dark:text-teal-300'
          />
        </g>

        {/* Binary tree structure - right branch */}
        <g opacity='0.95' filter='url(#logoIconGlow)'>
          <line
            x1='0'
            y1='-10'
            x2='13'
            y2='6'
            stroke='currentColor'
            strokeWidth='3.5'
            strokeLinecap='round'
            className='text-purple-400 dark:text-purple-300'
          />
          <circle
            cx='13'
            cy='6'
            r='4.5'
            fill='currentColor'
            className='text-fuchsia-400 dark:text-fuchsia-300'
          />
          
          {/* Sub-branches right */}
          <line
            x1='13'
            y1='10.5'
            x2='6'
            y2='18'
            stroke='currentColor'
            strokeWidth='2.5'
            strokeLinecap='round'
            className='text-fuchsia-300 dark:text-fuchsia-200'
            opacity='0.9'
          />
          <circle
            cx='6'
            cy='18'
            r='3.5'
            fill='currentColor'
            className='text-pink-400 dark:text-pink-300'
          />
          
          <line
            x1='13'
            y1='10.5'
            x2='20'
            y2='18'
            stroke='currentColor'
            strokeWidth='2.5'
            strokeLinecap='round'
            className='text-fuchsia-300 dark:text-fuchsia-200'
            opacity='0.9'
          />
          <circle
            cx='20'
            cy='18'
            r='3.5'
            fill='currentColor'
            className='text-pink-400 dark:text-pink-300'
          />
        </g>

        {/* Upward arrow path - representing growth/rise */}
        <g className='text-amber-400 dark:text-amber-300' filter='url(#logoIconGlow)'>
          <path
            d='M 0,-25 L 0,-32 M -4,-28 L 0,-32 L 4,-28'
            stroke='currentColor'
            strokeWidth='3'
            strokeLinecap='round'
            strokeLinejoin='round'
            opacity='1'
          />
        </g>

        {/* Connection lines creating network effect */}
        <line
          x1='-20'
          y1='18'
          x2='6'
          y2='18'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          className='text-cyan-300 dark:text-cyan-200'
          opacity='0.6'
          strokeDasharray='3 3'
        />
        <line
          x1='-6'
          y1='18'
          x2='20'
          y2='18'
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          className='text-fuchsia-300 dark:text-fuchsia-200'
          opacity='0.6'
          strokeDasharray='3 3'
        />

        {/* Decorative pulse circles */}
        <circle
          cx='0'
          cy='0'
          r='37'
          stroke='currentColor'
          strokeWidth='0.8'
          opacity='0.3'
          className='text-violet-400 dark:text-violet-300'
        />
      </g>
    </svg>
  );
}
