'use client';

import { faBell } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { SocialLoginProvider } from '@/services/auth/types';
import useNewModalStore from '@/shared/model/stores/useModalStore';
import { useAccountStore } from '@/store/useAccountStore';
import { useModalStore } from '@/store/useStoreModal';

interface NotificationButtonProps {
  count?: number;
  className?: string;
}

export default function NotificationButton({ count = 0, className = '' }: NotificationButtonProps) {
  const { loginType } = useAccountStore();
  const [isHovered, setIsHovered] = useState(false);
  const { openModal } = useModalStore();
  const { openModal: openNewModal } = useNewModalStore();

  const handleClick = () => {
    if (!loginType || loginType === ('Guest' as SocialLoginProvider)) {
      openNewModal({ type: 'socialLogin' });
      return;
    }

    openModal('notification'); // 알림 사이드바 모달 열기
  };

  return (
    <button
      className={`relative rounded-full p-2 text-text-muted transition-colors hover:bg-surface-elevated-hover hover:text-text-primary ${className}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label='알림'
    >
      <FontAwesomeIcon icon={faBell} className={`h-5 w-5 ${isHovered ? 'animate-wiggle' : ''}`} />
      {count > 0 && (
        <span className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-xs font-bold text-text-inverse'>
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  );
}
