'use client'

import { FadeIn } from '@/components/motion/PageTransition'
import type { Character } from '@/store/useStoreData'
import { useStoreData } from '@/store/useStoreData'
import { useEffect, useState, useRef } from 'react'
import { useModalStore } from '@/store/useStoreModal'
import { useRouter } from 'next/navigation'
import CardSkeleton from '../skeleton/CardSkeleton'
import Card from './Card'
import Link from 'next/link'
// Swiper 관련 임포트 추가
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
// Swiper 스타일 임포트
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

interface CardGridProps {
  title?: string | null
  subtitle?: string | null
  categoryId?: string
  customData?: Array<Character>
  variant?: 'default' | 'my-character'
  onEdit?: (character: Character) => void
  onDelete?: (character: Character) => void
  cardsPerRow?: number // 한 줄에 표시할 카드 수
  hasRanking?: boolean // 랭킹 표시 여부
  showMoreLink?: string // 더보기 링크
  showMoreText?: string // 더보기 텍스트
  lastUpdateTime?: string // 마지막 업데이트 시간
  isLoading?: boolean
  error?: string | null
  useSwiper?: boolean // Swiper 사용 여부 (기본값: true)
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
}: CardGridProps) {
  const { isLoading: storeLoading, error: storeError, fetchCategoryCharacters } = useStoreData()
  const { openModal, setSelectedCharacter } = useModalStore()
  const [characters, setCharacters] = useState<Array<Character>>([])
  const [localLoading, setLocalLoading] = useState(true)
  const [reachedEnd, setReachedEnd] = useState(false)
  const [reachedBeginning, setReachedBeginning] = useState(true)
  const router = useRouter()
  const swiperRef = useRef<SwiperType | null>(null)

  // 로딩 상태와 에러 상태 통합
  const isDataLoading = externalLoading !== undefined ? externalLoading : storeLoading || localLoading
  const error = externalError || storeError

  useEffect(() => {
    // customData가 제공되면 해당 데이터를 사용
    if (customData) {
      setCharacters(customData)
      setLocalLoading(false)
      return
    }

    // customData가 없으면 기존 로직으로 데이터 로드
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
  }, [fetchCategoryCharacters, categoryId, customData])

  // 카드 클릭 핸들러
  const handleCardClick = (character: Character) => {
    if (variant !== 'my-character') {
      setSelectedCharacter(character)
      openModal('character')
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

  // 브레이크포인트에 따른 한 번에 보이는 슬라이드 수 설정
  const getSlidesPerView = () => {
    switch (cardsPerRow) {
      case 1:
        return 1
      case 2:
        return { default: 1, sm: 2 }
      case 3:
        return { default: 1, sm: 2, md: 3 }
      case 4:
        return { default: 2, sm: 2, md: 3, lg: 4 }
      default:
        return { default: 2, sm: 3, md: 4, lg: 5 }
    }
  }

  // 슬라이드당 카드 수 설정
  const slidesPerView = getSlidesPerView()

  // 모바일/태블릿/데스크탑별 브레이크포인트 설정 (항상 한 장씩 슬라이드)
  const breakpoints = {
    320: {
      slidesPerView: typeof slidesPerView === 'object' ? slidesPerView.default : slidesPerView,
      slidesPerGroup: 1,
    },
    640: {
      slidesPerView: typeof slidesPerView === 'object' ? slidesPerView.sm || slidesPerView.default : slidesPerView,
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
      case 4:
        return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      default:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
    }
  }

  // 스켈레톤 로더 렌더링
  const renderSkeletons = () => {
    return Array(cardsPerRow)
      .fill(0)
      .map((_, index) => (
        <SwiperSlide key={`skeleton-${index}`}>
          <CardSkeleton />
        </SwiperSlide>
      ))
  }

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

      {useSwiper ? (
        <div className="relative swiper-container-wrapper">
          <button
            type="button"
            className={`swiper-button-prev navigation-button navigation-prev-button card-grid-prev-button absolute left-[-20px] z-[9999] flex items-center justify-center ${
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
            className={`swiper-button-next navigation-button navigation-next-button card-grid-next-button absolute right-[-20px] z-[9999] flex items-center justify-center ${
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
            loop={false}
            slidesPerGroup={1}
            navigation={{
              nextEl: '.card-grid-next-button',
              prevEl: '.card-grid-prev-button',
              enabled: true,
            }}
            breakpoints={breakpoints}
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
            className="custom-swiper card-grid-swiper"
          >
            {isDataLoading ? renderSkeletons() : renderCards()}
          </Swiper>
        </div>
      ) : (
        <div className={`grid ${getGridColumns()} gap-4 md:gap-6`}>
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
                />
              ))}
        </div>
      )}
    </div>
  )
}
