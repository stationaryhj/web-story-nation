'use client';

import type { ReactNode } from 'react';

import BaseModal from './BaseModal';

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  className?: string;
  showCloseButton?: boolean;
  preventBackdropClose?: boolean;
}

export default function ConfirmActionModal({
  isOpen,
  onClose,
  title,
  description,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  className = '',
  showCloseButton = true,
  preventBackdropClose = false,
}: ConfirmActionModalProps) {
  const footerContent = (
    <div className='flex justify-end space-x-3'>
      <button
        onClick={onCancel || onClose}
        className='rounded-full bg-surface-elevated px-5 py-2 text-text-primary transition-colors hover:bg-surface-elevated-hover'
      >
        {cancelText}
      </button>
      <button
        onClick={onConfirm}
        className='rounded-full bg-brand px-5 py-2 text-text-inverse transition-colors hover:bg-brand-hover'
      >
        {confirmText}
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className={className}
      showCloseButton={showCloseButton}
      preventBackdropClose={preventBackdropClose}
      footerContent={footerContent}
      size='sm'
    >
      {typeof description === 'string' ? (
        <div className='flex flex-col gap-2 justify-center items-center px-8 pb-4'>
          <p className='text-center text-text-primary'>{description}</p>
        </div>
      ) : (
        <div className='flex flex-col gap-2 justify-center items-center px-8 pb-4 text-center'>
          {description}
        </div>
      )}
    </BaseModal>
  );
}
