'use client';

import { useEffect, useState } from 'react';
import { useCreateCharacterData } from '@/store/useCreateCharacterData';
import LikeLevelItem from './like-level-item';

const DEFAULT_MAX_LEVEL = 3;

export default function LikeForm() {
  const { isVaild, formData, setFormField, updateLikeAbilityLevel } = useCreateCharacterData();
  const [isLikeabilityLock, setIsLikeabilityLock] = useState(false);

  const likeSystem = formData.likeability_yn;
  const likeabilities = formData.likeabilities || [];
  const maxLevel = formData.likeability_max_lv || DEFAULT_MAX_LEVEL;

  useEffect(() => {
    const isLock = formData.likeability_yn === 1 ? true : false;
    if (formData.finish_yn === 1) {
      setIsLikeabilityLock(isLock);
    }
  }, []);

  const handleLikeSystemToggle = (type: number) => {
    const _maxLevel = type === 0 && maxLevel === 0 ? 0 : maxLevel;

    setFormField('likeability_yn', type);
    updateLikeAbilityLevel(_maxLevel);
  };

  const handleMaxLevelChange = (lv: number) => {
    updateLikeAbilityLevel(lv);
  };

  return (
    <div>
      <div className='flex justify-between items-start mb-4'>
        <div>
          <h3 className='block text-sm font-medium text-text-primary'>호감도 시스템</h3>
          <p className='text-xs text-text-muted'>-레벨에 따라 캐릭터 답변이 달라져요</p>
          <p className='text-xs text-text-muted'>
            -호감도 시스템 ON으로 만든 캐릭터는 다시 OFF로 바꿀 수 없어요
          </p>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-2 sm:gap-4 w-full sm:w-1/2 md:w-1/3 mb-4'>
        <button
          disabled={isLikeabilityLock}
          type='button'
          onClick={() => handleLikeSystemToggle(0)}
          className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-center text-sm sm:text-base transition-colors ${
            likeSystem === 0 ? 'bg-brand text-text-inverse' : 'bg-secondary-100 text-text-muted'
          } ${isLikeabilityLock ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          OFF
        </button>
        <button
          disabled={isLikeabilityLock}
          type='button'
          onClick={() => handleLikeSystemToggle(1)}
          className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-center text-sm sm:text-base transition-colors ${
            likeSystem === 1 ? 'bg-brand text-text-inverse' : 'bg-secondary-100 text-text-muted'
          } ${isLikeabilityLock ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          ON
        </button>
      </div>

      {likeSystem === 1 && (
        <div>
          {/* level Button */}
          <div className='flex justify-between items-start mb-4 gap-2'>
            {Array.from({ length: 3 }).map((_, index) => {
              return (
                <button
                  key={index}
                  type='button'
                  onClick={() => handleMaxLevelChange(DEFAULT_MAX_LEVEL + index)}
                  className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-center text-sm sm:text-base transition-colors ${
                    maxLevel === DEFAULT_MAX_LEVEL + index
                      ? 'bg-brand text-text-inverse'
                      : 'bg-secondary-100 text-text-muted'
                  }`}
                >
                  Lv.{3 + index}
                </button>
              );
            })}
          </div>

          {/* level Item Component */}
          <div className='flex flex-col gap-4'>
            {likeabilities.map((data, index) => {
              return (
                <div key={index}>
                  <LikeLevelItem data={data} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
