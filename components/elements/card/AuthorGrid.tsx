'use client'

import { FadeIn } from '@/components/motion/PageTransition'
import { useState, useEffect } from 'react'
import AuthorCard from './AuthorCard'
import Link from 'next/link'
import CardSkeleton from '../skeleton/CardSkeleton'

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
}: AuthorGridProps) {
  const [authors, setAuthors] = useState<Array<Author>>(customData)
  const [localLoading, setLocalLoading] = useState(isLoading)

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

  // 한 줄에 표시할 카드 수에 따른 그리드 클래스
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
        return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-10'
      default:
        return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4' // 기본값 4
    }
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

      <div className={`grid ${getGridColumns()} ${isSidebar ? 'gap-5' : 'gap-2'}`}>
        {localLoading
          ? Array(cardsPerRow)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="h-24 bg-secondary-100 dark:bg-dark-secondary-800 rounded-xl animate-pulse"
                ></div>
              ))
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
    </div>
  )
}
