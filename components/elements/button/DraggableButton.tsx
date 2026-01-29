'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pen, Lightbulb, Minus, X } from 'lucide-react'
import IdeaShareModal from '../../modal/IdeaShareModal'
import RewardModal from '../../modal/RewardModal'
import { contentApi } from '@/services/api/storyNationApi'
import { useAccountStore } from '@/store/useAccountStore'
import useModalStore from '@/shared/model/stores/useModalStore'

// 타입 정의는 types/window.ts 파일로 이동했습니다
// window.resizeTimer 속성을 사용하기 위해 타입 참조
import '../../../types/window'

interface FloatingMenuButton {
  id: string
  icon: React.JSX.Element
  label: string
  color: string
  onClick: () => void
  position: {
    x: number
    y: number
  }
}

interface DraggableButtonProps {
  color?: string
  children?: React.ReactNode
  icon?: React.ReactNode
  onClick?: () => void
  initialPosition?: { x: number; y: number }
  size?: number
  floatingMenuButtons?: FloatingMenuButton[]
  id?: string
}

export default function DraggableButton({
  color = 'bg-blue-500',
  children,
  icon,
  onClick,
  initialPosition,
  size = 70,
  floatingMenuButtons,
  id = 'default-draggable-button',
}: DraggableButtonProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [actualSize, setActualSize] = useState(size)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [ideaModalOpen, setIdeaModalOpen] = useState(false)
  const [rewardModalOpen, setRewardModalOpen] = useState(false)
  const { openModal } = useModalStore()

  const isInitialized = useRef(false)
  const prevIsMobile = useRef(false)

  // 모바일 기준 화면 너비 (이 값보다 작으면 모바일로 간주)
  const MOBILE_BREAKPOINT = 768
  // 모바일에서 버튼 크기 축소 비율
  const MOBILE_SIZE_RATIO = 0.7
  // 버튼 여백
  const BUTTON_MARGIN = 20
  // 모바일 GNB 높이 (MobileGNB.tsx의 실제 높이인 55px로 수정)
  const MOBILE_GNB_HEIGHT = 55
  // 버튼 간 간격 (픽셀)
  const BUTTON_SPACING = 80
  // 버튼 투명도 값
  const BUTTON_OPACITY_NORMAL = 0.8
  // 메뉴 버튼 크기
  const NAV_BUTTON_SIZE = isMobile ? 50 : 60
  // 버튼 간 거리
  const BUTTON_DISTANCE = isMobile ? 70 : 80

  const { isLogin } = useAccountStore()

  // 모바일 환경 감지 함수
  const checkIfMobile = useCallback(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < MOBILE_BREAKPOINT
  }, [])

  // 기본 위치 계산 (항상 좌측 하단에 위치하도록 설정)
  const calculatePosition = useCallback(() => {
    if (typeof window === 'undefined') return { x: 0, y: 0 }

    const buttonSize = isMobile ? Math.round(size * MOBILE_SIZE_RATIO) : size
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    // 왼쪽 하단에 위치하도록 설정
    const initialX = BUTTON_MARGIN

    // 모바일에서는 GNB 높이를 고려하여 위치 조정 (추가 여백 포함)
    const gapFromGNB = 15 // GNB로부터의 추가 간격
    const bottomMargin = isMobile ? BUTTON_MARGIN + MOBILE_GNB_HEIGHT + gapFromGNB : BUTTON_MARGIN
    const initialY = screenHeight - bottomMargin - buttonSize

    return { x: initialX, y: initialY }
  }, [isMobile, size])

  // 위치 및 크기 업데이트
  const updatePositionAndSize = useCallback(() => {
    const newIsMobile = checkIfMobile()
    const newSize = newIsMobile ? Math.round(size * MOBILE_SIZE_RATIO) : size

    // 모바일 상태가 변경된 경우에만 크기 업데이트
    if (newIsMobile !== prevIsMobile.current) {
      setIsMobile(newIsMobile)
      prevIsMobile.current = newIsMobile
      setActualSize(newSize)
    }

    // 위치 업데이트 (항상 좌측 하단으로 설정)
    const newPosition = calculatePosition()
    setPosition(newPosition)

    if (!isInitialized.current) {
      isInitialized.current = true
    }
  }, [checkIfMobile, calculatePosition, size])

  // localStorage에서 버튼의 닫힌 상태 확인
  useEffect(() => {
    const isButtonHidden = localStorage.getItem(`draggable-button-hidden-${id}`)
    if (isButtonHidden === 'true') {
      setIsVisible(false)
    } else {
      setIsVisible(true)
    }
  }, [id])

  // 페이지 새로고침 시 버튼 다시 보이기
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem(`draggable-button-hidden-${id}`)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [id])

  // 초기 위치 업데이트
  useEffect(() => {
    const forceUpdateTimer = setTimeout(() => {
      if (isInitialized.current) {
        updatePositionAndSize()
      }
    }, 1000)

    return () => clearTimeout(forceUpdateTimer)
  }, [updatePositionAndSize])

  // ESC 키로 메뉴 닫기
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscKey)
    return () => window.removeEventListener('keydown', handleEscKey)
  }, [isMenuOpen])

  // 초기 설정 및 리사이징 이벤트 처리
  useEffect(() => {
    if (typeof window === 'undefined') return

    updatePositionAndSize()
    setIsVisible(true)

    const handleResize = () => {
      if (window.resizeTimer) {
        clearTimeout(window.resizeTimer)
      }

      window.resizeTimer = setTimeout(updatePositionAndSize, 100)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      if (window.resizeTimer) {
        clearTimeout(window.resizeTimer)
      }
    }
  }, [updatePositionAndSize])

  // 기본 플로팅 메뉴 버튼 정의
  const defaultFloatingMenuButtons = [
    {
      id: 'microphone',
      icon: <Lightbulb size={20} color="white" />,
      label: '아이디어 제안',
      color: 'bg-primary-500',
      onClick: () => {
        if (isLogin) {
          setIdeaModalOpen(true)
        } else {
          openModal({ type: 'socialLogin' })
        }
      },
      position: { x: 0, y: -BUTTON_DISTANCE },
    },
    {
      id: 'pen',
      icon: <Pen size={20} color="white" />,
      label: '출석체크',
      color: 'bg-primary-500',
      onClick: () => {
        if (isLogin) {
          setRewardModalOpen(true)
        } else {
          openModal({ type: 'socialLogin' })
        }
      },
      position: { x: 0, y: -BUTTON_DISTANCE * 2 },
    },
  ]

  // 아이디어 제출 처리
  const handleIdeaSubmit = async (idea: string) => {
    const response = await contentApi.SendFeedback(idea)
    if (response.data.result.err === 0) {
      setIdeaModalOpen(false)
    }
  }

  // 버튼 클릭 핸들러
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsMenuOpen(!isMenuOpen)
  }

  // 아이콘 컨텐츠 기본값 설정
  const buttonContent = children || (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        key={isMenuOpen ? 'minus' : 'plus'}
        initial={{ rotate: -180, scale: 0 }}
        animate={{ rotate: 0, scale: 1 }}
        exit={{ rotate: 180, scale: 0 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
          duration: 0.3,
        }}
        className="flex items-center justify-center"
      >
        {isMenuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Minus size={24} color="white" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus size={24} color="white" />
          </motion.div>
        )}
      </motion.div>
    </div>
  )

  if (!isVisible) return null

  // 사용할 플로팅 메뉴 버튼 결정
  const menuButtons = floatingMenuButtons || defaultFloatingMenuButtons

  return (
    <>
      <button
        onClick={handleClick}
        className={`
          fixed
          ${color}
          text-white
          rounded-full
          shadow-lg
          select-none
          flex
          items-center
          justify-center
          transition-transform
          duration-200
          hover:scale-110
          active:scale-95
        `}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 999,
          width: `${actualSize}px`,
          height: `${actualSize}px`,
          fontSize: isMobile ? '0.875rem' : '1rem',
          opacity: BUTTON_OPACITY_NORMAL,
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <div className="transform scale-125 flex items-center justify-center w-full h-full">{buttonContent}</div>
      </button>

      {/* 플로팅 메뉴 버튼 (메인 버튼 클릭 시 표시) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* 메뉴 배경 (클릭 시 메뉴 닫힘) */}
            <motion.div
              className="fixed inset-0 bg-black/10"
              style={{ zIndex: 998 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />

            {/* 플로팅 메뉴 버튼 렌더링 */}
            {menuButtons.map(button => (
              <motion.button
                key={button.id}
                className={`fixed rounded-full ${button.color} text-white flex items-center gap-2 shadow-lg px-4`}
                style={{
                  left: `${position.x + actualSize / 2 - NAV_BUTTON_SIZE / 2}px`,
                  top: `${position.y}px`,
                  height: `${NAV_BUTTON_SIZE}px`,
                  minWidth: `${NAV_BUTTON_SIZE}px`,
                  zIndex: 999,
                }}
                initial={{
                  opacity: 0,
                  x: '0',
                  y: '0',
                }}
                animate={{
                  opacity: 1,
                  x: `${button.position.x}px`,
                  y: `${button.position.y}px`,
                  transition: {
                    duration: 0.2,
                    delay: 0.05 * menuButtons.indexOf(button),
                  },
                }}
                exit={{
                  opacity: 0,
                  x: '0',
                  y: '0',
                  transition: { duration: 0.2 },
                }}
                onClick={() => {
                  setIsMenuOpen(false)
                  button.onClick()
                }}
              >
                {button.icon}
                <span className="text-sm whitespace-nowrap">{button.label}</span>
              </motion.button>
            ))}
          </>
        )}
      </AnimatePresence>

      {/* 모달 컴포넌트 */}
      <IdeaShareModal isOpen={ideaModalOpen} onClose={() => setIdeaModalOpen(false)} onSubmit={handleIdeaSubmit} />
      <RewardModal isOpen={rewardModalOpen} onClose={() => setRewardModalOpen(false)} />
    </>
  )
}
