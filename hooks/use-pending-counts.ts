/**
 * usePendingCounts Hook
 * Fetches and maintains pending counts with real-time Socket.IO updates
 */

'use client'

import { useEffect, useState, useCallback } from 'react'
import { pendingCountsApi, type PendingCounts } from '@/lib/api'
import { useNotificationStore } from '@/lib/notification-store'

export function usePendingCounts() {
  const [counts, setCounts] = useState<PendingCounts | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Watch notification lastUpdate timestamp to trigger refetch
  const lastUpdate = useNotificationStore((state) => state.lastUpdate)

  // Fetch counts
  const fetchCounts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await pendingCountsApi.getAll()
      console.log('📊 Pending counts fetched:', data)
      setCounts(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch pending counts'
      setError(message)
      console.error('Failed to fetch pending counts:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch on mount
  useEffect(() => {
    console.log('📊 usePendingCounts: Initial fetch')
    fetchCounts()
  }, [fetchCounts])

  // Refetch when notification store updates (lastUpdate timestamp changes)
  useEffect(() => {
    console.log('📊 Notification store lastUpdate changed, refetching counts...', {
      lastUpdate: new Date(lastUpdate).toISOString()
    })
    fetchCounts()
  }, [lastUpdate, fetchCounts])

  return {
    counts,
    isLoading,
    error,
    refetch: fetchCounts,
  }
}
