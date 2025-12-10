import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number to fixed decimal places with safe type conversion
 * @param value - The number to format (can be string, number, null, or undefined)
 * @param decimals - Number of decimal places (default: 2)
 * @param fallback - Fallback value if conversion fails (default: '0.00' for 2 decimals)
 * @returns Formatted number string
 */
export function formatNumber(
  value: string | number | null | undefined,
  decimals: number = 2,
  fallback?: string
): string {
  const num = Number(value)
  if (isNaN(num)) {
    return fallback ?? '0'.padEnd(decimals > 0 ? decimals + 2 : 1, '.0')
  }
  return num.toFixed(decimals)
}

/**
 * Format currency with $ symbol
 * @param value - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @param fallback - Fallback value if conversion fails (default: '0.00')
 * @returns Formatted currency string with $ symbol
 */
export function formatCurrency(
  value: string | number | null | undefined,
  decimals: number = 2,
  fallback?: string
): string {
  return `$${formatNumber(value, decimals, fallback)}`
}

/**
 * Format number with thousand separators using toLocaleString
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted number string with thousand separators
 */
export function formatNumberWithCommas(
  value: string | number | null | undefined,
  decimals: number = 0
): string {
  const num = Number(value)
  if (isNaN(num)) {
    return '0'
  }
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Format currency with thousand separators
 * @param value - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string with $ and thousand separators
 */
export function formatCurrencyWithCommas(
  value: string | number | null | undefined,
  decimals: number = 2
): string {
  return `$${formatNumberWithCommas(value, decimals)}`
}

/**
 * Format percentage
 * @param value - The percentage value to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export function formatPercentage(
  value: string | number | null | undefined,
  decimals: number = 2
): string {
  return `${formatNumber(value, decimals)}%`
}

/**
 * Format large numbers with K/M suffix
 * @param value - The number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string with K/M suffix
 */
export function formatCompactNumber(
  value: string | number | null | undefined,
  decimals: number = 1
): string {
  const num = Number(value)
  if (isNaN(num)) {
    return '0'
  }
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(decimals)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(decimals)}K`
  }
  return num.toFixed(decimals)
}

/**
 * Format currency with K/M suffix
 * @param value - The amount to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted currency string with K/M suffix
 */
export function formatCompactCurrency(
  value: string | number | null | undefined,
  decimals: number = 1
): string {
  return `$${formatCompactNumber(value, decimals)}`
}
