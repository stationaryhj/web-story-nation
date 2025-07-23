'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
// import pako from 'pako'

import { toast } from 'react-toastify'
import { MultiImageStructure } from '@/types/api'
import { useCreateCharacterData } from '@/store/useCreateCharacterData'

import AddImageSection from './components/image/add-image-section'


interface ImageUploadFormProps {
  setFormField: (name: string, value: any) => void
  setNormalImage: (path: string) => void
  setAdultImage: (path: string) => void
  setAdultNormalImage: (path: string) => void
  onValidationChange?: (isValid: boolean) => void
  invalidFields?: { [key: string]: boolean }
  isSubmitting?: boolean
}

export default function ImageUploadForm({
  setFormField,
  setNormalImage,
  setAdultImage,
  setAdultNormalImage,
  onValidationChange,
  invalidFields,
  isSubmitting,
}: ImageUploadFormProps) {
  const { formData } = useCreateCharacterData()
  const toastShownRef = useRef(false)

  // 제출 시도 시 유효성 검사 실패하면 toast 메시지 표시
  useEffect(() => {
    if (isSubmitting && invalidFields && 'image' in invalidFields && invalidFields.image && !toastShownRef.current) {
      // 토스트 메시지가 이미 표시되었음을 표시
      toastShownRef.current = true

      if (formData.rating === 'adult') {
        if (!formData.imgUrl && !formData.imgUrlNsfw) {
          toast.error('기본 이미지와 짜릿 모드 이미지를 모두 업로드해주세요.')
        } else if (!formData.imgUrl) {
          toast.error('기본 이미지를 업로드해주세요.')
        } else if (!formData.imgUrlNsfw) {
          toast.error('짜릿 모드 이미지를 업로드해주세요.')
        }
      } else {
        toast.error('캐릭터 이미지를 업로드해주세요.')
      }
    }

    // isSubmitting이 false로 바뀌면 토스트 표시 상태 초기화
    if (!isSubmitting) {
      toastShownRef.current = false
    }
  }, [isSubmitting, invalidFields, formData.rating, formData.imgUrlNsfw])

  // 유효성 검사
  useEffect(() => {
    if (onValidationChange) {
      // 이미지 탭 유효성 검사
      let isValid = false

      // 이용등급에 따른 필수 이미지 확인
      if (formData.rating === 'adult') {
        // 성인 등급: imgNormal(기본 이미지)와 imgUrlNsfw(짜릿 모드 이미지) 모두 필요
        isValid = !!(formData.imgUrl && formData.imgUrlNsfw)
      } else {
        // 전체 이용가: imgUrl(기본 이미지)만 필요
        isValid = !!formData.imgUrl
      }

      // 유효성 검사 결과 전달
      onValidationChange(isValid)

      // 유효하지 않으면 invalidFields 업데이트 (props로 전달받은 경우)
      if (invalidFields && typeof invalidFields === 'object') {
        if ('image' in invalidFields) {
          invalidFields.image = !isValid
        }
      }
    }
  }, [formData.rating, formData.imgUrl, formData.imgUrlNsfw, onValidationChange, invalidFields])


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
          성인 캐릭터 이미지 업로드 시 주의사항
        </h3>
        <div className="space-y-2 text-sm text-secondary-600 dark:text-dark-secondary-500">
          <p>• 기본 이미지는 모든 유저가 볼 수 있기 때문에 성인용 이미지 업로드 시 별도의 경고 없이 차단될 수 있습니다.</p>
          <p>• 성기 노출, 잔인한 장면, 그외 사회 통념상 허용할 수 없는 이미지는 통보 없이 삭제될 수 있습니다.</p>
          <p>• 초상권, 저작권 침해 이미지는 통보 없이 삭제될 수 있습니다.</p>
          <p>• 한 번 공개된 이미지는 삭제할 수 없어요(수정은 가능).</p>
        </div>
      </div>
    </div>
  )
}
