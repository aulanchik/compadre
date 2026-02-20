/**
 * Composable for generating unique IDs
 * Uses crypto.randomUUID() when available, falls back to Math.random()
 */
export function useIdGenerator() {
  const generateId = (): string => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    return 'id-' + Math.random().toString(36).substr(2, 9)
  }

  return {
    generateId,
  }
}
