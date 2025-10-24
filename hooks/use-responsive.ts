"use client"

import { useState, useEffect } from "react"
import { MOBILE_BREAKPOINT } from "@/lib/responsive-utils"

export function useResponsive() {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [screenWidth, setScreenWidth] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setScreenWidth(width)
      setIsMobile(width < MOBILE_BREAKPOINT)
      setIsTablet(width >= MOBILE_BREAKPOINT && width < 1024)
      setIsDesktop(width >= 1024)
    }

    // Initial check
    handleResize()

    // Add listener
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenWidth,
  }
}
