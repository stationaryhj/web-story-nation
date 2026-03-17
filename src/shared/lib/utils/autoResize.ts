interface AutoResizeOptions {
  maxRows?: number
}
export const autoResize = (el: HTMLTextAreaElement, options?: AutoResizeOptions) => {
  const { maxRows } = options ?? {}

  el.style.height = 'auto'

  if (maxRows) {
    const style = getComputedStyle(el)
    const lineHeight = Number.parseInt(style.lineHeight, 10) || 20
    const paddingTop = Number.parseInt(style.paddingTop, 10) || 0
    const paddingBottom = Number.parseInt(style.paddingBottom, 10) || 0
    const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom

    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`
    el.style.overflowY = 'hidden'
  } else {
    el.style.height = `${el.scrollHeight}px`
    el.style.overflowY = 'hidden'
  }
}
