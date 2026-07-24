import CardGrid from '@/components/elements/card/CardGrid';
import ButtonTabs, { TabItem } from '@/components/elements/tabs/ButtonTabs';
import { SectionTransition } from '@/components/motion/PageTransition';
import type { Character } from '@/store/useStoreData';

export type RankingPeriod = 'realtime' | 'daily' | 'weekly' | 'monthly';

// 기간 서브탭 정의 (기존 CharacterRankingSection.tsx의 characterRankingTabs와 동일한 id/label)
const periodTabs: TabItem[] = [
  { id: 'realtime', label: '실시간' },
  { id: 'daily', label: '일간' },
  { id: 'weekly', label: '주간' },
  { id: 'monthly', label: '월간' },
];

// 기간별 안내 문구 (기존 CharacterRankingSection.tsx의 getRankingUpdateMessage 문구 재사용)
const getRankingUpdateMessage = (period: RankingPeriod) => {
  switch (period) {
    case 'realtime':
      return '지금 인기 있는 캐릭터를 만나보세요!';
    case 'daily':
      return '매일 밤 00시 업데이트';
    case 'weekly':
      return '매주 월요일 업데이트';
    case 'monthly':
      return '매월 1일 업데이트';
    default:
      return '';
  }
};

interface RankingGridSectionViewProps {
  characters: Character[];
  period: RankingPeriod;
  onPeriodChange: (period: string) => void;
  isLoading: boolean;
  /** 더 노출할 항목이 남아 있는지 (더 보기 버튼 표시 여부) */
  hasMore?: boolean;
  /** 더 보기 클릭 시 호출 (컨테이너가 노출 개수를 늘린다) */
  onLoadMore?: () => void;
}

// 표시용(View) 컴포넌트: 데이터 페칭/URL 로직 없음. 상위 컨테이너(RankingGridSection, writer)가 props로 상태를 주입한다.
export default function RankingGridSectionView({
  characters,
  period,
  onPeriodChange,
  isLoading,
  hasMore = false,
  onLoadMore,
}: RankingGridSectionViewProps) {
  const isEmpty = !isLoading && characters.length === 0;

  return (
    <SectionTransition className='py-12 bg-surface'>
      <div className='container mx-auto px-4'>
        {/* 헤더: 타이틀 + 기간별 안내 문구 + 기간 서브탭 (성별 셀렉트 없음) */}
        <div className='mb-6'>
          <h2 className='text-2xl font-bold text-text-primary mb-1'>🏆 캐릭터 랭킹</h2>
          <p className='text-xs text-text-muted mb-4'>{getRankingUpdateMessage(period)}</p>
          <ButtonTabs
            tabs={periodTabs}
            defaultTabId={period}
            variant='underline'
            disableUrlSync
            onTabChange={onPeriodChange}
          />
        </div>

        {/* 카드 그리드 (남/여/성별모름 탭과 동일 레이아웃) / 로딩 스켈레톤 / 빈 상태 */}
        {isEmpty ? (
          <div className='mt-12 py-12 text-center'>
            <div className='max-w-md mx-auto'>
              <h3 className='text-xl font-semibold mb-2 text-text-primary'>
                랭킹 정보를 불러올 수 없어요
              </h3>
              <p className='text-text-muted'>잠시 후 다시 확인해주세요.</p>
            </div>
          </div>
        ) : (
          <>
            <CardGrid customData={characters} useSwiper={false} hasRanking isLoading={isLoading} />

            {/* 더 보기 버튼 (남/여/성별모름 탭과 동일 UX, CharacterGridSection 스타일 준용) */}
            {hasMore && onLoadMore && (
              <div className='mt-8 flex justify-center'>
                <button
                  type='button'
                  onClick={onLoadMore}
                  disabled={isLoading}
                  className={`min-h-[44px] px-6 py-2 rounded-full text-white bg-primary-500 hover:bg-primary-600 transition ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? '로딩 중...' : '더 보기'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </SectionTransition>
  );
}
