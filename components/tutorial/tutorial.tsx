import { useEffect, useRef, useState } from 'react'

// 튜토리얼 단계 설정 인터페이스
interface TutorialStep {
  id: string
  text: string
  textPosition?: 'top' | 'middle' | 'bottom'
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
    switch (step.textPosition) {
      case 'top':
        return { top: '20%' }
      case 'middle':
        return { top: '50%', transform: 'translateY(-50%)' }
      case 'bottom':
        return { bottom: '20%' }
      default:
        return { bottom: '20%' }
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
        className="fixed inset-0 bg-black/80 z-[9999]"
        style={{
          clipPath: clipPath,
          WebkitClipPath: clipPath,
        }}
        onClick={handleClick}
      />

      {/* 타겟 요소 테두리 */}
      <div
        className="fixed border-2 border-white rounded-lg z-[10000]"
        style={{
          top: rect.top - 4,
          left: rect.left - 4,
          width: rect.width + 8,
          height: rect.height + 8,
        }}
      />

      {/* 설명 텍스트 */}
      <div
        className="fixed left-1/2 -translate-x-1/2 text-white text-center max-w-[80%] z-[10001]"
        style={getTextPosition()}
      >
        <p className="text-lg font-medium mb-2">{config.steps[currentStep].text}</p>
        <p className="text-sm text-gray-300">클릭하여 계속하기</p>
      </div>

      {/* 다시보지 않기 체크박스 */}
      <div className="fixed top-4 right-4 flex items-center gap-2 text-white z-[10001]">
        <input
          type="checkbox"
          id="dontShowAgain"
          checked={dontShowAgain}
          onChange={e => setDontShowAgain(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
        />
        <label htmlFor="dontShowAgain" className="text-sm">
          다시 보지 않기
        </label>
      </div>
    </>
  )
}
