'use client';

import { useState } from 'react';
import LoginModal from '@/components/modal/LoginModal';
import { useAccountStore } from '@/store/useAccountStore';

export default function GuestSignupPage() {
  const [isOpen, setIsOpen] = useState(true);
  const { isLogin } = useAccountStore();

  const handleClose = () => {
    setIsOpen(false);

    window.history.back();
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
