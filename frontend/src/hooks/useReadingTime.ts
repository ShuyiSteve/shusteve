// Chinese has no spaces between words, so its characters are counted on their own.
const HAN = /\p{Script=Han}/gu

export function readingTime(content: string): number {
  if (!content) return 1
  const characters = content.match(HAN)?.length ?? 0
  const words = content.replace(HAN, ' ').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 220 + characters / 400))
}
