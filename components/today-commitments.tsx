'use client'

import * as React from 'react'
import Link from 'next/link'
import { Check, Flame } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { AppData, formatDate, getHabits, isHabitDone, setHabitDone } from '@/lib/storage'
import { habitStreak } from '@/lib/stats'

interface TodayCommitmentsProps {
  data: AppData
  onChange: (data: AppData) => void
}

export function TodayCommitments({ data, onChange }: TodayCommitmentsProps) {
  const today = formatDate(new Date())
  const habits = getHabits(data)

  const rows = habits.map(h => ({
    ...h,
    done: isHabitDone(data, today, h.id),
    streak: habitStreak(data, h.id),
  }))
  const doneCount = rows.filter(r => r.done).length
  const percent = habits.length ? Math.round((doneCount / habits.length) * 100) : 0

  const toggle = (id: string, done: boolean) => onChange(setHabitDone(today, id, !done))

  if (habits.length === 0) return null

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Today&apos;s commitments</CardTitle>
            <CardDescription>
              Tick each one you kept today. Prayers, Quran, reading, gym and bedtime are ticked
              automatically from your <Link href="/journal" className="underline underline-offset-2">journal</Link>.
            </CardDescription>
          </div>
          <span className="shrink-0 text-sm font-medium tabular-nums">
            {doneCount}/{habits.length}
          </span>
        </div>
        <Progress value={percent} className="mt-2 h-2" />
      </CardHeader>
      <CardContent>
        <ul className="grid gap-2 sm:grid-cols-2">
          {rows.map(r => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => toggle(r.id, r.done)}
                aria-pressed={r.done}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors',
                  r.done
                    ? 'border-primary/40 bg-primary/10'
                    : 'border-border hover:border-primary/40 hover:bg-muted/50'
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2',
                    r.done ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                  )}
                >
                  {r.done && <Check className="h-4 w-4" />}
                </span>
                <span className="text-lg leading-none">{r.icon}</span>
                <span className="flex-1 text-sm font-medium">{r.label}</span>
                {r.streak > 0 && (
                  <span
                    className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground tabular-nums"
                    title={r.kind === 'quit' ? `${r.streak} days clean` : `${r.streak}-day streak`}
                  >
                    <Flame className="h-3.5 w-3.5 text-amber-500" />
                    {r.streak}
                    {r.kind === 'quit' ? 'd clean' : 'd'}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
