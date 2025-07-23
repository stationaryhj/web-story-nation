'use client'

import { useCreateCharacterData } from '@/store/useCreateCharacterData'
import LikeLevelItem from './like-level-item'
import { useEffect, useState } from 'react'

const DEFAULT_MAX_LEVEL = 3


export default function LikeForm() {
	const { isVaild, formData, setFormField, updateLikeAbilityLevel } = useCreateCharacterData()
	const [isLikeabilityLock, setIsLikeabilityLock] = useState(false)
	
	const likeSystem = formData.likeability_yn
	const likeabilities = formData.likeabilities || []
	const maxLevel = formData.likeability_max_lv || DEFAULT_MAX_LEVEL

	useEffect(() => {
		const isLock = formData.likeability_yn === 1 ? true : false
		if(formData.finish_yn === 1) {
      setIsLikeabilityLock(isLock)
    }
	}, [])

	const handleLikeSystemToggle = (type: number) => {
		const _maxLevel = (type === 0 && maxLevel === 0) ? 0 : maxLevel

		setFormField('likeability_yn', type)
		updateLikeAbilityLevel(_maxLevel)
	}

	const handleMaxLevelChange = (lv: number) => {
		updateLikeAbilityLevel(lv)
	}


  return (
    <div>
      <div className="flex justify-between items-start mb-4">
				<div>
					<h3 className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
						호감도 시스템
					</h3>
					<p className="text-xs text-secondary-500 dark:text-dark-secondary-500">
						-레벨에 따라 캐릭터 답변이 달라져요
					</p>
					<p className="text-xs text-secondary-500 dark:text-dark-secondary-500">
						-호감도 시스템 ON으로 만든 캐릭터는 다시 OFF로 바꿀 수 없어요
					</p>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-2 sm:gap-4 w-full sm:w-1/2 md:w-1/3 mb-4">
				<button
					disabled={isLikeabilityLock}
					type="button"
					onClick={() => handleLikeSystemToggle(0)}
					className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-center text-sm sm:text-base transition-colors ${
						likeSystem === 0
							? 'bg-primary-500 text-white dark:bg-dark-primary-500'
							: 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
					} ${isLikeabilityLock ? 'opacity-50 cursor-not-allowed' : ''}`}
				>
					비공개
				</button>
				<button
					disabled={isLikeabilityLock}
					type="button"
					onClick={() => handleLikeSystemToggle(1)}
					className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-center text-sm sm:text-base transition-colors ${
						likeSystem === 1
							? 'bg-primary-500 text-white dark:bg-dark-primary-500'
							: 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
					} ${isLikeabilityLock ? 'opacity-50 cursor-not-allowed' : ''}`}
				>
					공개
				</button>
			</div>

			{likeSystem === 1 && (
				<div>
					{/* level Button */}
					<div className="flex justify-between items-start mb-4 gap-2">
						{Array.from({ length: 3 }).map((_, index) => {
							return(
								<button
									key={index}
									type="button"
									onClick={() => handleMaxLevelChange(DEFAULT_MAX_LEVEL + index)}
									className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-center text-sm sm:text-base transition-colors ${
										maxLevel === DEFAULT_MAX_LEVEL + index
											? 'bg-primary-500 text-white dark:bg-dark-primary-500'
											: 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
									}`}
								>
									Lv.{3 + index}
								</button>
							)
						})}
					</div>

					{/* level Item Component */}
					<div className='flex flex-col gap-4'>
						{likeabilities.map((data, index) => {
							return(
								<div key={index}>
									<LikeLevelItem data={data} />
								</div>
							)
						})}
					</div>
				</div>
			)}
    </div>
  )
}