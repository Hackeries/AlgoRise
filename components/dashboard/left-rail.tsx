"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"

const items = [
  { href: "/train", label: "Today", key: "today" },
  { href: "/adaptive-sheet", label: "Adaptive Sheet", key: "sheet" },
  { href: "/contests", label: "Contests", key: "contests" },
  { href: "/analytics", label: "Analytics", key: "analytics" },
  { href: "/groups", label: "Groups", key: "groups" },
  { href: "/visualizers", label: "Visualizers", key: "visualizers" },
]

export function LeftRail({ active }: { active?: string }) {
  return (
    <nav className="rounded-lg border bg-card p-2 text-sm">
      <ul className="flex flex-col">
        {items.map((it) => {
          const isActive = active === it.key
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="truncate">{it.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
