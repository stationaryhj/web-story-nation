'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useAccountStore } from '@/store/useStoreData';
import { useSettingsStore } from '@/store/useStoreSettings';
import BaseModal from './BaseModal';

interface AdultVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify?: () => void; // 본인인증 성공 시 호출될 콜백
}

export default function AdultVerificationModal({
  isOpen,
  onClose,
  onVerify,
}: AdultVerificationModalProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const { enableAdultMode } = useSettingsStore();
  const router = useRouter();

  // 본인인증 처리 함수
  const handleVerify = async () => {
    try {
      const { verifyIdentity } = useAccountStore.getState();
      const result = await verifyIdentity();

      if (result.success) {
        // 인증 성공 시 콜백 실행
        if (onVerify) {
          onVerify();
        }

        onClose();

        return;
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('본인인증 중 오류 발생:', error);
    } finally {
      setIsVerifying(false);
    }
  };

  // 푸터에 들어갈 버튼 컴포넌트
  const footerButtons = (
    <div className='flex justify-end space-x-3'>
      <button
        onClick={onClose}
        className='px-4 py-2 border border-border-default rounded-md text-text-primary hover:bg-surface-elevated transition-colors'
        disabled={isVerifying}
      >
        취소
      </button>
      <button
        onClick={handleVerify}
        className='px-4 py-2 bg-brand hover:bg-brand-hover text-text-inverse rounded-md transition-colors flex items-center justify-center'
        disabled={isVerifying}
      >
        {isVerifying ? (
          <>
            <svg
              className='animate-spin -ml-1 mr-2 h-4 w-4 text-text-inverse'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              ></circle>
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              ></path>
            </svg>
            인증 중...
          </>
        ) : (
          '본인인증하기'
        )}
      </button>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size='md'
      animation='scale'
      showCloseButton={true}
      preventBackdropClose={isVerifying}
      footerContent={footerButtons}
    >
      <div className='flex flex-col items-center mb-6 text-center'>
        <div className='mb-2'>
          <svg
            className='mx-auto h-16 w-16 text-yellow-500'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
            />
          </svg>
        </div>
        <div className='text-[20px] font-bold mb-4'>성인 인증이 필요한 서비스</div>
        <p className='text-md text-text-muted'>
          성인인증을 마친 뒤 성인모드 캐릭터를 생성할 수 있어요!
        </p>
      </div>
    </BaseModal>
  );
}
