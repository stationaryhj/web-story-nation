// 스크롤 방지 관련 유틸리티 함수

// 상태 관리 변수
let scrollLockCount = 0
let isScrollLocked = false
let originalStyles: {
  bodyOverflow: string | null
  paddingRight: string | null
  scrollbarVisibility: string | null
} = {
  bodyOverflow: null,
  paddingRight: null,
  scrollbarVisibility: null,
}

// 대상 요소 선택자
const SELECTORS = {
  BODY: 'body',
  HTML: 'html',
  ROOT: ':root',
}

// CSS 클래스 상수
const CSS_CLASSES = {
  NO_SCROLLBAR: 'no-scrollbar',
}

/**
 * 모든 스크롤바 관련 요소에 CSS 클래스를 추가하거나 제거합니다.
 * @param action 'add' 또는 'remove'
 */
function updateScrollbarClasses(action: 'add' | 'remove'): void {
  try {
    if (typeof document === 'undefined') return

    const method = action === 'add' ? 'add' : 'remove'

    // 주요 DOM 요소에 클래스 적용
    document.body.classList[method](CSS_CLASSES.NO_SCROLLBAR)
    document.documentElement.classList[method](CSS_CLASSES.NO_SCROLLBAR)

    // querySelector를 사용한 추가 적용 (중복 적용될 수 있으나 브라우저가 처리)
    const htmlElement = document.querySelector('html')
    if (htmlElement) {
      htmlElement.classList[method](CSS_CLASSES.NO_SCROLLBAR)
    }
  } catch (error) {
    console.error(`[scrollLock] 스크롤바 클래스 ${action} 중 오류 발생:`, error)
  }
}

/**
 * 스크롤바를 잠금 처리합니다.
 */
export function lockScroll(): void {
  // 카운트 증가
  scrollLockCount++
  console.log(`[scrollLock] 스크롤 락 요청됨. 현재 카운트: ${scrollLockCount}`)

  // 이미 잠금된 상태면 중복 적용하지 않음
  if (isScrollLocked) {
    console.log('[scrollLock] 이미 스크롤이 잠겨 있어 추가 작업 없음')
    return
  }

  try {
    if (typeof document === 'undefined') return

    // 스크롤바 너비 계산
    const documentWidth = document.documentElement.clientWidth
    const windowWidth = window.innerWidth
    const scrollbarWidth = windowWidth - documentWidth

    // 현재 스타일 저장
    originalStyles = {
      bodyOverflow: document.body.style.overflow,
      paddingRight: document.body.style.paddingRight,
      scrollbarVisibility: document.body.style.scrollbarWidth || '',
    }

    // 스크롤바 숨기기 스타일 적용
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`
    document.body.style.scrollbarWidth = 'none' // Firefox

    // TypeScript 타입 호환을 위한 처리
    ;(document.body.style as any).msOverflowStyle = 'none' // IE/Edge

    // CSS 변수 설정
    document.documentElement.style.setProperty('--scrollbar-width', '0px')

    // 클래스 추가
    updateScrollbarClasses('add')

    isScrollLocked = true
    console.log('[scrollLock] 스크롤 락 적용 완료')
  } catch (error) {
    console.error('[scrollLock] 스크롤 락 적용 중 오류 발생:', error)
  }
}

/**
 * 스크롤바 잠금을 해제합니다.
 */
export function unlockScroll(): void {
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
  clearScrollLock()
}

/**
 * 내부 함수: 스크롤 잠금을 실제로 해제하는 로직
 */
function clearScrollLock(): void {
  try {
    // document.body가 유효한지 확인
    if (typeof document !== 'undefined' && document.body) {
      // 스크롤바 관련 스타일 원복
      document.body.style.overflow = originalStyles.bodyOverflow || ''
      document.body.style.paddingRight = originalStyles.paddingRight || ''
      document.body.style.scrollbarWidth = originalStyles.scrollbarVisibility || ''

      // TypeScript 타입 호환을 위한 처리
      ;(document.body.style as any).msOverflowStyle = ''

      // CSS 변수 제거
      document.documentElement.style.removeProperty('--scrollbar-width')

      // 클래스 제거
      updateScrollbarClasses('remove')

      // 상태 초기화
      originalStyles = {
        bodyOverflow: null,
        paddingRight: null,
        scrollbarVisibility: null,
      }
      isScrollLocked = false
      console.log('[scrollLock] 스크롤 락 해제 완료')
    } else {
      console.warn('[scrollLock] document.body가 유효하지 않아 스크롤 락 해제 건너뜀')
    }
  } catch (error) {
    console.error('[scrollLock] 스크롤 락 해제 중 오류 발생:', error)
    // 오류 발생 시에도 상태 초기화
    resetLockState()
  }
}

/**
 * 스크롤바 잠금 상태를 강제로 초기화합니다.
 */
export function resetScrollLock(): void {
  console.log('[scrollLock] 스크롤 락 강제 초기화 요청됨')

  // 카운트 초기화
  scrollLockCount = 0

  // 상태가 잠금 상태인 경우에만 해제 작업 수행
  if (isScrollLocked) {
    clearScrollLock()
  } else {
    console.log('[scrollLock] 이미 스크롤이 잠금 해제 상태입니다. 초기화 불필요')
  }
}

/**
 * 내부 함수: 상태 변수를 초기화합니다.
 */
function resetLockState(): void {
  originalStyles = {
    bodyOverflow: null,
    paddingRight: null,
    scrollbarVisibility: null,
  }
  isScrollLocked = false
}

/**
 * 현재 스크롤 락 상태를 확인합니다. (디버깅용)
 */
export function getScrollLockStatus(): Record<string, any> {
  return {
    isLocked: isScrollLocked,
    count: scrollLockCount,
    bodyOverflow: typeof document !== 'undefined' ? document.body.style.overflow : null,
    bodyPaddingRight: typeof document !== 'undefined' ? document.body.style.paddingRight : null,
    scrollbarVisibility: typeof document !== 'undefined' ? document.body.style.scrollbarWidth : null,
    originalStyles,
  }
}
