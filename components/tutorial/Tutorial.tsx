import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// 튜토리얼 단계 설정 인터페이스
interface TutorialStep {
  id: string
  html: string
  textPosition?: 'top' | 'bottom' | 'left' | 'right'
  messagePosition?: 'top' | 'middle' | 'bottom' // 클릭하여 계속하기 메시지 위치
}

// 튜토리얼 설정 인터페이스
interface TutorialConfig {
  steps: TutorialStep[]
  storageKey: string // localStorage에 저장할 키 값
  defaultMessagePosition?: 'top' | 'middle' | 'bottom' // 기본 메시지 위치
}

interface TutorialProps {
  isOpen: boolean
  onClose: () => void
  config: TutorialConfig
}

export default function Tutorial({ isOpen, onClose, config }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [dontShowAgain, setDontShowAgain] = useState(false)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // 컴포넌트 마운트 확인 (클라이언트 측에서만 Portal 사용)
  useEffect(() => {
    setIsMounted(true)
    // 모바일 여부 감지
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 현재 단계의 요소를 찾아서 하이라이트
  useEffect(() => {
    if (!isOpen || currentStep >= config.steps.length) return

    const step = config.steps[currentStep]
    const element = document.getElementById(step.id)
    setTargetElement(element)

    // 요소가 없으면 다음 단계로 이동
    if (!element) {
      setCurrentStep(prev => prev + 1)
    }
  }, [isOpen, currentStep, config.steps])

  // localStorage에서 다시보지 않기 설정 확인
  useEffect(() => {
    if (!isOpen) return

    const dontShow = localStorage.getItem(config.storageKey)
    if (dontShow === 'true') {
      onClose()
    }
  }, [isOpen, config.storageKey, onClose])

  // 튜토리얼 활성화 시 스크롤 막기
  useEffect(() => {
    if (isOpen) {
      // 원래 스타일 저장
      const originalStyle = window.getComputedStyle(document.body).overflow
      // 스크롤 막기
      document.body.style.overflow = 'hidden'

      // 컴포넌트 언마운트 시 원래 스타일로 복원
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [isOpen])

  useEffect(() => {
    console.log('onClose')
  }, [onClose])

  // 오버레이 높이 설정
  useEffect(() => {
    if (isOpen && overlayRef.current) {
      // main-content의 높이가 있으면 해당 높이로, 없으면 document 높이로 설정
      const mainContent = document.getElementById('main-content')
      if (mainContent) {
        const contentHeight = mainContent.scrollHeight
        console.log('[튜토리얼] main-content 높이:', contentHeight)
        overlayRef.current.style.height = `${contentHeight}px`
      } else {
        // main-content가 없는 경우 document 높이 사용
        const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
        console.log('[튜토리얼] document 높이:', docHeight)
        overlayRef.current.style.height = `${docHeight}px`
      }
    }
  }, [isOpen, targetElement])

  // 클릭 이벤트 핸들러
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (currentStep < config.steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      if (dontShowAgain) {
        localStorage.setItem(config.storageKey, 'true')
      }
      onClose()
    }
  }

  if (!isOpen || !targetElement || !isMounted) return null

  // 타겟 요소의 위치 계산
  const rect = targetElement.getBoundingClientRect()
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  // 설명 텍스트 위치 계산
  const getTextPosition = () => {
    const step = config.steps[currentStep]
    // 모바일에서는 패딩 값 줄임
    const padding = isMobile ? 12 : 20 // 타겟 요소와의 간격 (픽셀)
    // 화면을 벗어나지 않도록 최대/최소 위치 제한
    const ensureVisible = (value: number, dimension: 'width' | 'height') => {
      // 텍스트 설명 박스의 추정 크기
      const boxSize = dimension === 'width' ? 300 : 100
      const max = dimension === 'width' ? windowWidth - boxSize / 2 - 10 : windowHeight - boxSize - 10
      const min = dimension === 'width' ? boxSize / 2 + 10 : boxSize + 10
      return Math.min(Math.max(value, min), max)
    }

    switch (step.textPosition) {
      case 'top':
        // 표시 위치가 화면 상단을 벗어나지 않도록 제한
        const topPosition = Math.max(padding, windowHeight - rect.top + padding)
        return {
          bottom: `${topPosition}px`,
          left: `${ensureVisible(rect.left + rect.width / 2, 'width')}px`,
          transform: 'translateX(-50%)',
        }
      case 'bottom':
        const bottomPosition = Math.min(rect.bottom + padding, windowHeight - 100)
        return {
          top: `${bottomPosition}px`,
          left: `${ensureVisible(rect.left + rect.width / 2, 'width')}px`,
          transform: 'translateX(-50%)',
        }
      case 'left':
        return {
          right: `${Math.min(windowWidth - rect.left + padding, windowWidth - 150)}px`,
          top: `${ensureVisible(rect.top + rect.height / 2, 'height')}px`,
          transform: 'translateY(-50%)',
        }
      case 'right':
        return {
          left: `${Math.min(rect.right + padding, windowWidth - 150)}px`,
          top: `${ensureVisible(rect.top + rect.height / 2, 'height')}px`,
          transform: 'translateY(-50%)',
        }
      default:
        // 기본값은 bottom
        return {
          top: `${Math.min(rect.bottom + padding, windowHeight - 100)}px`,
          left: `${ensureVisible(rect.left + rect.width / 2, 'width')}px`,
          transform: 'translateX(-50%)',
        }
    }
  }

  // 사각형 위치와 크기를 계산하여 클리핑 경로 생성
  const clipPath = `
    polygon(
      0% 0%, 
      0% 100%, 
      100% 100%, 
      100% 0%,
      ${rect.left - 4}px 0%, 
      ${rect.left - 4}px ${rect.top - 4}px, 
      ${rect.right + 4}px ${rect.top - 4}px, 
      ${rect.right + 4}px ${rect.bottom + 4}px, 
      ${rect.left - 4}px ${rect.bottom + 4}px, 
      ${rect.left - 4}px 0%
    )
  `

  // 클릭하여 계속하기 메시지 위치 계산 함수
  const getMessagePosition = () => {
    // 현재 스텝의 위치 설정 또는 기본값 사용
    const position = config.steps[currentStep].messagePosition || config.defaultMessagePosition || 'middle'

    // PC에서는 항상 중앙
    if (!isMobile) {
      return {
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }
    }

    // 모바일에서 위치 분기 처리
    switch (position) {
      case 'top':
        return {
          left: '50%',
          top: '15%', // 상단에서 15% 위치
          transform: 'translateX(-50%)',
        }
      case 'middle':
        return {
          left: '50%',
          top: '50%', // 중앙
          transform: 'translate(-50%, -50%)',
        }
      case 'bottom':
        return {
          left: '50%',
          bottom: '15%', // 하단에서 15% 위치
          top: 'auto',
          transform: 'translateX(-50%)',
        }
    }
  }

  // React Portal을 통해 body에 직접 렌더링
  const tutorialContent = (
    <>
      {/* 검은색 오버레이 배경 - 클리핑 경로 사용 */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/85 backdrop-blur-none transition-all duration-300"
        style={{
          clipPath: clipPath,
          WebkitClipPath: clipPath,
          minHeight: '100vh',
          top: 0,
          left: 0,
          right: 0,
          position: 'fixed',
          zIndex: 9999999,
        }}
        onClick={handleClick}
      />

      {/* 타겟 요소 테두리 */}
      <div
        className="fixed border-2 border-primary-500 rounded-lg animate-[pulse_2s_ease-in-out_infinite]"
        style={{
          top: rect.top - 4,
          left: rect.left - 4,
          width: rect.width + 8,
          height: rect.height + 8,
          zIndex: 9999999,
        }}
      />

      {/* 설명 텍스트 */}
      <div
        className={`fixed text-white text-center ${isMobile ? 'max-w-[250px] p-2' : 'max-w-[300px] p-3'} shadow-lg bg-black/80`}
        style={{
          ...getTextPosition(),
          borderRadius: '12px',
          zIndex: 9999999,
        }}
      >
        <div
          className={`${isMobile ? 'text-xs' : 'text-base'} font-medium`}
          dangerouslySetInnerHTML={{ __html: config.steps[currentStep].html }}
        />
      </div>

      {/* 클릭하여 계속하기 텍스트 */}
      <div
        className={`fixed text-white text-center animate-pulse`}
        style={{
          // 명시적으로 위치 지정 (상대 배치 방식 제거)
          position: 'fixed',
          ...getMessagePosition(),
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: isMobile ? '8px 16px' : '10px 20px',
          borderRadius: '30px',
          width: 'auto',
          zIndex: 9999999,
        }}
      >
        <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-white`}>클릭하여 계속하기</p>
      </div>

      {/* 다시보지 않기 체크박스 */}
      <div
        className={`fixed ${isMobile ? 'top-2 right-2' : 'top-4 right-4'} flex items-center gap-2 text-white bg-black/60 ${isMobile ? 'px-2 py-1' : 'px-3 py-2'} rounded-full shadow-lg transition-all duration-300 hover:bg-black/70`}
        style={{ zIndex: 9999999 }}
      >
        <input
          type="checkbox"
          id="dontShowAgain"
          checked={dontShowAgain}
          onChange={e => setDontShowAgain(e.target.checked)}
          className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} rounded-md border-gray-300 text-primary-500 focus:ring-primary-500 cursor-pointer accent-primary-500`}
        />
        <label
          htmlFor="dontShowAgain"
          className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium cursor-pointer select-none`}
        >
          다시 보지 않기
        </label>
      </div>
    </>
  )

  // Portal을 사용하여 body에 직접 렌더링
  return createPortal(tutorialContent, document.body)
}
