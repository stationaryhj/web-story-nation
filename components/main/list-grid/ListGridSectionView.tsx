import CardGrid from '@/components/elements/card/CardGrid';
import { SectionTransition } from '@/components/motion/PageTransition';
import type { Character } from '@/store/useStoreData';

export interface ListGridSectionViewProps {
  characters: Character[];
  isLoading: boolean;
  /** 더 노출할 항목이 남아 있는지 (더 보기 버튼 표시 여부) */
  hasMore?: boolean;
  /** 더 보기 클릭 시 호출 (컨테이너가 다음 페이지를 불러온다) */
  onLoadMore?: () => void;
  title: string;
  description: string;
  emptyTitle: string;
}

// 표시용(View): 최신/인기 탭 공통 마크업. 헤더 문구만 props로 주입.
export default function ListGridSectionView({
  characters,
  isLoading,
  hasMore = false,
  onLoadMore,
  title,
  description,
  emptyTitle,
}: ListGridSectionViewProps) {
  const isEmpty = !isLoading && characters.length === 0;

  return (
    <SectionTransition className='py-12 bg-surface'>
      <div className='container mx-auto px-4'>
        <div className='mb-6'>
          <h2 className='text-2xl font-bold text-text-primary mb-1'>{title}</h2>
          <p className='text-xs text-text-muted'>{description}</p>
        </div>

        {isEmpty ? (
          <div className='mt-12 py-12 text-center'>
            <div className='max-w-md mx-auto'>
              <h3 className='text-xl font-semibold mb-2 text-text-primary'>{emptyTitle}</h3>
              <p className='text-text-muted'>잠시 후 다시 확인해주세요.</p>
            </div>
          </div>
        ) : (
          <>
            {/* 더 보기 중에는 isLoading을 넘기지 않음 — 남/여 탭과 동일.
                CardGrid가 isLoading이면 스켈레톤으로 교체되어 높이 붕괴·스크롤 점프가 난다. */}
            <CardGrid
              customData={characters}
              useSwiper={false}
              isLoading={isLoading && characters.length === 0}
            />

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
