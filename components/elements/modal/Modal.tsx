'use client'

import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AnimatePresence, motion } from 'framer-motion'
import { ReactNode, useEffect } from 'react'
import { lockScroll, unlockScroll, resetScrollLock } from '@/lib/utils/scrollLock'

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
export type ModalPosition = 'center' | 'top' | 'bottom' | 'left' | 'right'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string | ReactNode
  children: ReactNode
  size?: ModalSize
  position?: ModalPosition
  showCloseButton?: boolean
  closeOnClickOutside?: boolean
  closeOnEsc?: boolean
  preventScroll?: boolean
  footer?: ReactNode
  className?: string
  contentClassName?: string
  headerClassName?: string
  footerClassName?: string
  animation?: 'fade' | 'zoom' | 'slide-up' | 'slide-down' | 'slide-left' | 'slide-right'
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  position = 'center',
  showCloseButton = true,
  closeOnClickOutside = true,
  closeOnEsc = true,
  preventScroll = true,
  footer,
  className = '',
  contentClassName = '',
  headerClassName = '',
  footerClassName = '',
  animation = 'fade',
}: ModalProps) {
  // 모달 열릴 때 스크롤 방지
  useEffect(() => {
    if (isOpen && preventScroll) {
      lockScroll()
    } else {
      unlockScroll()
    }

    return () => {
      resetScrollLock()
    }
  }, [isOpen, preventScroll])

  // ESC 키 눌렀을 때 모달 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEsc && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeOnEsc, isOpen, onClose])

  // 백드롭 클릭 핸들러
  const handleBackdropClick = () => {
    if (closeOnClickOutside) {
      onClose()
    }
  }

  // 이벤트 전파 방지 (모달 내부 클릭시 백드롭 클릭으로 간주되지 않도록)
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // 모달 크기 클래스
  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full h-full m-0',
  }

  // 모달 위치 클래스
  const positionClasses = {
    center: 'items-center justify-center',
    top: 'items-start justify-center pt-16',
    bottom: 'items-end justify-center pb-16',
    left: 'items-center justify-start pl-16',
    right: 'items-center justify-end pr-16',
  }

  // 애니메이션 변형
  const animationVariants = {
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    zoom: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
    'slide-up': {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 30 },
    },
    'slide-down': {
      initial: { opacity: 0, y: -30 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -30 },
    },
    'slide-left': {
      initial: { opacity: 0, x: 30 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 30 },
    },
    'slide-right': {
      initial: { opacity: 0, x: -30 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -30 },
    },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 z-50 flex ${positionClasses[position]} overflow-auto p-4 ${className}`}
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className={`relative rounded-lg bg-white shadow-xl dark:bg-dark-background-light ${
              size === 'full' ? 'w-full' : sizeClasses[size]
            } ${contentClassName}`}
            onClick={handleModalClick}
            {...animationVariants[animation]}
            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
          >
            {/* 헤더 */}
            {(title || showCloseButton) && (
              <div
                className={`flex items-center justify-between border-b border-secondary-200 p-4 dark:border-dark-secondary-700 ${headerClassName}`}
              >
                {title && (
                  <h3 className="text-lg font-medium text-secondary-900 dark:text-dark-secondary-200">{title}</h3>
                )}
                {showCloseButton && (
                  <button
                    type="button"
                    className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-secondary-500 transition-colors hover:bg-secondary-100 hover:text-secondary-700 dark:text-dark-secondary-400 dark:hover:bg-dark-secondary-800 dark:hover:text-dark-secondary-300"
                    onClick={onClose}
                    aria-label="닫기"
                  >
                    <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {/* 내용 */}
            <div className="p-5">{children}</div>

            {/* 푸터 */}
            {footer && (
              <div className={`border-t border-secondary-200 p-4 dark:border-dark-secondary-700 ${footerClassName}`}>
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
