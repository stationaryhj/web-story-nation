'use client'

// 서버 컴포넌트로 변경
import PageTransition from '@/components/motion/PageTransition'

import SettingsForm from '@/views/settings/home'

export default function SettingsPage() {

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow container mx-auto px-4 py-6">
          {/* 클라이언트 컴포넌트로 폼 부분 분리 */}
          <SettingsForm />
        </main>
      </div>
    </PageTransition>
  )
}
