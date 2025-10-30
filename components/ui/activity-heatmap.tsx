"use client"

export function ActivityHeatmap() {
  // Mock data for 12 weeks of activity
  const weeks = 12
  const daysPerWeek = 7
  
  // Generate random activity data (0-4 intensity)
  const generateActivityData = () => {
    const data = []
    for (let week = 0; week < weeks; week++) {
      const weekData = []
      for (let day = 0; day < daysPerWeek; day++) {
        weekData.push(Math.floor(Math.random() * 5))
      }
      data.push(weekData)
    }
    return data
  }

  const activityData = generateActivityData()

  const getColor = (intensity: number) => {
    if (intensity === 0) return "bg-muted/30"
    if (intensity === 1) return "bg-primary/20"
    if (intensity === 2) return "bg-primary/40"
    if (intensity === 3) return "bg-primary/60"
    return "bg-primary/80"
  }

  return (
    <div className="w-full">
      <div className="flex gap-1">
        {activityData.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((intensity, dayIndex) => (
              <div
                key={dayIndex}
                className={`w-3 h-3 rounded-sm ${getColor(intensity)}`}
                title={`Week ${weekIndex + 1}, Day ${dayIndex + 1}: ${intensity} activities`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs text-muted-foreground">Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted/30" />
          <div className="w-3 h-3 rounded-sm bg-primary/20" />
          <div className="w-3 h-3 rounded-sm bg-primary/40" />
          <div className="w-3 h-3 rounded-sm bg-primary/60" />
          <div className="w-3 h-3 rounded-sm bg-primary/80" />
        </div>
        <span className="text-xs text-muted-foreground">More</span>
      </div>
    </div>
  )
}