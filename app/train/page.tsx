import { CFDashboard } from "@/components/dashboard/cf-dashboard"
import { RightRailToday } from "@/components/today/right-rail"

export default function TrainPage() {
  return (
    <main className="flex-1 flex">
      <div className="flex-1 p-6">
        <CFDashboard />
      </div>
      <div className="w-80 border-l bg-muted/30 p-6">
        <RightRailToday />
      </div>
    </main>
  )
}
