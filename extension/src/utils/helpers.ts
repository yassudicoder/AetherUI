export const uniqueSorted = (values: string[], limit = 12): string[] => {
  return Array.from(new Set(values.filter(Boolean))).slice(0, limit)
}

export const compactNumber = (value: number): string => {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value)
}

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, value))
}

export const truncate = (value: string, maxLength = 500): string => {
  if (value.length <= maxLength) {
    return value
  }

  return `${value.slice(0, maxLength)}...`
}

export const bytesToPretty = (bytes: number): string => {
  if (!Number.isFinite(bytes)) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  let amount = bytes
  let unitIdx = 0

  while (amount >= 1024 && unitIdx < units.length - 1) {
    amount /= 1024
    unitIdx += 1
  }

  return `${compactNumber(amount)} ${units[unitIdx]}`
}
