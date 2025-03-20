'use client'

import type { ReactNode } from 'react'

import BaseModal from './BaseModal'

interface ConfirmActionModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  className?: string
  showCloseButton?: boolean
  preventBackdropClose?: boolean
}

export default function ConfirmActionModal({
  isOpen,
  onClose,
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  className = '',
  showCloseButton = true,
  preventBackdropClose = false,
}: ConfirmActionModalProps) {
  const footerContent = (
    <div className="flex justify-end space-x-3">
      <button
        onClick={onClose}
        className="rounded-full bg-secondary-100 px-5 py-2 text-secondary-700 transition-colors hover:bg-secondary-200 dark:bg-dark-secondary-800 dark:text-dark-secondary-200 dark:hover:bg-dark-secondary-700"
      >
        {cancelText}
      </button>
      <button
        onClick={onConfirm}
        className="rounded-full bg-primary-500 px-5 py-2 text-white transition-colors hover:bg-primary-600 dark:bg-dark-primary-500 dark:hover:bg-dark-primary-600"
      >
        {confirmText}
      </button>
    </div>
  )

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className={className}
      showCloseButton={showCloseButton}
      preventBackdropClose={preventBackdropClose}
      footerContent={footerContent}
      size="sm"
    >
      {typeof description === 'string' ? (
        <p className="text-secondary-800 dark:text-dark-secondary-200">{description}</p>
      ) : (
        description
      )}
    </BaseModal>
  )
}
