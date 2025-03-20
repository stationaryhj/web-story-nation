'use client'

<<<<<<< HEAD
<<<<<<< HEAD
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode, MouseEvent as ReactMouseEvent } from 'react';
import { useEffect } from 'react';
=======
=======
>>>>>>> d52f283b589cf3627df43245f82c281c5d3b5553
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode, MouseEvent as ReactMouseEvent } from 'react'
import { useEffect } from 'react'
<<<<<<< HEAD
>>>>>>> d52f283b589cf3627df43245f82c281c5d3b5553
=======
>>>>>>> d52f283b589cf3627df43245f82c281c5d3b5553

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
  showCloseButton?: boolean
  preventBackdropClose?: boolean
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  showCloseButton = true,
  preventBackdropClose = false,
}: ModalProps) {
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
      onClose()
    }
  }

  // 모달 컨텐츠 클릭 시 이벤트 전파 중지
  const handleModalClick = (e: ReactMouseEvent) => {
<<<<<<< HEAD
<<<<<<< HEAD
    e.stopPropagation();
  };
=======
    e.stopPropagation()
  }
>>>>>>> d52f283b589cf3627df43245f82c281c5d3b5553
=======
    e.stopPropagation()
  }
>>>>>>> d52f283b589cf3627df43245f82c281c5d3b5553

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 백드롭 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50"
            onClick={handleBackdropClick}
          />

          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`relative z-10 max-h-[90vh] w-full max-w-md overflow-auto rounded-xl bg-white p-5 shadow-lg dark:bg-dark-background-light ${className}`}
            onClick={handleModalClick}
          >
            {/* 모달 헤더 */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-dark-secondary-100">{title}</h2>
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

            {/* 모달 내용 */}
            <div>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
