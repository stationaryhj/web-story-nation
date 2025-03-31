'use client'

import React, { useEffect, ReactNode, useState } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { lockScroll, unlockScroll, resetScrollLock } from '@/lib/utils/scrollLock'
import Portal from '@/components/portal/Portal'

interface BaseSidebarProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  headerExtra?: ReactNode
  width?: string
  side?: 'right' | 'left'
  className?: string
}

/**
 * 모든 사이드바 컴포넌트의 기본 구조를 제공하는 베이스 컴포넌트
 */
export default function BaseSidebar({
  isOpen,
  onClose,
  title,
  children,
  headerExtra,
  width = '',
  side = 'right',
  className,
}: BaseSidebarProps) {
  const [isMobile, setIsMobile] = useState(false)

  // 화면 크기 감지
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    // 초기 체크
    checkIsMobile()

    // 리사이즈 이벤트 리스너
    window.addEventListener('resize', checkIsMobile)

    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])

  // 모달이 열릴 때 배경 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      lockScroll()
    } else {
      unlockScroll()
    }

    return () => {
      resetScrollLock()
    }
  }, [isOpen])

  // 반응형 너비 설정 로직
  const getWidth = () => {
    if (width) {
      return width
    }

    return isMobile ? '100%' : '600px'
  }

  if (!isOpen) return null

  const sidebarContent = (
    <>
      {/* 배경 오버레이 */}
      <motion.div
        className="fixed inset-0 bg-black/50 z-[999]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* 사이드바 컨테이너 */}
      <motion.div
        className={`fixed top-0 ${side === 'right' ? 'right-0' : 'left-0'} h-full bg-white dark:bg-dark-background-light shadow-xl z-[1000] overflow-hidden ${className}`}
        style={{
          width: getWidth(),
          minWidth: isMobile ? 'auto' : '600px',
          maxWidth: isMobile ? '100%' : 'none',
          maxHeight: '100vh',
          overflowX: 'hidden',
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        initial={{ x: side === 'right' ? '100%' : '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: side === 'right' ? '100%' : '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-white dark:bg-dark-background-DEFAULT z-20 px-6 py-4 border-b dark:border-dark-secondary-200/10 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-dark-secondary-200">{title}</h2>
            {headerExtra && <div>{headerExtra}</div>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-secondary-500 hover:bg-secondary-100 dark:text-dark-secondary-400 dark:hover:bg-dark-secondary-800"
            aria-label="닫기"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">{children}</div>
      </motion.div>
    </>
  )

  // Portal을 사용하여 DOM의 최상단에 렌더링
  return <Portal>{sidebarContent}</Portal>
}
