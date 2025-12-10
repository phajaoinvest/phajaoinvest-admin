/**
 * usePagination Hook
 * Handles pagination state and logic
 */

import { useState, useCallback, useMemo } from 'react'
import type { PaginationMeta, PaginationParams } from '@/lib/types'

// ============================================================================
// Types
// ============================================================================

interface UsePaginationOptions {
  initialPage?: number
  initialLimit?: number
}

interface UsePaginationReturn {
  // State
  page: number
  limit: number
  
  // Computed
  offset: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  totalPages: number
  startIndex: number
  endIndex: number
  
  // Actions
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  nextPage: () => void
  previousPage: () => void
  firstPage: () => void
  lastPage: () => void
  updateFromMeta: (meta: PaginationMeta) => void
  getParams: () => PaginationParams
  reset: () => void
}

// ============================================================================
// Hook
// ============================================================================

export function usePagination(
  options: UsePaginationOptions = {}
): UsePaginationReturn {
  const { initialPage = 1, initialLimit = 10 } = options

  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)
  const [total, setTotal] = useState(0)

  const totalPages = useMemo(() => Math.ceil(total / limit) || 1, [total, limit])
  const offset = useMemo(() => (page - 1) * limit, [page, limit])
  const hasNextPage = page < totalPages
  const hasPreviousPage = page > 1
  const startIndex = offset + 1
  const endIndex = Math.min(offset + limit, total)

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setPage((p) => p + 1)
    }
  }, [hasNextPage])

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setPage((p) => p - 1)
    }
  }, [hasPreviousPage])

  const firstPage = useCallback(() => {
    setPage(1)
  }, [])

  const lastPage = useCallback(() => {
    setPage(totalPages)
  }, [totalPages])

  const updateFromMeta = useCallback((meta: PaginationMeta) => {
    setTotal(meta.total)
    if (meta.page !== page) {
      setPage(meta.page)
    }
    if (meta.limit !== limit) {
      setLimit(meta.limit)
    }
  }, [page, limit])

  const getParams = useCallback((): PaginationParams => ({
    page,
    limit,
  }), [page, limit])

  const reset = useCallback(() => {
    setPage(initialPage)
    setLimit(initialLimit)
    setTotal(0)
  }, [initialPage, initialLimit])

  const handleSetLimit = useCallback((newLimit: number) => {
    setLimit(newLimit)
    setPage(1) // Reset to first page when limit changes
  }, [])

  return {
    page,
    limit,
    offset,
    hasNextPage,
    hasPreviousPage,
    totalPages,
    startIndex,
    endIndex,
    setPage,
    setLimit: handleSetLimit,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    updateFromMeta,
    getParams,
    reset,
  }
}
