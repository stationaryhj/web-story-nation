// components/ui/card/Card.tsx
'use client'

import { CardTransition } from '@/components/motion/PageTransition'
import type { Character } from '@/store/useStoreData'
import { useModalStore } from '@/store/useStoreModal'
import { faPencilAlt, faTrash, faLock, faFire, faImages, faImage } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { getChangeNameTag } from '@/lib/utils/storyNationUtil'
import { contentApi, createApi } from '@/services/api/storyNationApi'
import type { CharbotResponse } from '@/types/api'

interface CardProps {
  character: Character
  index?: number
  variant?: 'default' | 'my-character' | 'horizontal'
  onEdit?: () => void
  onDelete?: () => void
  onCardClick?: (character: Character) => void
  rank?: number
  hasRank?: boolean
  isCharacterRankingSidebar?: boolean
  isSidebar?: boolean
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
  isSidebar = false,
  isCharacterRankingSidebar = false,
}: CardProps) {
  const { name, subject, description, imageUrl, commentCount, hashtags, isAdult, creator } = character
  const { openModal, setSelectedCharacter } = useModalStore()
  const [isMobile, setIsMobile] = useState(false)
  const [imageError, setImageError] = React.useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  const isTemp = character.finish_yn == 0
  const isLocked = character.show_yn == 0

  // hover 시 모달 데이터 prefetch
  const handlePrefetch = useCallback(() => {
    const id = Number(character.id)
    if (!id) return
    queryClient.prefetchQuery({
      queryKey: ['createChatBot', id],
      queryFn: async () => {
        const response = await createApi.GetChatBot(id)
        return response.data as CharbotResponse
      },
      staleTime: 60_000,
    })
    queryClient.prefetchQuery({
      queryKey: ['multiImage', id],
      queryFn: () => contentApi.GetMultiImageData(id, 0),
      staleTime: 60_000,
    })
  }, [character.id, queryClient])

  // 카드 클릭 기본 핸들러 - 캐릭터 모달 열기
  const defaultCardClick = () => {
    setSelectedCharacter(character)
    openModal('character')
  }

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    // 초기 체크
    checkMobile()

    // 화면 크기 변경 시 체크
    window.addEventListener('resize', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

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

  // 가로형 카드 렌더링
  if (variant === 'horizontal') {
    return (
      <CardTransition index={Math.min(index, 5)}>
        <div
          className="group relative overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-dark-background-light dark:border dark:border-dark-secondary-200/10 cursor-pointer flex mb-2"
          onClick={handleCardClick}
          onMouseEnter={handlePrefetch}
        >
          {/* 이미지 영역 */}
          <div className="relative w-32 h-32 overflow-hidden">
            {/* 랭킹 표시 */}
            {hasRank && rank !== undefined && (
              <div
                className={`absolute top-0 left-0 z-[40] w-6 h-6 ${getRankBgColor(rank)} text-white flex items-center justify-center font-bold shadow-md text-sm`}
              >
                {rank}
              </div>
            )}

            <Image
              src={imageUrl}
              alt={`${name} 캐릭터 이미지`}
              fill
              sizes="(max-width: 640px) 25vw, 128px"
              className="object-cover"
              onError={handleImageError}
            />

            {/* 그라데이션 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent"></div>

            {/* 성인 컨텐츠 표시 */}
            {isAdult && !isSidebar && (
              <div className="absolute top-2 right-2 z-[40] flex items-center justify-center">
                <Image src="/images/flames.png" alt="성인인증" width={18.5} height={23} />
              </div>
            )}

            {/* 댓글 수 표시 - 이미지 우측 하단으로 이동 */}
            {!isCharacterRankingSidebar && (
              <div className="absolute bottom-2 right-2 flex items-center gap-[5px] text-white text-xs z-10">
                <Image src="/images/comment_black.png" alt="댓글 아이콘" width={17} height={17} />
                <span className="text-[15px]">{commentCount}</span>
              </div>
            )}
          </div>

          {/* 콘텐츠 영역 */}
          <div className="flex-1 px-3 pt-2">
            <h3 className="font-bold text-secondary-900 dark:text-dark-secondary-700 text-base truncate">{subject || name}</h3>

            {/* 캐릭터 설명 - 최대 2줄 */}
            <p className="text-xs text-secondary-600 dark:text-dark-secondary-500 line-clamp-2 my-1.5">
              {getChangeNameTag(description || '', name)}
            </p>

            <div className="flex flex-wrap gap-1 my-1.5">
              {hashtags?.slice(0, 2).map((tag, index) => (
                <span
                  key={`${character.id}-tag-${tag}-${index}`}
                  className="text-xs text-primary-500 dark:text-dark-primary-600 bg-primary-50 dark:bg-dark-primary-100/10 px-1.5 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center mt-1.5">
              <div className="w-5 h-5 rounded-full bg-secondary-200 dark:bg-dark-secondary-300 flex items-center justify-center overflow-hidden">
                {creator?.profileImageUrl ? (
                  <Image
                    src={creator.profileImageUrl}
                    alt={`${creator.nickname} 프로필 이미지`}
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

              <span className="ml-1.5 text-xs text-secondary-500 dark:text-dark-secondary-500 truncate max-w-[100px]">
                {creator?.nickname || '익명'}
              </span>
            </div>
          </div>

          <div className='absolute top-2 right-2 flex items-center gap-4 text-black z-10'>
            {character.multi_image_count > 0 &&
              <div className='flex items-center justify-center gap-1'>
                <FontAwesomeIcon icon={faImage} className='text-[14px] md:text-[18px]' />
                <span className="text-[14px] md:text-[18px]">{character.multi_image_count || 0}</span>
              </div>
            }

            {character.likeability_yn === 1 &&
              <div className='flex items-center justify-center gap-1'>
                <Image src="/images/icons/like_icon_pink.png" alt="레벨 아이콘" width={isMobile ? 14 : 18} height={isMobile ? 14 : 18} />
                <span className="text-[14px] md:text-[18px]">Lv.{character.likeability_max_lv || 0}</span>
              </div>
            }
          </div>
        </div>
      </CardTransition>
    )
  }


  if(variant === 'my-character') {
    return (
      <CardTransition index={Math.min(index, 5)}>
        <div
          className="group relative overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-dark-background-light dark:border dark:border-dark-secondary-200/10 cursor-pointer"
          onClick={handleCardClick}
          onMouseEnter={handlePrefetch}
        >
          <div className="block">
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl">
  
              {/* 성인 컨텐츠 표시 */}
              {isAdult && !isSidebar && (
                <div className="absolute top-2 right-2 md:top-[15px] md:right-[15px] z-[40] flex items-center justify-center">
                  <Image
                    src="/images/flames.png"
                    alt="성인인증"
                    width={isMobile ? 18.5 : 27.7}
                    height={isMobile ? 23 : 35.3}
                  />
                </div>
              )}
  
              <Image
                src={imageUrl}
                alt={`${name} 캐릭터 이미지`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                onError={handleImageError}
              />
  
              {/* 그라데이션 오버레이 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent"></div>
  
              {isTemp && (
                <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                  임시저장
                </div>
              )}
  
              {isLocked && (
                <div className="absolute bottom-2 right-2 bg-orange-500/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                  <FontAwesomeIcon icon={faLock} />
                  <span className="ml-1 font-black">비공개</span>
                </div>
              )}
            </div>
  
            <div className="p-4">
              <h3 className="font-bold text-secondary-900 dark:text-dark-secondary-700 mb-1 truncate group-hover:text-primary-600 dark:group-hover:text-dark-primary-600 transition-colors">
                {subject || name}
              </h3>
  
              <div className="mb-2 flex flex-wrap gap-1">
                {hashtags?.slice(0, 3).map((tag, index) => (
                  <span
                    key={`${character.id}-tag-${tag}-${index}`}
                    className="text-xs text-primary-500 dark:text-dark-primary-600 bg-primary-50 dark:bg-dark-primary-100/10 px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
  
              <p className="text-xs text-secondary-600 dark:text-dark-secondary-500 mb-1 line-clamp-2 h-8 group-hover:text-secondary-800 dark:group-hover:text-dark-secondary-400 transition-colors">
                {getChangeNameTag(description || '', name)}
              </p>

              {/* 캐릭터 만들기 에서 내 작가 이름은 일단 숨김 */}
              {/* <div className="flex items-center">
                <div className="w-5 h-5 rounded-full bg-secondary-200 dark:bg-dark-secondary-300 flex items-center justify-center overflow-hidden">
                  {creator?.profileImageUrl ? (
                    <Image
                      src={creator.profileImageUrl}
                      alt={`${creator.nickname} 프로필 이미지`}
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
              </div> */}
  
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
            </div>
          </div>
        </div>
      </CardTransition>
    )
  }

  // 기존 카드 렌더링 (세로형)
  return (
    <CardTransition index={Math.min(index, 5)}>
      <div
        className="group relative overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-dark-background-light dark:border dark:border-dark-secondary-200/10 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="block">
          <div className="relative aspect-[3/4] overflow-hidden rounded-t-xl">
            {/* 랭킹 표시 */}
            {hasRank && rank !== undefined && (
              <div
                className={`absolute top-0 left-0 z-[40] w-8 h-8 ${getRankBgColor(rank)} text-white flex items-center justify-center font-bold shadow-md`}
              >
                {rank}
              </div>
            )}

            {/* 성인 컨텐츠 표시 */}
            {isAdult && !isSidebar && (
              <div className="absolute top-2 right-2 md:top-[15px] md:right-[15px] z-[40] flex items-center justify-center">
                <Image
                  src="/images/flames.png"
                  alt="성인인증"
                  width={isMobile ? 18.5 : 27.7}
                  height={isMobile ? 23 : 35.3}
                />
              </div>
            )}

            <Image
              src={imageUrl}
              alt={`${name} 캐릭터 이미지`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              onError={handleImageError}
            />

            {/* 그라데이션 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent"></div>

            <div className='absolute bottom-2 left-2 flex items-center justify-center gap-1 md:gap-4 text-white z-10'>
              {/* 갤러리 아이콘 */}
              {character.multi_image_count > 0 &&
                <div className='flex items-center justify-center gap-1'>
                  <FontAwesomeIcon icon={faImage} className='text-[14px] md:text-[20px]' />
                  <span className="text-[14px] md:text-[20px]">{character.multi_image_count || 0}</span>
                </div>
              }

              {/* Level */}
              {character.likeability_yn === 1 &&
                <div className='flex items-center justify-center gap-1'>
                  <Image src="/images/icons/like_icon_white.png" alt="레벨 아이콘" width={isMobile ? 14 : 20} height={isMobile ? 14 : 20} />
                  <span className="text-[14px] md:text-[20px]">Lv.{character.likeability_max_lv || 0}</span>
                </div>
              }
            </div>

            {/* 댓글 수 표시 - 이미지 우측 하단으로 이동 */}
            {!isCharacterRankingSidebar && (
              <div className="absolute bottom-2 right-2 gap-1 flex items-center text-white z-10">
                <Image
                  src="/images/comment_black.png"
                  alt="댓글 아이콘"
                  width={isMobile ? 12 : 22}
                  height={isMobile ? 11 : 22}
                />
                <span className="text-[14px] md:text-[20px]">{commentCount}</span>
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-bold text-secondary-900 dark:text-dark-secondary-700 mb-1 truncate group-hover:text-primary-600 dark:group-hover:text-dark-primary-600 transition-colors">
              {subject || name}
            </h3>

            <div className="mb-2 flex flex-wrap gap-1">
              {hashtags?.slice(0, 3).map((tag, index) => (
                <span
                  key={`${character.id}-tag-${tag}-${index}`}
                  className="text-xs text-primary-500 dark:text-dark-primary-600 bg-primary-50 dark:bg-dark-primary-100/10 px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="text-xs text-secondary-600 dark:text-dark-secondary-500 mb-1 line-clamp-2 h-8 group-hover:text-secondary-800 dark:group-hover:text-dark-secondary-400 transition-colors">
              {getChangeNameTag(description || '', name)}
            </p>
            <div className="flex items-center">
              <div className="w-5 h-5 rounded-full bg-secondary-200 dark:bg-dark-secondary-300 flex items-center justify-center overflow-hidden">
                {creator?.profileImageUrl ? (
                  <Image
                    src={creator.profileImageUrl}
                    alt={`${creator.nickname} 프로필 이미지`}
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
          </div>
        </div>
      </div>
    </CardTransition>
  )
}
