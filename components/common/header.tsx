// components/ui/header/Header.tsx
'use client';

import {
  faBars,
  faBell,
  faCog,
  faFire,
  faMoon,
  faShoppingBag,
  faSignOutAlt,
  faSun,
  faTimes,
  faUser,
  faVideo,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import HeaderSearch from '@/components/common/HeaderSearch';
import HeaderSidebar from '@/components/elements/sidebar/HeaderSidebar';
import NotificationButton from '@/components/elements/sidebar/NotificationButton';
import { FadeIn } from '@/components/motion/PageTransition';
import useNewModalStore from '@/shared/model/stores/useModalStore';
import { useAccountStore, useThemeStore } from '@/store/useStoreData';
import { useModalStore } from '@/store/useStoreModal';

export default function Header() {
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [activeLink, setActiveLink] = useState('/');
  const { openModal } = useModalStore();
  const { openModal: openNewModal } = useNewModalStore();
  const { isLogin, logout } = useAccountStore();
  const router = useRouter();

  // 데스크톱 nav는 좌측 사이드바(DesktopSideNav)로 이전되어 제거됨. 이 배열은
  // HeaderSidebar(모바일 사이드바) prop 타입 호환을 위해 유지하되 렌더에는 쓰지 않는다.
  // (HeaderSidebar.tsx:53/71-152 — navLinks는 실제 렌더에 사용되지 않음)
  const navLinks: { href: string; label: string; requireLogin?: boolean }[] = [];

  // 컴포넌트가 마운트되었는지 확인
  useEffect(() => {
    setMounted(true);

    // 현재 경로 확인 - usePathname 훅 사용으로 대체
    if (pathname) {
      setActiveLink(pathname);
    }
  }, [pathname]);

  // 다크모드 변경 시 HTML에 클래스 추가/제거
  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (!mounted) return;

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode, mounted]);

  const onClickSettingLink = () => {
    if (isLogin) {
      router.push('/settings');
    } else {
      openNewModal({ type: 'socialLogin' });
    }
  };

  return (
    <>
      <motion.header
        className='sticky top-0 left-0 right-0 z-[50] bg-surface-sunken shadow-sm dark:shadow-dark-primary-300/20'
        initial={{ y: 0 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className='w-full px-4 md:pl-20 py-3 flex items-center justify-between'>
          <div className='flex items-center'>
            {/* 로고는 Header 전용(전 화면 크기 노출). 데스크톱 좌측 사이드바(DesktopSideNav)는
                caveduck 리디자인으로 로고를 갖지 않고 nav 항목만 담당한다.
                근거: docs/plan/plan-20260710-sidebar-caveduck-redesign.md (3단계, 담당: writer) */}
            <Link
              href='/'
              className='text-xl font-bold text-brand-hover mr-10'
              onClick={(e) => {
                // 메인 페이지로 이동 시 URL에서 tab 파라미터를 삭제하여 추천 탭으로 강제 이동
                e.preventDefault();
                router.push('/');
              }}
            >
              <Image
                src='/images/logo.svg'
                alt='스토리네이션'
                width={49}
                height={49}
                className='h-10 w-auto'
              />
            </Link>
          </div>

          <HeaderSearch />

          <div className='flex items-center md:space-x-4 gap-1'>
            {/* 다크모드 토글 버튼 - 모바일에서는 숨김 */}
            {/* {mounted && (
              <motion.button
                onClick={toggleDarkMode}
                className="hidden md:block text-secondary-500 hover:text-primary-500 dark:text-dark-secondary-500 dark:hover:text-dark-primary-600 transition-colors"
                aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={themeIcon!} className="text-xl" />
              </motion.button>
            )} */}

            {/* 알림 버튼 - 모든 화면 크기에서 표시 */}
            <div>
              <NotificationButton />
            </div>

            {/* 내 정보 버튼 - PC에서만 표시 */}

            <div className='hidden md:block'>
              <motion.button
                onClick={onClickSettingLink}
                className='text-text-primary hover:text-brand-hover transition-colors'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={faUser} className='text-xl' />
              </motion.button>
            </div>

            {/* 장바구니 버튼 */}
            <Link href='/cart'>
              <motion.button
                className='hidden sm:visible text-text-primary hover:text-brand-hover transition-colors'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={faShoppingBag} className='text-xl hidden sm:block' />
              </motion.button>
            </Link>

            <motion.button
              onClick={(e) => {
                setIsSidebarOpen(true);
              }}
              className='md:hidden text-text-primary hover:text-brand-hover transition-colors'
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faBars} className='text-2xl' />
            </motion.button>
          </div>
          {/* 햄버거 메뉴 버튼 - 태블릿 이하에서만 표시 */}
        </div>
      </motion.header>

      {/* 모바일 사이드바 */}
      <HeaderSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        navLinks={navLinks}
        activeLink={activeLink}
        isLogin={isLogin}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        openModal={openModal}
        setActiveLink={setActiveLink}
        logout={logout}
      />
    </>
  );
}
