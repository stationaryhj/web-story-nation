'use client';

import { BaseButton } from '../elements/button/BaseButton';
import BaseModal from './BaseModal';

interface DuplicateLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DuplicateLoginModal({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
}: DuplicateLoginModalProps) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title='기존에 가입된 계정이 있습니다. 그대로 로그인하시겠습니까?'
      footerContent={
        <div className='flex justify-end w-full'>
          <BaseButton color='primary' className='w-full' onClick={onCancel}>
            취소
          </BaseButton>

          <BaseButton
            color='primary'
            className='w-full bg-gradient-to-r from-brand to-brand-hover text-text-inverse transition-all duration-200 font-medium disabled:opacity-50 shadow-md transform'
            onClick={onConfirm}
          >
            로그인
          </BaseButton>
        </div>
      }
    >
      <div className='flex flex-col items-center space-y-6 px-4'>
        <div className='text-center text-sm text-text-muted px-4'>
          <p>기존 계정으로 로그인할 경우 지금까지 대화한 내용은 저장되지 않습니다.</p>
        </div>
      </div>
    </BaseModal>
  );
}
