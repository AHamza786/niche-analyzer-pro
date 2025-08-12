// Scheduler service for automated data updates
// In a production environment, this would integrate with a proper job queue system

export class SchedulerService {
  private intervals: Map<string, NodeJS.Timeout> = new Map()

  startScheduledUpdates() {
    // Daily BSR history updates at 2 AM
    this.scheduleDaily("bsr-history-update", "02:00", async () => {
      const { dataUpdateService } = await import("./data-update-service")
      await dataUpdateService.updateBSRHistory()
    })

    // Weekly full keyword analysis on Sundays at 3 AM
    this.scheduleWeekly("full-keyword-update", 0, "03:00", async () => {
      const { dataUpdateService } = await import("./data-update-service")
      await dataUpdateService.updateAllKeywords()
    })

    // Hourly metrics recalculation during business hours (9 AM - 6 PM)
    this.scheduleHourly("metrics-recalc", async () => {
      const hour = new Date().getHours()
      if (hour >= 9 && hour <= 18) {
        const { dataUpdateService } = await import("./data-update-service")
        await dataUpdateService.recalculateAllMetrics()
      }
    })

    console.log("Scheduled updates started")
  }

  stopScheduledUpdates() {
    this.intervals.forEach((interval, name) => {
      clearInterval(interval)
      console.log(`Stopped scheduled update: ${name}`)
    })
    this.intervals.clear()
  }

  private scheduleDaily(name: string, time: string, callback: () => Promise<void>) {
    const [hours, minutes] = time.split(":").map(Number)

    const scheduleNext = () => {
      const now = new Date()
      const scheduledTime = new Date()
      scheduledTime.setHours(hours, minutes, 0, 0)

      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1)
      }

      const timeUntilNext = scheduledTime.getTime() - now.getTime()

      const timeout = setTimeout(async () => {
        try {
          await callback()
        } catch (error) {
          console.error(`Scheduled update ${name} failed:`, error)
        }
        scheduleNext() // Schedule the next occurrence
      }, timeUntilNext)

      this.intervals.set(name, timeout as any)
    }

    scheduleNext()
  }

  private scheduleWeekly(name: string, dayOfWeek: number, time: string, callback: () => Promise<void>) {
    const [hours, minutes] = time.split(":").map(Number)

    const scheduleNext = () => {
      const now = new Date()
      const scheduledTime = new Date()
      scheduledTime.setHours(hours, minutes, 0, 0)

      const daysUntilTarget = (dayOfWeek - now.getDay() + 7) % 7
      if (daysUntilTarget === 0 && scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 7)
      } else {
        scheduledTime.setDate(scheduledTime.getDate() + daysUntilTarget)
      }

      const timeUntilNext = scheduledTime.getTime() - now.getTime()

      const timeout = setTimeout(async () => {
        try {
          await callback()
        } catch (error) {
          console.error(`Scheduled update ${name} failed:`, error)
        }
        scheduleNext()
      }, timeUntilNext)

      this.intervals.set(name, timeout as any)
    }

    scheduleNext()
  }

  private scheduleHourly(name: string, callback: () => Promise<void>) {
    const interval = setInterval(
      async () => {
        try {
          await callback()
        } catch (error) {
          console.error(`Scheduled update ${name} failed:`, error)
        }
      },
      60 * 60 * 1000,
    ) // Every hour

    this.intervals.set(name, interval)
  }
}

export const schedulerService = new SchedulerService()
