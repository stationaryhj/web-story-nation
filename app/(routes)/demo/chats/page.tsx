'use client';

/**
 * 채팅 목록 Figma 퍼블리싱 데모 페이지 — 미리보기 전용(/demo/chats)
 *
 * Figma: 8IbJb4GyvbmBmClFRzDsbL node 3840:33201 (1920×1080 데스크톱 다크 시안)
 * 선행 데모(/demo/home, publish-20260709-home-demo.md)와 동일 규칙:
 *   전역 구조/토큰을 건드리지 않는 self-contained 단일 파일,
 *   Figma 색은 데모 전용 하드코딩(프로덕션 반영 시 tailwind.config 토큰으로 매핑).
 * 데이터 미연결 — 탭/즐겨찾기/삭제는 로컬 상태로만 동작한다.
 */

import Image from 'next/image';
import { useState } from 'react';

// Figma 색 (데모 전용 하드코딩)
const C = {
  bg: '#1F1F1F',
  accent: '#FF0750',
  tabActive: '#FF1158',
  navIdle: '#B1B1B1',
  preview: '#BAAAD5',
  placeholder: 'rgba(108, 108, 108, 0.56)',
} as const;

// Figma 다운로드 아이콘 (선행 데모의 nav 에셋 재사용 + 이번 시안 신규 3종)
const NAV_ITEMS = [
  { key: 'home', label: '홈', icon: '/images/demo/nav/home.svg' },
  { key: 'chat', label: '채팅', icon: '/images/demo/nav/chat.svg' },
  { key: 'create', label: '만들기', icon: '/images/demo/nav/create.svg' },
  { key: 'studio', label: '내 작업실', icon: '/images/demo/nav/studio.svg' },
  { key: 'revenue', label: '수익내역', icon: '/images/demo/nav/revenue.png' },
] as const;

const TABS = [
  { key: 'all', label: '모든대화' },
  { key: 'favorite', label: '즐겨찾기' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

/** Figma 아이콘을 currentColor로 칠하는 mask 렌더러 (활성 핑크/비활성 회색 전환용) */
function MaskIcon({ src, size }: { src: string; size: number }) {
  return (
    <span
      aria-hidden='true'
      className='inline-block shrink-0 bg-current'
      style={{
        width: size,
        height: size,
        maskImage: `url(${src})`,
        WebkitMaskImage: `url(${src})`,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
      }}
    />
  );
}

// 채팅 목록: 데모 더미 8건 (Figma 시안은 동일 행 4건 반복)
const INITIAL_CHATS = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  name: '김주혁',
  preview: '늦은 오후, 수영부 연습이 끝난 뒤, 도윤은 무거운 공기를 깨고 다가온다. 그는 땀에...',
  isFavorite: i % 3 === 0,
}));

export default function DemoChatsPage() {
  const [activeNav, setActiveNav] = useState<string>('chat');
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [keyword, setKeyword] = useState('');
  const [chats, setChats] = useState(INITIAL_CHATS);

  const visibleChats = chats.filter((chat) => {
    if (activeTab === 'favorite' && !chat.isFavorite) return false;
    if (keyword && !chat.name.includes(keyword.trim())) return false;
    return true;
  });

  const handleToggleFavorite = (id: number) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === id ? { ...chat, isFavorite: !chat.isFavorite } : chat))
    );
  };

  const handleDelete = (id: number) => {
    setChats((prev) => prev.filter((chat) => chat.id !== id));
  };

  return (
    <div
      className='relative flex min-h-[100dvh] overflow-hidden text-white'
      style={{ backgroundColor: C.bg }}
    >
      {/* Figma 배경 글로우(블러 블롭) — 장식용 */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute -top-28 left-1/4 h-[605px] w-[760px] rounded-full blur-[56px]'
        style={{ backgroundColor: 'rgba(86, 0, 26, 0.5)' }}
      />
      <div
        aria-hidden='true'
        className='pointer-events-none absolute bottom-[-40%] right-[-20%] h-[920px] w-[1278px] rounded-full blur-[56px]'
        style={{ backgroundColor: 'rgba(79, 5, 28, 0.5)' }}
      />

      {/* 데스크톱 좌측 사이드바 (md 이상) — /demo/home과 동일 구조, '채팅' 활성 */}
      <aside
        className='sticky top-0 z-10 hidden h-[100dvh] w-32 shrink-0 flex-col items-center gap-10 border-r border-white/5 py-8 md:flex'
        aria-label='주 메뉴'
      >
        <Image src='/images/logo.svg' alt='StoryNation' width={48} height={48} priority />
        <nav className='flex flex-col items-stretch gap-8 self-stretch px-2'>
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.key;
            return (
              <button
                key={item.key}
                type='button'
                onClick={() => setActiveNav(item.key)}
                aria-current={isActive ? 'page' : undefined}
                className='flex min-h-[64px] flex-col items-center justify-center gap-2 rounded-xl transition-colors hover:bg-white/5'
                style={{ color: isActive ? C.accent : C.navIdle }}
              >
                <MaskIcon src={item.icon} size={32} />
                <span className='whitespace-nowrap text-base font-medium'>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* 메인 컬럼 */}
      <main className='relative z-10 mx-auto min-w-0 w-full max-w-3xl flex-1 px-4 pb-24 pt-6 md:mx-0 md:px-8 md:pb-8'>
        {/* 상단 태그라인 */}
        <h1 className='mb-5 text-lg font-bold leading-snug md:mb-6 md:text-2xl'>
          오직 성인 남성만을 위한,
          <br className='sm:hidden' /> 상상하는 모든것이 이뤄지는 AI파라다이스
        </h1>

        {/* 검색바 — Figma 316×33 흰색 라운드, 모바일은 풀폭 */}
        <div className='relative mb-6 w-full max-w-[316px]'>
          <input
            type='search'
            inputMode='search'
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder='캐릭터 이름으로 검색'
            aria-label='캐릭터 이름으로 검색'
            className='h-11 w-full rounded-[10px] bg-white pl-4 pr-11 text-sm text-black outline-none placeholder:text-[color:var(--demo-placeholder)] focus:ring-2 focus:ring-[#FF0750]/60'
            style={{ '--demo-placeholder': C.placeholder } as React.CSSProperties}
          />
          <span className='pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#040303]'>
            <MaskIcon src='/images/demo/chats/search.svg' size={18} />
          </span>
        </div>

        {/* 탭 — 모든대화 / 즐겨찾기 */}
        <div role='tablist' aria-label='대화 목록 필터' className='mb-5 flex gap-4'>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type='button'
                role='tab'
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.key)}
                className='min-h-[44px] text-lg font-bold transition-colors'
                style={{ color: isActive ? C.tabActive : '#FFFFFF' }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 채팅 리스트 */}
        {visibleChats.length === 0 ? (
          <p className='py-16 text-center text-sm text-white/50'>
            {activeTab === 'favorite' ? '즐겨찾기한 대화가 없습니다.' : '대화가 없습니다.'}
          </p>
        ) : (
          <ul className='flex flex-col'>
            {visibleChats.map((chat) => (
              <li key={chat.id}>
                <div className='group flex items-start gap-3 rounded-xl px-1 py-3 transition-colors hover:bg-white/5 md:px-2 md:py-4'>
                  {/* 아바타 */}
                  <div className='relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-full md:h-[60px] md:w-[60px]'>
                    <Image
                      src='/images/placeholders/default-character.jpg'
                      alt={`${chat.name} 프로필 이미지`}
                      fill
                      sizes='60px'
                      className='object-cover'
                    />
                  </div>
                  {/* 이름 + 미리보기 */}
                  <div className='min-w-0 flex-1'>
                    <p className='text-sm font-bold'>{chat.name}</p>
                    <p
                      className='mt-0.5 line-clamp-2 text-xs md:text-sm'
                      style={{ color: C.preview }}
                    >
                      {chat.preview}
                    </p>
                  </div>
                  {/* 액션: 즐겨찾기 / 삭제 */}
                  <div className='flex shrink-0 items-center gap-1'>
                    <button
                      type='button'
                      onClick={() => handleToggleFavorite(chat.id)}
                      aria-pressed={chat.isFavorite}
                      aria-label={chat.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                      className='flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-white/10'
                      style={{ color: chat.isFavorite ? C.accent : '#FEF7FF' }}
                    >
                      <MaskIcon src='/images/demo/chats/favorite.svg' size={24} />
                    </button>
                    <button
                      type='button'
                      onClick={() => handleDelete(chat.id)}
                      aria-label={`${chat.name} 대화 삭제`}
                      className='flex h-11 w-11 items-center justify-center rounded-full text-[#F3F3F3] transition-colors hover:bg-white/10 hover:text-[#FF0750]'
                    >
                      <MaskIcon src='/images/demo/chats/trash.svg' size={24} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* 모바일 하단 탭바 (md 미만) */}
      <nav
        className='fixed inset-x-0 bottom-0 z-10 flex h-16 items-stretch border-t border-white/10 md:hidden'
        style={{ backgroundColor: C.bg }}
        aria-label='주 메뉴'
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeNav === item.key;
          return (
            <button
              key={item.key}
              type='button'
              onClick={() => setActiveNav(item.key)}
              aria-current={isActive ? 'page' : undefined}
              className='flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1'
              style={{ color: isActive ? C.accent : C.navIdle }}
            >
              <MaskIcon src={item.icon} size={24} />
              <span className='text-[10px] font-medium'>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
