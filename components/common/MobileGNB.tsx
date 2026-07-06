'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { HandCoins, Home, MessageCircle, Store, UserRoundPlus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { SocialLoginProvider } from '@/services/auth/types';
import useModalStore from '@/shared/model/stores/useModalStore';
import { useAccountStore } from '@/store/useStoreData';

export default function MobileGNB() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const [activeLink, setActiveLink] = useState('/');
  const { openModal } = useModalStore();
  const { isLogin, loginType } = useAccountStore();

  // 컴포넌트가 마운트되었는지 확인
  useEffect(() => {
    setMounted(true);

    // 현재 경로 확인
    if (pathname) {
      setActiveLink(pathname);
    }

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

  // 네비게이션 링크 (아이콘 추가)
  const navLinks = [
    { href: '/', label: '홈', requireLogin: false, icon: Home, loginTypeCheck: false },
    {
      href: '/chat-list',
      label: '대화',
      requireLogin: true,
      icon: MessageCircle,
      loginTypeCheck: false,
    },
    {
      href: '/my-characters',
      label: '만들기',
      requireLogin: true,
      icon: UserRoundPlus,
      loginTypeCheck: true,
    },
    {
      href: '/my-account',
      label: '수익 관리',
      requireLogin: true,
      icon: HandCoins,
      loginTypeCheck: true,
    },
    {
      href: '/shop-recharge',
      label: '상점',
      requireLogin: true,
      icon: Store,
      loginTypeCheck: false,
    },
  ];

  const isDisabled = '/guest'.includes(pathname || '');

  // 로그인 필요한 링크 체크 핸들러
  const handleNavLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    link: (typeof navLinks)[0]
  ) => {
    if (link.requireLogin && !isLogin) {
      e.preventDefault();
      openModal({ type: 'socialLogin' });
    }

    if (link.loginTypeCheck) {
      if (!loginType || loginType === ('Guest' as SocialLoginProvider)) {
        e.preventDefault();
        openModal({ type: 'socialLogin' });
      }
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
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={(e) => handleNavLinkClick(e, link)}
            className={`flex flex-col items-center justify-center ${
              activeLink === link.href ? 'text-brand' : 'text-text-muted'
            }`}
          >
            {React.createElement(link.icon, {
              className: `w-5 h-5 ${activeLink === link.href ? 'text-brand' : 'text-text-muted'}`,
            })}
            <span className='text-[10px] mt-1'>{link.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
