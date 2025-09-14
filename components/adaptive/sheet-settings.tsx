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
  snoozeMinutes: number
  onSnoozeMinutesChange: (m: number) => void
  srMode: SRMode
  onSrModeChange: (m: SRMode) => void
}) {
  const [open, setOpen] = useState(false)

  const snoozeOptions = [15, 60, 240, 1440] // 15m, 1h, 4h, 1d

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
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Snooze duration</DropdownMenuLabel>
        {snoozeOptions.map((m) => (
          <DropdownMenuItem key={m} onClick={() => onSnoozeMinutesChange(m)}>
            {m < 60 ? `${m} minutes` : m < 1440 ? `${m / 60} hours` : `${m / 1440} day`}
            {m === snoozeMinutes ? " •" : ""}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
