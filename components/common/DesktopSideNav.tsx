'use client';

/**
 * 데스크톱 좌측 세로 사이드바 — 컨테이너(로직) 컴포넌트
 *
 * 근거 계획: docs/plan/plan-20260710-home-sidebar-integration.md (3단계, 담당: writer)
 *
 * pathname 기반 활성 판정, 로그인/로그인타입 게이팅, route push·action(모달 오픈) 분기를
 * 전담한다. 마크업/스타일은 표시용 View(DesktopSideNavView, 담당: publisher)가 담당하며
 * 이 컴포넌트는 View를 수정하지 않고 소비만 한다.
 */

import { usePathname, useRouter } from 'next/navigation';
import useModalStore from '@/shared/model/stores/useModalStore';
import { useAccountStore } from '@/store/useStoreData';
import DesktopSideNavView, { type SideNavItemView } from './DesktopSideNavView';
import { getActiveKey, navConfig } from './navConfig';

export default function DesktopSideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { openModal } = useModalStore();
  const { isLogin } = useAccountStore();

  // 채팅 상세(`/chat/[id]`)에서는 MobileGNB와 동일하게 사이드바를 숨긴다.
  if (pathname && pathname.startsWith('/chat/') && pathname !== '/chat-list') {
    return null;
  }

  const activeKey = getActiveKey(pathname);

  const items: SideNavItemView[] = navConfig.map((item) => ({
    key: item.key,
    label: item.label,
    icon: item.icon,
    isActive: item.key === activeKey,
  }));

  const handleItemClick = (key: string) => {
    const item = navConfig.find((navItem) => navItem.key === key);
    if (!item) return;

    // 게이팅: 미로그인만 차단한다. 로그인 상태면 게스트 포함 해당 페이지/액션으로 진행한다.
    // (기존 Header의 loginType 검사는 주석 처리돼 비활성 상태였으므로 동일 정책을 따른다.)
    if (item.requireLogin && !isLogin) {
      openModal({ type: 'socialLogin' });
      return;
    }

    if (item.kind === 'route') {
      router.push(item.href);
      return;
    }

    if (item.kind === 'action' && item.action === 'chatModeSelect') {
      openModal({ type: 'chatModeSelect' });
    }
  };

  return <DesktopSideNavView items={items} onItemClick={handleItemClick} />;
}
