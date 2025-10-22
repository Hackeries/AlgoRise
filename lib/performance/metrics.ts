// Performance monitoring utilities
export class PerformanceMetrics {
  private metrics = new Map<string, number[]>()

  mark(name: string) {
    performance.mark(name)
  }

  measure(name: string, startMark: string, endMark: string) {
    try {
      performance.measure(name, startMark, endMark)
      const measure = performance.getEntriesByName(name)[0]
      if (measure) {
        const times = this.metrics.get(name) || []
        times.push(measure.duration)
        this.metrics.set(name, times)
        return measure.duration
      }
    } catch (error) {
      console.error("Performance measurement failed:", error)
    }
    return 0
  }

  getMetrics(name: string) {
    const times = this.metrics.get(name) || []
    if (times.length === 0) return null

    return {
      count: times.length,
      avg: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
    }
  }

  clear() {
    this.metrics.clear()
    performance.clearMarks()
    performance.clearMeasures()
  }
}

export const metrics = new PerformanceMetrics()
