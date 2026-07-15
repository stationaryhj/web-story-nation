/**
 * 전역 공용 내비게이션 설정 — DesktopSideNav·MobileGNB 공유
 *
 * 근거 계획: docs/plan/plan-20260710-home-sidebar-integration.md (1단계, 담당: writer)
 *           docs/plan/plan-20260715-sidebar-menu-restructure.md (1단계, 담당: writer)
 *
 * 항목은 두 종류다:
 *  - route: 실제 라우트로 이동하는 항목 (홈/채팅/만들기/수익내역/상점)
 *  - action: 라우트가 없는 액션형 항목. 현재 정의는 남아있으나 사용 항목은 없다
 *            (`NavConfigActionItem`/`chatModeSelect` 분기는 무해한 죽은 코드로 유지).
 *
 * requireLogin/loginTypeCheck 기준은 기존 Header(components/common/header.tsx:88-119)·
 * MobileGNB(components/common/MobileGNB.tsx:45-75) navLinks를 그대로 계승한다.
 */

import type { LucideIcon } from 'lucide-react';
import { HandCoins, Home, MessageCircle, Store, UserRoundPlus } from 'lucide-react';

interface NavConfigItemBase {
  /** 항목 식별자. DesktopSideNavView의 SideNavItemView.key와 대응. */
  key: string;
  label: string;
  icon: LucideIcon;
  /** 미로그인 시 진입 차단(socialLogin 모달) 여부. */
  requireLogin: boolean;
  /** Guest 등 정식 로그인이 아닌 경우도 차단할지 여부. */
  loginTypeCheck?: boolean;
}

interface NavConfigRouteItem extends NavConfigItemBase {
  kind: 'route';
  href: string;
}

interface NavConfigActionItem extends NavConfigItemBase {
  kind: 'action';
  action: 'chatModeSelect';
}

export type NavConfigItem = NavConfigRouteItem | NavConfigActionItem;

export const navConfig: NavConfigItem[] = [
  {
    kind: 'route',
    key: 'home',
    label: '홈',
    href: '/',
    icon: Home,
    requireLogin: false,
  },
  {
    kind: 'route',
    key: 'chat',
    label: '채팅',
    href: '/chat-list',
    icon: MessageCircle,
    requireLogin: true,
  },
  {
    kind: 'route',
    key: 'create',
    label: '만들기',
    href: '/my-characters',
    icon: UserRoundPlus,
    requireLogin: true,
    loginTypeCheck: true,
  },
  {
    kind: 'route',
    key: 'revenue',
    label: '수익내역',
    href: '/my-account',
    icon: HandCoins,
    requireLogin: true,
    loginTypeCheck: true,
  },
  {
    kind: 'route',
    key: 'shop',
    label: '상점',
    href: '/shop-recharge',
    icon: Store,
    requireLogin: true,
  },
];

/**
 * 현재 pathname에 해당하는 route 항목의 key를 반환한다.
 * action 항목(현재 정의된 항목 없음)은 라우트가 없어 판정 대상에서 제외된다.
 * 여러 route가 prefix로 겹칠 가능성에 대비해 href가 가장 긴(구체적인) 항목을 우선한다.
 */
export function getActiveKey(pathname: string | null | undefined): string | null {
  if (!pathname) return null;

  const routeItems = navConfig.filter((item): item is NavConfigRouteItem => item.kind === 'route');

  const matched = routeItems
    .filter((item) => (item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)))
    .sort((a, b) => b.href.length - a.href.length)[0];

  return matched?.key ?? null;
}
