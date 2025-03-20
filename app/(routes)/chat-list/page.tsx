'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatListPage from '@/views/chatList';
import { useAccountStore } from '@/store/useStoreData';

export default function Page() {
  const router = useRouter();
  const { isLogin } = useAccountStore();

  useEffect(() => {
    // 로그인 상태 확인 - 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    if (!isLogin) {
      router.push('/login');
    }
  }, [isLogin, router]);

  // 로그인되지 않은 경우 렌더링 중지
  if (!isLogin) {
    return null;
  }

  return (
    <>
      <ChatListPage />
    </>
  );
}
