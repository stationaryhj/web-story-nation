'use client'

import React, { useEffect, ReactNode, useState } from 'react'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { lockScroll, unlockScroll, resetScrollLock } from '@/lib/utils/scrollLock'

interface BaseSidebarProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  headerExtra?: ReactNode
  width?: string
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
  width = '600px',
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

  if (!isOpen) return null

  return (
    <>
      {/* 배경 오버레이 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/50 dark:bg-black/80 no-scrollbar z-[100]"
        onClick={onClose}
      />

      {/* 사이드바 컨테이너 */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed top-0 right-0 h-full w-full sm:w-auto bg-white dark:bg-dark-background-DEFAULT no-scrollbar z-[101]"
        style={{ width: isMobile ? '100%' : width }}
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
        <div className="h-[calc(100%-74px)] overflow-y-auto">{children}</div>
      </motion.div>
    </>
  )
}
