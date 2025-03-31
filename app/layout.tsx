// app/layout.tsx
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'

import './globals.css'
import Script from 'next/script'
import type { ReactNode } from 'react'

import Providers from './providers'
import DraggableButton from '@/components/elements/button/DraggableButton'
import MobileGNB from '@/components/common/MobileGNB'
import { Fan } from 'lucide-react'

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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, height=device-height"
        />
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
        {/* 뷰포트 높이 계산을 위한 스크립트 */}
        <Script
          id="viewport-height"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // 실제 뷰포트 높이 계산 및 CSS 변수 설정
                const setViewportHeight = () => {
                  const vh = window.innerHeight * 0.01;
                  document.documentElement.style.setProperty('--vh', \`\${vh}px\`);
                };
                
                // 초기화 시 실행
                setViewportHeight();
                
                // 리사이즈 이벤트에서 실행
                window.addEventListener('resize', setViewportHeight);
                
                // 방향 전환(orientation) 이벤트에서 실행
                window.addEventListener('orientationchange', () => {
                  setTimeout(setViewportHeight, 100);
                });
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans bg-white dark:bg-gray-900 transition-colors duration-300" suppressHydrationWarning>
        <Providers>
          <div className="flex min-h-screen flex-col pb-16 md:pb-0">
            <div className="flex-1">{children}</div>
          </div>
        </Providers>

        {/* 메인 플로팅 메뉴 버튼 */}
        <DraggableButton color="bg-primary-500" icon={<Fan size={24} color="white" />} />

        <MobileGNB />
      </body>
    </html>
  )
}
