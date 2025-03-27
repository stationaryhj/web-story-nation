'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'

// 타입 정의는 types/window.ts 파일로 이동했습니다
// window.resizeTimer 속성을 사용하기 위해 타입 참조
import '../../../types/window'

interface DraggableButtonProps {
  color?: string
  children: React.ReactNode
  onClick?: () => void
  initialPosition?: { x: number; y: number }
  size?: number
  buttonIndex?: number // 여러 버튼 사용 시 위치 계산을 위한 인덱스
  buttonsCount?: number // 전체 버튼 개수 (간격 계산용)
}

export default function DraggableButton({
  color = 'bg-blue-500',
  children,
  onClick,
  initialPosition,
  size = 70,
  buttonIndex = 0, // 기본값은 0 (첫 번째 버튼)
  buttonsCount = 2, // 기본값은 2개 버튼
}: DraggableButtonProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [actualSize, setActualSize] = useState(size)

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
  // 모바일에서 추가 상단 여백 (픽셀)
  const MOBILE_EXTRA_MARGIN_TOP = 80
  // 버튼 간 간격 (픽셀)
  const BUTTON_SPACING_DESKTOP = 20
  const BUTTON_SPACING_MOBILE = 15
  // 버튼 투명도 값
  const BUTTON_OPACITY_NORMAL = 0.8

  // 모바일 환경 감지 함수
  const checkIfMobile = useCallback(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth < MOBILE_BREAKPOINT
  }, [])

  // 기본 위치 계산 (드래그 무시)
  const calculateDefaultPosition = useCallback(() => {
    if (typeof window === 'undefined') return { x: 0, y: 0 }

    const buttonSize = isMobile ? Math.round(size * MOBILE_SIZE_RATIO) : size
    const margin = isMobile ? 15 : 20
    const spacing = isMobile ? BUTTON_SPACING_MOBILE : BUTTON_SPACING_DESKTOP

    const screenWidth = window.innerWidth
    const screenHeight = window.innerHeight
    const totalButtonsWidth = buttonsCount * buttonSize + (buttonsCount - 1) * spacing

    let leftStart = screenWidth - margin - totalButtonsWidth
    let initialX

    if (isMobile && totalButtonsWidth > screenWidth - 2 * margin) {
      const availableWidth = screenWidth - 2 * margin
      const buttonSectionWidth = availableWidth / buttonsCount
      const centerPoint = margin + buttonIndex * buttonSectionWidth + buttonSectionWidth / 2
      initialX = centerPoint - buttonSize / 2
    } else {
      initialX = leftStart + buttonIndex * (buttonSize + spacing)
    }

    const bottomMargin = isMobile ? margin + MOBILE_EXTRA_MARGIN_TOP : margin
    let initialY = screenHeight - bottomMargin - buttonSize

    initialX = Math.min(initialX, screenWidth - margin - buttonSize)
    initialX = Math.max(margin, initialX)

    return { x: initialX, y: initialY }
  }, [isMobile, size, buttonIndex, buttonsCount])

  // 버튼 위치 계산 함수
  const calculatePosition = useCallback(() => {
    if (typeof window === 'undefined') return { x: 0, y: 0 }

    const buttonSize = isMobile ? Math.round(size * MOBILE_SIZE_RATIO) : size

    // 사용자가 드래그로 위치를 변경했으면 재계산하지 않음 (화면 안으로만 조정)
    if (hasUserRepositioned.current && positionRef.current.x !== 0 && positionRef.current.y !== 0) {
      // 화면 밖으로 나가는 것만 방지
      const maxX = Math.max(0, window.innerWidth - buttonSize)
      const maxY = Math.max(0, window.innerHeight - buttonSize)

      return {
        x: Math.min(positionRef.current.x, maxX),
        y: Math.min(positionRef.current.y, maxY),
      }
    }

    // 기본 위치 계산
    return calculateDefaultPosition()
  }, [isMobile, size, calculateDefaultPosition])

  // 위치 및 크기 업데이트
  const updatePositionAndSize = useCallback(() => {
    const newIsMobile = checkIfMobile()

    if (newIsMobile !== prevIsMobile.current) {
      setIsMobile(newIsMobile)
      prevIsMobile.current = newIsMobile

      const newSize = newIsMobile ? Math.round(size * MOBILE_SIZE_RATIO) : size
      setActualSize(newSize)

      const defaultPosition = calculateDefaultPosition()
      positionRef.current = defaultPosition
      setPosition(defaultPosition)

      hasUserRepositioned.current = false
    } else if (isInitialized.current) {
      const newPosition = calculatePosition()
      positionRef.current = newPosition
      setPosition(newPosition)
    } else {
      const newSize = newIsMobile ? Math.round(size * MOBILE_SIZE_RATIO) : size
      setActualSize(newSize)

      const newPosition = calculatePosition()
      positionRef.current = newPosition
      setPosition(newPosition)

      isInitialized.current = true
    }
  }, [checkIfMobile, calculatePosition, calculateDefaultPosition, size])

  // 초기 설정 및 리사이징 이벤트 처리
  useEffect(() => {
    if (typeof window === 'undefined') return

    // 초기 설정
    if (!isInitialized.current) {
      updatePositionAndSize()
    }

    // 렌더링 이후에만 버튼을 표시 (하이드레이션 이슈 방지)
    const visibilityTimer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    // 브라우저 크기 변경 이벤트 리스너
    const handleResize = () => {
      // 디바운싱 적용 (성능 최적화)
      if (window.resizeTimer) {
        clearTimeout(window.resizeTimer)
      }

      window.resizeTimer = setTimeout(() => {
        updatePositionAndSize()
      }, 100)
    }

    window.addEventListener('resize', handleResize)

    // 모바일 모드 전환 강제 체크 (iOS Safari 등에서 스크롤 시 주소창 크기 변화 감지를 위함)
    const scrollCheck = () => {
      if (window.resizeTimer) {
        clearTimeout(window.resizeTimer)
      }

      window.resizeTimer = setTimeout(() => {
        const currentIsMobile = checkIfMobile()
        if (currentIsMobile !== prevIsMobile.current) {
          updatePositionAndSize()
        }
      }, 100)
    }

    window.addEventListener('scroll', scrollCheck)

    // 모바일 환경에서 방향 전환(orientation) 감지
    const handleOrientationChange = () => {
      if (window.resizeTimer) {
        clearTimeout(window.resizeTimer)
      }

      window.resizeTimer = setTimeout(() => {
        updatePositionAndSize()
      }, 100)
    }

    window.addEventListener('orientationchange', handleOrientationChange)

    // 컴포넌트 언마운트 시 이벤트 리스너 및 타이머 정리
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', scrollCheck)
      window.removeEventListener('orientationchange', handleOrientationChange)
      clearTimeout(visibilityTimer)
      if (window.resizeTimer) {
        clearTimeout(window.resizeTimer)
      }
    }
  }, [updatePositionAndSize, checkIfMobile])

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
    // 드래그가 아닌 단순 클릭인 경우에만 클릭 이벤트 실행
    if (!hasMoved.current && onClick) {
      onClick()
    }
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
    if (e.touches.length !== 1) return

    // 터치 시작 시 기본 동작 방지 (스크롤 방지)
    e.preventDefault()
    e.stopPropagation()

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

  const handleTouchEnd = () => {
    setIsDragging(false)

    if (!hasMoved.current && onClick) {
      onClick()
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

  if (!isVisible) return null

  return (
    <button
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
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
        zIndex: 9999,
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
      <div className="transform scale-125 flex items-center justify-center w-full h-full">{children}</div>
    </button>
  )
}
