'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pen, Lightbulb, Minus } from 'lucide-react'
import IdeaShareModal from '../../modal/IdeaShareModal'
import RewardModal from '../../modal/RewardModal'
import { contentApi } from '@/services/api/storyNationApi'

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
}

export default function DraggableButton({
  color = 'bg-blue-500',
  children,
  icon,
  onClick,
  initialPosition,
  size = 70,
  floatingMenuButtons,
}: DraggableButtonProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [actualSize, setActualSize] = useState(size)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [ideaModalOpen, setIdeaModalOpen] = useState(false)
  const [rewardModalOpen, setRewardModalOpen] = useState(false)

  const mouseDownPosition = useRef({ x: 0, y: 0 })
  const hasMoved = useRef(false)
  // 사용자가 드래그하여 위치를 변경했는지 여부
  const hasUserRepositioned = useRef(false)
  // 현재 위치를 ref로 저장 (의존성 순환 방지)
  const positionRef = useRef({ x: 0, y: 0 })
  // 초기화 여부 추적
  const isInitialized = useRef(false)
  // 이전 화면 모드 (모바일/데스크톱) 추적
  const prevIsMobile = useRef(false)

  // 드래그로 간주할 최소 이동 거리 (픽셀)
  const DRAG_THRESHOLD = 5
  // 모바일 기준 화면 너비 (이 값보다 작으면 모바일로 간주)
  const MOBILE_BREAKPOINT = 768
  // 모바일에서 버튼 크기 축소 비율
  const MOBILE_SIZE_RATIO = 0.7
  // 버튼 여백
  const BUTTON_MARGIN = 20
  // 모바일 GNB 높이
  const MOBILE_GNB_HEIGHT = 64
  // 버튼 간 간격 (픽셀)
  const BUTTON_SPACING = 80
  // 버튼 투명도 값
  const BUTTON_OPACITY_NORMAL = 0.8
  // 메뉴 버튼 크기
  const NAV_BUTTON_SIZE = isMobile ? 50 : 60
  // 버튼 간 거리
  const BUTTON_DISTANCE = isMobile ? 70 : 80

  // 기본 플로팅 메뉴 버튼 정의
  const defaultFloatingMenuButtons = [
    {
      id: 'microphone',
      icon: <Lightbulb size={20} color="white" />,
      label: '아이디어 제안',
      color: 'bg-primary-500',
      onClick: () => setIdeaModalOpen(true),
      position: { x: 0, y: -BUTTON_DISTANCE },
    },
    {
      id: 'pen',
      icon: <Pen size={20} color="white" />,
      label: '리워드 받기',
      color: 'bg-primary-500',
      onClick: () => setRewardModalOpen(true),
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

  // 모바일 환경 감지 함수
  const checkIfMobile = useCallback(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < MOBILE_BREAKPOINT
  }, [])

  // 기본 위치 계산 (드래그 무시)
  const calculateDefaultPosition = useCallback(() => {
    if (typeof window === 'undefined') return { x: 0, y: 0 }

    const buttonSize = isMobile ? Math.round(size * MOBILE_SIZE_RATIO) : size
    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight

    // 왼쪽 하단에 위치하도록 변경
    const initialX = BUTTON_MARGIN
    // 모바일에서는 GNB 높이를 고려하여 위치 조정
    const bottomMargin = isMobile ? BUTTON_MARGIN + MOBILE_GNB_HEIGHT : BUTTON_MARGIN
    const initialY = screenHeight - bottomMargin - buttonSize

    return { x: initialX, y: initialY }
  }, [isMobile, size])

  // 버튼 위치 계산 함수 최적화
  const calculatePosition = useCallback(() => {
    if (typeof window === 'undefined') return { x: 0, y: 0 }

    const buttonSize = isMobile ? Math.round(size * MOBILE_SIZE_RATIO) : size

    // 사용자가 드래그로 위치를 변경한 경우
    if (hasUserRepositioned.current) {
      const maxX = Math.max(0, window.innerWidth - buttonSize)
      const maxY = Math.max(0, window.innerHeight - buttonSize)

      return {
        x: Math.min(Math.max(0, positionRef.current.x), maxX),
        y: Math.min(Math.max(0, positionRef.current.y), maxY),
      }
    }

    // 기본 위치 반환
    return calculateDefaultPosition()
  }, [isMobile, size, calculateDefaultPosition])

  // 위치 및 크기 업데이트 최적화
  const updatePositionAndSize = useCallback(() => {
    const newIsMobile = checkIfMobile()
    const newSize = newIsMobile ? Math.round(size * MOBILE_SIZE_RATIO) : size

    // 모바일 상태가 변경된 경우에만 크기 업데이트
    if (newIsMobile !== prevIsMobile.current) {
      setIsMobile(newIsMobile)
      prevIsMobile.current = newIsMobile
      setActualSize(newSize)
    }

    // 위치 업데이트
    const newPosition = calculatePosition()
    positionRef.current = newPosition
    setPosition(newPosition)

    if (!isInitialized.current) {
      isInitialized.current = true
    }
  }, [checkIfMobile, calculatePosition, size])

  // 초기 설정 및 리사이징 이벤트 처리
  useEffect(() => {
    if (typeof window === 'undefined') return

    // 초기 설정
    updatePositionAndSize()
    setIsVisible(true)

    // 브라우저 크기 변경 이벤트 리스너 (디바운싱 적용)
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

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 마우스 다운 위치 저장
    mouseDownPosition.current = { x: e.clientX, y: e.clientY }
    hasMoved.current = false

    setIsDragging(true)
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    // 마우스 이동 거리 계산
    const dx = Math.abs(e.clientX - mouseDownPosition.current.x)
    const dy = Math.abs(e.clientY - mouseDownPosition.current.y)
    const distance = Math.sqrt(dx * dx + dy * dy)

    // 임계값 이상 이동했다면 드래그 중으로 표시
    if (distance > DRAG_THRESHOLD) {
      hasMoved.current = true
      hasUserRepositioned.current = true // 사용자가 드래그로 위치 변경했음을 표시
    }

    const newX = e.clientX - dragStart.x
    const newY = e.clientY - dragStart.y

    // 화면 경계 제한
    const maxX = window.innerWidth - actualSize
    const maxY = window.innerHeight - actualSize

    const newPosition = {
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    }

    // ref와 state 둘 다 업데이트
    positionRef.current = newPosition
    setPosition(newPosition)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 이벤트 전파 중지를 가장 먼저 실행
    e.preventDefault()
    e.stopPropagation()

    // 드래그가 아닌 단순 클릭인 경우에만 메뉴 토글
    if (!hasMoved.current) {
      setIsMenuOpen(!isMenuOpen)
    }
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    // 이벤트 전파 중지를 가장 먼저 실행
    e.preventDefault()
    e.stopPropagation()

    if (e.touches.length !== 1) return

    const touch = e.touches[0]
    mouseDownPosition.current = { x: touch.clientX, y: touch.clientY }
    hasMoved.current = false

    setIsDragging(true)
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    })
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return

    // 항상 기본 스크롤 동작 방지
    e.preventDefault()
    e.stopPropagation()

    const touch = e.touches[0]

    // 터치 이동 거리 계산
    const dx = Math.abs(touch.clientX - mouseDownPosition.current.x)
    const dy = Math.abs(touch.clientY - mouseDownPosition.current.y)
    const distance = Math.sqrt(dx * dx + dy * dy)

    // 임계값 이상 이동했다면 드래그 중으로 표시
    if (distance > DRAG_THRESHOLD) {
      hasMoved.current = true
      hasUserRepositioned.current = true
    }

    const newX = touch.clientX - dragStart.x
    const newY = touch.clientY - dragStart.y

    // 화면 경계 제한
    const maxX = window.innerWidth - actualSize
    const maxY = window.innerHeight - actualSize

    const newPosition = {
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    }

    // ref와 state 둘 다 업데이트
    positionRef.current = newPosition
    setPosition(newPosition)
  }

  const handleTouchEnd = (e: TouchEvent) => {
    setIsDragging(false)

    // 드래그하지 않은 경우에만 메뉴 토글
    if (!hasMoved.current) {
      // 이벤트 전파 중지
      e.preventDefault()
      e.stopPropagation()
      // 메뉴 토글
      setIsMenuOpen(!isMenuOpen)
      // onClick prop이 실행되지 않도록 return
      return false
    }
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', handleTouchEnd)

      // 드래그 중에는 body의 스크롤을 방지
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      document.body.style.overflow = ''
    }
  }, [isDragging, dragStart, actualSize])

  // 위치가 변경될 때마다 ref 업데이트 (순환 방지)
  useEffect(() => {
    positionRef.current = position
  }, [position])

  // 컴포넌트가 마운트된 후 1초 후에 강제로 위치 업데이트 (초기화 이슈 대응)
  useEffect(() => {
    const forceUpdateTimer = setTimeout(() => {
      if (isInitialized.current) {
        updatePositionAndSize()
      }
    }, 1000)

    return () => clearTimeout(forceUpdateTimer)
  }, [updatePositionAndSize])

  // 메뉴가 열릴 때 ESC 키로 닫기 가능하도록 설정
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscKey)
    return () => window.removeEventListener('keydown', handleEscKey)
  }, [isMenuOpen])

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
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={e => {
          e.preventDefault()
          e.stopPropagation()
          if (!hasMoved.current) {
            setIsMenuOpen(!isMenuOpen)
          }
        }}
        className={`
          fixed
          ${color}
          text-white
          rounded-full
          shadow-lg
          cursor-pointer
          select-none
          flex
          items-center
          justify-center
          transition-transform
          duration-200
          hover:scale-110
          active:scale-95
          touch-none
        `}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 999,
          width: `${actualSize}px`,
          height: `${actualSize}px`,
          fontSize: isMobile ? '0.875rem' : '1rem',
          transform: 'translate3d(0,0,0)',
          opacity: BUTTON_OPACITY_NORMAL,
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'none',
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
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                setIsMenuOpen(false)
              }}
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
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
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
