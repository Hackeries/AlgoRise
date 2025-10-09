"use client"

import type { ReactNode } from "react"

export const ToastContainer = (_props: { children?: ReactNode }) => null

type Fn = (..._args: any[]) => void
export const toast: Fn & {
  success: Fn
  error: Fn
  info: Fn
  warn: Fn
  dismiss: Fn
} = Object.assign(() => {}, {
  success: () => {},
  error: () => {},
  info: () => {},
  warn: () => {},
  dismiss: () => {},
})
