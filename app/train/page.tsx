import { DashboardShell } from "@/components/dashboard/shell"
import { LeftRail } from "@/components/dashboard/left-rail"
import { CFDashboard } from "@/components/dashboard/cf-dashboard"
import { RightRailToday } from "@/components/today/right-rail"

export default function TrainPage() {
  return (
    <main>
      <DashboardShell left={<LeftRail active="today" />} center={<CFDashboard />} right={<RightRailToday />} />
    </main>
  )
}
