// 스크롤 방지 관련 유틸리티 함수

let scrollLockCount = 0
let isScrollLocked = false
let originalPaddingRight: string | null = null
let originalBodyOverflow: string | null = null

/**
 * 스크롤바를 잠금 처리합니다.
 */
export function lockScroll() {
  // 이미 잠금 처리된 경우 카운트만 증가
  scrollLockCount++
  console.log(`[scrollLock] 스크롤 락 요청됨. 현재 카운트: ${scrollLockCount}`)

  // 이미 잠금된 상태면 중복 적용하지 않음
  if (isScrollLocked) {
    console.log('[scrollLock] 이미 스크롤이 잠겨 있어 추가 작업 없음')
    return
  }

  try {
    const documentWidth = document.documentElement.clientWidth
    const windowWidth = window.innerWidth
    const scrollbarWidth = windowWidth - documentWidth

    // 현재 상태 저장
    originalBodyOverflow = document.body.style.overflow
    originalPaddingRight = document.body.style.paddingRight

    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`
    isScrollLocked = true
    console.log('[scrollLock] 스크롤 락 적용 완료')
  } catch (error) {
    console.error('[scrollLock] 스크롤 락 적용 중 오류 발생:', error)
  }
}

/**
 * 스크롤바 잠금을 해제합니다.
 */
export function unlockScroll() {
  console.log(`[scrollLock] 스크롤 언락 요청됨. 현재 카운트: ${scrollLockCount}`)

  // 카운트가 0 이하인 경우 처리하지 않음
  if (scrollLockCount <= 0) {
    console.log('[scrollLock] 스크롤 락 카운트가 이미 0 이하입니다. 아무 작업 없음')
    scrollLockCount = 0
    return
  }

  // 카운트 감소
  scrollLockCount--
  console.log(`[scrollLock] 스크롤 락 카운트 감소됨. 남은 카운트: ${scrollLockCount}`)

  // 카운트가 0이 아니면 아직 해제하지 않음
  if (scrollLockCount > 0) {
    console.log('[scrollLock] 다른 컴포넌트에서 여전히 스크롤이 잠겨 있어 해제하지 않음')
    return
  }

  // 카운트가 0이면 잠금 해제
  try {
    // window.document.body가 유효한지 확인
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.overflow = originalBodyOverflow || ''
      document.body.style.paddingRight = originalPaddingRight || ''
      // 원래 값 초기화
      originalBodyOverflow = null
      originalPaddingRight = null
      isScrollLocked = false
      console.log('[scrollLock] 스크롤 락 해제 완료')
    } else {
      console.warn('[scrollLock] document.body가 유효하지 않아 스크롤 락 해제 건너뜀')
    }
  } catch (error) {
    console.error('[scrollLock] 스크롤 락 해제 중 오류 발생:', error)
    // 오류 발생 시에도 상태 초기화
    originalBodyOverflow = null
    originalPaddingRight = null
    isScrollLocked = false
  }
}

/**
 * 스크롤바 잠금 상태를 강제로 초기화합니다.
 */
export function resetScrollLock() {
  console.log('[scrollLock] 스크롤 락 강제 초기화 요청됨')

  // 카운트 초기화
  scrollLockCount = 0

  // 상태가 잠금 상태인 경우에만 해제 작업 수행
  if (isScrollLocked) {
    try {
      // window.document.body가 유효한지 확인
      if (typeof document !== 'undefined' && document.body) {
        document.body.style.overflow = originalBodyOverflow || ''
        document.body.style.paddingRight = originalPaddingRight || ''
        // 원래 값 초기화
        originalBodyOverflow = null
        originalPaddingRight = null
        isScrollLocked = false
        console.log('[scrollLock] 스크롤 락 강제 초기화 완료')
      } else {
        console.warn('[scrollLock] document.body가 유효하지 않아 스크롤 락 초기화 건너뜀')
      }
    } catch (error) {
      console.error('[scrollLock] 스크롤 락 강제 초기화 중 오류 발생:', error)
      // 오류 발생 시에도 상태 초기화
      originalBodyOverflow = null
      originalPaddingRight = null
      isScrollLocked = false
    }
  } else {
    console.log('[scrollLock] 이미 스크롤이 잠금 해제 상태입니다. 초기화 불필요')
  }
}

/**
 * 현재 스크롤 락 상태를 확인합니다. (디버깅용)
 */
export function getScrollLockStatus() {
  return {
    isLocked: isScrollLocked,
    count: scrollLockCount,
    bodyOverflow: document.body.style.overflow,
    bodyPaddingRight: document.body.style.paddingRight,
  }
}
