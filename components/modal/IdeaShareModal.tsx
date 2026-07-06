'use client';

import { faCommentDots } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { BaseButton } from '@/components/elements/button/BaseButton';
import BaseModal from './BaseModal';

interface IdeaShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (idea: string) => void;
}

export default function IdeaShareModal({ isOpen, onClose, onSubmit }: IdeaShareModalProps) {
  const [idea, setIdea] = useState('');
  const maxLength = 2000;

  const handleSubmit = () => {
    if (idea.trim()) {
      if (onSubmit) {
        onSubmit(idea);
      }
      setIdea(''); // 입력 초기화
      onClose();
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title=''
      size='md'
      animation='fade'
      backdropColor='bg-overlay/70 backdrop-blur-sm'
      showCloseButton={true}
      footerContent={
        <div className='flex justify-end w-full space-x-4'>
          <BaseButton
            color='gradient'
            className='px-6'
            onClick={handleSubmit}
            disabled={!idea.trim()}
          >
            제출하기
          </BaseButton>
        </div>
      }
    >
      <div className='flex flex-col items-center py-4 space-y-6'>
        {/* 말풍선 아이콘 */}
        <div className='w-20 h-20 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900'>
          <FontAwesomeIcon
            icon={faCommentDots}
            className='h-10 w-10 text-blue-500 dark:text-blue-300'
          />
        </div>

        {/* 대제목 */}
        <h1 className='text-2xl font-bold text-center text-text-primary'>
          아이디어를 공유해 주세요!
        </h1>

        {/* 설명 */}
        <p className='text-center text-text-muted'>
          스네를 사용하면서 느낀 불편한 점이나 희망하시는 추가 기능을 알려주세요.
          <br />
          스네를 더욱 재밌게 만드는 데 큰 힘이 됩니다!
        </p>

        {/* 아이디어 입력 영역 */}
        <div className='w-full'>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value.slice(0, maxLength))}
            placeholder='아이디어를 작성해 주세요!'
            className='w-full h-32 p-3 rounded-lg border border-border-default focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 resize-none bg-surface text-text-primary'
            maxLength={maxLength}
          />
          <div className='text-right text-sm text-text-muted mt-1'>
            {idea.length}/{maxLength}
          </div>
        </div>
      </div>
    </BaseModal>
  );
}
