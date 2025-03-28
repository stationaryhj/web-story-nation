'use client'

// 서버 컴포넌트로 변경
import Header from '@/components/common/header'
import PageTransition from '@/components/motion/PageTransition'

import SettingsForm from '@/views/settings/home'
import { useTermsStore } from '@/store/useGlobalStore'
import { useEffect } from 'react'

export default function SettingsPage() {
  // useEffect(() => {
  //   const initializeTerms = async () => {
  //     await useTermsStore.getState().initializeAllTerms();
  //   }
  //   initializeTerms();
  // }, [])

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
