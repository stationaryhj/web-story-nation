'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
// Swiper 관련 임포트 추가
import { Swiper, SwiperSlide } from 'swiper/react';
import { FadeIn } from '@/components/motion/PageTransition';
import type { Character } from '@/store/useStoreData';
import { useStoreData } from '@/store/useStoreData';
import { useModalStore } from '@/store/useStoreModal';
import { useSettingsStore } from '@/store/useStoreSettings';
import CardSkeleton from '../skeleton/CardSkeleton';
import Card from './Card';
// Swiper 스타일 임포트
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface CardGridProps {
  title?: string | null;
  subtitle?: string | null;
  categoryId?: string;
  customData?: Array<Character>;
  variant?: 'default' | 'my-character' | 'horizontal';
  onEdit?: (character: Character) => void;
  onDelete?: (character: Character) => void;
  cardsPerRow?: number; // 한 줄에 표시할 카드 수
  hasRanking?: boolean; // 랭킹 표시 여부
  showMoreLink?: string; // 더보기 링크
  showMoreText?: string; // 더보기 텍스트
  lastUpdateTime?: string; // 마지막 업데이트 시간
  isLoading?: boolean;
  error?: string | null;
  useSwiper?: boolean; // Swiper 사용 여부 (기본값: true)
  className?: string; // 추가 스타일링을 위한 클래스명
  sectionId?: string; // 각 섹션을 구분하기 위한 고유 ID
  isCharacterRankingSidebar?: boolean; // 캐릭터 랭킹 사이드바 여부
  isSidebar?: boolean; // 사이드바 여부
}

export default function CardGrid({
  title = null,
  subtitle = null,
  categoryId = 'all',
  customData,
  variant = 'default',
  onEdit,
  onDelete,
  cardsPerRow = 5, // 기본값 5
  hasRanking = false,
  showMoreLink,
  showMoreText = '더보기',
  lastUpdateTime,
  isLoading: externalLoading,
  error: externalError,
  useSwiper = true, // 기본적으로 Swiper 사용
  className = '',
  sectionId = '',
  isCharacterRankingSidebar = false,
  isSidebar = false,
}: CardGridProps) {
  const { isLoading: storeLoading, error: storeError, fetchCategoryCharacters } = useStoreData();
  const { openModal, setSelectedCharacter } = useModalStore();
  const { isAdultModeEnabled } = useSettingsStore();
  const [characters, setCharacters] = useState<Array<Character>>([]);
  const [localLoading, setLocalLoading] = useState(true);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [reachedBeginning, setReachedBeginning] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const swiperRef = useRef<SwiperType | null>(null);

  // 화면 크기에 따른 모바일 여부 체크
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // 초기 체크
    checkMobile();

    // 화면 크기 변경 시 체크
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // 데이터 길이와 화면 크기에 따른 showNavigation 자동 결정
  const shouldShowNavigation = isMobile ? characters.length > 2 : characters.length > 5;

  // 로딩 상태와 에러 상태 통합
  const isDataLoading =
    externalLoading !== undefined ? externalLoading : storeLoading || localLoading;
  const error = externalError || storeError;

  useEffect(() => {
    // customData가 제공되면 해당 데이터를 사용
    if (customData) {
      // 성인 모드 비활성화 시 성인 컨텐츠 필터링
      // const filteredData = isAdultModeEnabled ? customData : customData.filter(character => !character.isAdult)
      // setCharacters(filteredData)
      // setCharacters(mockCharacters)
      setCharacters(customData);
      setLocalLoading(false);
      return;
    }

    // 목데이터 사용

    // 기존 데이터 로딩 로직 주석 처리
    /*
    const loadCharacters = async () => {
      setLocalLoading(true)
      try {
        const data = await fetchCategoryCharacters(categoryId)
        setCharacters(data)
      } catch (err) {
        console.error('캐릭터 로딩 실패:', err)
      } finally {
        setLocalLoading(false)
      }
    }

    loadCharacters()
    */
  }, [fetchCategoryCharacters, categoryId, customData, isAdultModeEnabled]);

  // 카드 클릭 핸들러
  const handleCardClick = (character: Character) => {
    if (variant !== 'my-character') {
      setSelectedCharacter(character);
      openModal('character');
    } else {
      if (character.finish_yn === 1) {
        setSelectedCharacter(character);
        openModal('character', { variant: 'my-character' });
      }
    }
  };

  // 스와이프 끝에 도달했을 때 핸들러
  const handleReachEnd = () => {
    setReachedEnd(true);
  };

  // 스와이프가 첫 슬라이드로 돌아왔을 때 핸들러
  const handleReachBeginning = () => {
    setReachedBeginning(true);
    setReachedEnd(false);
  };

  // 슬라이드가 이동할 때 호출되는 핸들러
  const handleSlideChange = (swiper: SwiperType) => {
    setReachedBeginning(swiper.isBeginning);
    setReachedEnd(swiper.isEnd);
  };

  // 브레이크포인트에 따른 한 번에 보이는 슬라이드 수 설정
  const getSlidesPerView = () => {
    switch (cardsPerRow) {
      case 1:
        return 2.5;
      case 2:
        return { default: 2.5, sm: 2.5 };
      case 3:
        return { default: 2.5, sm: 2.5, md: 3.5 };
      case 4:
        return { default: 2.5, sm: 2.5, md: 3.5, lg: 4.5 };
      default:
        return { default: 2.5, sm: 2.5, md: 3.5, lg: 4.5 };
    }
  };

  // 슬라이드당 카드 수 설정
  const slidesPerView = getSlidesPerView();

  // 모바일/태블릿/데스크탑별 브레이크포인트 설정 (항상 한 장씩 슬라이드)
  const breakpoints = {
    320: {
      slidesPerView: typeof slidesPerView === 'object' ? slidesPerView.default : slidesPerView,
      slidesPerGroup: 1,
    },
    640: {
      slidesPerView:
        typeof slidesPerView === 'object'
          ? slidesPerView.sm || slidesPerView.default
          : slidesPerView,
      slidesPerGroup: 1,
    },
    768: {
      slidesPerView:
        typeof slidesPerView === 'object'
          ? slidesPerView.md || slidesPerView.sm || slidesPerView.default
          : slidesPerView,
      slidesPerGroup: 1,
    },
    1024: {
      slidesPerView:
        typeof slidesPerView === 'object'
          ? slidesPerView.lg || slidesPerView.md || slidesPerView.default
          : slidesPerView,
      slidesPerGroup: 1,
    },
  };

  // 한 줄에 표시할 카드 수에 따른 그리드 클래스 (스와이퍼를 사용하지 않을 때 사용)
  const getGridColumns = () => {
    switch (cardsPerRow) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
      case 4:
        return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
      default:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
    }
  };

  // 스켈레톤 로더 렌더링
  const renderSkeletons = () => {
    return Array(cardsPerRow)
      .fill(0)
      .map((_, index) => (
        <SwiperSlide key={`skeleton-${index}`}>
          <CardSkeleton />
        </SwiperSlide>
      ));
  };

  // 카드 렌더링
  const renderCards = () => {
    return characters.map((character, index) => (
      <SwiperSlide key={character.id}>
        <Card
          character={character}
          index={index}
          variant={variant}
          onCardClick={() => handleCardClick(character)}
          onEdit={onEdit ? () => onEdit(character) : undefined}
          onDelete={onDelete ? () => onDelete(character) : undefined}
          hasRank={hasRanking}
          rank={hasRanking ? index + 1 : undefined}
          isCharacterRankingSidebar={isCharacterRankingSidebar}
          isSidebar={isSidebar}
        />
      </SwiperSlide>
    ));
  };

  return (
    <div className={className}>
      {title && (
        <FadeIn direction='up' delay={0.1}>
          <div className='flex justify-between items-center mb-4'>
            <div>
              <h2 className='text-2xl font-bold text-text-primary relative inline-block'>
                {title}
              </h2>
              {subtitle && <p className='text-sm text-text-muted mt-1'>{subtitle}</p>}
              {lastUpdateTime && (
                <p className='text-xs text-text-muted mt-1'>{lastUpdateTime} 업데이트</p>
              )}
            </div>

            {showMoreLink && (
              <Link
                href={showMoreLink}
                className='text-sm text-brand hover:text-brand-hover flex items-center'
              >
                {showMoreText}
              </Link>
            )}
          </div>
        </FadeIn>
      )}

      {error && (
        <FadeIn direction='up' delay={0.2}>
          <div className='bg-danger/10 text-danger p-4 rounded-md mb-6'>{error}</div>
        </FadeIn>
      )}

      {useSwiper ? (
        <div className='relative swiper-container-wrapper overflow-visible' id={sectionId}>
          {shouldShowNavigation && (
            <>
              <button
                type='button'
                className={`swiper-button-prev navigation-button navigation-prev-button card-grid-prev-button absolute left-[-20px] z-[9999] hidden md:flex items-center justify-center ${
                  reachedBeginning ? 'swiper-button-disabled' : ''
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (swiperRef.current && !reachedBeginning) {
                    swiperRef.current.slidePrev();
                  }
                }}
                aria-label='이전'
                disabled={reachedBeginning}
              ></button>
              <button
                type='button'
                className={`swiper-button-next navigation-button navigation-next-button card-grid-next-button absolute right-[-20px] z-[9999] hidden md:flex items-center justify-center ${
                  reachedEnd ? 'swiper-button-disabled' : ''
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (swiperRef.current && !reachedEnd) {
                    swiperRef.current.slideNext();
                  }
                }}
                aria-label='다음'
                disabled={reachedEnd}
              ></button>
            </>
          )}
          <Swiper
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              setReachedBeginning(swiper.isBeginning);
              setReachedEnd(swiper.isEnd);

              // 스와이퍼 초기화 후 버튼 재연결
              setTimeout(() => {
                if (swiper && swiper.navigation) {
                  swiper.navigation.update();
                }
              }, 100);
            }}
            modules={[Navigation]}
            spaceBetween={16}
            loop={false}
            slidesPerGroup={1}
            navigation={{
              nextEl: `#${sectionId} .card-grid-next-button`,
              prevEl: `#${sectionId} .card-grid-prev-button`,
              enabled: true,
            }}
            breakpoints={breakpoints}
            onReachEnd={handleReachEnd}
            onReachBeginning={handleReachBeginning}
            onSlideChange={handleSlideChange}
            className='custom-swiper card-grid-swiper overflow-visible'
          >
            {isDataLoading ? renderSkeletons() : renderCards()}
          </Swiper>
        </div>
      ) : (
        <div
          className={`grid ${getGridColumns()} ${variant === 'horizontal' ? 'gap-2' : 'gap-4 md:gap-6'}`}
        >
          {isDataLoading
            ? Array(cardsPerRow)
                .fill(0)
                .map((_, index) => <CardSkeleton key={index} />)
            : characters.map((character, index) => (
                <Card
                  key={character.id}
                  character={character}
                  index={index}
                  variant={variant}
                  onCardClick={() => handleCardClick(character)}
                  onEdit={onEdit ? () => onEdit(character) : undefined}
                  onDelete={onDelete ? () => onDelete(character) : undefined}
                  hasRank={hasRanking}
                  rank={hasRanking ? index + 1 : undefined}
                  isCharacterRankingSidebar={isCharacterRankingSidebar}
                  isSidebar={isSidebar}
                />
              ))}
        </div>
      )}
    </div>
  );
}
