// app/layout.tsx
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'

import './globals.css'
import Script from 'next/script'
import type { ReactNode } from 'react'

import Providers from './providers'

// Poppins 폰트 설정
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '스토리네이션',
  description: '스토리네이션 - 캐릭터 기반 서비스',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" className={`${poppins.variable}`} suppressHydrationWarning>
      <head>
        {/* 다크모드 초기화를 위한 인라인 스크립트 */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // 로컬 스토리지에서 테마 설정 가져오기
                  const storedTheme = localStorage.getItem('theme-storage');
                  const theme = storedTheme ? JSON.parse(storedTheme) : null;
                  const isDarkMode = theme?.state?.isDarkMode;
                  
                  // 시스템 다크모드 감지
                  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  
                  // 다크모드 적용 여부 결정
                  const shouldApplyDarkMode = isDarkMode === true || 
                    (isDarkMode === undefined && prefersDarkMode);
                  
                  // HTML에 다크모드 클래스 추가
                  if (shouldApplyDarkMode) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  // 에러 발생 시 기본값 사용
                  console.error('테마 초기화 중 오류 발생:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans bg-white dark:bg-gray-900 transition-colors duration-300" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
