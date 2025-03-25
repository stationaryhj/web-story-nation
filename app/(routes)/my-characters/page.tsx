'use client'

import MyCharacterPage from '@/views/my-characters/home'
import Header from '@/components/common/header'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccountStore } from '@/store/useStoreData'

export default function Page() {
  const router = useRouter()
  const { isLogin } = useAccountStore()

  useEffect(() => {
    if (!isLogin) {
      router.push('/login')
    }
  }, [isLogin, router])

  //  로딩 상태일 때 보여줄 UI
  if (!isLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <MyCharacterPage />
    </>
  )
}
