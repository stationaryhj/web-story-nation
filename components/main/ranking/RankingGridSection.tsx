'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRecommendSectionStoreData } from '@/store/useMainStoreData';
import type { Character } from '@/store/useStoreData';
import { useSettingsStore } from '@/store/useStoreSettings';
import RankingGridSectionView, { RankingPeriod } from './RankingGridSectionView';

// 기간 → topid(ranking_type) 매핑: 실시간=4, 일간=1, 주간=2, 월간=3
const PERIOD_TO_TOPID: Record<RankingPeriod, number> = {
  realtime: 4,
  daily: 1,
  weekly: 2,
  monthly: 3,
};

const VALID_PERIODS: RankingPeriod[] = ['realtime', 'daily', 'weekly', 'monthly'];

// gender=4(전체) 고정 — 랭킹 탭엔 성별 필터를 노출하지 않는다(계획 확정 #1)
const GENDER_ALL = 4;

// '더 보기' 노출 단위 — 랭킹 API는 top 50을 한 번에 받으므로(기존 '랭킹더보기' 사이드바와 동일)
// 서버 페이징 대신 클라이언트에서 20건씩 점진 노출한다(20→40→50).
const VISIBLE_STEP = 20;

// URL의 period 파라미터가 유효하지 않으면 기본값(realtime)으로 방어
function parsePeriod(value: string | null): RankingPeriod {
  return VALID_PERIODS.includes(value as RankingPeriod) ? (value as RankingPeriod) : 'realtime';
}

// 컨테이너: 데이터 페칭('랭킹 더보기'와 동일한 UpdateRankingTopCharacter API)과 URL(period) 동기화를 담당.
// 표시는 RankingGridSectionView(publisher)에 위임한다.
export default function RankingGridSection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAdultModeEnabled } = useSettingsStore();
  const { UpdateRankingTopCharacter } = useRecommendSectionStoreData();

  // 초기값은 URL의 period를 따른다(새로고침/공유 복원). 이후 변경은 handlePeriodChange가 로컬로 관리.
  const [period, setPeriod] = useState<RankingPeriod>(() =>
    parsePeriod(searchParams?.get('period') ?? null)
  );
  // 기간 연타 시 늦게 도착한 이전 응답이 최신 선택을 덮지 않도록, 요청 순번 가드 + resolve 값을 직접 사용
  // (store 공유 필드 rankingCharactersSlide 구독 대신) — review-20260721-home-ranking-tab.md Warning 반영
  const requestIdRef = useRef(0);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(VISIBLE_STEP);

  useEffect(() => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);

    const topid = PERIOD_TO_TOPID[period];
    UpdateRankingTopCharacter('KR', topid, GENDER_ALL, true)
      .then((data) => {
        if (requestId !== requestIdRef.current) return; // 늦게 도착한 응답 무시
        setCharacters(data ?? []);
        setVisibleCount(VISIBLE_STEP); // 기간/짜릿모드 변경 시 노출 개수 초기화
        setIsLoading(false);
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) return;
        setIsLoading(false);
      });
    // 짜릿모드 변경 시에도 재조회(기존 RecommendSection/CharacterGridSection 패턴 참고)
  }, [period, isAdultModeEnabled, UpdateRankingTopCharacter]);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((count) => Math.min(count + VISIBLE_STEP, 50));
  }, []);

  const handlePeriodChange = useCallback(
    (nextPeriod: string) => {
      const parsed = parsePeriod(nextPeriod);
      setPeriod(parsed);

      // 상위 `?tab=ranking`을 보존하며 `period`만 갱신(뒤로가기 스크롤 유지 위해 scroll:false)
      const params = new URLSearchParams(searchParams?.toString());
      params.set('tab', 'ranking');
      params.set('period', parsed);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return (
    <RankingGridSectionView
      characters={characters.slice(0, visibleCount)}
      period={period}
      onPeriodChange={handlePeriodChange}
      isLoading={isLoading}
      hasMore={visibleCount < characters.length}
      onLoadMore={handleLoadMore}
    />
  );
}
