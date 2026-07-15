// app/layout.tsx
import type { Metadata } from 'next';
import { Noto_Sans_KR, Poppins } from 'next/font/google';
import 'react-toastify/dist/ReactToastify.css';

import './globals.css';
import { Plus } from 'lucide-react';
import Script from 'next/script';
import type { ReactNode } from 'react';
import AppShell from '@/components/common/AppShell';
import MobileGNB from '@/components/common/MobileGNB';
import DraggableButton from '@/components/elements/button/DraggableButton';
import { ToastPortal } from '@/components/elements/toast/ToastPortal';
import { IS_DARK_THEME } from '@/shared/config/theme';
import Providers from './providers';

// Poppins 폰트 설정 (라틴 우선)
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

// Noto Sans KR — 한글 폴백. 글리프 용량이 커 korean subset은 프리로드하지 않고
// latin subset + display:swap + unicode-range 폴백으로 처리(초기 로드 부담 최소화).
const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-kr',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '스토리네이션',
  description: '스네: 함께 만드는 세계관&캐릭터 채팅',
  metadataBase: new URL('https://www.storynation.co.kr'),
  icons: {
    icon: '/images/storyNation_thumb.png',
  },
  openGraph: {
    type: 'website',
    title: '스토리네이션',
    description: '스네: 함께 만드는 세계관&캐릭터 채팅',
    images: [
      {
        url: 'https://www.storynation.co.kr/images/sn-thumb.jpg',
        width: 1200,
        height: 630,
        alt: '스토리네이션 썸네일',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '스토리네이션',
    description: '스네: 함께 만드는 세계관&캐릭터 채팅',
    images: ['https://www.storynation.co.kr/images/sn-thumb.jpg'],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang='ko'
      className={`${poppins.variable} ${notoSansKr.variable}${IS_DARK_THEME ? ' dark' : ''}`}
      suppressHydrationWarning
    >
      <head>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, height=device-height'
        />
        {/* 테마는 APP_THEME 상수로 서버에서 정적 결정되므로 초기화 스크립트가 불필요하다. */}
        {/* 뷰포트 높이 계산을 위한 스크립트 */}
        <Script
          id='viewport-height'
          strategy='beforeInteractive'
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
      <body
        className='font-sans bg-surface transition-colors duration-300'
        suppressHydrationWarning
      >
        <Providers>
          <div className='flex min-h-screen flex-col md:pb-0'>
            <AppShell>{children}</AppShell>
          </div>
        </Providers>

        {/* 메인 플로팅 메뉴 버튼 */}
        <DraggableButton color='bg-primary-500' />

        <MobileGNB />
        <ToastPortal />
      </body>
    </html>
  );
}
