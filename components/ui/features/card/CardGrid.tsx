'use client'

import { useEffect, useState } from 'react'
import Card from './Card'
import CardSkeleton from './CardSkeleton'
import { useStoreData, Character } from '@/store/useStoreData'
import { FadeIn } from '@/components/ui/motion/PageTransition'

interface CardGridProps {
  title?: string;
  categoryId?: string;
}

export default function CardGrid({ title = '인기 캐릭터', categoryId = 'recommended' }: CardGridProps) {
  const { isLoading, error, fetchCategoryCharacters } = useStoreData()
  const [characters, setCharacters] = useState<Character[]>([])
  const [localLoading, setLocalLoading] = useState(true)
  
  useEffect(() => {
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
  }, [fetchCategoryCharacters, categoryId])
  
  const isDataLoading = isLoading || localLoading
  
  return (
    <div className="container mx-auto px-4">
      <FadeIn direction="up" delay={0.1}>
        <h2 className="text-2xl font-bold mb-6 text-secondary-900 dark:text-dark-secondary-700 relative inline-block">
          {title}
          <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-primary-500 dark:bg-dark-primary-500 rounded-full"></span>
        </h2>
      </FadeIn>
      
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
              <Card key={character.id} character={character} index={index} />
            ))}
      </div>
    </div>
  )
}