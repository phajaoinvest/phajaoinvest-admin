/**
 * useAsync Hook
 * Handles async operations with loading, error, and data states
 */

import { useState, useCallback, useRef, useEffect } from 'react'

// ============================================================================
// Types
// ============================================================================

interface AsyncState<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
}

interface UseAsyncOptions {
  immediate?: boolean
}

interface UseAsyncReturn<T, Args extends unknown[]> extends AsyncState<T> {
  execute: (...args: Args) => Promise<T | null>
  reset: () => void
  setData: (data: T | null) => void
}

// ============================================================================
// Hook
// ============================================================================

export function useAsync<T, Args extends unknown[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseAsyncOptions = {}
): UseAsyncReturn<T, Args> {
  const { immediate = false } = options
  
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: immediate,
    isSuccess: false,
    isError: false,
  })

  const mountedRef = useRef(true)
  const lastCallIdRef = useRef(0)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      const callId = ++lastCallIdRef.current

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        isSuccess: false,
        isError: false,
      }))

      try {
        const result = await asyncFunction(...args)

        // Only update if this is the latest call and component is mounted
        if (mountedRef.current && callId === lastCallIdRef.current) {
          setState({
            data: result,
            error: null,
            isLoading: false,
            isSuccess: true,
            isError: false,
          })
        }

        return result
      } catch (error) {
        if (mountedRef.current && callId === lastCallIdRef.current) {
          setState({
            data: null,
            error: error instanceof Error ? error : new Error(String(error)),
            isLoading: false,
            isSuccess: false,
            isError: true,
          })
        }
        return null
      }
    },
    [asyncFunction]
  )

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    })
  }, [])

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data }))
  }, [])

  return {
    ...state,
    execute,
    reset,
    setData,
  }
}

// ============================================================================
// useMutation Hook
// ============================================================================

interface MutationState<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
}

interface UseMutationOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  onSettled?: () => void
}

export function useMutation<T, Args extends unknown[] = []>(
  mutationFn: (...args: Args) => Promise<T>,
  options: UseMutationOptions<T> = {}
) {
  const { onSuccess, onError, onSettled } = options

  const [state, setState] = useState<MutationState<T>>({
    data: null,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  })

  const mutate = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        isSuccess: false,
        isError: false,
      }))

      try {
        const result = await mutationFn(...args)
        setState({
          data: result,
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false,
        })
        onSuccess?.(result)
        return result
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        setState({
          data: null,
          error: err,
          isLoading: false,
          isSuccess: false,
          isError: true,
        })
        onError?.(err)
        return null
      } finally {
        onSettled?.()
      }
    },
    [mutationFn, onSuccess, onError, onSettled]
  )

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    })
  }, [])

  return {
    ...state,
    mutate,
    reset,
  }
}
