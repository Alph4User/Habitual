'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { CalendarIcon, Clock, Droplets, Dumbbell, BookOpen, Wallet, Target, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useJournalEntry } from '@/hooks/use-data'
import { getDayNumber } from '@/lib/storage'

const PRAYERS = [
  { id: 'fajr', label: 'Fajr' },
  { id: 'dhuhr', label: 'Dhuhr' },
  { id: 'asr', label: 'Asr' },
  { id: 'maghrib', label: 'Maghrib' },
  { id: 'isha', label: 'Isha' },
] as const

const CHARACTER_TRAITS = [
  { id: 'discipline', label: 'Discipline' },
  { id: 'focus', label: 'Focus' },
  { id: 'patience', label: 'Patience' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'integrity', label: 'Integrity' },
] as const

export default function JournalPage() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date())
  const { entry, loading, updateEntry, updateNestedEntry, dayNumber } = useJournalEntry(selectedDate)

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() - 1)
    setSelectedDate(newDate)
  }

  const handleNextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + 1)
    if (newDate <= new Date()) {
      setSelectedDate(newDate)
    }
  }

  const progressPercent = Math.round((dayNumber / 180) * 100)

  const totalScore = entry
    ? Object.values(entry.pillarScores).reduce((a, b) => a + b, 0)
    : 0

  if (loading || !entry) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Date Picker */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-balance">Daily Journal</h1>
          <p className="text-muted-foreground">Record your day and track your progress</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousDay}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date > new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNextDay}
            disabled={selectedDate >= new Date()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day Progress */}
      <Card className="border-border/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Day {dayNumber} of 180</span>
            <span className="text-sm text-muted-foreground">{progressPercent}% Complete</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Metadata Section */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Metadata</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wakeup">Wake-up Time</Label>
                <Input
                  id="wakeup"
                  type="time"
                  value={entry.wakeUpTime}
                  onChange={(e) => updateEntry({ wakeUpTime: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sleep">Sleep Time</Label>
                <Input
                  id="sleep"
                  type="time"
                  value={entry.sleepTime}
                  onChange={(e) => updateEntry({ sleepTime: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spiritual Section */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
                <span className="text-lg">🕌</span>
              </div>
              <CardTitle className="text-base">Spiritual</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-3 block">Prayers</Label>
              <div className="flex flex-wrap gap-3">
                {PRAYERS.map((prayer) => (
                  <div key={prayer.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={prayer.id}
                      checked={entry.prayers[prayer.id]}
                      onCheckedChange={(checked) =>
                        updateNestedEntry('prayers', { [prayer.id]: !!checked })
                      }
                    />
                    <Label htmlFor={prayer.id} className="text-sm font-normal">
                      {prayer.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quran">{"Qur'an Pages Read"}</Label>
                <Input
                  id="quran"
                  type="number"
                  min="0"
                  value={entry.quranPages || ''}
                  onChange={(e) => updateEntry({ quranPages: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dhikr">{"Dhikr / Du'a"}</Label>
                <Input
                  id="dhikr"
                  value={entry.dhikrDua}
                  onChange={(e) => updateEntry({ dhikrDua: e.target.value })}
                  placeholder="What did you recite?"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="spiritual-reflection">Reflection</Label>
              <Textarea
                id="spiritual-reflection"
                value={entry.spiritualReflection}
                onChange={(e) => updateEntry({ spiritualReflection: e.target.value })}
                placeholder="Your spiritual thoughts for today..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Physical Section */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10">
                <Dumbbell className="h-4 w-4 text-orange-500" />
              </div>
              <CardTitle className="text-base">Physical</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={entry.weight || ''}
                  onChange={(e) => updateEntry({ weight: parseFloat(e.target.value) || null })}
                  placeholder="0.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="water">Water Intake (L)</Label>
                <div className="relative">
                  <Droplets className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="water"
                    type="number"
                    step="0.5"
                    min="0"
                    value={entry.waterIntake || ''}
                    onChange={(e) => updateEntry({ waterIntake: parseFloat(e.target.value) || 0 })}
                    placeholder="0.0"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <div className="space-y-0.5">
                <Label htmlFor="workout">Workout Completed</Label>
                <p className="text-xs text-muted-foreground">Did you exercise today?</p>
              </div>
              <Switch
                id="workout"
                checked={entry.workoutCompleted}
                onCheckedChange={(checked) => updateEntry({ workoutCompleted: checked })}
              />
            </div>
            {entry.workoutCompleted && (
              <div className="space-y-2">
                <Label htmlFor="workout-details">Workout Details</Label>
                <Textarea
                  id="workout-details"
                  value={entry.workoutDetails}
                  onChange={(e) => updateEntry({ workoutDetails: e.target.value })}
                  placeholder="What exercises did you do?"
                  rows={2}
                />
              </div>
            )}
            <div>
              <Label className="mb-3 block">Meals</Label>
              <div className="space-y-2">
                <Input
                  value={entry.meals.breakfast}
                  onChange={(e) => updateNestedEntry('meals', { breakfast: e.target.value })}
                  placeholder="Breakfast"
                />
                <Input
                  value={entry.meals.lunch}
                  onChange={(e) => updateNestedEntry('meals', { lunch: e.target.value })}
                  placeholder="Lunch"
                />
                <Input
                  value={entry.meals.dinner}
                  onChange={(e) => updateNestedEntry('meals', { dinner: e.target.value })}
                  placeholder="Dinner"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mental Section */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                <BookOpen className="h-4 w-4 text-blue-500" />
              </div>
              <CardTitle className="text-base">Mental</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="book">Book Title</Label>
              <Input
                id="book"
                value={entry.bookTitle}
                onChange={(e) => updateEntry({ bookTitle: e.target.value })}
                placeholder="What are you reading?"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pages">Pages Read</Label>
              <Input
                id="pages"
                type="number"
                min="0"
                value={entry.pagesRead || ''}
                onChange={(e) => updateEntry({ pagesRead: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="learning">Learning Summary</Label>
              <Textarea
                id="learning"
                value={entry.learningSummary}
                onChange={(e) => updateEntry({ learningSummary: e.target.value })}
                placeholder="What did you learn today?"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Financial Section */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10">
                <Wallet className="h-4 w-4 text-green-500" />
              </div>
              <CardTitle className="text-base">Financial</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="earned">Money Earned (KES)</Label>
                <Input
                  id="earned"
                  type="number"
                  min="0"
                  value={entry.moneyEarned || ''}
                  onChange={(e) => updateEntry({ moneyEarned: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spent">Money Spent (KES)</Label>
                <Input
                  id="spent"
                  type="number"
                  min="0"
                  value={entry.moneySpent || ''}
                  onChange={(e) => updateEntry({ moneySpent: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>
            <div className={cn(
              "rounded-lg border p-3 text-center",
              entry.moneyEarned - entry.moneySpent >= 0
                ? "border-green-500/30 bg-green-500/10"
                : "border-red-500/30 bg-red-500/10"
            )}>
              <p className="text-xs text-muted-foreground mb-1">{"Today's Savings"}</p>
              <p className={cn(
                "text-xl font-bold",
                entry.moneyEarned - entry.moneySpent >= 0 ? "text-green-500" : "text-red-500"
              )}>
                KES {(entry.moneyEarned - entry.moneySpent).toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="financial-lesson">Financial Lesson</Label>
              <Textarea
                id="financial-lesson"
                value={entry.financialLesson}
                onChange={(e) => updateEntry({ financialLesson: e.target.value })}
                placeholder="What did you learn about money today?"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Character & Discipline Section */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                <Target className="h-4 w-4 text-purple-500" />
              </div>
              <CardTitle className="text-base">Character & Discipline</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {CHARACTER_TRAITS.map((trait) => (
              <div key={trait.id} className="space-y-2">
                <div className="flex justify-between">
                  <Label>{trait.label}</Label>
                  <span className="text-sm font-medium tabular-nums">{entry.scores[trait.id]}/10</span>
                </div>
                <Slider
                  value={[entry.scores[trait.id]]}
                  onValueChange={([value]) => updateNestedEntry('scores', { [trait.id]: value })}
                  min={0}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>
            ))}
            <div className="flex items-center justify-between rounded-lg border border-border/50 p-3">
              <div className="space-y-0.5">
                <Label htmlFor="promises">Kept All Promises</Label>
                <p className="text-xs text-muted-foreground">Did you follow through today?</p>
              </div>
              <Switch
                id="promises"
                checked={entry.keptAllPromises}
                onCheckedChange={(checked) => updateEntry({ keptAllPromises: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Reflection Section */}
        <Card className="border-border/50">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
                <span className="text-lg">📊</span>
              </div>
              <CardTitle className="text-base">Reflection</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Top Priority for Tomorrow</Label>
              <Input
                id="priority"
                value={entry.topPriorityTomorrow}
                onChange={(e) => updateEntry({ topPriorityTomorrow: e.target.value })}
                placeholder="What's most important tomorrow?"
              />
            </div>
            <div className="space-y-2">
              <Label>3 Things {"I'm"} Grateful For</Label>
              <div className="space-y-2">
                {[0, 1, 2].map((idx) => (
                  <Input
                    key={idx}
                    value={entry.gratitude[idx]}
                    onChange={(e) => {
                      const newGratitude = [...entry.gratitude] as [string, string, string]
                      newGratitude[idx] = e.target.value
                      updateEntry({ gratitude: newGratitude })
                    }}
                    placeholder={`Gratitude ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="wins">Wins of the Day</Label>
              <Textarea
                id="wins"
                value={entry.winsOfDay}
                onChange={(e) => updateEntry({ winsOfDay: e.target.value })}
                placeholder="What did you accomplish?"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lessons">Lessons Learned</Label>
              <Textarea
                id="lessons"
                value={entry.lessonsLearned}
                onChange={(e) => updateEntry({ lessonsLearned: e.target.value })}
                placeholder="What did you learn today?"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="improvement">Improvement Plan for Tomorrow</Label>
              <Textarea
                id="improvement"
                value={entry.improvementPlan}
                onChange={(e) => updateEntry({ improvementPlan: e.target.value })}
                placeholder="How will you be better tomorrow?"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Score Card */}
      <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="text-lg">Daily Score Card</CardTitle>
          <CardDescription>Your performance across the 5 pillars</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
            {/* Total Score */}
            <div className="flex flex-col items-center">
              <div className="relative h-36 w-36">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-muted/20"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeDasharray={`${(totalScore / 50) * 283} 283`}
                    strokeLinecap="round"
                    className="text-primary transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{totalScore}</span>
                  <span className="text-sm text-muted-foreground">/ 50</span>
                </div>
              </div>
              <p className="mt-2 text-sm font-medium">Total Score</p>
            </div>

            {/* Pillar Scores */}
            <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-5 lg:max-w-2xl">
              {[
                { key: 'spiritual', label: 'Spiritual', color: 'bg-emerald-500' },
                { key: 'physical', label: 'Physical', color: 'bg-orange-500' },
                { key: 'mental', label: 'Mental', color: 'bg-blue-500' },
                { key: 'financial', label: 'Financial', color: 'bg-green-500' },
                { key: 'character', label: 'Character', color: 'bg-purple-500' },
              ].map((pillar) => (
                <div key={pillar.key} className="text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                    <span className="text-xl font-bold">
                      {entry.pillarScores[pillar.key as keyof typeof entry.pillarScores]}
                    </span>
                  </div>
                  <div className={cn("mx-auto h-1 w-full rounded-full", pillar.color, "opacity-60")} />
                  <p className="mt-2 text-xs text-muted-foreground">{pillar.label}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quote Footer */}
      <Card className="border-border/50 bg-card/50">
        <CardContent className="py-6">
          <blockquote className="text-center">
            <p className="text-sm italic text-muted-foreground">
              {"\"The man who moves a mountain begins by carrying away small stones.\""}
            </p>
            <footer className="mt-2 text-xs text-muted-foreground">— Confucius</footer>
          </blockquote>
        </CardContent>
      </Card>
    </div>
  )
}
