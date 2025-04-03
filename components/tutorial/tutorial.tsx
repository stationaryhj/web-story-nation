import { useEffect, useRef, useState } from 'react'

// 튜토리얼 단계 설정 인터페이스
interface TutorialStep {
  id: string
  html: string
  textPosition?: 'top' | 'bottom' | 'left' | 'right'
}

// 튜토리얼 설정 인터페이스
interface TutorialConfig {
  steps: TutorialStep[]
  storageKey: string // localStorage에 저장할 키 값
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

  // 클릭 이벤트 핸들러
  const handleClick = () => {
    if (currentStep < config.steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      if (dontShowAgain) {
        localStorage.setItem(config.storageKey, 'true')
      }
      onClose()
    }
  }

  // 튜토리얼이 열릴 때 클릭 이벤트 리스너 추가
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [isOpen, currentStep, config.steps.length, dontShowAgain])

  if (!isOpen || !targetElement) return null

  // 타겟 요소의 위치 계산
  const rect = targetElement.getBoundingClientRect()
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  // 설명 텍스트 위치 계산
  const getTextPosition = () => {
    const step = config.steps[currentStep]
    const padding = 20 // 타겟 요소와의 간격 (픽셀)

    switch (step.textPosition) {
      case 'top':
        return {
          bottom: `${windowHeight - rect.top + padding}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)',
        }
      case 'bottom':
        return {
          top: `${rect.bottom + padding}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)',
        }
      case 'left':
        return {
          right: `${windowWidth - rect.left + padding}px`,
          top: `${rect.top + rect.height / 2}px`,
          transform: 'translateY(-50%)',
        }
      case 'right':
        return {
          left: `${rect.right + padding}px`,
          top: `${rect.top + rect.height / 2}px`,
          transform: 'translateY(-50%)',
        }
      default:
        // 기본값은 bottom
        return {
          top: `${rect.bottom + padding}px`,
          left: `${rect.left + rect.width / 2}px`,
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

  return (
    <>
      {/* 검은색 오버레이 배경 - 클리핑 경로 사용 */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/85 z-[9999] backdrop-blur-sm transition-all duration-300"
        style={{
          clipPath: clipPath,
          WebkitClipPath: clipPath,
        }}
        onClick={handleClick}
      />

      {/* 타겟 요소 테두리 */}
      <div
        className="fixed border-2 border-primary-500 rounded-lg z-[10000] animate-[pulse_2s_ease-in-out_infinite]"
        style={{
          top: rect.top - 4,
          left: rect.left - 4,
          width: rect.width + 8,
          height: rect.height + 8,
          boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.4), 0 0 15px rgba(99, 102, 241, 0.4)',
        }}
      />

      {/* 설명 텍스트 */}
      <div
        className="fixed text-white text-center max-w-[300px] z-[10001] p-3 backdrop-blur-sm shadow-lg"
        style={{
          ...getTextPosition(),
          borderRadius: '12px',
        }}
      >
        <div className="text-lg font-medium" dangerouslySetInnerHTML={{ __html: config.steps[currentStep].html }} />
      </div>

      {/* 클릭하여 계속하기 텍스트 - 화면 정중앙에 배치 */}
      <div
        className="fixed text-white text-center z-[10001] animate-pulse"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '10px 20px',
          borderRadius: '30px',
          width: 'auto',
        }}
      >
        <p className="text-sm font-medium text-white">클릭하여 계속하기</p>
      </div>

      {/* 다시보지 않기 체크박스 */}
      <div className="fixed top-4 right-4 flex items-center gap-2 text-white z-[10001] bg-black/60 px-3 py-2 rounded-full backdrop-blur-sm shadow-lg transition-all duration-300 hover:bg-black/70">
        <input
          type="checkbox"
          id="dontShowAgain"
          checked={dontShowAgain}
          onChange={e => setDontShowAgain(e.target.checked)}
          className="w-4 h-4 rounded-md border-gray-300 text-primary-500 focus:ring-primary-500 cursor-pointer accent-primary-500"
        />
        <label htmlFor="dontShowAgain" className="text-sm font-medium cursor-pointer select-none">
          다시 보지 않기
        </label>
      </div>
    </>
  )
}
