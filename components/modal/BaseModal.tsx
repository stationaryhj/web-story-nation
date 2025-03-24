'use client'

import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion, AnimatePresence } from 'framer-motion'
import type { CSSProperties, ReactNode, MouseEvent as ReactMouseEvent } from 'react'
import { useEffect } from 'react'

interface BaseModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
  contentClassName?: string
  headerClassName?: string
  bodyClassName?: string
  footerClassName?: string
  showCloseButton?: boolean
  preventBackdropClose?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  position?: 'center' | 'top' | 'bottom'
  backdropColor?: string
  style?: CSSProperties
  footerContent?: ReactNode
  hideHeader?: boolean
  animation?: 'fade' | 'slide' | 'scale' | 'none'
  animationDuration?: number
  zIndex?: number
  onBackdropClick?: () => void
  onAnimationComplete?: () => void
}

export default function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  contentClassName = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  showCloseButton = true,
  preventBackdropClose = false,
  size = 'md',
  position = 'center',
  backdropColor = 'bg-black/50',
  style,
  footerContent,
  hideHeader = false,
  animation = 'scale',
  animationDuration = 0.2,
  zIndex = 50,
  onBackdropClick,
  onAnimationComplete,
}: BaseModalProps) {
  // 모달이 열릴 때 배경 스크롤 방지
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    if (isOpen) {
      // 스크롤바 너비만큼 패딩을 추가하여 레이아웃 이동 방지
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      // 컴포넌트 언마운트 또는 isOpen 상태 변경 시 원래 스타일로 복원
      if (isOpen) {
        document.body.style.overflow = originalStyle
        document.body.style.paddingRight = '0px'
      }
    }
  }, [isOpen])

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !preventBackdropClose) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose, preventBackdropClose])

  // 백드롭 클릭으로 모달 닫기
  const handleBackdropClick = () => {
    if (!preventBackdropClose) {
      if (onBackdropClick) {
        onBackdropClick()
      } else {
        onClose()
      }
    }
  }

  // 모달 컨텐츠 클릭 시 이벤트 전파 중지
  const handleModalClick = (e: ReactMouseEvent) => {
    e.stopPropagation()
  }

  // 모달 크기에 따른 클래스 설정
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  }

  // 모달 위치에 따른 클래스 설정
  const positionClasses = {
    center: 'items-center justify-center',
    top: 'items-start justify-center pt-16',
    bottom: 'items-end justify-center pb-16',
  }

  // 애니메이션 설정
  const getAnimationProps = () => {
    switch (animation) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: animationDuration },
        }
      case 'slide':
        return {
          initial: { y: position === 'top' ? -100 : position === 'bottom' ? 100 : 0, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: position === 'top' ? -100 : position === 'bottom' ? 100 : 0, opacity: 0 },
          transition: { type: 'spring', damping: 25, stiffness: 300 },
        }
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.9 },
          transition: { type: 'spring', damping: 20, stiffness: 300 },
        }
      case 'none':
      default:
        return {
          initial: {},
          animate: {},
          exit: {},
          transition: {},
        }
    }
  }

  return (
    <AnimatePresence onExitComplete={onAnimationComplete}>
      {isOpen && (
        <div className={`fixed inset-0 z-${zIndex} flex ${positionClasses[position]}`}>
          {/* 백드롭 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: animationDuration }}
            className={`fixed inset-0 ${backdropColor}`}
            onClick={handleBackdropClick}
          />

          {/* 모달 */}
          <motion.div
            {...getAnimationProps()}
            className={`relative z-10 max-h-[90vh] w-full overflow-auto rounded-xl bg-white shadow-lg dark:bg-dark-background-light ${sizeClasses[size]} ${className}`}
            onClick={handleModalClick}
            style={style}
          >
            <div className={`flex flex-col ${contentClassName}`}>
              {/* 모달 헤더 */}
              {!hideHeader && (
                <div className={`mb-4 flex items-center justify-between p-5 pb-0 ${headerClassName}`}>
                  {title && (
                    <h2 className="text-xl font-bold text-secondary-900 dark:text-dark-secondary-100">{title}</h2>
                  )}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="text-secondary-500 transition-colors hover:text-secondary-700 dark:text-dark-secondary-400 dark:hover:text-dark-secondary-300"
                      aria-label="닫기"
                    >
                      <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}

              {/* 모달 내용 */}
              <div className={`p-5 ${bodyClassName}`}>{children}</div>

              {/* 모달 푸터 */}
              {footerContent && <div className={`mt-2 p-5 pt-0 ${footerClassName}`}>{footerContent}</div>}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
