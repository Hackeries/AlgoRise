// Responsive breakpoints and utilities for consistent mobile-first design
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const

export const MOBILE_BREAKPOINT = 768

// Touch target sizes (minimum 44x44px for accessibility)
export const TOUCH_TARGETS = {
  small: "h-10 w-10",
  medium: "h-12 w-12",
  large: "h-14 w-14",
} as const

// Responsive padding utilities
export const RESPONSIVE_PADDING = {
  container: "px-3 sm:px-4 md:px-6 lg:px-8",
  section: "py-6 sm:py-8 md:py-12 lg:py-16",
  card: "p-3 sm:p-4 md:p-6 lg:p-8",
} as const

// Responsive font sizes
export const RESPONSIVE_TEXT = {
  h1: "text-2xl sm:text-3xl md:text-4xl lg:text-5xl",
  h2: "text-xl sm:text-2xl md:text-3xl lg:text-4xl",
  h3: "text-lg sm:text-xl md:text-2xl lg:text-3xl",
  body: "text-sm sm:text-base md:text-base lg:text-lg",
  small: "text-xs sm:text-sm md:text-sm lg:text-base",
} as const

// Responsive grid utilities
export const RESPONSIVE_GRID = {
  cols1: "grid-cols-1",
  cols2: "sm:grid-cols-2",
  cols3: "md:grid-cols-3",
  cols4: "lg:grid-cols-4",
  gap: "gap-3 sm:gap-4 md:gap-6 lg:gap-8",
} as const

// Media query helpers
export const mediaQueries = {
  mobile: "(max-width: 767px)",
  tablet: "(min-width: 768px) and (max-width: 1023px)",
  desktop: "(min-width: 1024px)",
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
} as const
