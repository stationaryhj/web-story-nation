// components/ui/card/Card.tsx
'use client'

import { CardTransition } from '@/components/motion/PageTransition'
import { getImageUri } from '@/lib/utils/storyNationUtil'
import type { Character } from '@/store/useStoreData'
import { useModalStore } from '@/store/useStoreModal'
import { faComment, faFire, faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import React from 'react'
import { useRouter } from 'next/navigation'

interface CardProps {
  character: Character
  index?: number
  variant?: 'default' | 'my-character'
  onEdit?: () => void
  onDelete?: () => void
  onCardClick?: () => void
  rank?: number
  hasRank?: boolean

}

export default function Card({
  character,
  index = 0,
  variant = 'default',
  onEdit,
  onDelete,
  onCardClick,
  rank,
  hasRank = false,
}: CardProps) {
  const { name, description, imageUrl, commentCount, hashtags, isAdult, creator } = character
  const { openModal, setSelectedCharacter } = useModalStore()
  const [imageError, setImageError] = React.useState(false)
  const router = useRouter()
  // 카드 클릭 기본 핸들러 - 캐릭터 모달 열기
  const defaultCardClick = () => {
    setSelectedCharacter(character)
    openModal('character')
  }

  // 실제 카드 클릭 핸들러
  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(character)
    } else {
      defaultCardClick()
    }
  }

  // 이미지 로드 에러 핸들러
  const handleImageError = () => {
    setImageError(true)
  }

  // 수정 버튼 클릭 처리
  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation() // 카드 클릭 이벤트 전파 방지
    if (onEdit) onEdit()
  }

  // 삭제 버튼 클릭 처리
  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation() // 카드 클릭 이벤트 전파 방지
    if (onDelete) onDelete()
  }

  // 랭킹에 따른 배경색 설정
  const getRankBgColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500' // 1위: 금색
    if (rank === 2) return 'bg-gray-400' // 2위: 은색
    if (rank === 3) return 'bg-amber-600' // 3위: 동색
    return 'bg-primary-500' // 그 외
  }

  return (
    <CardTransition index={index}>
      <div
        className="group relative overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-dark-background-light dark:border dark:border-dark-secondary-200/10 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="block">
          <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl">
            {/* 랭킹 표시 */}
            {hasRank && rank !== undefined && (
              <div
                className={`absolute top-0 left-0 z-10 w-8 h-8 ${getRankBgColor(rank)} text-white flex items-center justify-center font-bold shadow-md`}
              >
                {rank}
              </div>
            )}

            <Image
              src={getImageUri(imageUrl)}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              onError={handleImageError}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* {variant === 'default' && (
              <div className="absolute top-3 left-3 bg-primary-500/90 dark:bg-dark-primary-500/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                스토리네이션
              </div>
            )} */}

            {isAdult && (
              <div className="absolute top-3 right-3 bg-red-500/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                성인인증
              </div>
            )}

            {variant === 'default' && commentCount > 100 && (
              <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center backdrop-blur-sm">
                <FontAwesomeIcon icon={faFire} className="mr-1 text-red-400" />
                인기
              </div>
            )}

            {variant !== 'default' && (
              <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center backdrop-blur-sm">
                <FontAwesomeIcon icon={faComment} className="mr-1" />
                {commentCount}
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-bold text-secondary-900 dark:text-dark-secondary-700 mb-1 truncate group-hover:text-primary-600 dark:group-hover:text-dark-primary-600 transition-colors">
              {name}
            </h3>

            <div className="mb-2 flex flex-wrap gap-1">
              {hashtags.slice(0, 3).map((tag, index) => (
                <span
                  key={`${character.id}-tag-${tag}-${index}`}
                  className="text-xs text-primary-500 dark:text-dark-primary-600 bg-primary-50 dark:bg-dark-primary-100/10 px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-xs text-secondary-600 dark:text-dark-secondary-500 mb-3 line-clamp-2 h-8 group-hover:text-secondary-800 dark:group-hover:text-dark-secondary-400 transition-colors">
              {description}
            </p>

            {/* variant에 따라 다른 하단 영역 렌더링 */}
            {variant === 'default' ? (
              // 기본 카드 - 작성자 정보와 댓글 수
              <div className="flex items-center justify-between pt-2 border-t border-secondary-100 dark:border-dark-secondary-200/10">
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-secondary-200 dark:bg-dark-secondary-300 flex items-center justify-center overflow-hidden">
                    {creator?.profileImageUrl ? (
                      <Image
                        src={creator.profileImageUrl}
                        alt={creator.nickname}
                        width={20}
                        height={20}
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-[8px] text-secondary-500 dark:text-dark-secondary-400">
                        {creator?.nickname?.charAt(0) || '?'}
                      </span>
                    )}
                  </div>
                  <span className="ml-1 text-xs text-secondary-500 dark:text-dark-secondary-500 truncate max-w-[80px]">
                    {creator?.nickname || '익명'}
                  </span>
                </div>

                <div className="flex items-center text-secondary-500 dark:text-dark-secondary-500">
                  <FontAwesomeIcon icon={faComment} className="text-xs" />
                  <span className="ml-1 text-xs">{commentCount}</span>
                </div>
              </div>
            ) : (
              // 내 캐릭터 카드 - 수정/삭제 버튼
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={handleEditClick}
                  className="py-1.5 px-2 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 text-xs rounded flex items-center justify-center transition-colors dark:bg-dark-secondary-100/10 dark:hover:bg-dark-secondary-100/20 dark:text-dark-secondary-500"
                >
                  <FontAwesomeIcon icon={faPencilAlt} className="mr-1" />
                  수정
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs rounded flex items-center justify-center transition-colors dark:bg-red-900/10 dark:hover:bg-red-900/20 dark:text-red-400"
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-1" />
                  삭제
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </CardTransition>
  )
}
