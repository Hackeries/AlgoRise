"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { AppError } from "@/lib/error/error-handler"

interface ErrorToastProps {
  error: Error | AppError | null
  onDismiss?: () => void
}

export function ErrorToast({ error, onDismiss }: ErrorToastProps) {
  const { toast } = useToast()

  useEffect(() => {
    if (!error) return

    const message = error instanceof Error ? error.message : "An error occurred"
    const title = error instanceof AppError ? error.code : "Error"

    toast({
      title,
      description: message,
      variant: "destructive",
      onOpenChange: (open) => {
        if (!open) onDismiss?.()
      },
    })
  }, [error, toast, onDismiss])

  return null
}
