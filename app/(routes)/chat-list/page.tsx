'use client'

import ChatListPage from '@/views/chat-list/home'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccountStore } from '@/store/useStoreData'

export default function Page() {
  const router = useRouter()
  const isLogin = useAccountStore(state => state.isLogin)
  
  useEffect(() => {
    // 로그인 상태가 아니면 로그인 페이지로 리다이렉트
    if (!isLogin) {
      router.push('/login')
    }
  }, [isLogin, router])

  // 비로그인 상태일 때 임시 로딩 상태 표시
  if (!isLogin) {
    return <div className="flex justify-center items-center min-h-screen">로그인 확인 중...</div>
  }

  return (
    <>
      <ChatListPage />
    </>
  );
}
