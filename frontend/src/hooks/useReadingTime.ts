export function readingTime(content: string): number {
  if (!content) return 1
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 220))
}
