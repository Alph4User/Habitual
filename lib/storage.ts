// Types for the 180-Day Discipline OS

export interface JournalEntry {
  date: string // ISO date string YYYY-MM-DD
  dayNumber: number
  
  // Metadata
  wakeUpTime: string
  sleepTime: string
  
  // Spiritual
  prayers: {
    fajr: boolean
    dhuhr: boolean
    asr: boolean
    maghrib: boolean
    isha: boolean
  }
  quranPages: number
  dhikrDua: string
  spiritualReflection: string
  
  // Physical
  weight: number | null
  workoutCompleted: boolean
  workoutDetails: string
  waterIntake: number
  meals: {
    breakfast: string
    lunch: string
    dinner: string
  }
  
  // Mental
  bookTitle: string
  pagesRead: number
  learningSummary: string
  
  // Financial
  moneyEarned: number
  moneySpent: number
  financialLesson: string
  
  // Character & Discipline
  scores: {
    discipline: number
    focus: number
    patience: number
    productivity: number
    integrity: number
  }
  keptAllPromises: boolean
  
  // Reflection
  topPriorityTomorrow: string
  gratitude: [string, string, string]
  winsOfDay: string
  lessonsLearned: string
  improvementPlan: string
  
  // Pillar scores (calculated or manual)
  pillarScores: {
    spiritual: number
    physical: number
    mental: number
    financial: number
    character: number
  }
}

export interface WeeklyReview {
  weekNumber: number
  startDate: string
  endDate: string
  consistency: boolean
  whatImproved: string
  whatFailed: string
  biggestLesson: string
  pillarNotes: {
    spiritual: string
    physical: string
    mental: string
    financial: string
    character: string
  }
  nextWeekFocus: string
}

export interface MonthlyReview {
  monthNumber: number
  startDate: string
  endDate: string
  identityShifts: string
  achievements: string
  mistakesAndCorrections: string
  habitsBuilt: string
  habitsBroken: string
  nextMonthIntentions: string
}

export interface HabitMatrix {
  weekNumber: number
  startDate: string
  habits: {
    [key: string]: boolean[] // 7 days per habit
  }
}

export interface Goals {
  spiritual: string
  physical: string
  mental: string
  financial: string
  character: string
  relationship: string
  startDate: string
}

export interface HabitDefinition {
  id: string
  label: string
  icon: string
  /** 'build' = a good habit to do; 'quit' = a bad habit to stay away from */
  kind?: 'build' | 'quit'
}

// The 10 commitments. Ids for prayer/reading/workout/sleep are kept from the
// original defaults so existing history still lines up.
export const DEFAULT_HABITS: HabitDefinition[] = [
  { id: 'prayer', label: 'Prayed all 5 Swalah', icon: '🕌', kind: 'build' },
  { id: 'quran', label: 'Read Quran', icon: '📖', kind: 'build' },
  { id: 'reading', label: 'Read & studied', icon: '📚', kind: 'build' },
  { id: 'workout', label: 'Went to the gym', icon: '💪', kind: 'build' },
  { id: 'sleep', label: 'Slept on time', icon: '😴', kind: 'build' },
  { id: 'clean-house', label: 'Kept the house clean', icon: '🧹', kind: 'build' },
  { id: 'priority', label: 'Did my top priority first', icon: '🎯', kind: 'build' },
  { id: 'moderate-eating', label: 'Ate in moderation', icon: '🍽️', kind: 'quit' },
  { id: 'boundaries', label: 'Protected my time', icon: '🛑', kind: 'quit' },
  { id: 'zinaa', label: 'Stayed away from Zinaa', icon: '🛡️', kind: 'quit' },
]

export const DEFAULT_BEDTIME = '22:30'

export interface AppData {
  goals: Goals | null
  habits?: HabitDefinition[] // custom habit list; falls back to DEFAULT_HABITS
  bedtimeTarget?: string // HH:mm; 'Slept on time' is ticked when sleepTime is at or before this
  journals: JournalEntry[]
  weeklyReviews: WeeklyReview[]
  monthlyReviews: MonthlyReview[]
  habitMatrix: HabitMatrix[]
}

const STORAGE_KEY = '180-day-discipline-os'

export function getStoredData(): AppData {
  if (typeof window === 'undefined') {
    return {
      goals: null,
      journals: [],
      weeklyReviews: [],
      monthlyReviews: [],
      habitMatrix: [],
    }
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Error reading from localStorage:', e)
  }
  
  return {
    goals: null,
    journals: [],
    weeklyReviews: [],
    monthlyReviews: [],
    habitMatrix: [],
  }
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Error saving to localStorage:', e)
  }
}

export function exportData(): string {
  const data = getStoredData()
  return JSON.stringify(data, null, 2)
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as AppData
    saveData(data)
    return true
  } catch (e) {
    console.error('Error importing data:', e)
    return false
  }
}

export function resetAllData(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export function getStartDate(): Date {
  const data = getStoredData()
  if (data.goals?.startDate) {
    return parseLocalDate(data.goals.startDate)
  }
  return new Date()
}

export function getDayNumber(date: Date = new Date()): number {
  const data = getStoredData()
  if (!data.goals?.startDate) return 1
  
  const startDate = parseLocalDate(data.goals.startDate)
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((day.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return Math.max(1, Math.min(180, diffDays))
}

// Local-time YYYY-MM-DD (toISOString would use UTC and shift the date
// for users ahead of UTC, e.g. 00:00-03:00 in Nairobi became "yesterday")
export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// Parse a YYYY-MM-DD string as a local date (new Date('YYYY-MM-DD') is UTC)
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('T')[0].split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export function getHabits(data: AppData = getStoredData()): HabitDefinition[] {
  return data.habits ?? DEFAULT_HABITS
}

export function saveHabits(habits: HabitDefinition[]): void {
  const data = getStoredData()
  saveData({ ...data, habits })
}

export function getJournalEntry(date: string): JournalEntry | undefined {
  const data = getStoredData()
  return data.journals.find(j => j.date === date)
}

export function saveJournalEntry(entry: JournalEntry): void {
  const data = getStoredData()
  const existingIndex = data.journals.findIndex(j => j.date === entry.date)
  
  if (existingIndex >= 0) {
    data.journals[existingIndex] = entry
  } else {
    data.journals.push(entry)
  }
  
  applyJournalToHabits(data, entry)
  saveData(data)
}

// ---- Habit check-ins by date ----

const emptyDays = () => [false, false, false, false, false, false, false]

/** Monday (local) of the week containing `date`, plus the weekday index 0=Mon..6=Sun */
function weekSlot(dateStr: string): { monday: string; index: number } {
  const d = parseLocalDate(dateStr)
  const index = (d.getDay() + 6) % 7
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - index)
  return { monday: formatDate(monday), index }
}

export function isHabitDone(data: AppData, dateStr: string, habitId: string): boolean {
  const { monday, index } = weekSlot(dateStr)
  const week = data.habitMatrix.find(w => w.startDate === monday)
  return !!week?.habits[habitId]?.[index]
}

/** Mutates `data` (does not save) */
export function setHabitDoneIn(data: AppData, dateStr: string, habitId: string, done: boolean): void {
  const { monday, index } = weekSlot(dateStr)
  let week = data.habitMatrix.find(w => w.startDate === monday)
  if (!week) {
    week = { weekNumber: Math.ceil(getDayNumber(parseLocalDate(monday)) / 7), startDate: monday, habits: {} }
    data.habitMatrix.push(week)
  }
  const days = week.habits[habitId] ? [...week.habits[habitId]] : emptyDays()
  days[index] = done
  week.habits[habitId] = days
}

export function setHabitDone(dateStr: string, habitId: string, done: boolean): AppData {
  const data = getStoredData()
  setHabitDoneIn(data, dateStr, habitId, done)
  saveData(data)
  return data
}

/** Minutes after noon-of-the-day, so 23:00 < 00:30 < 02:00 (after-midnight times count as late) */
function nightMinutes(time: string): number | null {
  const m = /^(\d{1,2}):(\d{2})/.exec(time)
  if (!m) return null
  const mins = Number(m[1]) * 60 + Number(m[2])
  return mins < 12 * 60 ? mins + 24 * 60 : mins
}

export function sleptOnTime(sleepTime: string, target: string = DEFAULT_BEDTIME): boolean {
  const slept = nightMinutes(sleepTime)
  const goal = nightMinutes(target)
  return slept !== null && goal !== null && slept <= goal
}

/**
 * Tick commitments the journal already proves. Only ever ticks (never unticks),
 * so a manual check-in is not undone by an unrelated journal edit.
 */
export function applyJournalToHabits(data: AppData, entry: JournalEntry): void {
  const habitIds = new Set(getHabits(data).map(h => h.id))
  const proofs: Record<string, boolean> = {
    prayer: Object.values(entry.prayers).every(Boolean),
    quran: entry.quranPages > 0,
    reading: entry.pagesRead > 0,
    workout: entry.workoutCompleted,
    sleep: sleptOnTime(entry.sleepTime, data.bedtimeTarget || DEFAULT_BEDTIME),
  }
  for (const [id, proven] of Object.entries(proofs)) {
    if (proven && habitIds.has(id) && !isHabitDone(data, entry.date, id)) {
      setHabitDoneIn(data, entry.date, id, true)
    }
  }
}

export function createEmptyJournalEntry(date: string, dayNumber: number): JournalEntry {
  return {
    date,
    dayNumber,
    wakeUpTime: '',
    sleepTime: '',
    prayers: {
      fajr: false,
      dhuhr: false,
      asr: false,
      maghrib: false,
      isha: false,
    },
    quranPages: 0,
    dhikrDua: '',
    spiritualReflection: '',
    weight: null,
    workoutCompleted: false,
    workoutDetails: '',
    waterIntake: 0,
    meals: {
      breakfast: '',
      lunch: '',
      dinner: '',
    },
    bookTitle: '',
    pagesRead: 0,
    learningSummary: '',
    moneyEarned: 0,
    moneySpent: 0,
    financialLesson: '',
    scores: {
      discipline: 5,
      focus: 5,
      patience: 5,
      productivity: 5,
      integrity: 5,
    },
    keptAllPromises: false,
    topPriorityTomorrow: '',
    gratitude: ['', '', ''],
    winsOfDay: '',
    lessonsLearned: '',
    improvementPlan: '',
    pillarScores: {
      spiritual: 0,
      physical: 0,
      mental: 0,
      financial: 0,
      character: 0,
    },
  }
}

// Calculate pillar scores based on entry data
export function calculatePillarScores(entry: JournalEntry): JournalEntry['pillarScores'] {
  // Spiritual: prayers (5 max) + quran pages (max 5) + has reflection (1)
  const prayerCount = Object.values(entry.prayers).filter(Boolean).length
  const quranScore = Math.min(entry.quranPages / 2, 5) // 10 pages = max score
  const reflectionScore = entry.spiritualReflection ? 1 : 0
  const spiritual = Math.round(((prayerCount + quranScore + reflectionScore) / 11) * 10)
  
  // Physical: workout (4) + water (3 if >= 2L) + logged meals (3)
  const workoutScore = entry.workoutCompleted ? 4 : 0
  const waterScore = entry.waterIntake >= 2 ? 3 : entry.waterIntake >= 1 ? 1.5 : 0
  const mealsLogged = [entry.meals.breakfast, entry.meals.lunch, entry.meals.dinner].filter(Boolean).length
  const physical = Math.round(((workoutScore + waterScore + mealsLogged) / 10) * 10)
  
  // Mental: pages read (max 5 for 50 pages) + has summary (3) + has book (2)
  const readingScore = Math.min(entry.pagesRead / 10, 5)
  const summaryScore = entry.learningSummary ? 3 : 0
  const bookScore = entry.bookTitle ? 2 : 0
  const mental = Math.round(((readingScore + summaryScore + bookScore) / 10) * 10)
  
  // Financial: earned > 0 (3) + spent tracked (2) + saved (3) + lesson (2)
  const earnedScore = entry.moneyEarned > 0 ? 3 : 0
  const spentScore = entry.moneySpent >= 0 ? 2 : 0
  const savedScore = entry.moneyEarned - entry.moneySpent > 0 ? 3 : 0
  const lessonScore = entry.financialLesson ? 2 : 0
  const financial = Math.round(((earnedScore + spentScore + savedScore + lessonScore) / 10) * 10)
  
  // Character: average of 5 sliders + promises
  const avgScore = Object.values(entry.scores).reduce((a, b) => a + b, 0) / 5
  const promiseScore = entry.keptAllPromises ? 1 : 0
  const character = Math.round(((avgScore + promiseScore) / 11) * 10)
  
  return { spiritual, physical, mental, financial, character }
}
