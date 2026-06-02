'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  Calendar,
  CalendarDays,
  LayoutGrid,
  Settings,
  Target,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar'
import { DashboardHeader } from './dashboard-header'

const navigationItems = [
  {
    title: 'Daily Journal',
    href: '/journal',
    icon: BookOpen,
  },
  {
    title: 'Habit Matrix',
    href: '/habits',
    icon: LayoutGrid,
  },
  {
    title: 'Weekly Review',
    href: '/weekly',
    icon: Calendar,
  },
  {
    title: 'Monthly Review',
    href: '/monthly',
    icon: CalendarDays,
  },
  {
    title: 'Settings / Goals',
    href: '/settings',
    icon: Target,
  },
]

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
          <Link href="/" className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Target className="h-4 w-4" />
            </div>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-semibold text-foreground">180-Day</span>
              <span className="text-xs text-muted-foreground">Discipline OS</span>
            </div>
          </Link>
        </SidebarHeader>
        <SidebarContent className="px-2 py-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.title}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <div className="flex h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
              Saved locally
            </span>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
