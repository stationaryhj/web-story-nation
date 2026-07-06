'use client';

import { BaseButton } from '@/components/elements/button/BaseButton';
import BaseModal from './BaseModal';

interface ResetChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ResetChatModal({ isOpen, onClose, onConfirm }: ResetChatModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size='sm' hideHeader>
      <div className='p-6 text-center'>
        <p className='text-text-primary mb-6'>
          초기화된 채팅 내용은 복구할 수 없습니다.
          <br />
          그래도 초기화 하시겠습니까?
        </p>

        <div className='flex justify-center space-x-3'>
          <BaseButton color='secondary' onClick={onClose} className='px-4 py-2'>
            취소
          </BaseButton>
          <BaseButton color='primary' onClick={onConfirm} className='px-4 py-2'>
            초기화
          </BaseButton>
        </div>
      </div>
    </BaseModal>
  );
}
