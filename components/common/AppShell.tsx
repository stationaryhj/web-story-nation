'use client';

/**
 * 전역 셸 — 전폭 Header 마운트 + 데스크톱 좌측 아이콘 레일 마운트 + 메인 콘텐츠 여백 계산
 *
 * 근거 계획: docs/plan/plan-20260710-caveduck-shell-layout.md (2단계, 담당: writer)
 *
 * caveduck식 셸 구조 = [전폭 Top bar(Header)] / [좁은 아이콘 레일(top bar 아래) | 여백 콘텐츠].
 * Header가 페이지별 렌더에서 이 전역 셸로 승격되었다(4단계, 16개 페이지에서 <Header/> 제거).
 * 채팅 상세(`/chat/[id]`)에서는 Header·레일·좌측 여백을 모두 제거해 몰입형 화면을 보존한다
 * (`views/chat/home.tsx`가 이미 자체 Header 렌더를 주석 처리한 상태와 정합).
 *
 * ⚠️ 레이아웃 판단(writer): app/layout.tsx의 상위 래퍼는 `flex flex-col`이라 레일을
 * 일반 flex 형제로 두면 콘텐츠와 나란히 배치되지 않고 수직으로 쌓인다(DesktopSideNavView는
 * `h-full`만 사용, `fixed`가 아니므로 스스로 플로우를 빠져나가지 못함). 레일을 감싸는 래퍼만
 * `md:fixed`로 플로우에서 제거하고, Header 높이(4rem)만큼 아래(`md:top-16`)에서
 * `md:bottom-0`까지 채운다(z-40, Header z-50 아래). 본문에는 `md:pl-20`로 레일 폭(w-20)을
 * 보정한다. DesktopSideNavView(publisher) 마크업 자체는 수정하지 않는다.
 *
 * 폭 계약(publisher ↔ writer 합의값): 레일 폭 w-20(80px) / 본문 보정 md:pl-20 /
 * 헤더 높이 4rem(레일 md:top-16). 세 값은 세트로만 함께 변경한다.
 */

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils/cn';
import DesktopSideNav from './DesktopSideNav';
import Header from './header';

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isImmersive = !!pathname && pathname.startsWith('/chat/') && pathname !== '/chat-list';
  const showSideNav = !isImmersive;

  return (
    <>
      {!isImmersive && <Header />}
      {showSideNav && (
        <div className='hidden md:fixed md:top-16 md:bottom-0 md:left-0 md:z-40 md:block'>
          <DesktopSideNav />
        </div>
      )}
      <div id='main-content' className={cn('flex-1', showSideNav && 'md:pl-20')}>
        {children}
      </div>
    </>
  );
}
