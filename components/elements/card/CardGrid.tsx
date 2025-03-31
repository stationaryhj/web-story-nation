'use client'

import { FadeIn } from '@/components/motion/PageTransition'
import type { Character } from '@/store/useStoreData'
import { useStoreData } from '@/store/useStoreData'
import { useEffect, useState, useRef } from 'react'
import { useModalStore } from '@/store/useStoreModal'
import { useSettingsStore } from '@/store/useStoreSettings'
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
  variant?: 'default' | 'my-character' | 'horizontal'
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
  className?: string // 추가 스타일링을 위한 클래스명
  sectionId?: string // 각 섹션을 구분하기 위한 고유 ID
}

// 목데이터 추가
const mockCharacters: Array<Character> = [
  {
    id: '1',
    name: '김철수',
    description: '열정적인 마법사',
    imageUrl: '/images/character1.jpg',
    category: 'male',
    isAdult: false,
    createdAt: new Date().toISOString(),
    commentCount: 0,
    hashtags: ['마법사', '열정'],
    creator: {
      id: 'user1',
      nickname: '김철수',
      username: 'kimchulsu',
      profileImageUrl: null,
      isActive: true,
    },
  },
  {
    id: '2',
    name: '이영희',
    description: '신비로운 요정',
    imageUrl: '/images/character1.jpg',
    category: 'female',
    isAdult: false,
    createdAt: new Date().toISOString(),
    commentCount: 5,
    hashtags: ['요정', '신비'],
    creator: {
      id: 'user2',
      nickname: '이영희',
      username: 'leeyounghee',
      profileImageUrl: null,
      isActive: true,
    },
  },
  {
    id: '3',
    name: '박지성',
    description: '용감한 전사',
    imageUrl: '/images/character1.jpg',
    category: 'male',
    isAdult: false,
    createdAt: new Date().toISOString(),
    commentCount: 3,
    hashtags: ['전사', '용감'],
    creator: {
      id: 'user3',
      nickname: '박지성',
      username: 'parkjisung',
      profileImageUrl: null,
      isActive: true,
    },
  },
  {
    id: '4',
    name: '최민수',
    description: '교활한 도적',
    imageUrl: '/images/character1.jpg',
    category: 'male',
    isAdult: true,
    createdAt: new Date().toISOString(),
    commentCount: 2,
    hashtags: ['도적', '교활'],
    creator: {
      id: 'user4',
      nickname: '최민수',
      username: 'choiminsu',
      profileImageUrl: null,
      isActive: true,
    },
  },
  {
    id: '5',
    name: '정유미',
    description: '현명한 마법사',
    imageUrl: '/images/character1.jpg',
    category: 'female',
    isAdult: false,
    createdAt: new Date().toISOString(),
    commentCount: 7,
    hashtags: ['마법사', '현명'],
    creator: {
      id: 'user5',
      nickname: '정유미',
      username: 'jungyumi',
      profileImageUrl: null,
      isActive: true,
    },
  },
  {
    id: '6',
    name: '한지민',
    description: '강력한 전사',
    imageUrl: '/images/character1.jpg',
    category: 'male',
    isAdult: false,
    createdAt: new Date().toISOString(),
    commentCount: 4,
    hashtags: ['전사', '강력'],
    creator: {
      id: 'user6',
      nickname: '한지민',
      username: 'hanjimin',
      profileImageUrl: null,
      isActive: true,
    },
  },
  {
    id: '7',
    name: '송혜교',
    description: '신비로운 요정',
    imageUrl: '/images/character1.jpg',
    category: 'female',
    isAdult: false,
    createdAt: new Date().toISOString(),
    commentCount: 6,
    hashtags: ['요정', '신비'],
    creator: {
      id: 'user7',
      nickname: '송혜교',
      username: 'songhyekyo',
      profileImageUrl: null,
      isActive: true,
    },
  },
  {
    id: '8',
    name: '이병헌',
    description: '교활한 도적',
    imageUrl: '/images/character1.jpg',
    category: 'male',
    isAdult: true,
    createdAt: new Date().toISOString(),
    commentCount: 1,
    hashtags: ['도적', '교활'],
    creator: {
      id: 'user8',
      nickname: '이병헌',
      username: 'leebyunghun',
      profileImageUrl: null,
      isActive: true,
    },
  },
  {
    id: '9',
    name: '김태희',
    description: '현명한 마법사',
    imageUrl: '/images/character1.jpg',
    category: 'female',
    isAdult: false,
    createdAt: new Date().toISOString(),
    commentCount: 8,
    hashtags: ['마법사', '현명'],
    creator: {
      id: 'user9',
      nickname: '김태희',
      username: 'kimtaehee',
      profileImageUrl: null,
      isActive: true,
    },
  },
  {
    id: '10',
    name: '원빈',
    description: '강력한 전사',
    imageUrl: '/images/character1.jpg',
    category: 'male',
    isAdult: false,
    createdAt: new Date().toISOString(),
    commentCount: 9,
    hashtags: ['전사', '강력'],
    creator: {
      id: 'user10',
      nickname: '원빈',
      username: 'wonbin',
      profileImageUrl: null,
      isActive: true,
    },
  },
  {
    id: '11',
    name: '김하늘',
    description: '신비로운 요정',
    imageUrl: '/images/character1.jpg',
    category: 'female',
    isAdult: false,
    createdAt: new Date().toISOString(),
    commentCount: 10,
    hashtags: ['요정', '신비'],
    creator: {
      id: 'user11',
      nickname: '김하늘',
      username: 'kimhaneul',
      profileImageUrl: null,
      isActive: true,
    },
  },
  {
    id: '12',
    name: '장동건',
    description: '교활한 도적',
    imageUrl: '/images/character1.jpg',
    category: 'male',
    isAdult: true,
    createdAt: new Date().toISOString(),
    commentCount: 11,
    hashtags: ['도적', '교활'],
    creator: {
      id: 'user12',
      nickname: '장동건',
      username: 'jangdonggun',
      profileImageUrl: null,
      isActive: true,
    },
  },
  {
    id: '13',
    name: '이영애',
    description: '현명한 마법사',
    imageUrl: '/images/character1.jpg',
    category: 'female',
    isAdult: false,
    createdAt: new Date().toISOString(),
    commentCount: 12,
    hashtags: ['마법사', '현명'],
    creator: {
      id: 'user13',
      nickname: '이영애',
      username: 'leeyoungae',
      profileImageUrl: null,
      isActive: true,
    },
  },
  {
    id: '14',
    name: '배수지',
    description: '강력한 전사',
    imageUrl: '/images/character1.jpg',
    category: 'female',
    isAdult: false,
    createdAt: new Date().toISOString(),
    commentCount: 13,
    hashtags: ['전사', '강력'],
    creator: {
      id: 'user14',
      nickname: '배수지',
      username: 'baesuji',
      profileImageUrl: null,
      isActive: true,
    },
  },
  {
    id: '15',
    name: '이민호',
    description: '신비로운 요정',
    imageUrl: '/images/character1.jpg',
    category: 'male',
    isAdult: false,
    createdAt: new Date().toISOString(),
    commentCount: 14,
    hashtags: ['요정', '신비'],
    creator: {
      id: 'user15',
      nickname: '이민호',
      username: 'leeminho',
      profileImageUrl: null,
      isActive: true,
    },
  },
]

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
}: CardGridProps) {
  const { isLoading: storeLoading, error: storeError, fetchCategoryCharacters } = useStoreData()
  const { openModal, setSelectedCharacter } = useModalStore()
  const { isAdultModeEnabled } = useSettingsStore()
  const [characters, setCharacters] = useState<Array<Character>>([])
  const [localLoading, setLocalLoading] = useState(true)
  const [reachedEnd, setReachedEnd] = useState(false)
  const [reachedBeginning, setReachedBeginning] = useState(true)
  const swiperRef = useRef<SwiperType | null>(null)

  // 로딩 상태와 에러 상태 통합
  const isDataLoading = externalLoading !== undefined ? externalLoading : storeLoading || localLoading
  const error = externalError || storeError

  useEffect(() => {
    // customData가 제공되면 해당 데이터를 사용
    if (customData) {
      // 성인 모드 비활성화 시 성인 컨텐츠 필터링
      // const filteredData = isAdultModeEnabled ? customData : customData.filter(character => !character.isAdult)
      // setCharacters(filteredData)
      setCharacters(mockCharacters)
      setLocalLoading(false)
      return
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
  }, [fetchCategoryCharacters, categoryId, customData, isAdultModeEnabled])

  useEffect(() => {
    console.log('characters', characters)
  }, [characters])

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
        return 2.5
      case 2:
        return { default: 2.5, sm: 2.5 }
      case 3:
        return { default: 2.5, sm: 2.5, md: 3.5 }
      case 4:
        return { default: 2.5, sm: 2.5, md: 3.5, lg: 4.5 }
      default:
        return { default: 2.5, sm: 2.5, md: 3.5, lg: 4.5 }
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
    <div className={className}>
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
        <div className="relative swiper-container-wrapper overflow-visible" id={sectionId}>
          <button
            type="button"
            className={`swiper-button-prev navigation-button navigation-prev-button card-grid-prev-button absolute left-[-20px] z-[9999] hidden md:flex items-center justify-center ${
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
            className={`swiper-button-next navigation-button navigation-next-button card-grid-next-button absolute right-[-20px] z-[9999] hidden md:flex items-center justify-center ${
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
            className="custom-swiper card-grid-swiper overflow-visible"
          >
            {isDataLoading ? renderSkeletons() : renderCards()}
          </Swiper>
        </div>
      ) : (
        <div className={`grid ${getGridColumns()} ${variant === 'horizontal' ? 'gap-2' : 'gap-4 md:gap-6'}`}>
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
