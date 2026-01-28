'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import LoginModal from '@/components/modal/LoginModal';
import { useAccountStore } from '@/store/useAccountStore';

function GuestSignupContent() {
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL에서 게스트 정보 복원
  useEffect(() => {
    const guestInfo = searchParams.get('guest_info');
    if (guestInfo) {
      try {
        const decoded = JSON.parse(atob(guestInfo));
        // useAccountStore에 게스트 상태 복원
        useAccountStore.getState().setLoginState(true, decoded, 'Guest');
      } catch (e) {
        console.error('게스트 정보 파싱 실패:', e);
      }
    }
  }, [searchParams]);

  const handleClose = () => {
    setIsOpen(false);
    window.history.back();
  };

  const handleSuccess = () => {
    router.push('/shop-recharge');
  };

  return <LoginModal isOpen={isOpen} onLoginSuccess={handleSuccess} onClose={handleClose} />;
}

export default function GuestSignupPage() {
  return (
    <Suspense fallback={<div />}>
      <GuestSignupContent />
    </Suspense>
  );
}
