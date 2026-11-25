'use client'

import * as React from 'react'
import { Target, Download, Upload, Trash2, Check, Save, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useAppData } from '@/hooks/use-data'
import { exportData, importData, resetAllData, Goals, formatDate, parseLocalDate } from '@/lib/storage'

const GOAL_CATEGORIES = [
  { key: 'spiritual', label: 'Spiritual Goal', icon: '🕌', placeholder: 'e.g., Complete reading the Quran, establish all 5 daily prayers...' },
  { key: 'physical', label: 'Physical Goal', icon: '💪', placeholder: 'e.g., Lose 10kg, run a 5K, workout 5x/week...' },
  { key: 'mental', label: 'Mental Goal', icon: '🧠', placeholder: 'e.g., Read 20 books, learn a new skill, complete a course...' },
  { key: 'financial', label: 'Financial Goal', icon: '💰', placeholder: 'e.g., Save KES 100,000, start a side business, pay off debt...' },
  { key: 'character', label: 'Character Goal', icon: '🎯', placeholder: 'e.g., Be more patient, eliminate bad habits, improve discipline...' },
  { key: 'relationship', label: 'Relationship Goal', icon: '❤️', placeholder: 'e.g., Strengthen family bonds, make new friends, be more present...' },
] as const

export default function SettingsPage() {
  const { data, loading, saveGoals } = useAppData()
  const [saved, setSaved] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const [goals, setGoals] = React.useState<Goals>({
    spiritual: '',
    physical: '',
    mental: '',
    financial: '',
    character: '',
    relationship: '',
    startDate: formatDate(new Date()),
  })

  React.useEffect(() => {
    if (data?.goals) {
      setGoals(data.goals)
    }
  }, [data])

  const handleSaveGoals = () => {
    saveGoals(goals)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const updateGoal = (key: keyof Goals, value: string) => {
    setGoals(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleExport = () => {
    const dataStr = exportData()
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `180-day-discipline-os-backup-${formatDate(new Date())}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (importData(content)) {
        window.location.reload()
      } else {
        alert('Failed to import data. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  const handleReset = () => {
    resetAllData()
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const hasGoals = data?.goals && Object.values(data.goals).some(v => v && v !== data.goals?.startDate)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Settings / Goals</h1>
        <p className="text-muted-foreground">Configure your 180-day journey and set meaningful goals</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - Goals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Journey Start Date */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Journey Start Date</CardTitle>
              <CardDescription>
                When did your 180-day journey begin? This determines your day count.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-xs">
                <Input
                  type="date"
                  value={goals.startDate}
                  onChange={(e) => updateGoal('startDate', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* 6-Month Goals */}
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Your 6-Month Goals</CardTitle>
              </div>
              <CardDescription>
                Define clear, measurable goals for each area of your life
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {GOAL_CATEGORIES.map((category) => (
                <div key={category.key} className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                  </Label>
                  <Textarea
                    placeholder={category.placeholder}
                    className="min-h-20 resize-none"
                    value={goals[category.key as keyof Omit<Goals, 'startDate'>]}
                    onChange={(e) => updateGoal(category.key as keyof Goals, e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveGoals} className="gap-2">
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Goals
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Summary */}
          {hasGoals && (
            <Card className="border-border/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base">Journey Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary">
                    {Math.round((new Date(new Date().setHours(0, 0, 0, 0)).getTime() - parseLocalDate(goals.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}
                  </p>
                  <p className="text-sm text-muted-foreground">days into your journey</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Management */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Data Management</CardTitle>
              <CardDescription>Backup, restore, or reset your data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full gap-2" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Export JSON
              </Button>
              
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button 
                variant="outline" 
                className="w-full gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                Import JSON
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Reset All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all your journal entries, habit data, reviews, and goals.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleReset}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, delete everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Goal Setting Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p><strong className="text-foreground">Be Specific:</strong> {"\"Lose 10kg\""} is better than {"\"get fit\""}</p>
              <p><strong className="text-foreground">Make it Measurable:</strong> Include numbers and deadlines</p>
              <p><strong className="text-foreground">Stay Realistic:</strong> Challenging but achievable in 180 days</p>
              <p><strong className="text-foreground">Write Your Why:</strong> Connect goals to deeper purpose</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
