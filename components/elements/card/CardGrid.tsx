'use client'

import { FadeIn } from '@/components/motion/PageTransition'
import type { Character } from '@/store/useStoreData'
import { useStoreData } from '@/store/useStoreData'
import { useEffect, useState } from 'react'
import { useModalStore } from '@/store/useStoreModal'
import { useRouter } from 'next/navigation'
import CardSkeleton from '../skeleton/CardSkeleton'
import Card from './Card'
import Link from 'next/link'

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
}: CardGridProps) {
  const { isLoading: storeLoading, error: storeError, fetchCategoryCharacters } = useStoreData()
  const { openModal, setSelectedCharacter } = useModalStore()
  const [characters, setCharacters] = useState<Array<Character>>([])
  const [localLoading, setLocalLoading] = useState(true)
  const router = useRouter()

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

  // 한 줄에 표시할 카드 수에 따른 그리드 클래스
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
      case 6:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
      case 7:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7'
      case 8:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8'
      default:
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' // 기본값 5
    }
  }

  return (
    <div className="container mx-auto px-4">
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
    </div>
  )
}
