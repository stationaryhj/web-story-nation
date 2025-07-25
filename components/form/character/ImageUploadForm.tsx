'use client'

import React, { useEffect } from 'react'
import { useCreateCharacterData } from '@/store/useCreateCharacterData'
import AddImageSection from './components/image/add-image-section'


export default function ImageUploadForm() {
  const { formData } = useCreateCharacterData()

  useEffect(() => {
    console.log('@@@@ formData.multi_images :: ' , formData.multi_images)
  }, [formData.multi_images])

  return (
    <div className="space-y-6">
      {/* 설명 */}
      <div className="flex flex-col items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-secondary-700 dark:text-dark-secondary-400">
            이미지 추가(최대 100장, 유료 해금 매출 20% 분배)
          </span>
        </div>
        <div>
          <span className="text-xs text-secondary-500 dark:text-dark-secondary-500">
            이미지를 올리고 설명을 적어주세요! AI가 상황에 맞춰 보여줘요!
          </span>
        </div>
      </div>


      {/* 컴포넌트 예시 */}
      <div className='flex flex-col gap-8'>
        {formData.likeability_yn === 1 ? (
          Array.from({ length: formData.likeability_max_lv || 0 }, (_, index) => (
            <AddImageSection key={index} selectedLevel={index + 1} />
          ))
        ) : (
          <AddImageSection selectedLevel={0} />
        )}
      </div>


      {/* 이용등급별 경고문구 */}
      <div className="rounded-lg bg-secondary-50 p-4 dark:bg-dark-secondary-100/5">
        <h3 className="mb-2 text-sm font-medium text-secondary-800 dark:text-dark-secondary-300">
          이미지 업로드 시 주의사항
        </h3>
        <div className="space-y-2 text-sm text-secondary-600 dark:text-dark-secondary-500">
          <p>• 성기 노출, 잔인한 장면, 그외 사회 통념상 허용할 수 없는 이미지는 통보 없이 삭제될 수 있습니다.</p>
          <p>• 초상권, 저작권 침해 이미지는 통보 없이 삭제될 수 있습니다.</p>
          <p>• 한 번 공개된 이미지는 삭제할 수 없어요(수정은 가능).</p>
          <p>• 업로드한 이미지는 다음 버튼을 클릭해야 저장돼요.</p>
        </div>
      </div>
    </div>
  )
}
