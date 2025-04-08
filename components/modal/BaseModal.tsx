'use client'

import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion, AnimatePresence } from 'framer-motion'
import type { CSSProperties, ReactNode, MouseEvent as ReactMouseEvent } from 'react'
import { useEffect } from 'react'
import { lockScroll, unlockScroll, resetScrollLock } from '@/lib/utils/scrollLock'
import Portal from '@/components/portal/Portal'

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
  icon?: ReactNode
  isIcon?: boolean
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
  icon,
  isIcon = false,
}: BaseModalProps) {
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
    sm: 'w-[375px] min-w-[375px] max-w-[375px]',
    md: 'w-[375px] min-w-[375px] max-w-[375px]',
    lg: 'w-full min-w-[375px] max-w-lg',
    xl: 'w-full min-w-[375px] max-w-xl',
    full: 'w-full min-w-[375px] max-w-[1300px] mx-4',
  }

  // 모달 위치에 따른 클래스 설정
  const positionClasses = {
    center: 'items-center justify-center min-h-screen',
    top: 'items-start justify-center pt-4 sm:pt-16',
    bottom: 'items-end justify-center pb-4 sm:pb-16',
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
        <Portal>
          <div className={`fixed inset-0 z-[1100] flex min-w-[375px] ${positionClasses[position]}`}>
            {/* 백드롭 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: animationDuration }}
              className={`fixed inset-0 ${backdropColor} z-[1101]`}
              onClick={handleBackdropClick}
            />

            {/* 모달 */}
            <motion.div
              {...getAnimationProps()}
              className={`relative z-[1102] rounded-xl bg-white shadow-lg dark:bg-dark-background-light ${sizeClasses[size]} ${className} overflow-hidden md:overflow-visible`}
              onClick={handleModalClick}
              style={{ ...style, minWidth: '375px' }}
            >
              {/* 모달 헤더 - 닫기 버튼만 포함 */}
              {!hideHeader && showCloseButton && (
                <div className={`relative flex justify-end p-3 pb-0 ${headerClassName}`}>
                  <button
                    onClick={onClose}
                    className="text-secondary-500 transition-colors hover:text-secondary-700 dark:text-dark-secondary-400 dark:hover:text-dark-secondary-300"
                    aria-label="닫기"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
                  </button>
                </div>
              )}

              {/* 닫기 버튼이 필요하지만 헤더가 숨겨진 경우 */}
              {hideHeader && showCloseButton && (
                <div className="absolute right-4 top-4 z-10">
                  <button
                    onClick={onClose}
                    className="text-secondary-500 transition-colors hover:text-secondary-700 dark:text-dark-secondary-400 dark:hover:text-dark-secondary-300"
                    aria-label="닫기"
                  >
                    <FontAwesomeIcon icon={faTimes} className="h-6 w-6" />
                  </button>
                </div>
              )}

              {/* 모달 내용 */}
              <div className={`${bodyClassName} h-full overflow-y-auto md:overflow-visible`}>
                {/* 아이콘이 있는 경우 타이틀 위에 표시 */}
                {isIcon && icon && <div className="mb-3 flex justify-center">{icon}</div>}
                {/* 타이틀을 바디에 포함 (가운데 정렬) */}
                {title && (
                  <h2 className="mb-4 text-center text-xl font-bold text-secondary-900 dark:text-dark-secondary-100">
                    {title}
                  </h2>
                )}
                {children}
              </div>

              {/* 모달 푸터 */}
              {footerContent && (
                <div className={`border-t border-secondary-100 dark:border-dark-secondary-800 p-4 ${footerClassName}`}>
                  {footerContent}
                </div>
              )}
            </motion.div>
          </div>
        </Portal>
      )}
    </AnimatePresence>
  )
}
