'use client'

// 서버 컴포넌트로 변경
import Header from '@/components/common/header'
import PageTransition from '@/components/motion/PageTransition'

import SettingsForm from '@/views/settings/home'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccountStore } from '@/store/useStoreData'

export default function SettingsPage() {
  const router = useRouter()
  const { isLogin } = useAccountStore()

  useEffect(() => {
    if (!isLogin) {
      router.push('/login')
    }
  }, [isLogin, router])

  // 로딩 상태일 때 보여줄 UI
  if (!isLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6">
          {/* 클라이언트 컴포넌트로 폼 부분 분리 */}
          <SettingsForm />
        </main>
      </div>
    </PageTransition>
  )
}
