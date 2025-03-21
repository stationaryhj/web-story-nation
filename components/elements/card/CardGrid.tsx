'use client'

import { FadeIn } from '@/components/motion/PageTransition'
import type { Character } from '@/store/useStoreData'
import { useStoreData } from '@/store/useStoreData'
import { useEffect, useState } from 'react'
import { useModalStore } from '@/store/useStoreModal'
import { useRouter } from 'next/navigation'
import CardSkeleton from '../skeleton/CardSkeleton'
import Card from './Card'

interface CardGridProps {
  title?: string | null
  subtitle?: string | null
  categoryId?: string
  customData?: Array<Character>
}

export default function CardGrid({ title = null, subtitle = null, categoryId = 'all', customData }: CardGridProps) {
  const { isLoading, error, fetchCategoryCharacters } = useStoreData()
  const { openModal, setSelectedCharacter } = useModalStore()
  const [characters, setCharacters] = useState<Array<Character>>([])
  const [localLoading, setLocalLoading] = useState(true)
  const router = useRouter()

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

  const isDataLoading = isLoading || localLoading

  // 카드 클릭 핸들러
  const handleCardClick = (character: Character) => {
    // URL로 바로 이동하는 대신 모달 열기
    setSelectedCharacter(character)
    // openModal('character')
    router.push(`/chat/${1}`)
  }

  return (
    <div className="container mx-auto px-4">
      {title && subtitle && (
        <FadeIn direction="up" delay={0.1}>
          <h2 className="text-2xl font-bold mb-6 text-secondary-900 dark:text-dark-secondary-700 relative inline-block">
            {title}
            <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-primary-500 dark:bg-dark-primary-500 rounded-full"></span>
            <br />
            {subtitle && <span className="text-sm text-gray-500 dark:text-dark-gray-500">{subtitle}</span>}
          </h2>
        </FadeIn>
      )}

      {error && (
        <FadeIn direction="up" delay={0.2}>
          <div className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 p-4 rounded-md mb-6">
            {error}
          </div>
        </FadeIn>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {isDataLoading
          ? Array(5)
              .fill(0)
              .map((_, index) => <CardSkeleton key={index} />)
          : characters.map((character, index) => (
              <Card
                key={character.id}
                character={character}
                index={index}
                onCardClick={() => handleCardClick(character)}
              />
            ))}
      </div>
    </div>
  )
}
