import { BookOpen, LayoutGrid, Calendar, CalendarDays, Target, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">
          Welcome to Your Discipline OS
        </h1>
        <p className="mt-1 text-muted-foreground">
          180 days to transform your habits and achieve your goals.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>Day</CardDescription>
            <CardTitle className="text-3xl font-bold">1</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">of 180 days</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>Streak</CardDescription>
            <CardTitle className="text-3xl font-bold">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">consecutive days</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>Habits Tracked</CardDescription>
            <CardTitle className="text-3xl font-bold">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">total completions</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardDescription>Journal Entries</CardDescription>
            <CardTitle className="text-3xl font-bold">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">entries written</p>
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
    </div>
  )
}
