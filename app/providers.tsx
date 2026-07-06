'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { AnimatePresence } from 'framer-motion';
import { usePathname, useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { Suspense, use, useEffect, useState } from 'react';
import app from '@/app/firebase';
import { InitDataLoader } from '@/app/providers/InitDataLoader';
import { SkeletonThemeProvider } from '@/components/elements/skeleton';
import InspectionPage from '@/components/inspection';
import CharactorOpenModal from '@/components/modal/CharactorOpenModal';
import ModalManager from '@/components/modal/ModalManager';
import NoticeModal from '@/components/modal/NoticeModal';
import { IS_DARK_THEME } from '@/shared/config/theme';
import { GlobalModalHost } from '@/shared/ui/modal';
import { useAccountStore } from '@/store/useAccountStore';
import { useMainConfigStore } from '@/store/useMainConfigStore';
import { useModalStore } from '@/store/useStoreModal';
import { PromotionItem } from '@/types/provider';

/**팝업을 노출시키지 않을 페이지 경로 */
const POPUP_BLOCK_PAGE_PATHS: string[] = ['/guest', '/chat-list', '/shop-recharge'];

// SearchParamsHandler 컴포넌트로 분리하여 useSearchParams 로직 처리
function SearchParamsHandler() {
  const { openModal, setChrbotKey } = useModalStore();
  const searchParams = useSearchParams();
  const linkChrbot_key = searchParams.get('chrbot_key');

  useEffect(() => {
    // 스토어에 chrbotKey 값 저장
    setChrbotKey(linkChrbot_key);

    // if (linkChrbot_key) {
    //   openModal('characterOpen', { chatBotKey: linkChrbot_key })
    // }
  }, [linkChrbot_key, openModal, setChrbotKey]);

  return null;
}

export default function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPopupBlockPage = POPUP_BLOCK_PAGE_PATHS.includes(pathname || '');

  const { chrbotKey } = useModalStore(); // 스토어에서 값 가져오기
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );
  const { isLogin, updateUserInfoFromUserInfo } = useAccountStore();
  const [mounted, setMounted] = useState(false);
  const { webConfig, activeNotices, fetchAllConfig, closeNotice } = useMainConfigStore();

  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [notice, setNotice] = useState<PromotionItem | null>(null);

  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);

  const [isCharactorOpenModalOpen, setIsCharactorOpenModalOpen] = useState(false);

  // 컴포넌트가 마운트되었는지 확인
  useEffect(() => {
    setMounted(true);

    // Zustand 스토어 하이드레이션 수동 처리
    const hydrateStore = async () => {
      const { useCoinStore } = await import('@/store/useStoreData');
      useCoinStore.persist.rehydrate();
    };

    hydrateStore();

    // 카카오톡 내장 브라우저 감지
    const userAgent = navigator.userAgent.toLowerCase();
    const isKakaoBrowser = userAgent.indexOf('kakaotalk') > -1;

    if (isKakaoBrowser) {
      // 현재 URL 저장 (로그인 후 돌아올 URL)
      const returnUrl = encodeURIComponent(window.location.href);

      // 모바일 기기 확인 및 적절한 외부 브라우저 열기
      if (/iPhone|iPad|iPod/.test(userAgent)) {
        // Safari로 직접 열기
      } else {
        // window.location.href = `intent://${window.location.host}${window.location.pathname}#Intent;scheme=https;package=com.android.chrome;end`;
        const fullPath = window.location.pathname + window.location.search;
        window.location.href = `intent://${window.location.host}${fullPath}#Intent;scheme=https;package=com.android.chrome;end`;
      }
    }

    fetchAllConfig();
  }, []);

  useEffect(() => {
    // 외부 토큰으로 접근하는 경우(채팅방 → 상점) 자동 업데이트 스킵
    // initFromExternalToken에서 별도로 처리함
    const hasExternalAuth =
      pathname === '/shop-recharge' &&
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).has('auth');

    if (isLogin && !hasExternalAuth) {
      updateUserInfoFromUserInfo().then((isSuccess) => {
        if (isSuccess) {
          console.log('updateUserInfoFromUserInfo success');
        }
      });
    }
  }, [isLogin, pathname]);

  useEffect(() => {
    if (!chrbotKey && activeNotices?.length > 0) {
      setNotice(activeNotices[0]);
      setIsNoticeModalOpen(true);
    }
  }, [activeNotices, chrbotKey]);

  useEffect(() => {
    if (chrbotKey) {
      setIsCharactorOpenModalOpen(true);
    }
  }, [chrbotKey]);

  // 테마는 APP_THEME 상수로 <html>에 정적 적용되므로 런타임 클래스 동기화가 불필요하다.

  // 스켈레톤 테마 색상 설정 (APP_THEME 상수 기준)
  const skeletonBaseColor = IS_DARK_THEME ? '#3A3A3A' : '#E5E7EB';
  const skeletonHighlightColor = IS_DARK_THEME ? '#4A4A4A' : '#F3F4F6';

  // Firebase Analytics 초기화
  useEffect(() => {
    if (typeof window !== 'undefined' && mounted) {
      try {
        console.log('Initializing Firebase Analytics in Providers...');
        const analytics = getAnalytics(app);

        // 앱 시작 이벤트 로깅
        logEvent(analytics, 'app_start', {
          app_version: process.env.NEXT_PUBLIC_APP_VERSION || '0.2.2',
          platform: 'web',
        });

        if (process.env.NODE_ENV === 'development') {
          // @ts-expect-error
          window.FIREBASE_ANALYTICS_DEBUG_MODE = true;
          console.log('Firebase Analytics initialized in debug mode');
        }
      } catch (error) {
        console.error('Firebase Analytics initialization error:', error);
      }
    }
  }, [mounted]);

  return (
    <QueryClientProvider client={queryClient}>
      {/* useSearchParams 부분을 Suspense로 감싸서 처리 */}
      <Suspense fallback={null}>
        <SearchParamsHandler />
      </Suspense>
      <GlobalModalHost />
      {webConfig?.ispm ? (
        <InspectionPage />
      ) : (
        <div
          className='mobile-scroll-container relative h-full w-full'
          style={{
            width: '100%',
            height: '100%',
            maxWidth: '100vw',
            maxHeight: '100vh',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <SkeletonThemeProvider
            baseColor={skeletonBaseColor}
            highlightColor={skeletonHighlightColor}
            borderRadius='0.25rem'
            duration={1.5}
          >
            <InitDataLoader>
              <AnimatePresence mode='wait'>{children}</AnimatePresence>
              <ModalManager />
            </InitDataLoader>
          </SkeletonThemeProvider>
        </div>
      )}
      {!chrbotKey && notice && !isPopupBlockPage && (
        <NoticeModal
          isOpen={isNoticeModalOpen}
          notice={notice}
          onClose={() => {
            setIsNoticeModalOpen(false);
            closeNotice(notice.key);
          }}
        />
      )}

      {chrbotKey && !isPopupBlockPage && (
        <CharactorOpenModal
          isOpen={isCharactorOpenModalOpen}
          chatBotKey={chrbotKey}
          onClose={() => {
            setIsCharactorOpenModalOpen(false);
          }}
        />
      )}
    </QueryClientProvider>
  );
}
