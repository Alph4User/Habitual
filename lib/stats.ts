import { addDays, format, startOfWeek } from 'date-fns'
import { AppData, HabitDefinition, formatDate, getHabits, parseLocalDate } from '@/lib/storage'

export const TOTAL_DAYS = 180

export type PillarKey = 'spiritual' | 'physical' | 'mental' | 'financial' | 'character'

export const PILLARS: { key: PillarKey; label: string }[] = [
  { key: 'spiritual', label: 'Spiritual' },
  { key: 'physical', label: 'Physical' },
  { key: 'mental', label: 'Mental' },
  { key: 'financial', label: 'Financial' },
  { key: 'character', label: 'Character' },
]

/** Map of YYYY-MM-DD -> number of habits checked that day */
export function habitChecksByDate(data: AppData): Map<string, number> {
  const byDate = new Map<string, number>()
  for (const week of data.habitMatrix) {
    const monday = parseLocalDate(week.startDate)
    for (const days of Object.values(week.habits)) {
      days.forEach((done, i) => {
        if (!done) return
        const key = formatDate(addDays(monday, i))
        byDate.set(key, (byDate.get(key) ?? 0) + 1)
      })
    }
  }
  return byDate
}

/** Dates on which the user did something: wrote a journal entry or checked a habit */
export function activeDates(data: AppData): Set<string> {
  const dates = new Set<string>(data.journals.map(j => j.date))
  for (const [date, count] of habitChecksByDate(data)) if (count > 0) dates.add(date)
  return dates
}

/**
 * Consecutive active days ending today. If today has no activity yet,
 * the streak still counts up to yesterday (it isn't broken until the day ends).
 */
export function currentStreak(data: AppData, today: Date = new Date()): number {
  const active = activeDates(data)
  let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (!active.has(formatDate(cursor))) cursor = addDays(cursor, -1)
  let streak = 0
  while (active.has(formatDate(cursor))) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}

export function longestStreak(data: AppData): number {
  const dates = [...activeDates(data)].sort()
  let best = 0
  let run = 0
  let prev: string | null = null
  for (const d of dates) {
    run = prev && formatDate(addDays(parseLocalDate(prev), 1)) === d ? run + 1 : 1
    best = Math.max(best, run)
    prev = d
  }
  return best
}

export function totalHabitCompletions(data: AppData): number {
  let total = 0
  for (const count of habitChecksByDate(data).values()) total += count
  return total
}

/** Average of the five pillar scores (each 0-10) */
export function dailyScore(p: Record<PillarKey, number>): number {
  return Math.round(((p.spiritual + p.physical + p.mental + p.financial + p.character) / 5) * 10) / 10
}

/** One point per day for the last `days` days; null where nothing was logged */
export function dailyScoreSeries(data: AppData, days = 30, today: Date = new Date()) {
  const byDate = new Map(data.journals.map(j => [j.date, j]))
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(today, i - days + 1)
    const entry = byDate.get(formatDate(date))
    return {
      date: format(date, 'MMM d'),
      score: entry ? dailyScore(entry.pillarScores) : null,
    }
  })
}

/** Average of each pillar across the last `days` days of journal entries */
export function pillarAverages(data: AppData, days = 30, today: Date = new Date()) {
  const from = formatDate(addDays(today, -days + 1))
  const to = formatDate(today)
  const recent = data.journals.filter(j => j.date >= from && j.date <= to)
  return PILLARS.map(({ key, label }) => ({
    pillar: label,
    score: recent.length
      ? Math.round((recent.reduce((s, j) => s + (j.pillarScores?.[key] ?? 0), 0) / recent.length) * 10) / 10
      : 0,
  }))
}

/** Habit completion % for each of the last `weeks` calendar weeks (Mon-Sun) */
export function weeklyHabitCompletion(data: AppData, weeks = 8, today: Date = new Date()) {
  const habits: HabitDefinition[] = getHabits(data)
  const thisMonday = startOfWeek(today, { weekStartsOn: 1 })
  return Array.from({ length: weeks }, (_, i) => {
    const monday = addDays(thisMonday, (i - weeks + 1) * 7)
    const week = data.habitMatrix.find(w => w.startDate === formatDate(monday))
    // For the current week, only count days that have started
    const elapsed =
      i === weeks - 1 ? Math.min(7, Math.floor((today.getTime() - monday.getTime()) / 86400000) + 1) : 7
    const done = week
      ? habits.reduce((s, h) => s + (week.habits[h.id]?.slice(0, elapsed).filter(Boolean).length ?? 0), 0)
      : 0
    const possible = habits.length * elapsed
    return {
      week: format(monday, 'MMM d'),
      percent: possible ? Math.min(100, Math.round((done / possible) * 100)) : 0,
    }
  })
}
