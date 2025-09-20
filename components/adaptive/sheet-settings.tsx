"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type SRMode = "standard" | "aggressive"

export function SheetSettings({
  snoozeMinutes,
  onSnoozeMinutesChange,
  srMode,
  onSrModeChange,
}: {
  snoozeMinutes?: number
  onSnoozeMinutesChange?: (m: number) => void
  srMode: SRMode
  onSrModeChange: (m: SRMode) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Sheet settings">
          Settings
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel>Spaced repetition</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => onSrModeChange("standard")}
          aria-checked={srMode === "standard"}
          role="menuitemradio"
        >
          {srMode === "standard" ? "• " : ""} Standard
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSrModeChange("aggressive")}
          aria-checked={srMode === "aggressive"}
          role="menuitemradio"
        >
          {srMode === "aggressive" ? "• " : ""} Aggressive
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}
