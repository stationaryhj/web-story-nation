// 스크롤 방지 관련 유틸리티 함수

let scrollLockCount = 0

export const lockScroll = () => {
  if (scrollLockCount === 0) {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`
  }
  scrollLockCount++
}

export const unlockScroll = () => {
  scrollLockCount--
  if (scrollLockCount === 0) {
    document.body.style.overflow = ''
    document.body.style.paddingRight = ''
  }
}

export const resetScrollLock = () => {
  scrollLockCount = 0
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
}
