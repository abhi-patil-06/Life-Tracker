import { relKey, todayKey } from "./dateHelpers"

export const isDueToday = (habit) => {
  if (habit.active === false) return false
  if (!habit.days || habit.days.length === 0) return true
  return habit.days.includes(new Date().getDay())
}

export const isDueOnDate = (habit, date) => {
  if (habit.active === false) return false
  if (!habit.days || habit.days.length === 0) return true
  return habit.days.includes(date.getDay())
}

// Overall streak: consecutive days where ANY habit was completed
export const calcOverallStreak = (habits) => {
  const active = habits.filter(h => h.active !== false)
  if (!active.length) return 0

  let streak = 0
  let day    = 0

  while (day <= 365) {
    const key     = relKey(-day)
    const anyDone = active.some(h => h.completedDates.includes(key))

    if (day === 0) {
      // Today: only count if at least one done; if not started, still check yesterday
      if (anyDone) { streak++; day++; continue }
      else { day++; continue } // start from yesterday
    }

    if (!anyDone) break
    streak++
    day++
  }

  return streak
}

// Per-habit streak
export const calcHabitStreak = (habit) => {
  let streak = 0
  let day    = 0
  const today = todayKey()

  // If completed today, start counting from today
  if (habit.completedDates.includes(today)) {
    streak = 1
    day    = 1
  } else {
    day = 1 // start from yesterday
  }

  while (day <= 365) {
    const key = relKey(-day)
    if (!habit.completedDates.includes(key)) break
    streak++
    day++
  }

  return streak
}

// Completion rate for a habit (last N days it was supposed to be done)
export const calcHabitCompletionRate = (habit, days = 30) => {
  let due  = 0
  let done = 0

  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)

    if (isDueOnDate(habit, d)) {
      due++
      const key = relKey(-i)
      if (habit.completedDates.includes(key)) done++
    }
  }

  return due === 0 ? 0 : Math.round((done / due) * 100)
}

// Weekly data for bar chart (last 7 days)
export const getWeekData = (habits) => {
  const active = habits.filter(h => h.active !== false)
  if (!active.length) return Array.from({ length: 7 }, (_, i) => ({ pct: 0, dayIndex: i }))

  return Array.from({ length: 7 }, (_, i) => {
    const offset = -(6 - i)
    const key    = relKey(offset)
    const d      = new Date(); d.setDate(d.getDate() + offset)
    const due    = active.filter(h => isDueOnDate(h, d))
    const done   = due.filter(h => h.completedDates.includes(key))
    return {
      pct:      due.length ? Math.round((done.length / due.length) * 100) : 0,
      dayIndex: d.getDay(),
    }
  })
}

// Heatmap data (last N days)
export const getHeatmapData = (habits, days = 91) => {
  const active = habits.filter(h => h.active !== false)

  return Array.from({ length: days }, (_, i) => {
    const offset = -(days - 1 - i)
    const key    = relKey(offset)
    const d      = new Date(); d.setDate(d.getDate() + offset)
    const due    = active.filter(h => isDueOnDate(h, d))
    const done   = due.filter(h => h.completedDates.includes(key))
    const ratio  = due.length ? done.length / due.length : 0
    return { key, ratio, date: d }
  })
}

// Category breakdown
export const getCategoryStats = (habits, days = 30) => {
  const counts = {}
  habits.filter(h => h.active !== false).forEach(h => {
    const done = h.completedDates.filter(d => {
      const date = new Date(d)
      const diff = Math.floor((new Date() - date) / 86400000)
      return diff < days
    }).length
    counts[h.category] = (counts[h.category] || { done: 0, total: 0 })
    counts[h.category].done  += done
    counts[h.category].total += days
  })
  return counts
}

// Best and worst habit
export const getBestWorstHabits = (habits, days = 30) => {
  const rated = habits
    .filter(h => h.active !== false)
    .map(h => ({ habit: h, rate: calcHabitCompletionRate(h, days) }))
    .sort((a, b) => b.rate - a.rate)

  return {
    best:  rated[0]  ?? null,
    worst: rated[rated.length - 1] ?? null,
  }
}
