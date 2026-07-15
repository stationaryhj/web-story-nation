// components/ui/card/Card.tsx
'use client';

import {
  faFire,
  faImage,
  faImages,
  faLock,
  faPencilAlt,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback } from 'react';
import { CardTransition } from '@/components/motion/PageTransition';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { getChangeNameTag } from '@/lib/utils/storyNationUtil';
import { contentApi, createApi } from '@/services/api/storyNationApi';
import type { Character } from '@/store/useStoreData';
import { useModalStore } from '@/store/useStoreModal';
import type { CharbotResponse } from '@/types/api';

interface CardProps {
  character: Character;
  index?: number;
  variant?: 'default' | 'my-character' | 'horizontal';
  onEdit?: () => void;
  onDelete?: () => void;
  onCardClick?: (character: Character) => void;
  rank?: number;
  hasRank?: boolean;
  isCharacterRankingSidebar?: boolean;
  isSidebar?: boolean;
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
  const { name, subject, description, imageUrl, commentCount, hashtags, isAdult, creator } =
    character;
  const { openModal, setSelectedCharacter } = useModalStore();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [imageError, setImageError] = React.useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const isTemp = character.finish_yn == 0;
  const isLocked = character.show_yn == 0;

  // hover 시 모달 데이터 prefetch
  const handlePrefetch = useCallback(() => {
    const id = Number(character.id);
    if (!id) return;
    queryClient.prefetchQuery({
      queryKey: ['createChatBot', id],
      queryFn: async () => {
        const response = await createApi.GetChatBot(id);
        return response.data as CharbotResponse;
      },
      staleTime: 60_000,
    });
    queryClient.prefetchQuery({
      queryKey: ['multiImage', id],
      queryFn: () => contentApi.GetMultiImageData(id, 0),
      staleTime: 60_000,
    });
  }, [character.id, queryClient]);

  // 카드 클릭 기본 핸들러 - 캐릭터 모달 열기
  const defaultCardClick = () => {
    setSelectedCharacter(character);
    openModal('character');
  };

  // 실제 카드 클릭 핸들러
  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(character);
    } else {
      defaultCardClick();
    }
  };

  // 이미지 로드 에러 핸들러
  const handleImageError = () => {
    setImageError(true);
  };

  // 수정 버튼 클릭 처리
  const handleEditClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    if (onEdit) onEdit();
  };

  // 삭제 버튼 클릭 처리
  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // 카드 클릭 이벤트 전파 방지
    if (onDelete) onDelete();
  };

  // 랭킹에 따른 배경색 설정
  const getRankBgColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500'; // 1위: 금색
    if (rank === 2) return 'bg-gray-400'; // 2위: 은색
    if (rank === 3) return 'bg-amber-600'; // 3위: 동색
    return 'bg-brand'; // 그 외
  };

  // 가로형 카드 렌더링
  if (variant === 'horizontal') {
    return (
      <CardTransition index={Math.min(index, 5)} className='h-full'>
        <div
          className='cv-card-h group relative h-full overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-surface-elevated cursor-pointer flex mb-2'
          onClick={handleCardClick}
          onMouseEnter={handlePrefetch}
        >
          {/* 이미지 영역 */}
          <div className='relative w-32 h-32 shrink-0 overflow-hidden'>
            {/* 랭킹 표시 */}
            {hasRank && rank !== undefined && (
              <div
                className={`absolute top-0 left-0 z-[40] w-6 h-6 ${getRankBgColor(rank)} text-text-inverse flex items-center justify-center font-bold shadow-md text-sm`}
              >
                {rank}
              </div>
            )}

            <Image
              src={imageUrl}
              alt={`${name} 캐릭터 이미지`}
              fill
              sizes='(max-width: 640px) 25vw, 128px'
              className='object-cover'
              onError={handleImageError}
            />

            {/* 그라데이션 오버레이 */}
            <div className='absolute inset-0 bg-gradient-to-t from-overlay/60 via-overlay/0 to-transparent'></div>

            {/* 성인 컨텐츠 표시 */}
            {isAdult && !isSidebar && (
              <div className='absolute top-2 right-2 z-[40] flex items-center justify-center'>
                <Image src='/images/flames.png' alt='성인인증' width={18.5} height={23} />
              </div>
            )}

            {/* 댓글 수 표시 - 이미지 우측 하단으로 이동 */}
            {!isCharacterRankingSidebar && (
              <div className='absolute bottom-2 right-2 flex items-center gap-[5px] text-text-inverse text-xs z-10'>
                <Image src='/images/comment_black.png' alt='댓글 아이콘' width={17} height={17} />
                <span className='text-[15px]'>{commentCount}</span>
              </div>
            )}
          </div>

          {/* 콘텐츠 영역 */}
          <div className='flex flex-1 flex-col px-3 py-2'>
            <h3 className='font-bold text-text-primary text-base truncate'>{subject || name}</h3>

            {/* 캐릭터 설명 - 최대 2줄 */}
            <p className='text-xs text-text-muted line-clamp-2 my-1.5'>
              {getChangeNameTag(description || '', name)}
            </p>

            {/* 태그는 한 줄 고정 — 넘치면 말줄임(…) 처리해 카드 높이 편차를 차단 */}
            <div className='my-1.5 overflow-hidden text-ellipsis whitespace-nowrap'>
              {hashtags?.slice(0, 2).map((tag, index) => (
                <span
                  key={`${character.id}-tag-${tag}-${index}`}
                  className='mr-1 inline-block text-xs text-brand bg-brand/10 px-1.5 py-0.5 rounded-full'
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className='mt-auto flex items-center pt-1.5'>
              <div className='w-5 h-5 rounded-full bg-surface-elevated flex items-center justify-center overflow-hidden'>
                {creator?.profileImageUrl ? (
                  <Image
                    src={creator.profileImageUrl}
                    alt={`${creator.nickname} 프로필 이미지`}
                    width={20}
                    height={20}
                    className='object-cover'
                  />
                ) : (
                  <span className='text-[8px] text-text-muted'>
                    {creator?.nickname?.charAt(0) || '?'}
                  </span>
                )}
              </div>

              <span className='ml-1.5 text-xs text-text-muted truncate max-w-[100px]'>
                {creator?.nickname || '익명'}
              </span>
            </div>
          </div>

          <div className='absolute top-2 right-2 flex items-center gap-4 text-black z-10'>
            {character.multi_image_count > 0 && (
              <div className='flex items-center justify-center gap-1'>
                <FontAwesomeIcon icon={faImage} className='text-[14px] md:text-[18px]' />
                <span className='text-[14px] md:text-[18px]'>
                  {character.multi_image_count || 0}
                </span>
              </div>
            )}

            {character.likeability_yn === 1 && (
              <div className='flex items-center justify-center gap-1'>
                <Image
                  src='/images/icons/like_icon_pink.png'
                  alt='레벨 아이콘'
                  width={isMobile ? 14 : 18}
                  height={isMobile ? 14 : 18}
                />
                <span className='text-[14px] md:text-[18px]'>
                  Lv.{character.likeability_max_lv || 0}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardTransition>
    );
  }

  if (variant === 'my-character') {
    return (
      <CardTransition index={Math.min(index, 5)} className='h-full'>
        <div
          className='cv-card group relative h-full overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-surface-elevated cursor-pointer'
          onClick={handleCardClick}
          onMouseEnter={handlePrefetch}
        >
          <div className='flex h-full flex-col'>
            <div className='relative aspect-[3/4] shrink-0 overflow-hidden rounded-t-xl'>
              {/* 성인 컨텐츠 표시 */}
              {isAdult && !isSidebar && (
                <div className='absolute top-2 right-2 md:top-[15px] md:right-[15px] z-[40] flex items-center justify-center'>
                  <Image
                    src='/images/flames.png'
                    alt='성인인증'
                    width={isMobile ? 18.5 : 22}
                    height={isMobile ? 23 : 28}
                  />
                </div>
              )}

              <Image
                src={imageUrl}
                alt={`${name} 캐릭터 이미지`}
                fill
                sizes='(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw'
                className='object-cover transition-transform duration-500 group-hover:scale-110'
                onError={handleImageError}
              />

              {/* 그라데이션 오버레이 */}
              <div className='absolute inset-0 bg-gradient-to-t from-overlay/70 via-overlay/0 to-transparent'></div>

              {isTemp && (
                <div className='absolute top-3 left-3 bg-overlay/60 text-text-inverse text-xs px-2 py-1 rounded-full backdrop-blur-sm'>
                  임시저장
                </div>
              )}

              {isLocked && (
                <div className='absolute bottom-2 right-2 bg-orange-500/90 text-text-inverse text-xs px-2 py-1 rounded-full backdrop-blur-sm'>
                  <FontAwesomeIcon icon={faLock} />
                  <span className='ml-1 font-black'>비공개</span>
                </div>
              )}
            </div>

            <div className='flex flex-1 flex-col p-2.5'>
              <h3 className='text-sm font-bold text-text-primary mb-1 truncate group-hover:text-brand-hover transition-colors'>
                {subject || name}
              </h3>

              {/* 태그는 한 줄 고정 — 넘치면 말줄임(…) 처리해 카드 높이 편차를 차단 */}
              <div className='mb-1 overflow-hidden text-ellipsis whitespace-nowrap'>
                {hashtags?.slice(0, 3).map((tag, index) => (
                  <span
                    key={`${character.id}-tag-${tag}-${index}`}
                    className='mr-1 inline-block text-[11px] text-brand bg-brand/10 px-1.5 py-0.5 rounded-full'
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className='text-[11px] text-text-muted mb-1 line-clamp-1 h-auto group-hover:text-text-primary transition-colors'>
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

              <div className='grid grid-cols-2 gap-1.5 mt-auto pt-1.5'>
                <button
                  onClick={handleEditClick}
                  className='py-1 px-1.5 bg-surface-elevated hover:bg-surface-elevated-hover text-text-primary text-[11px] rounded flex items-center justify-center transition-colors'
                >
                  <FontAwesomeIcon icon={faPencilAlt} className='mr-1' />
                  수정
                </button>
                <button
                  onClick={handleDeleteClick}
                  className='py-1 px-1.5 bg-danger/10 hover:bg-danger/20 text-danger text-[11px] rounded flex items-center justify-center transition-colors'
                >
                  <FontAwesomeIcon icon={faTrash} className='mr-1' />
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      </CardTransition>
    );
  }

  // 기존 카드 렌더링 (세로형)
  return (
    <CardTransition index={Math.min(index, 5)} className='h-full'>
      <div
        className='cv-card group relative h-full overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-surface-elevated cursor-pointer'
        onClick={handleCardClick}
      >
        <div className='flex h-full flex-col'>
          <div className='relative aspect-[3/4] shrink-0 overflow-hidden rounded-t-xl'>
            {/* 랭킹 표시 */}
            {hasRank && rank !== undefined && (
              <div
                className={`absolute top-0 left-0 z-[40] w-7 h-7 ${getRankBgColor(rank)} text-text-inverse flex items-center justify-center font-bold shadow-md`}
              >
                {rank}
              </div>
            )}

            {/* 성인 컨텐츠 표시 */}
            {isAdult && !isSidebar && (
              <div className='absolute top-2 right-2 md:top-[15px] md:right-[15px] z-[40] flex items-center justify-center'>
                <Image
                  src='/images/flames.png'
                  alt='성인인증'
                  width={isMobile ? 18.5 : 22}
                  height={isMobile ? 23 : 28}
                />
              </div>
            )}

            <Image
              src={imageUrl}
              alt={`${name} 캐릭터 이미지`}
              fill
              sizes='(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw'
              className='object-cover transition-transform duration-500 group-hover:scale-110'
              onError={handleImageError}
            />

            {/* 그라데이션 오버레이 */}
            <div className='absolute inset-0 bg-gradient-to-t from-overlay/70 via-overlay/0 to-transparent'></div>

            <div className='absolute bottom-2 left-2 flex items-center justify-center gap-1 md:gap-4 text-text-inverse z-10'>
              {/* 갤러리 아이콘 */}
              {character.multi_image_count > 0 && (
                <div className='flex items-center justify-center gap-1'>
                  <FontAwesomeIcon icon={faImage} className='text-[12px] md:text-[14px]' />
                  <span className='text-[12px] md:text-[14px]'>
                    {character.multi_image_count || 0}
                  </span>
                </div>
              )}

              {/* Level */}
              {character.likeability_yn === 1 && (
                <div className='flex items-center justify-center gap-1'>
                  <Image
                    src='/images/icons/like_icon_white.png'
                    alt='레벨 아이콘'
                    width={isMobile ? 12 : 16}
                    height={isMobile ? 12 : 16}
                  />
                  <span className='text-[12px] md:text-[14px]'>
                    Lv.{character.likeability_max_lv || 0}
                  </span>
                </div>
              )}
            </div>

            {/* 댓글 수 표시 - 이미지 우측 하단으로 이동 */}
            {!isCharacterRankingSidebar && (
              <div className='absolute bottom-2 right-2 gap-1 flex items-center text-text-inverse z-10'>
                <Image
                  src='/images/comment_black.png'
                  alt='댓글 아이콘'
                  width={isMobile ? 12 : 16}
                  height={isMobile ? 11 : 16}
                />
                <span className='text-[12px] md:text-[14px]'>{commentCount}</span>
              </div>
            )}
          </div>

          <div className='flex flex-1 flex-col p-2.5'>
            <h3 className='text-sm font-bold text-text-primary mb-1 truncate group-hover:text-brand-hover transition-colors'>
              {subject || name}
            </h3>

            {/* 태그는 한 줄 고정 — 넘치면 말줄임(…) 처리해 카드 높이 편차를 차단 */}
            <div className='mb-1 overflow-hidden text-ellipsis whitespace-nowrap'>
              {hashtags?.slice(0, 3).map((tag, index) => (
                <span
                  key={`${character.id}-tag-${tag}-${index}`}
                  className='mr-1 inline-block text-[11px] text-brand bg-brand/10 px-1.5 py-0.5 rounded-full'
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className='text-[11px] text-text-muted mb-1 line-clamp-1 h-auto group-hover:text-text-primary transition-colors'>
              {getChangeNameTag(description || '', name)}
            </p>
            <div className='mt-auto flex items-center pt-1'>
              <div className='w-4 h-4 rounded-full bg-surface-elevated flex items-center justify-center overflow-hidden'>
                {creator?.profileImageUrl ? (
                  <Image
                    src={creator.profileImageUrl}
                    alt={`${creator.nickname} 프로필 이미지`}
                    width={16}
                    height={16}
                    className='object-cover'
                  />
                ) : (
                  <span className='text-[8px] text-text-muted'>
                    {creator?.nickname?.charAt(0) || '?'}
                  </span>
                )}
              </div>
              <span className='ml-1 text-[11px] text-text-muted truncate max-w-[80px]'>
                {creator?.nickname || '익명'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </CardTransition>
  );
}
