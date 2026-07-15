/**
 * 데스크톱 좌측 세로 사이드바 — 표시용(View) 컴포넌트
 *
 * 근거 계획: docs/plan/plan-20260710-caveduck-shell-layout.md (1단계, 담당: publisher)
 * — caveduck식 좁은 아이콘 레일로 되돌림: 폭 80px(w-20, writer의 AppShell md:pl-20과 정합),
 *   항목을 아이콘 위·라벨 아래 세로 배치(MobileGNB 세로 패턴 재사용) + 활성 항목은
 *   둥근 사각(rounded-2xl) 채움 하이라이트로 표시. 로고는 여전히 갖지 않는다
 *   (로고는 전폭 Top bar인 Header가 소유, components/common/header.tsx, 담당: publisher).
 *
 * ⚠️ 순수 표시용(dumb component): 라우팅/게이팅/모달/스토어를 직접 다루지 않는다.
 *   클릭은 onItemClick(key)만 호출하고, 실제 동작(route push / action 분기 / 로그인 게이팅)은
 *   컨테이너(components/common/DesktopSideNav.tsx, 담당: writer)가 처리한다.
 *   navConfig의 NavConfigItem 타입을 import하지 않고 표시에 필요한 최소 형태를 자체 정의한다
 *   (표시 레이어가 로직 레이어의 타입에 의존하지 않도록 계약을 분리).
 *
 * 위치/높이 계약: 이 aside는 h-full로 셸 wrapper(writer, AppShell.tsx)를 채운다.
 * wrapper가 `md:top-16`(헤더 4rem 아래)부터 `md:bottom-0`까지 fixed 위치·높이를 담당한다.
 */

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/shared/lib/utils/cn';

export interface SideNavItemView {
  /** 항목 식별자. 컨테이너가 정의한 navConfig item.key와 대응. */
  key: string;
  /** 항목 라벨(아이콘 아래 세로 배치로 표시). */
  label: string;
  /** lucide-react 아이콘 컴포넌트. 색은 currentColor로 상속. */
  icon: LucideIcon;
  /** 현재 활성 항목 여부. true면 둥근 사각 채움 하이라이트 + aria-current='page'. */
  isActive: boolean;
}

export interface DesktopSideNavViewProps {
  items: SideNavItemView[];
  /** 항목 클릭 시 key만 콜백으로 전달. 라우팅/게이팅/모달 오픈은 컨테이너 책임. */
  onItemClick: (key: string) => void;
}

/**
 * 데스크톱(md 이상)에서만 보이는 좌측 세로 내비게이션.
 * 모바일(md 미만)은 MobileGNB가 담당하므로 이 컴포넌트는 렌더하지 않는다.
 * 로고는 사이드바가 아닌 Header 좌측에서 표시한다(components/common/header.tsx, 담당: publisher).
 */
export default function DesktopSideNavView({ items, onItemClick }: DesktopSideNavViewProps) {
  return (
    <aside className='hidden h-full w-20 shrink-0 flex-col items-stretch overflow-y-auto border-r border-border-default bg-surface-sunken py-4 md:flex'>
      <nav aria-label='주 메뉴' className='flex flex-col items-stretch gap-1 self-stretch px-2'>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type='button'
              onClick={() => onItemClick(item.key)}
              aria-current={item.isActive ? 'page' : undefined}
              className={cn(
                'flex min-h-[44px] w-full flex-col items-center justify-center gap-1 self-stretch rounded-2xl px-1 py-2 transition-colors',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand',
                item.isActive
                  ? 'bg-brand text-text-inverse'
                  : 'text-text-muted hover:bg-surface-elevated-hover active:bg-surface-elevated-hover'
              )}
            >
              <Icon aria-hidden='true' className='h-5 w-5 shrink-0' />
              <span className='mt-0.5 whitespace-nowrap text-center text-[10px] leading-tight'>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
