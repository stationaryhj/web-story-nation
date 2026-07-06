'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
// Swiper 관련 임포트 추가
import { Swiper, SwiperSlide } from 'swiper/react';
import { FadeIn } from '@/components/motion/PageTransition';
import CardSkeleton from '../skeleton/CardSkeleton';
import AuthorCard from './AuthorCard';
// Swiper 스타일 임포트
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useRouter } from 'next/navigation';
import { useAuthorStore } from '@/store/useAuthorStore';

// 작가 타입 정의
interface Author {
  id: string;
  name: string;
  nickname: string;
  description?: string;
  profileImageUrl?: string | null;
  characterCount: number;
  isVerified?: boolean;
}

interface AuthorGridProps {
  title?: string | null;
  subtitle?: string | null;
  customData?: Array<Author>;
  cardsPerRow?: number;
  hasRanking?: boolean;
  showMoreLink?: string;
  showMoreText?: string;
  lastUpdateTime?: string;
  isLoading?: boolean;
  error?: string | null;
  isSidebar?: boolean;
  onAuthorClick?: (author: Author) => void;
  useSwiper?: boolean;
  variant?: 'default' | 'horizontal';
  className?: string;
  sectionId?: string;
}

export default function AuthorGrid({
  title = null,
  subtitle = null,
  customData = [],
  cardsPerRow = 4, // 기본값 4
  hasRanking = false,
  showMoreLink,
  showMoreText = '더보기',
  lastUpdateTime,
  isLoading = false,
  error = null,
  isSidebar = false,
  onAuthorClick,
  useSwiper = true,
  variant = 'default',
  className = '',
  sectionId = '',
}: AuthorGridProps) {
  const router = useRouter();
  const [authors, setAuthors] = useState<Array<Author>>(customData);
  const [localLoading, setLocalLoading] = useState(isLoading);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [reachedBeginning, setReachedBeginning] = useState(true);
  const swiperRef = useRef<SwiperType | null>(null);

  // 스와이퍼 사용 여부 결정 - 항상 props의 useSwiper 값을 따름
  const shouldUseSwiper = useSwiper;
  // PC에서 8개 이하일 때는 네비게이션 버튼 숨김
  const shouldShowNavigation = authors.length > 8;

  useEffect(() => {
    setAuthors(customData);
    setLocalLoading(isLoading);
  }, [customData, isLoading]);

  // 작가 클릭 핸들러
  const handleAuthorClick = (author: Author) => {
    if (author && author.nickname) {
      // 작가 정보를 스토어에 미리 저장
      const authorStore = useAuthorStore.getState();

      // 작가 기본 정보 설정
      authorStore.reset(); // 기존 데이터 초기화

      // 작가 정보 미리 설정 (상세 정보는 없지만 기본 정보만이라도 표시)
      const preloadedAuthor = {
        nickname: author.nickname,
        profileImage: author.profileImageUrl || '/images/default-profile.jpg',
        bio: author.description || '',
        isBlocked: false,
      };

      // 스토어 상태 수동 업데이트
      useAuthorStore.setState({
        author: preloadedAuthor,
        isLoading: true, // API 호출을 위해 로딩 상태로 설정
      });

      // 페이지 이동 (나머지 데이터는 페이지에서 로드)
      router.push(`/author/${encodeURIComponent(author.nickname)}`);
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

  // 한 줄에 표시할 카드 수에 따른 그리드 클래스 (스와이퍼를 사용하지 않을 때 사용)
  const getGridColumns = () => {
    switch (cardsPerRow) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
      case 5:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
      case 6:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';
      case 10:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
      default:
        return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'; // 기본값 4
    }
  };

  // 스켈레톤 로더 렌더링
  const renderSkeletons = () => {
    return Array(cardsPerRow)
      .fill(0)
      .map((_, index) => (
        <SwiperSlide key={`skeleton-${Date.now()}-${index}`}>
          <div className='h-24 bg-surface-elevated rounded-xl animate-pulse'></div>
        </SwiperSlide>
      ));
  };

  // 작가 카드 렌더링
  const renderAuthorCards = () => {
    return authors.map((author, index) => (
      <SwiperSlide key={`author-${author.id}`}>
        <AuthorCard
          author={author}
          index={index}
          hasRank={hasRanking}
          rank={hasRanking ? index + 1 : undefined}
          onClick={() => handleAuthorClick(author)}
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

      {shouldUseSwiper ? (
        <div className='relative swiper-container-wrapper' id={sectionId}>
          {shouldShowNavigation && (
            <>
              <button
                type='button'
                className={`swiper-button-prev navigation-button navigation-prev-button author-grid-prev-button absolute left-[-20px] z-[9999] flex items-center justify-center ${
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
                className={`swiper-button-next navigation-button navigation-next-button author-grid-next-button absolute right-[-20px] z-[9999] flex items-center justify-center ${
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
            modules={[Navigation]}
            spaceBetween={16}
            loop={false}
            slidesPerGroup={1}
            navigation={
              shouldShowNavigation
                ? {
                    nextEl: `#${sectionId} .author-grid-next-button`,
                    prevEl: `#${sectionId} .author-grid-prev-button`,
                    enabled: true,
                  }
                : false
            }
            breakpoints={{
              320: { slidesPerView: 3 },
              640: { slidesPerView: 3 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
              1280: { slidesPerView: cardsPerRow > 4 ? cardsPerRow : 4 },
            }}
            onReachEnd={handleReachEnd}
            onReachBeginning={handleReachBeginning}
            onSlideChange={handleSlideChange}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              setReachedBeginning(swiper.isBeginning);
              setReachedEnd(swiper.isEnd);

              // 스와이퍼 초기화 후 버튼 재연결
              if (shouldShowNavigation) {
                setTimeout(() => {
                  if (swiper && swiper.navigation) {
                    swiper.navigation.update();
                  }
                }, 100);
              }
            }}
            className='custom-swiper author-grid-swiper'
          >
            {localLoading ? renderSkeletons() : renderAuthorCards()}
          </Swiper>
        </div>
      ) : (
        <div className={`grid ${getGridColumns()} gap-4 md:gap-6`}>
          {localLoading
            ? Array(cardsPerRow)
                .fill(0)
                .map((_, index) => <CardSkeleton key={index} />)
            : authors.map((author, index) => (
                <AuthorCard
                  key={author.id}
                  author={author}
                  index={index}
                  hasRank={hasRanking}
                  rank={hasRanking ? index + 1 : undefined}
                  onClick={() => handleAuthorClick(author)}
                  isSidebar={isSidebar}
                />
              ))}
        </div>
      )}
    </div>
  );
}
