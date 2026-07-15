'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { MouseEvent } from 'react';
import { useEffect, useState } from 'react';
import useModalStore from '@/shared/model/stores/useModalStore';
import { useAccountStore } from '@/store/useStoreData';
import { getActiveKey, type NavConfigItem, navConfig } from './navConfig';

export default function MobileGNB() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { openModal } = useModalStore();
  const { isLogin } = useAccountStore();

  // 컴포넌트가 마운트되었는지 확인
  useEffect(() => {
    setMounted(true);

    // 페이지 하단에 패딩 추가
    const addBottomPadding = () => {
      document.body.style.paddingBottom = '64px'; // GNB 높이
    };

    addBottomPadding();

    return () => {
      document.body.style.paddingBottom = '0';
    };
  }, [pathname]);

  // 마운트되지 않았거나 chat/[id] 페이지인 경우 렌더링하지 않음
  if (!mounted || (pathname && pathname.startsWith('/chat/') && pathname !== '/chat-list'))
    return null;

  const activeKey = getActiveKey(pathname);

  // 게이팅 + 액션 분기 핸들러. route/action 항목 모두 동일 규칙(DesktopSideNav와 동일)을 적용한다.
  const handleNavItemClick = (
    e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    item: NavConfigItem
  ) => {
    // 게이팅: 미로그인만 차단한다. 로그인 상태면 게스트 포함 진행(DesktopSideNav와 동일 정책).
    if (item.requireLogin && !isLogin) {
      e.preventDefault();
      openModal({ type: 'socialLogin' });
      return;
    }

    if (item.kind === 'action' && item.action === 'chatModeSelect') {
      e.preventDefault();
      openModal({ type: 'chatModeSelect' });
    }
  };

  return (
    <div
      className='md:hidden sticky bottom-0 left-0 right-0 bg-surface-sunken border-t border-border-default h-16'
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: '55px',
        zIndex: 100,
        boxShadow: '0 -2px 4px rgba(0,0,0,0.05)',
        margin: 0,
        padding: 0,
      }}
    >
      <div className='grid grid-cols-5 h-full'>
        {navConfig.map((item) => {
          const isActive = item.key === activeKey;
          const Icon = item.icon;
          const colorClassName = isActive ? 'text-brand' : 'text-text-muted';

          if (item.kind === 'route') {
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={(e) => handleNavItemClick(e, item)}
                className={`flex flex-col items-center justify-center ${colorClassName}`}
              >
                <Icon className={`w-5 h-5 ${colorClassName}`} />
                <span className='text-[10px] mt-1'>{item.label}</span>
              </Link>
            );
          }

          return (
            <button
              key={item.key}
              type='button'
              onClick={(e) => handleNavItemClick(e, item)}
              className={`flex flex-col items-center justify-center ${colorClassName}`}
            >
              <Icon className={`w-5 h-5 ${colorClassName}`} />
              <span className='text-[10px] mt-1'>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
