'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, Check, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { useReviews, useAppData } from '@/hooks/use-data'
import { getDayNumber, MonthlyReview, formatDate } from '@/lib/storage'

function createEmptyMonthlyReview(monthNumber: number): MonthlyReview {
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(1 + (monthNumber - 1) * 30)
  const endDate = new Date(startDate)
  endDate.setDate(startDate.getDate() + 29)

  return {
    monthNumber,
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
    identityShifts: '',
    achievements: '',
    mistakesAndCorrections: '',
    habitsBuilt: '',
    habitsBroken: '',
    nextMonthIntentions: '',
  }
}

export default function MonthlyReviewPage() {
  const currentMonthNumber = Math.ceil(getDayNumber() / 30)
  const [selectedMonth, setSelectedMonth] = React.useState(currentMonthNumber)
  const [saved, setSaved] = React.useState(false)
  const { data, loading, saveMonthlyReview, getMonthlyReview } = useReviews()
  const { data: appData } = useAppData()

  const [review, setReview] = React.useState<MonthlyReview>(
    createEmptyMonthlyReview(selectedMonth)
  )

  React.useEffect(() => {
    const existingReview = getMonthlyReview(selectedMonth)
    if (existingReview) {
      setReview(existingReview)
    } else {
      setReview(createEmptyMonthlyReview(selectedMonth))
    }
    setSaved(false)
  }, [selectedMonth, getMonthlyReview, data])

  const handleSave = () => {
    saveMonthlyReview(review)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateReview = (updates: Partial<MonthlyReview>) => {
    setReview(prev => ({ ...prev, ...updates }))
    setSaved(false)
  }

  // Calculate stats for this month
  const journalEntries = appData?.journals?.filter(j => {
    const entryDay = j.dayNumber
    const monthStart = (selectedMonth - 1) * 30 + 1
    const monthEnd = selectedMonth * 30
    return entryDay >= monthStart && entryDay <= monthEnd
  }) || []

  const daysInMonth = Math.min(30, Math.max(0, getDayNumber() - (selectedMonth - 1) * 30))
  const journalCompletion = daysInMonth > 0 ? Math.round((journalEntries.length / daysInMonth) * 100) : 0

  // Calculate habit completion from entries
  const habitCompletions = journalEntries.reduce((acc, entry) => {
    if (entry.workoutCompleted) acc++
    const prayerCount = Object.values(entry.prayers).filter(Boolean).length
    if (prayerCount >= 3) acc++
    if (entry.pagesRead > 0) acc++
    return acc
  }, 0)
  const possibleHabitCompletions = journalEntries.length * 3
  const habitCompletion = possibleHabitCompletions > 0 
    ? Math.round((habitCompletions / possibleHabitCompletions) * 100) 
    : 0

  const overallProgress = Math.round((daysInMonth / 30) * 100)

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
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Monthly Review</h1>
          <p className="text-muted-foreground">Analyze your progress and adjust your strategy</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setSelectedMonth(prev => Math.max(1, prev - 1))}
            disabled={selectedMonth <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex min-w-[120px] items-center justify-center rounded-md border border-border px-3 py-2">
            <span className="text-sm font-medium">Month {selectedMonth}</span>
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setSelectedMonth(prev => Math.min(6, prev + 1))}
            disabled={selectedMonth >= currentMonthNumber}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>Overall Progress</CardDescription>
            <CardTitle className="text-2xl font-bold">{overallProgress}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={overallProgress} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">{daysInMonth} of 30 days completed</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>Habit Completion Rate</CardDescription>
            <CardTitle className="text-2xl font-bold">{habitCompletion}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={habitCompletion} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">Based on journal entries</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>Journal Consistency</CardDescription>
            <CardTitle className="text-2xl font-bold">{journalCompletion}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={journalCompletion} className="h-2" />
            <p className="mt-2 text-xs text-muted-foreground">{journalEntries.length} entries this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Review Form */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Identity Shifts</CardTitle>
            <CardDescription>How has your identity evolved this month?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="What changes have you noticed in how you see yourself? What new beliefs have formed?"
              className="min-h-32 resize-none"
              value={review.identityShifts}
              onChange={(e) => updateReview({ identityShifts: e.target.value })}
            />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Achievements</CardTitle>
            <CardDescription>What did you accomplish this month?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="List your major accomplishments and milestones..."
              className="min-h-32 resize-none"
              value={review.achievements}
              onChange={(e) => updateReview({ achievements: e.target.value })}
            />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Mistakes & Corrections</CardTitle>
            <CardDescription>What went wrong and how will you fix it?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="What mistakes did you make? What corrections will you implement?"
              className="min-h-32 resize-none"
              value={review.mistakesAndCorrections}
              onChange={(e) => updateReview({ mistakesAndCorrections: e.target.value })}
            />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Habits Built</CardTitle>
            <CardDescription>What new habits have become automatic?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Which habits are now part of your routine?"
              className="min-h-32 resize-none"
              value={review.habitsBuilt}
              onChange={(e) => updateReview({ habitsBuilt: e.target.value })}
            />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Habits Broken</CardTitle>
            <CardDescription>What bad habits did you eliminate?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Which negative patterns have you successfully broken?"
              className="min-h-32 resize-none"
              value={review.habitsBroken}
              onChange={(e) => updateReview({ habitsBroken: e.target.value })}
            />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Next Month Intentions</CardTitle>
            <CardDescription>What are your goals for the coming month?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="What do you want to focus on and achieve next month?"
              className="min-h-32 resize-none"
              value={review.nextMonthIntentions}
              onChange={(e) => updateReview({ nextMonthIntentions: e.target.value })}
            />
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end sticky bottom-6">
        <Button onClick={handleSave} className="gap-2 shadow-lg">
          {saved ? (
            <>
              <Check className="h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Review
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
