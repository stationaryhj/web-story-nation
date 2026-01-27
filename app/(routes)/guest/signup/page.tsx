'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import LoginModal from '@/components/modal/LoginModal';
import { useAccountStore } from '@/store/useAccountStore';

export default function GuestSignupPage() {
  const [isOpen, setIsOpen] = useState(true);
  const { isLogin } = useAccountStore();

  const handleClose = () => {
    if (!isLogin) {
      setIsOpen(false);

      window.history.back();
    }
  };

  return (
    <LoginModal
      isOpen={isOpen}
      callbackUrl='/shop-recharge'
      onClose={handleClose}
      chrbot_key={null}
    />
  );
}
