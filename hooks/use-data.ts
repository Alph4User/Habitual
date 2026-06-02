'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  AppData,
  JournalEntry,
  Goals,
  getStoredData,
  saveData,
  getJournalEntry,
  saveJournalEntry,
  createEmptyJournalEntry,
  getDayNumber,
  formatDate,
  calculatePillarScores,
  HabitMatrix,
  WeeklyReview,
  MonthlyReview,
} from '@/lib/storage'

export function useAppData() {
  const [data, setData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setData(getStoredData())
    setLoading(false)
  }, [])

  const updateData = useCallback((newData: AppData) => {
    setData(newData)
    saveData(newData)
  }, [])

  const saveGoals = useCallback((goals: Goals) => {
    const currentData = getStoredData()
    const newData = { ...currentData, goals }
    updateData(newData)
  }, [updateData])

  return { data, loading, updateData, saveGoals }
}

export function useJournalEntry(date: Date) {
  const [entry, setEntry] = useState<JournalEntry | null>(null)
  const [loading, setLoading] = useState(true)

  const dateString = formatDate(date)
  const dayNumber = getDayNumber(date)

  useEffect(() => {
    const existingEntry = getJournalEntry(dateString)
    if (existingEntry) {
      setEntry(existingEntry)
    } else {
      setEntry(createEmptyJournalEntry(dateString, dayNumber))
    }
    setLoading(false)
  }, [dateString, dayNumber])

  const updateEntry = useCallback((updates: Partial<JournalEntry>) => {
    setEntry(prev => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      // Recalculate pillar scores
      updated.pillarScores = calculatePillarScores(updated)
      saveJournalEntry(updated)
      return updated
    })
  }, [])

  const updateNestedEntry = useCallback(<K extends keyof JournalEntry>(
    key: K,
    nestedUpdates: Partial<JournalEntry[K]>
  ) => {
    setEntry(prev => {
      if (!prev) return prev
      const updated = {
        ...prev,
        [key]: { ...prev[key] as object, ...nestedUpdates },
      }
      // Recalculate pillar scores
      updated.pillarScores = calculatePillarScores(updated as JournalEntry)
      saveJournalEntry(updated as JournalEntry)
      return updated as JournalEntry
    })
  }, [])

  return { entry, loading, updateEntry, updateNestedEntry, dayNumber }
}

export function useHabitMatrix() {
  const [data, setData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setData(getStoredData())
    setLoading(false)
  }, [])

  const getCurrentWeekMatrix = useCallback((): HabitMatrix | null => {
    if (!data) return null
    const weekNumber = Math.ceil(getDayNumber() / 7)
    return data.habitMatrix.find(h => h.weekNumber === weekNumber) || null
  }, [data])

  const updateHabitMatrix = useCallback((matrix: HabitMatrix) => {
    const currentData = getStoredData()
    const existingIndex = currentData.habitMatrix.findIndex(
      h => h.weekNumber === matrix.weekNumber
    )
    
    if (existingIndex >= 0) {
      currentData.habitMatrix[existingIndex] = matrix
    } else {
      currentData.habitMatrix.push(matrix)
    }
    
    saveData(currentData)
    setData(currentData)
  }, [])

  return { data, loading, getCurrentWeekMatrix, updateHabitMatrix }
}

export function useReviews() {
  const [data, setData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setData(getStoredData())
    setLoading(false)
  }, [])

  const saveWeeklyReview = useCallback((review: WeeklyReview) => {
    const currentData = getStoredData()
    const existingIndex = currentData.weeklyReviews.findIndex(
      r => r.weekNumber === review.weekNumber
    )
    
    if (existingIndex >= 0) {
      currentData.weeklyReviews[existingIndex] = review
    } else {
      currentData.weeklyReviews.push(review)
    }
    
    saveData(currentData)
    setData(currentData)
  }, [])

  const saveMonthlyReview = useCallback((review: MonthlyReview) => {
    const currentData = getStoredData()
    const existingIndex = currentData.monthlyReviews.findIndex(
      r => r.monthNumber === review.monthNumber
    )
    
    if (existingIndex >= 0) {
      currentData.monthlyReviews[existingIndex] = review
    } else {
      currentData.monthlyReviews.push(review)
    }
    
    saveData(currentData)
    setData(currentData)
  }, [])

  const getWeeklyReview = useCallback((weekNumber: number): WeeklyReview | null => {
    if (!data) return null
    return data.weeklyReviews.find(r => r.weekNumber === weekNumber) || null
  }, [data])

  const getMonthlyReview = useCallback((monthNumber: number): MonthlyReview | null => {
    if (!data) return null
    return data.monthlyReviews.find(r => r.monthNumber === monthNumber) || null
  }, [data])

  return { data, loading, saveWeeklyReview, saveMonthlyReview, getWeeklyReview, getMonthlyReview }
}
