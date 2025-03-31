'use client'

import { SkeletonThemeProvider } from '@/components/elements/skeleton'
import ModalManager from '@/components/modal/ModalManager'
import { useThemeStore } from '@/store/useStoreData'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'
import { InitDataLoader } from '@/app/providers/InitDataLoader'

import { API_URL, CHAT_URL } from '@/services/api/storyNationApi'
import { useAccountStore } from '@/store/useStoreData'

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  )
  const { isDarkMode } = useThemeStore()
  const [mounted, setMounted] = useState(false)
  const { isLogin, data } = useAccountStore()

  // 컴포넌트가 마운트되었는지 확인
  useEffect(() => {
    setMounted(true)

    // Zustand 스토어 하이드레이션 수동 처리
    const hydrateStore = async () => {
      const { useThemeStore, useCoinStore } = await import('@/store/useStoreData')
      useThemeStore.persist.rehydrate()
      useCoinStore.persist.rehydrate()
    }

    hydrateStore()
  }, [])

  // 다크모드 초기화
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') return

    // 시스템 다크모드 감지
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches

    // 로컬 스토리지에 저장된 테마가 없고, 시스템이 다크모드면 다크모드 적용
    const hasStoredTheme = localStorage.getItem('theme-storage') !== null
    if (isDarkMode || (!hasStoredTheme && prefersDarkMode)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // 시스템 다크모드 변경 감지
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme-storage')) {
        if (e.matches) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [isDarkMode, mounted])

  // 스켈레톤 테마 색상 설정
  const skeletonBaseColor = mounted && isDarkMode ? '#1E293B' : '#E5E7EB'
  const skeletonHighlightColor = mounted && isDarkMode ? '#334155' : '#F3F4F6'

  const DevNote = () => {
    return (
      <div className="fixed top-0 left-0 bg-black/40 text-white text-bold p-4 shadow-lg z-50 rounded text-xs pointer-events-none">
        <b>CURRENT</b>
        <p>API_URL: {API_URL}</p>
        <p>CHAT_URL: {CHAT_URL}</p>

        <br />
        <pre>
          GUEST LOGIN
          <br />
          release : bslive1, bslive2, bslive1
          <br />
          dev : BS1, BS2, BS3, 천마신군
        </pre>
        <br />

        <pre>
          IS LOGIN : {isLogin ? 'true' : 'false'}
          <br />
          {isLogin && (
            <>
              NICKNAME : {data?.nick_nm}
              <br />
            </>
          )}
        </pre>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      <div
        className="relative w-full h-full mobile-scroll-container"
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '100vw',
          maxHeight: '100vh',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <SkeletonThemeProvider
          baseColor={skeletonBaseColor}
          highlightColor={skeletonHighlightColor}
          borderRadius="0.25rem"
          duration={1.5}
        >
          <InitDataLoader>
            <AnimatePresence mode="wait">{children}</AnimatePresence>
            <ModalManager />
          </InitDataLoader>
        </SkeletonThemeProvider>
      </div>
    </QueryClientProvider>
  )
}
