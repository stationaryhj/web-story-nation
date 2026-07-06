'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import CardGrid from '@/components/elements/card/CardGrid';
import FilterControls from '@/components/elements/filters/FilterControls';
import { SectionTransition } from '@/components/motion/PageTransition';
import { CATEGORIES, CategoryId } from '@/services/hooks/DataListManager';
import useModalStore from '@/shared/model/stores/useModalStore';
import { useCharacterGridStoreData } from '@/store/useCharacterGridStoreData';
import { useAccountStore } from '@/store/useStoreData';
import { useSettingsStore } from '@/store/useStoreSettings';

interface CharacterGridSectionProps {
  categoryId: CategoryId;
  selectedTags?: string[]; // 선택된 태그 ID 목록 추가
  onSearchTrigger?: (query: string) => void;
}

export default function CharacterGridSection({
  categoryId,
  selectedTags = [],
  onSearchTrigger,
}: CharacterGridSectionProps) {
  const router = useRouter();
  const isLogin = useAccountStore((state) => state.isLogin);
  const openModal = useModalStore((state) => state.openModal);
  const { isAdultModeEnabled } = useSettingsStore();

  // 초기화 완료 체크를 위한 ref
  const isInitialized = useRef(false);

  // 캐릭터 그리드 스토어 가져오기
  const { characters, isLoading, isEmpty, error, changeCategory, updateTags, reload } =
    useCharacterGridStoreData();

  // 카테고리 정보 가져오기
  // const categoryInfo = CATEGORIES.find(cat => cat.id === categoryId)
  // const categoryName = categoryInfo?.name || '캐릭터'

  const onClickCreateCharacterBtn = () => {
    if (isLogin) {
      router.push('/my-characters/create');
    } else {
      openModal({ type: 'socialLogin' });
    }
  };

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    if (categoryId === 'all') return; // all 카테고리는 처리하지 않음

    if (!isInitialized.current) {
      // 카테고리 변경 (태그가 있는 경우 추가 처리)
      changeCategory(categoryId).then(() => {
        if (selectedTags && selectedTags.length > 0) {
          updateTags(selectedTags);
        }
      });

      isInitialized.current = true;
    }
  }, [categoryId, changeCategory, selectedTags, updateTags]);

  // 카테고리 변경 시 데이터 초기화
  useEffect(() => {
    if (categoryId === 'all') return; // all 카테고리는 처리하지 않음

    if (isInitialized.current) {
      // 카테고리만 변경하고 태그는 초기화
      changeCategory(categoryId);
    }
  }, [categoryId, changeCategory]);

  // 선택된 태그가 변경될 때 처리
  useEffect(() => {
    if (categoryId === 'all') return; // all 카테고리는 처리하지 않음

    if (isInitialized.current) {
      updateTags(selectedTags);
    }
  }, [selectedTags, updateTags, categoryId]);

  useEffect(() => {
    reload();
  }, [isAdultModeEnabled, reload]);

  if (categoryId === 'all') {
    return null; // all 카테고리는 RecommendSection에서 처리
  }

  // 로딩 상태
  if (isLoading && characters.length === 0) {
    return (
      <SectionTransition className='py-12 bg-surface'>
        <div className='container mx-auto px-4'>
          {/* <h2 className="text-2xl font-bold mb-6">{categoryName}</h2> */}
          {/* 필터 컨트롤은 항상 보여줌 */}
          <FilterControls categoryId={categoryId} />
          <div className='mt-16 flex justify-center items-center flex-col'>
            {/* 로딩 인디케이터 */}
            <div className='relative w-20 h-20 mb-6'>
              <div className='absolute top-0 left-0 w-full h-full border-4 border-border-default rounded-full'></div>
              <div className='absolute top-0 left-0 w-full h-full border-4 border-primary-500 rounded-full animate-spin border-t-transparent'></div>
            </div>
            <p className='text-text-muted text-center'>데이터를 불러오는 중입니다...</p>
          </div>
        </div>
      </SectionTransition>
    );
  }

  // 에러 상태
  if (error && characters.length === 0) {
    return (
      <SectionTransition className='py-12 bg-surface'>
        <div className='container mx-auto px-4'>
          {/* <h2 className="text-2xl font-bold mb-6">{categoryName}</h2> */}
          <FilterControls categoryId={categoryId} />
          <div className='mt-8 py-12 text-center'>
            <p className='text-red-500 mb-4'>에러가 발생했습니다: {error.message}</p>
            <button
              onClick={() => changeCategory(categoryId)}
              className='px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition'
            >
              다시 시도
            </button>
          </div>
        </div>
      </SectionTransition>
    );
  }

  // 데이터가 없는 경우
  if ((isEmpty || characters.length === 0) && !isLoading) {
    return (
      <SectionTransition className='py-12 bg-surface'>
        <div className='container mx-auto px-4'>
          {/* <h2 className="text-2xl font-bold mb-6">{categoryName}</h2> */}
          <FilterControls categoryId={categoryId} />
          <div className='mt-12 py-12 text-center'>
            <div className='max-w-md mx-auto'>
              <h3 className='text-xl font-semibold mb-2'>
                {selectedTags.length > 0
                  ? '선택한 태그에 해당하는 캐릭터가 없어요'
                  : '검색된 캐릭터가 없어요'}
              </h3>
              <p className='text-text-muted mb-6'>
                {selectedTags.length > 0
                  ? '다른 태그를 선택하거나 직접 캐릭터를 만들어보세요!'
                  : '나만의 캐릭터를 직접 만들어보세요!'}
              </p>
              <div>
                <button
                  onClick={onClickCreateCharacterBtn}
                  className='px-6 py-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition shadow-md'
                >
                  캐릭터 만들기
                </button>
              </div>
            </div>
          </div>
        </div>
      </SectionTransition>
    );
  }

  // 정상 데이터 표시
  return (
    <SectionTransition className='py-12 bg-surface'>
      <div className='container mx-auto px-4'>
        {/* 필터 컨트롤 */}
        <FilterControls categoryId={categoryId} />

        {/* 카드 그리드 */}
        <CardGrid categoryId={categoryId} customData={characters} useSwiper={false} />

        {/* 더 보기 버튼 */}
        {characters.length > 0 && (
          <div className='mt-8 flex justify-center'>
            <button
              onClick={() => useCharacterGridStoreData.getState().loadMore()}
              disabled={isLoading}
              className={`px-6 py-2 rounded-full text-white bg-primary-500 hover:bg-primary-600 transition ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? '로딩 중...' : '더 보기'}
            </button>
          </div>
        )}
      </div>
    </SectionTransition>
  );
}
