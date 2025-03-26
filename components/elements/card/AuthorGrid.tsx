'use client'

import { FadeIn } from '@/components/motion/PageTransition'
import { useState, useEffect, useRef } from 'react'
import AuthorCard from './AuthorCard'
import Link from 'next/link'
import CardSkeleton from '../skeleton/CardSkeleton'
// Swiper 관련 임포트 추가
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
// Swiper 스타일 임포트
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// 작가 타입 정의
interface Author {
  id: string
  name: string
  nickname: string
  description?: string
  profileImageUrl?: string | null
  characterCount: number
  isVerified?: boolean
}

interface AuthorGridProps {
  title?: string | null
  subtitle?: string | null
  customData?: Array<Author>
  cardsPerRow?: number
  hasRanking?: boolean
  showMoreLink?: string
  showMoreText?: string
  lastUpdateTime?: string
  isLoading?: boolean
  error?: string | null
  isSidebar?: boolean
  onAuthorClick?: (author: Author) => void
  useSwiper?: boolean // Swiper 사용 여부 (기본값: true)
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
  useSwiper = true, // 기본적으로 Swiper 사용
}: AuthorGridProps) {
  const [authors, setAuthors] = useState<Array<Author>>(customData)
  const [localLoading, setLocalLoading] = useState(isLoading)
  const [reachedEnd, setReachedEnd] = useState(false)
  const [reachedBeginning, setReachedBeginning] = useState(true)
  const swiperRef = useRef<SwiperType | null>(null)

  // 스와이퍼 사용 여부 결정 - 항상 props의 useSwiper 값을 따름
  const shouldUseSwiper = useSwiper

  useEffect(() => {
    setAuthors(customData)
    setLocalLoading(isLoading)
  }, [customData, isLoading])

  // 작가 클릭 핸들러
  const handleAuthorClick = (author: Author) => {
    if (onAuthorClick) {
      onAuthorClick(author)
    }
  }

  // 스와이프 끝에 도달했을 때 핸들러
  const handleReachEnd = () => {
    setReachedEnd(true)
  }

  // 스와이프가 첫 슬라이드로 돌아왔을 때 핸들러
  const handleReachBeginning = () => {
    setReachedBeginning(true)
    setReachedEnd(false)
  }

  // 슬라이드가 이동할 때 호출되는 핸들러
  const handleSlideChange = (swiper: SwiperType) => {
    setReachedBeginning(swiper.isBeginning)
    setReachedEnd(swiper.isEnd)
  }

  // 한 줄에 표시할 카드 수에 따른 그리드 클래스 (스와이퍼를 사용하지 않을 때 사용)
  const getGridColumns = () => {
    switch (cardsPerRow) {
      case 1:
        return 'grid-cols-1'
      case 2:
        return 'grid-cols-1 sm:grid-cols-2'
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
      case 5:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
      case 6:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
      case 10:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
      default:
        return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' // 기본값 4
    }
  }

  // 스켈레톤 로더 렌더링
  const renderSkeletons = () => {
    return Array(cardsPerRow)
      .fill(0)
      .map((_, index) => (
        <SwiperSlide key={`skeleton-${index}`}>
          <div className="h-24 bg-secondary-100 dark:bg-dark-secondary-800 rounded-xl animate-pulse"></div>
        </SwiperSlide>
      ))
  }

  // 작가 카드 렌더링
  const renderAuthorCards = () => {
    return authors.map((author, index) => (
      <SwiperSlide key={author.id}>
        <AuthorCard
          author={author}
          index={index}
          hasRank={hasRanking}
          rank={hasRanking ? index + 1 : undefined}
          onClick={() => handleAuthorClick(author)}
          isSidebar={isSidebar}
        />
      </SwiperSlide>
    ))
  }

  return (
    <div>
      {title && (
        <FadeIn direction="up" delay={0.1}>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-dark-secondary-700 relative inline-block">
                {title}
                <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-primary-500 dark:bg-dark-primary-500 rounded-full"></span>
              </h2>
              {subtitle && <p className="text-sm text-gray-500 dark:text-dark-gray-500 mt-1">{subtitle}</p>}
              {lastUpdateTime && (
                <p className="text-xs text-secondary-500 dark:text-dark-secondary-500 mt-1">
                  {lastUpdateTime} 업데이트
                </p>
              )}
            </div>

            {showMoreLink && (
              <Link
                href={showMoreLink}
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-dark-primary-400 dark:hover:text-dark-primary-300 flex items-center"
              >
                {showMoreText}
              </Link>
            )}
          </div>
        </FadeIn>
      )}

      {error && (
        <FadeIn direction="up" delay={0.2}>
          <div className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 p-4 rounded-md mb-6">
            {error}
          </div>
        </FadeIn>
      )}

      {shouldUseSwiper ? (
        <div className="relative swiper-container-wrapper">
          <button
            type="button"
            className={`swiper-button-prev navigation-button navigation-prev-button author-grid-prev-button absolute left-[-20px] z-[9999] flex items-center justify-center ${
              reachedBeginning ? 'swiper-button-disabled' : ''
            }`}
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              if (swiperRef.current && !reachedBeginning) {
                swiperRef.current.slidePrev()
              }
            }}
            aria-label="이전"
            disabled={reachedBeginning}
          ></button>
          <button
            type="button"
            className={`swiper-button-next navigation-button navigation-next-button author-grid-next-button absolute right-[-20px] z-[9999] flex items-center justify-center ${
              reachedEnd ? 'swiper-button-disabled' : ''
            }`}
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              if (swiperRef.current && !reachedEnd) {
                swiperRef.current.slideNext()
              }
            }}
            aria-label="다음"
            disabled={reachedEnd}
          ></button>
          <Swiper
            modules={[Navigation]}
            spaceBetween={16}
            slidesPerGroup={1}
            slidesPerView="auto"
            navigation={{
              nextEl: '.author-grid-next-button',
              prevEl: '.author-grid-prev-button',
              enabled: true,
            }}
            breakpoints={{
              320: { slidesPerView: 2 },
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
              1280: { slidesPerView: cardsPerRow > 4 ? cardsPerRow : 4 },
            }}
            onReachEnd={handleReachEnd}
            onReachBeginning={handleReachBeginning}
            onSlideChange={handleSlideChange}
            onSwiper={swiper => {
              swiperRef.current = swiper
              setReachedBeginning(swiper.isBeginning)
              setReachedEnd(swiper.isEnd)

              // 스와이퍼 초기화 후 버튼 재연결
              setTimeout(() => {
                if (swiper && swiper.navigation) {
                  swiper.navigation.update()
                }
              }, 100)
            }}
            className="custom-swiper author-grid-swiper"
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
  )
}
