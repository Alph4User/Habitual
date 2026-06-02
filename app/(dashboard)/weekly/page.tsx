'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight, Check, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useReviews } from '@/hooks/use-data'
import { getDayNumber, WeeklyReview, formatDate } from '@/lib/storage'

const PILLAR_LABELS = [
  { key: 'spiritual', label: 'Spiritual', color: 'text-emerald-500' },
  { key: 'physical', label: 'Physical', color: 'text-orange-500' },
  { key: 'mental', label: 'Mental', color: 'text-blue-500' },
  { key: 'financial', label: 'Financial', color: 'text-green-500' },
  { key: 'character', label: 'Character', color: 'text-purple-500' },
] as const

function createEmptyWeeklyReview(weekNumber: number): WeeklyReview {
  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay() + 1 + (weekNumber - Math.ceil(getDayNumber() / 7)) * 7)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

  return {
    weekNumber,
    startDate: formatDate(startOfWeek),
    endDate: formatDate(endOfWeek),
    consistency: false,
    whatImproved: '',
    whatFailed: '',
    biggestLesson: '',
    pillarNotes: {
      spiritual: '',
      physical: '',
      mental: '',
      financial: '',
      character: '',
    },
    nextWeekFocus: '',
  }
}

export default function WeeklyReviewPage() {
  const currentWeekNumber = Math.ceil(getDayNumber() / 7)
  const [selectedWeek, setSelectedWeek] = React.useState(currentWeekNumber)
  const [saved, setSaved] = React.useState(false)
  const { data, loading, saveWeeklyReview, getWeeklyReview } = useReviews()

  const [review, setReview] = React.useState<WeeklyReview>(
    createEmptyWeeklyReview(selectedWeek)
  )

  React.useEffect(() => {
    const existingReview = getWeeklyReview(selectedWeek)
    if (existingReview) {
      setReview(existingReview)
    } else {
      setReview(createEmptyWeeklyReview(selectedWeek))
    }
    setSaved(false)
  }, [selectedWeek, getWeeklyReview, data])

  const handleSave = () => {
    saveWeeklyReview(review)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateReview = (updates: Partial<WeeklyReview>) => {
    setReview(prev => ({ ...prev, ...updates }))
    setSaved(false)
  }

  const updatePillarNote = (pillar: keyof WeeklyReview['pillarNotes'], value: string) => {
    setReview(prev => ({
      ...prev,
      pillarNotes: { ...prev.pillarNotes, [pillar]: value },
    }))
    setSaved(false)
  }

  // Only allow review days (Day 7, 14, 21, etc.) or any past week
  const isReviewDay = getDayNumber() % 7 === 0 || selectedWeek < currentWeekNumber

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
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Weekly Review</h1>
          <p className="text-muted-foreground">Reflect on your week and set intentions for the next one</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setSelectedWeek(prev => Math.max(1, prev - 1))}
            disabled={selectedWeek <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex min-w-[120px] items-center justify-center rounded-md border border-border px-3 py-2">
            <span className="text-sm font-medium">Week {selectedWeek}</span>
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setSelectedWeek(prev => Math.min(26, prev + 1))}
            disabled={selectedWeek >= currentWeekNumber}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Consistency Toggle */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="consistency" className="text-base font-medium">Were you consistent this week?</Label>
              <p className="text-sm text-muted-foreground">Did you show up for your habits most days?</p>
            </div>
            <Switch
              id="consistency"
              checked={review.consistency}
              onCheckedChange={(checked) => updateReview({ consistency: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Main Review Form */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">What Improved?</CardTitle>
            <CardDescription>Celebrate your progress and wins</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="List your accomplishments and areas where you saw improvement..."
              className="min-h-32 resize-none"
              value={review.whatImproved}
              onChange={(e) => updateReview({ whatImproved: e.target.value })}
            />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">What Failed?</CardTitle>
            <CardDescription>Identify challenges and shortcomings</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="What didn't go as planned? Where did you fall short?"
              className="min-h-32 resize-none"
              value={review.whatFailed}
              onChange={(e) => updateReview({ whatFailed: e.target.value })}
            />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Biggest Lesson</CardTitle>
            <CardDescription>What key insight did you gain?</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="What was the most valuable lesson from this week?"
              className="min-h-32 resize-none"
              value={review.biggestLesson}
              onChange={(e) => updateReview({ biggestLesson: e.target.value })}
            />
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Next Week Focus</CardTitle>
            <CardDescription>Set your intention for the coming week</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="What are your top priorities for next week?"
              className="min-h-32 resize-none"
              value={review.nextWeekFocus}
              onChange={(e) => updateReview({ nextWeekFocus: e.target.value })}
            />
          </CardContent>
        </Card>
      </div>

      {/* Pillar Notes */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Pillar Breakdown</CardTitle>
          <CardDescription>Notes on each area of your life</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {PILLAR_LABELS.map((pillar) => (
            <div key={pillar.key} className="space-y-2">
              <Label className={pillar.color}>{pillar.label}</Label>
              <Textarea
                placeholder={`How did your ${pillar.label.toLowerCase()} development go?`}
                className="min-h-20 resize-none"
                value={review.pillarNotes[pillar.key]}
                onChange={(e) => updatePillarNote(pillar.key, e.target.value)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

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
