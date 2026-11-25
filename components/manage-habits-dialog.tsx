'use client'

import * as React from 'react'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { HabitDefinition } from '@/lib/storage'

interface ManageHabitsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  habits: HabitDefinition[]
  onSave: (habits: HabitDefinition[]) => void
}

function makeId(label: string, existing: HabitDefinition[]): string {
  const base =
    label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'habit'
  let id = base
  let n = 2
  while (existing.some(h => h.id === id)) id = `${base}-${n++}`
  return id
}

export function ManageHabitsDialog({ open, onOpenChange, habits, onSave }: ManageHabitsDialogProps) {
  const [draft, setDraft] = React.useState<HabitDefinition[]>(habits)
  const [newLabel, setNewLabel] = React.useState('')
  const [newIcon, setNewIcon] = React.useState('')

  React.useEffect(() => {
    if (open) {
      setDraft(habits)
      setNewLabel('')
      setNewIcon('')
    }
  }, [open, habits])

  const update = (index: number, changes: Partial<HabitDefinition>) =>
    setDraft(prev => prev.map((h, i) => (i === index ? { ...h, ...changes } : h)))

  const move = (index: number, dir: -1 | 1) =>
    setDraft(prev => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })

  const remove = (index: number) => setDraft(prev => prev.filter((_, i) => i !== index))

  const add = () => {
    const label = newLabel.trim()
    if (!label) return
    setDraft(prev => [...prev, { id: makeId(label, prev), label, icon: newIcon.trim() || '✅' }])
    setNewLabel('')
    setNewIcon('')
  }

  const save = () => {
    // Drop rows whose name was cleared
    onSave(draft.filter(h => h.label.trim()).map(h => ({ ...h, label: h.label.trim(), icon: h.icon.trim() || '✅' })))
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage habits</DialogTitle>
          <DialogDescription>
            Add, rename, reorder or remove habits. Past check-ins are kept, so a removed habit's history comes back if you add it again under the same name.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
          {draft.map((habit, i) => (
            <div key={habit.id} className="flex items-center gap-2">
              <Input
                aria-label="Icon"
                value={habit.icon}
                onChange={e => update(i, { icon: e.target.value })}
                className="w-14 text-center"
                maxLength={4}
              />
              <Input
                aria-label="Habit name"
                value={habit.label}
                onChange={e => update(i, { label: e.target.value })}
                className="flex-1"
              />
              <Button variant="ghost" size="icon" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => move(i, 1)}
                disabled={i === draft.length - 1}
                aria-label="Move down"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Remove habit">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
          {draft.length === 0 && <p className="text-sm text-muted-foreground">No habits yet.</p>}
        </div>

        <form
          className="flex items-center gap-2 border-t border-border pt-4"
          onSubmit={e => {
            e.preventDefault()
            add()
          }}
        >
          <Input
            aria-label="New habit icon"
            placeholder="✅"
            value={newIcon}
            onChange={e => setNewIcon(e.target.value)}
            className="w-14 text-center"
            maxLength={4}
          />
          <Input
            aria-label="New habit name"
            placeholder="New habit, e.g. No sugar"
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" variant="outline" className="gap-1" disabled={!newLabel.trim()}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
