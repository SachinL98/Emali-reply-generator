export const saveJSON = (key: string, value: unknown) => {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}
export const loadJSON = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : fallback
  } catch {
    return fallback
  }
}
