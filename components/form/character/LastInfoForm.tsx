'use client';

import type { ChangeEvent } from 'react';
import React, { useEffect, useRef, useState } from 'react';
import { exampleDatas } from '@/lib/utils/storyNationUtil';
import { useAccountStore } from '@/store/useAccountStore';
import { useCreateCharacterData } from '@/store/useCreateCharacterData';
import { useModalStore } from '@/store/useStoreModal';

import RatingSelect from './RatingSelect';

const createCharacterScenario = {
  storageKey: 'detail-info-tutorial-completed',
  defaultMessagePosition: 'top' as const,
  steps: [
    {
      id: 'context-info-button',
      html: `
              <p>버튼을 클릭하면<span class="text-yellow-300 font-semibold">지문(**)</span>을 추가할 수 있어요!</p>
            `,
      textPosition: 'top' as const,
    },
    {
      id: 'character-name-button',
      html: `
              <p>버튼을 클릭하면<span class="text-yellow-300 font-semibold">캐릭터 이름({{char}})</span>을 추가할 수 있어요!</p>
            `,
      textPosition: 'top' as const,
    },
    {
      id: 'user-name-button',
      html: `
              <p>버튼을 클릭하면<span class="text-yellow-300 font-semibold">유저 이름({{user}})</span>을 추가할 수 있어요!</p>
            `,
      textPosition: 'top' as const,
    },
    {
      id: 'delete-chat-example',
      html: `
              <p>버튼을 클릭하면<span class="text-yellow-300 font-semibold">대화 예시</span>를 삭제할 수 있어요!</p>
            `,
      textPosition: 'top' as const,
    },
    {
      id: 'user-message-container',
      html: `
              <p>이곳에서 유저<span class="text-yellow-300 font-semibold"> 대화 예시</span>를 입력하고 수정할 수 있어요!</p>
            `,
      textPosition: 'top' as const,
    },
    {
      id: 'character-message-container',
      html: `
              <p>이곳에서 캐릭터<span class="text-yellow-300 font-semibold"> 대화 예시</span>를 입력하고 수정할 수 있어요!</p>
            `,
      textPosition: 'top' as const,
    },
  ],
};

const MAX_WRITER_NOTE_LENGTH = 1000;

interface LastInfoFormProps {
  setFormField: (name: string, value: any) => void;
}

export default function LastInfoForm({ setFormField }: LastInfoFormProps) {
  const { formData } = useCreateCharacterData();

  const { isAdult } = useAccountStore();
  const { openModal } = useModalStore();

  const isAdultModeEnabled = isAdult();

  // 상세 설명 입력 변경 핸들러
  const handleWriterNoteChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    // API 값 추가되고난 뒤 작업해야함
    const value = e.target.value;
    if (value.length <= MAX_WRITER_NOTE_LENGTH) {
      setFormField('writer_note', value);
    }
  };

  // 텍스트 길이 표시 형식
  const formatTextLength = (current: number, max: number) => {
    return `${current}/${max}`;
  };

  const handleRatingSelect = (rating: 'all' | 'adult') => {
    if (rating === 'adult' && !isAdultModeEnabled) {
      openModal('adultVerification');
      return;
    }

    setFormField('rating', rating);
  };

  return (
    <div className='space-y-8'>
      <div className='flex flex-col gap-8'>
        {/* 이용등급 */}
        <RatingSelect rating={formData.rating} onRatingSelect={handleRatingSelect} />

        {/* 작가의 말 */}
        <div className='flex flex-col gap-4'>
          <div className='flex justify-between items-start'>
            <h3 className='block text-sm font-medium text-text-primary'>작가의 말</h3>
            <span className='text-xs text-text-muted'>
              {formatTextLength(formData.writer_note.length, MAX_WRITER_NOTE_LENGTH)}
            </span>
          </div>
          <textarea
            id='writer-note'
            value={formData.writer_note}
            onChange={handleWriterNoteChange}
            placeholder='독자에게 하고싶은 말을 자유롭게 입력해 보세요!'
            rows={4}
            className='w-full px-4 py-3 rounded-lg text-sm sm:text-base border border-border-default bg-surface-elevated text-text-primary focus:outline-none focus:ring-2 focus:ring-brand resize-none'
            maxLength={MAX_WRITER_NOTE_LENGTH}
          />
        </div>
      </div>
    </div>
  );
}
