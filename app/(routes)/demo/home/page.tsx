'use client';

/**
 * 홈(메인) Figma 퍼블리싱 데모 페이지 — 미리보기 전용(/demo/home)
 *
 * 근거 계획: docs/plan/plan-20260709-home-figma-responsive.md
 * 확정 결정: (1) Figma대로 단순화(칩+그리드) (2) 좌측 사이드바가 상단 Header 대체
 *          (3) 색은 Figma 값 기준 (4) 칩은 UI만(데이터 미연결)
 *
 * ⚠️ 데모 한정 규칙: 전역 구조/토큰을 건드리지 않기 위해 self-contained로 작성하고
 *   Figma 색을 Tailwind arbitrary 값(#1F1F1F 등)으로 직접 사용한다.
 *   프로덕션 반영 시에는 tailwind.config 토큰으로 매핑/갱신한다(결정3, 별건).
 */

import Image from 'next/image';
import { useState } from 'react';

// Figma 색 (데모 전용 하드코딩)
const C = {
  bg: '#1F1F1F',
  accent: '#FF0750',
  chipIdle: '#555555',
  navIdle: '#B1B1B1',
  cardBg: '#D9D9D9',
} as const;

// Figma 다운로드 아이콘 (CSS mask로 nav 색을 따라가게 렌더)
const NAV_ITEMS = [
  { key: 'home', label: '홈', icon: '/images/demo/nav/home.svg' },
  { key: 'chat', label: '채팅', icon: '/images/demo/nav/chat.svg' },
  { key: 'create', label: '만들기', icon: '/images/demo/nav/create.svg' },
  { key: 'studio', label: '내 작업실', icon: '/images/demo/nav/studio.svg' },
  { key: 'revenue', label: '수익내역', icon: '/images/demo/nav/revenue.png' },
] as const;

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

// 칩: Figma 시안 그대로(정렬 + 태그 혼합). 데모라 정적 목록.
const CHIPS = [
  '추천',
  '랭킹',
  '최신',
  '미시',
  '남/여사친',
  '밝히는',
  '밀프',
  '반항적',
  '다정한',
  '금지된사랑이야기예요', // 확장 테스트용 10자
  '낮선사람',
  '메이드/노예',
  '노예',
  '로맨스',
  '패티시',
  'BDSM',
  '비너스',
  '커플',
  '파티',
  '아이돌',
  '패션',
  '뮤지컬',
  '영화',
  '드라마',
  '라디오',
  '소설',
  '시',
] as const;

// 카드: 데모 더미 12장
const CARDS = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  name: `데모 캐릭터 ${i + 1}`,
  desc: '상상하는 모든 것이 이뤄지는 AI',
}));

export default function DemoHomePage() {
  const [activeNav, setActiveNav] = useState<string>('home');
  const [activeChip, setActiveChip] = useState<string>('추천');

  return (
    <div className='flex min-h-[100dvh] text-white' style={{ backgroundColor: C.bg }}>
      {/* 데스크톱 좌측 사이드바 (md 이상) — 상단 Header 대체 */}
      <aside
        className='sticky top-0 hidden h-[100dvh] w-32 shrink-0 flex-col items-center gap-10 border-r border-white/5 py-8 md:flex'
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
      <main className='min-w-0 flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-8'>
        {/* 상단 태그라인 */}
        <h1 className='mb-5 text-lg font-bold leading-snug md:mb-6 md:text-2xl'>
          상상하는 모든것이 이뤄지는 AI파라다이스
        </h1>

        {/* 카테고리 칩 — Figma 균일 크기(119×45), 텍스트 넘칠 때만 확장. 모바일 가로 스크롤, 데스크톱 wrap */}
        <div className='mb-6 flex gap-[14px] overflow-x-auto scrollbar-hide md:flex-wrap md:overflow-visible'>
          {CHIPS.map((chip) => {
            const isActive = activeChip === chip;
            return (
              <button
                key={chip}
                type='button'
                onClick={() => setActiveChip(chip)}
                aria-pressed={isActive}
                className='inline-flex h-[45px] min-w-[119px] shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-base font-medium transition-colors'
                style={{ backgroundColor: isActive ? C.accent : C.chipIdle }}
              >
                {chip}
              </button>
            );
          })}
        </div>

        {/* 캐릭터 카드 그리드 — 2→3→4→5→6열 */}
        <ul className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6'>
          {CARDS.map((card) => (
            <li key={card.id}>
              <article className='group overflow-hidden rounded-2xl'>
                <div
                  className='relative aspect-[288/415] w-full overflow-hidden rounded-2xl'
                  style={{ backgroundColor: C.cardBg }}
                >
                  <Image
                    src='/images/placeholders/default-character.jpg'
                    alt={`${card.name} 이미지`}
                    fill
                    sizes='(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw'
                    className='object-cover transition-transform duration-300 group-hover:scale-105'
                  />
                  {/* 하단 그라데이션 + 이름 */}
                  <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3'>
                    <p className='truncate text-sm font-semibold'>{card.name}</p>
                    <p className='truncate text-xs text-white/70'>{card.desc}</p>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
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
