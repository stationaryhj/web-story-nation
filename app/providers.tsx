'use client'

import BaseModal from '@/components/modal/BaseModal';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react'
import { SkeletonThemeProvider } from '@/components/elements/skeleton';
import { useThemeStore } from '@/store/useStoreData';
import { AnimatePresence } from 'framer-motion';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const { isDarkMode } = useThemeStore()
  const [mounted, setMounted] = useState(false)
  
  // 컴포넌트가 마운트되었는지 확인
  useEffect(() => {
    setMounted(true)
    
    // Zustand 스토어 하이드레이션 수동 처리
    const hydrateStore = async () => {
      const { useThemeStore } = await import('@/store/useStoreData');
      useThemeStore.persist.rehydrate();
    };
    
    hydrateStore();
  }, []);
  
  // 다크모드 초기화
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === 'undefined') return;
    
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
  const skeletonBaseColor = mounted && isDarkMode ? "#1E293B" : "#E5E7EB"
  const skeletonHighlightColor = mounted && isDarkMode ? "#334155" : "#F3F4F6"

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <SkeletonThemeProvider
        baseColor={skeletonBaseColor}
        highlightColor={skeletonHighlightColor}
        borderRadius="0.25rem"
        duration={1.5}
      >
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
        <BaseModal />
      </SkeletonThemeProvider>
    </QueryClientProvider>
  )
}
