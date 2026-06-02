'use client'

import * as React from 'react'
import { format, startOfWeek, addDays } from 'date-fns'
import { ChevronLeft, ChevronRight, Check, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useHabitMatrix } from '@/hooks/use-data'
import { getDayNumber, formatDate, getStoredData, saveData, HabitMatrix } from '@/lib/storage'

const DEFAULT_HABITS = [
  { id: 'prayer', label: 'Prayer (5x daily)', icon: '🕌' },
  { id: 'workout', label: 'Workout', icon: '💪' },
  { id: 'reading', label: 'Reading / Learning', icon: '📚' },
  { id: 'savings', label: 'Savings', icon: '💰' },
  { id: 'journaling', label: 'Journaling', icon: '📝' },
  { id: 'sleep', label: 'Sleep Discipline', icon: '😴' },
]

export default function HabitsPage() {
  const [currentWeekOffset, setCurrentWeekOffset] = React.useState(0)
  const { data, loading, updateHabitMatrix } = useHabitMatrix()

  const today = React.useMemo(() => new Date(), [])
  const currentWeekStart = React.useMemo(
    () => startOfWeek(addDays(today, currentWeekOffset * 7), { weekStartsOn: 1 }),
    [today, currentWeekOffset]
  )
  const weekNumber = Math.ceil(getDayNumber() / 7)
  const displayWeekNumber = weekNumber + currentWeekOffset
  const currentWeekStartStr = formatDate(currentWeekStart)

  const weekDays = React.useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i)),
    [currentWeekStart]
  )

  // Get or create habit matrix for this week
  const getWeekMatrix = React.useCallback((): HabitMatrix => {
    if (!data) {
      return {
        weekNumber: displayWeekNumber,
        startDate: currentWeekStartStr,
        habits: DEFAULT_HABITS.reduce((acc, habit) => {
          acc[habit.id] = [false, false, false, false, false, false, false]
          return acc
        }, {} as Record<string, boolean[]>),
      }
    }

    const existing = data.habitMatrix.find(h => h.weekNumber === displayWeekNumber)
    if (existing) return existing

    return {
      weekNumber: displayWeekNumber,
      startDate: currentWeekStartStr,
      habits: DEFAULT_HABITS.reduce((acc, habit) => {
        acc[habit.id] = [false, false, false, false, false, false, false]
        return acc
      }, {} as Record<string, boolean[]>),
    }
  }, [data, displayWeekNumber, currentWeekStartStr])

  const [matrix, setMatrix] = React.useState<HabitMatrix>(() => getWeekMatrix())

  React.useEffect(() => {
    setMatrix(getWeekMatrix())
  }, [currentWeekOffset, data]) // Only re-run when week changes or data loads

  const toggleHabit = (habitId: string, dayIndex: number) => {
    const newMatrix = {
      ...matrix,
      habits: {
        ...matrix.habits,
        [habitId]: matrix.habits[habitId].map((val, idx) =>
          idx === dayIndex ? !val : val
        ),
      },
    }
    setMatrix(newMatrix)
    updateHabitMatrix(newMatrix)
  }

  const resetWeek = () => {
    const newMatrix = {
      ...matrix,
      habits: DEFAULT_HABITS.reduce((acc, habit) => {
        acc[habit.id] = [false, false, false, false, false, false, false]
        return acc
      }, {} as Record<string, boolean[]>),
    }
    setMatrix(newMatrix)
    updateHabitMatrix(newMatrix)
  }

  // Calculate stats
  const totalChecks = Object.values(matrix.habits).flat().filter(Boolean).length
  const totalPossible = DEFAULT_HABITS.length * 7
  const completionPercent = Math.round((totalChecks / totalPossible) * 100)

  // Calculate per-habit stats
  const habitStats = DEFAULT_HABITS.map(habit => {
    const completed = matrix.habits[habit.id]?.filter(Boolean).length || 0
    return { ...habit, completed, percent: Math.round((completed / 7) * 100) }
  })

  const todayStr = formatDate(today)
  const isCurrentWeek = currentWeekOffset === 0

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Habit Matrix</h1>
          <p className="text-muted-foreground">Track your daily habits and build consistency</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setCurrentWeekOffset(prev => prev - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex min-w-[160px] items-center justify-center gap-2 rounded-md border border-border px-3 py-2">
            <span className="text-sm font-medium">Week {displayWeekNumber}</span>
            <span className="text-xs text-muted-foreground">
              {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d')}
            </span>
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setCurrentWeekOffset(prev => prev + 1)}
            disabled={currentWeekOffset >= 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {isCurrentWeek && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetWeek}
              className="ml-2 gap-2"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Week Progress */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Weekly Completion</span>
            <span className="text-sm text-muted-foreground">{totalChecks}/{totalPossible} ({completionPercent}%)</span>
          </div>
          <Progress value={completionPercent} className="h-2" />
        </CardContent>
      </Card>

      {/* Habit Matrix Grid */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Weekly Tracking</CardTitle>
          <CardDescription>Click to toggle completion status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Header Row */}
              <div className="grid grid-cols-[1fr_repeat(7,_minmax(50px,_1fr))] gap-2 mb-4">
                <div className="text-sm font-medium text-muted-foreground">Habit</div>
                {weekDays.map((day, idx) => {
                  const isToday = formatDate(day) === formatDate(today)
                  return (
                    <div 
                      key={idx} 
                      className={cn(
                        "text-center text-sm font-medium",
                        isToday ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      <div>{format(day, 'EEE')}</div>
                      <div className={cn(
                        "text-xs mt-0.5",
                        isToday && "bg-primary text-primary-foreground rounded-full w-6 h-6 mx-auto flex items-center justify-center"
                      )}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Habit Rows */}
              {DEFAULT_HABITS.map((habit) => (
                <div 
                  key={habit.id}
                  className="grid grid-cols-[1fr_repeat(7,_minmax(50px,_1fr))] gap-2 py-3 border-t border-border/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{habit.icon}</span>
                    <span className="text-sm font-medium">{habit.label}</span>
                  </div>
                  {weekDays.map((day, dayIdx) => {
                    const isCompleted = matrix.habits[habit.id]?.[dayIdx] || false
                    const isToday = formatDate(day) === formatDate(today)
                    const isPast = day < new Date(new Date().setHours(0, 0, 0, 0))
                    const isFuture = day > new Date()
                    
                    return (
                      <div key={dayIdx} className="flex justify-center">
                        <button
                          onClick={() => !isFuture && toggleHabit(habit.id, dayIdx)}
                          disabled={isFuture}
                          className={cn(
                            "h-10 w-10 rounded-lg border-2 transition-all duration-200 flex items-center justify-center",
                            isCompleted 
                              ? "bg-primary border-primary text-primary-foreground"
                              : isPast && !isCompleted
                                ? "bg-destructive/10 border-destructive/30 text-destructive/50"
                                : "bg-muted/30 border-border hover:border-primary/50 hover:bg-muted/50",
                            isToday && !isCompleted && "ring-2 ring-primary/30",
                            isFuture && "opacity-30 cursor-not-allowed"
                          )}
                        >
                          {isCompleted && <Check className="h-5 w-5" />}
                        </button>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-Habit Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {habitStats.map((habit) => (
          <Card key={habit.id} className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{habit.icon}</span>
                  <span className="text-sm font-medium">{habit.label}</span>
                </div>
                <span className="text-sm font-bold tabular-nums">{habit.completed}/7</span>
              </div>
              <Progress 
                value={habit.percent} 
                className={cn(
                  "h-2",
                  habit.percent === 100 && "[&>div]:bg-emerald-500",
                  habit.percent >= 70 && habit.percent < 100 && "[&>div]:bg-amber-500",
                  habit.percent < 70 && "[&>div]:bg-primary"
                )}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                {habit.percent === 100 
                  ? "Perfect week!" 
                  : habit.percent >= 70 
                    ? "Great progress!" 
                    : "Keep going!"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
