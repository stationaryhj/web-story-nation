'use client';

import { faArrowUp, faRotate } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useRef, useState } from 'react';
import CardGrid from '@/components/elements/card/CardGrid';
import { moduleForTitleData, useRecommendSectionStoreData } from '@/store/useMainStoreData';
import BaseSidebar from './BaseSidebar';

interface NewCharacterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  moduleId: number;
}

export default function LatestCharacterSidebar({
  isOpen,
  onClose,
  moduleId,
}: NewCharacterSidebarProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const { modules_sumSlide, UpdateLatestCharactersPaging, ClearLatestCharactersSlide } =
    useRecommendSectionStoreData();

  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (isOpen && moduleId) {
      UpdateLatestCharactersPaging(moduleId, 1, currentPage, 50);
    } else {
      ClearLatestCharactersSlide();
    }
  }, [isOpen, moduleId]);

  // 시간 포맷 함수
  const formatTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // 데이터 로드 함수
  const loadNewCharacters = async () => {
    setIsLoading(true);
    try {
      await UpdateLatestCharactersPaging(moduleId, 1, 1, 50);
      setLastUpdate(formatTime());
      setIsLoading(false);

      // 리스트 최상단으로 스크롤
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    } catch (error) {
      console.error('캐릭터 로드 실패:', error);
      setIsLoading(false);
    }
  };

  // 스크롤 맨 위로 이동
  const scrollToTop = () => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  // 새로고침 버튼 클릭 핸들러
  const handleRefresh = () => {
    loadNewCharacters();
  };

  // 헤더에 표시할 추가 요소
  const headerExtra = lastUpdate ? (
    <p className='text-xs text-text-muted'>{lastUpdate} 업데이트</p>
  ) : null;

  return (
    <BaseSidebar
      isOpen={isOpen}
      onClose={onClose}
      title={moduleForTitleData[moduleId]?.title}
      headerExtra={
        <div className='flex items-center space-x-4'>
          {headerExtra}
          <button
            onClick={handleRefresh}
            className='w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-elevated-hover'
            title='새로고침'
          >
            <FontAwesomeIcon icon={faRotate} />
          </button>
        </div>
      }
    >
      <div ref={contentRef} className='h-full overflow-y-auto px-4 py-6'>
        <CardGrid
          customData={modules_sumSlide}
          cardsPerRow={2}
          useSwiper={false}
          isSidebar={true}
        />
      </div>

      {/* 맨 위로 스크롤 버튼 */}
      <button
        className='fixed bottom-6 right-6 w-10 h-10 rounded-full bg-brand text-text-inverse flex items-center justify-center shadow-md hover:bg-brand-hover transition-colors'
        onClick={scrollToTop}
      >
        <FontAwesomeIcon icon={faArrowUp} />
      </button>
    </BaseSidebar>
  );
}
