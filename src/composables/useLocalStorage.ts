import { ref, watch, type Ref } from 'vue'

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: {
    deep?: boolean
    onError?: (error: Error) => void
  } = {}
): Ref<T> {
  const { deep = true, onError } = options

  // Load from storage
  const loadFromStorage = (): T => {
    try {
      const stored = localStorage.getItem(key)
      if (stored) {
        return JSON.parse(stored) as T
      }
    } catch (error) {
      console.error(`Failed to load "${key}" from storage:`, error)
      onError?.(error as Error)
    }
    return initialValue
  }

  // Save to storage
  const saveToStorage = (value: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Failed to save "${key}" to storage:`, error)
      onError?.(error as Error)
    }
  }

  // Create ref with stored value
  const storedValue = ref<T>(loadFromStorage()) as Ref<T>

  // Watch for changes and persist
  watch(
    storedValue,
    (newValue) => {
      saveToStorage(newValue)
    },
    { deep }
  )

  return storedValue
}
