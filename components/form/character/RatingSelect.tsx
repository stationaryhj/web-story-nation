'use client'

import React from 'react'
import { useAccountStore } from '@/store/useAccountStore'
import { RequiredLabel } from '../CharacterForm'

interface RatingSelectProps {
  rating: 'all' | 'adult'
  onRatingSelect: (rating: 'all' | 'adult') => void
  showRequired?: boolean
}

export default function RatingSelect({ rating, onRatingSelect, showRequired = true }: RatingSelectProps) {
  const { isAdult } = useAccountStore()
  const isAdultModeEnabled = isAdult()

  return (
    <div>
      {showRequired ? (
        <RequiredLabel>
          <label className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">이용등급</label>
        </RequiredLabel>
      ) : (
        <label className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">이용등급</label>
      )}
      <div className="mt-2 grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onRatingSelect('all')}
          className={`rounded-lg px-3 sm:px-4 py-1 sm:py-3 text-sm sm:text-base text-center transition-colors ${
            rating === 'all'
              ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
              : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
          }`}
        >
          전체 이용가
        </button>
        <button
          type="button"
          onClick={() => onRatingSelect('adult')}
          disabled={!isAdultModeEnabled}
          className={`rounded-lg px-3 sm:px-4 py-1 sm:py-3 text-sm sm:text-base text-center transition-colors ${
            rating === 'adult' && isAdultModeEnabled
              ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
              : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
          } ${!isAdultModeEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          성인 전용
        </button>
      </div>
      {!isAdultModeEnabled && rating === 'adult' && (
        <p className="mt-2 text-sm text-red-500">성인 인증이 필요합니다.</p>
      )}
    </div>
  )
}
