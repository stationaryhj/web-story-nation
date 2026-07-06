'use client';

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnimatePresence, motion } from 'framer-motion';
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';
import { useEffect } from 'react';
import Portal from '@/components/portal/Portal';
import { lockScroll, resetScrollLock, unlockScroll } from '@/lib/utils/scrollLock';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
  showCloseButton?: boolean;
  preventBackdropClose?: boolean;
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
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, preventBackdropClose]);

  // 모달이 열릴 때 스크롤 락 적용
  useEffect(() => {
    if (isOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }

    return () => {
      // 컴포넌트 언마운트 시 스크롤 락 초기화
      resetScrollLock();
    };
  }, [isOpen]);

  // 백드롭 클릭으로 모달 닫기
  const handleBackdropClick = () => {
    if (!preventBackdropClose) {
      onClose();
    }
  };

  // 모달 컨텐츠 클릭 시 이벤트 전파 중지
  const handleModalClick = (e: ReactMouseEvent) => {
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Portal>
          <div className='fixed inset-0 z-50 flex items-center justify-center'>
            {/* 배경 */}
            <motion.div
              className='fixed inset-0 bg-overlay/50'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleBackdropClick}
            />

            {/* 모달 컨테이너 */}
            <motion.div
              className={`relative z-10 w-full max-w-md rounded-lg bg-surface-elevated p-5 shadow-xl ${className}`}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              onClick={handleModalClick}
            >
              {/* 헤더 */}
              <div className='mb-4 flex items-center justify-between'>
                <h3 className='text-lg font-bold text-text-primary'>{title}</h3>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className='text-text-muted transition-colors hover:text-text-primary'
                  >
                    <FontAwesomeIcon icon={faTimes} className='h-5 w-5' />
                  </button>
                )}
              </div>

              {/* 컨텐츠 */}
              <div>{children}</div>
            </motion.div>
          </div>
        </Portal>
      )}
    </AnimatePresence>
  );
}
