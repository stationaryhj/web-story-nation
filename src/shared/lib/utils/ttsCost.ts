export const countOneVoiceSegment = (segment: string): number => {
  let text = segment.trim()
  if (!text) return 0
  text = text.replace(/…/g, ' ').replace(/\.{2,3}/g, ' ')
  text = text.replace(/[^\p{L}\p{N}\s?!.,~]/gu, '').trim()
  if (!text) return 0
  return text.length
}
