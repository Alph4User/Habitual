'use client'

import * as React from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { BookOpen, LayoutGrid, Calendar, CalendarDays, Target, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useAppData } from '@/hooks/use-data'
import { getDayNumber } from '@/lib/storage'
import {
  TOTAL_DAYS,
  currentStreak,
  longestStreak,
  totalHabitCompletions,
  dailyScoreSeries,
  pillarAverages,
  weeklyHabitCompletion,
} from '@/lib/stats'

const quickLinks = [
  {
    title: 'Daily Journal',
    description: 'Record your thoughts, wins, and lessons learned',
    href: '/journal',
    icon: BookOpen,
  },
  {
    title: 'Habit Matrix',
    description: 'Track your daily habits and build consistency',
    href: '/habits',
    icon: LayoutGrid,
  },
  {
    title: 'Weekly Review',
    description: 'Reflect on your week and plan ahead',
    href: '/weekly',
    icon: Calendar,
  },
  {
    title: 'Monthly Review',
    description: 'Analyze your progress and adjust goals',
    href: '/monthly',
    icon: CalendarDays,
  },
]

const scoreConfig = {
  score: { label: 'Daily score', color: 'var(--chart-1)' },
} satisfies ChartConfig

const pillarConfig = {
  score: { label: 'Average score', color: 'var(--chart-1)' },
} satisfies ChartConfig

const habitConfig = {
  percent: { label: 'Completion %', color: 'var(--chart-1)' },
} satisfies ChartConfig

function StatCard({ label, value, hint }: { label: string; value: React.ReactNode; hint: string }) {
  return (
    <Card className="border-border/50">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl font-bold tabular-nums">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
      {message}
    </div>
  )
}

export default function DashboardPage() {
  const { data, loading } = useAppData()

  const stats = React.useMemo(() => {
    if (!data) return null
    const scores = dailyScoreSeries(data, 30)
    return {
      day: data.goals?.startDate ? getDayNumber() : null,
      streak: currentStreak(data),
      best: longestStreak(data),
      completions: totalHabitCompletions(data),
      entries: data.journals.length,
      scores,
      hasScores: scores.some(p => p.score !== null),
      pillars: pillarAverages(data, 30),
      weekly: weeklyHabitCompletion(data, 8),
      hasGoals: !!data.goals,
    }
  }, [data])

  if (loading || !stats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const progress = stats.day ? Math.round((stats.day / TOTAL_DAYS) * 100) : 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          Welcome to Your Discipline OS
        </h1>
        <p className="mt-1 text-muted-foreground">
          {TOTAL_DAYS} days to transform your habits and achieve your goals.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Day"
          value={stats.day ?? '–'}
          hint={stats.day ? `of ${TOTAL_DAYS} days` : 'set a start date in Settings'}
        />
        <StatCard
          label="Streak"
          value={stats.streak}
          hint={`consecutive active days · best ${stats.best}`}
        />
        <StatCard label="Habits Tracked" value={stats.completions} hint="total completions" />
        <StatCard label="Journal Entries" value={stats.entries} hint="entries written" />
      </div>

      {stats.day && (
        <Card className="border-border/50">
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Journey progress</span>
              <span className="text-sm text-muted-foreground tabular-nums">
                {stats.day}/{TOTAL_DAYS} ({progress}%)
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Daily score</CardTitle>
            <CardDescription>Average of your five pillar scores (0–10), last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.hasScores ? (
              <ChartContainer config={scoreConfig} className="h-[220px] w-full">
                <LineChart data={stats.scores} margin={{ left: -20, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} strokeOpacity={0.4} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} minTickGap={24} />
                  <YAxis domain={[0, 10]} ticks={[0, 5, 10]} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    dataKey="score"
                    type="monotone"
                    stroke="var(--color-score)"
                    strokeWidth={2}
                    dot={{ r: 4, strokeWidth: 2, fill: 'var(--background)' }}
                    activeDot={{ r: 5 }}
                    connectNulls
                  />
                </LineChart>
              </ChartContainer>
            ) : (
              <EmptyChart message="Write a journal entry to start your score trend" />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Pillar balance</CardTitle>
            <CardDescription>Average score per pillar, last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.hasScores ? (
              <ChartContainer config={pillarConfig} className="h-[220px] w-full">
                <BarChart data={stats.pillars} margin={{ left: -20, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} strokeOpacity={0.4} />
                  <XAxis dataKey="pillar" tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 10]} ticks={[0, 5, 10]} tickLine={false} axisLine={false} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="score" fill="var(--color-score)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ChartContainer>
            ) : (
              <EmptyChart message="No journal entries in the last 30 days" />
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-base">Habit completion</CardTitle>
            <CardDescription>Share of habits checked each week, last 8 weeks</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.completions > 0 ? (
              <ChartContainer config={habitConfig} className="h-[220px] w-full">
                <BarChart data={stats.weekly} margin={{ left: -20, right: 8, top: 8 }}>
                  <CartesianGrid vertical={false} strokeOpacity={0.4} />
                  <XAxis dataKey="week" tickLine={false} axisLine={false} minTickGap={8} />
                  <YAxis domain={[0, 100]} ticks={[0, 50, 100]} tickLine={false} axisLine={false} unit="%" />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="percent" fill="var(--color-percent)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ChartContainer>
            ) : (
              <EmptyChart message="Tick off habits in the Habit Matrix to see your weekly trend" />
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-medium">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className="group">
              <Card className="h-full border-border/50 transition-colors hover:border-primary/30 hover:bg-accent/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <link.icon className="h-5 w-5 text-primary" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </div>
                  <CardTitle className="mt-4 text-base">{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {!stats.hasGoals && (
      <Card className="border-border/50 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Target className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">Set Your Goals</CardTitle>
              <CardDescription>
                Define what you want to achieve in the next 180 days
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Go to Settings
            <ArrowRight className="h-4 w-4" />
          </Link>
        </CardContent>
      </Card>
      )}
    </div>
  )
}
