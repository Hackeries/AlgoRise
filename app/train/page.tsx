import { DashboardShell } from "@/components/dashboard/shell"
import { LeftRail } from "@/components/dashboard/left-rail"
import { TodayContent } from "@/components/today/today-content"
import { RightRailToday } from "@/components/today/right-rail"

export default function TrainPage() {
  return (
    <main>
      <DashboardShell left={<LeftRail active="today" />} center={<TodayContent />} right={<RightRailToday />} />
    </main>
  )
}
