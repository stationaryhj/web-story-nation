'use client'

import React, { useEffect } from 'react'
import { faUpload } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import type { ChangeEvent } from 'react'
import { Trash2, ArrowRight } from 'lucide-react'

import { RequiredLabel } from '../CharacterForm'
import { useAccountStore } from '@/store/useAccountStore'
import { getImageUri } from '@/lib/utils/storyNationUtil'
import { contentApi } from '@/services/api'
import { toast } from 'react-toastify'
import RatingSelect from './RatingSelect'
import { useRouter } from 'next/navigation'

interface ImageUploadFormProps {
  formData: any
  setFormField: (name: string, value: any) => void
  setNormalImage: (path: string) => void
  setAdultImage: (path: string) => void
  setAdultNormalImage: (path: string) => void
  onValidationChange?: (isValid: boolean) => void
}

export default function ImageUploadForm({
  formData,
  setFormField,
  setNormalImage,
  setAdultImage,
  setAdultNormalImage,
  onValidationChange,
}: ImageUploadFormProps) {
  const { isAdult } = useAccountStore()
  const isAdultModeEnabled = isAdult()
  const router = useRouter()
  // view Data - 이미지 URI 캐싱
  const imgNormal = getImageUri(formData.imgUrl)
  const imgNormalWeb = getImageUri(formData.imgWebUrl)
  const imgNsfw = getImageUri(formData.imgUrlNsfw)

  // 유효성 검사
  useEffect(() => {
    if (onValidationChange) {
      // 이미지 탭은 필수 항목이 없음
      onValidationChange(true)
    }
  }, [onValidationChange])

  // 이용등급 선택 핸들러
  const handleRatingSelect = (rating: 'all' | 'adult') => {
    if (rating === 'adult' && !isAdultModeEnabled) {
      return
    }
    setFormField('rating', rating)
  }

  // 이미지 업로드 핸들러
  const handleImageUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    isAdultImage: boolean = false,
    isNormalImage: boolean = false
  ) => {
    const file = e.target.files?.[0]

    if (!file) return

    // 파일 크기 확인 (10MB 이하)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('파일 크기는 10MB 이하여야 합니다')
      return
    }

    try {
      // 파일 확장자 추출
      const extension = file.name.split('.').pop()?.toLowerCase()
      const contentType = file.type

      // 이미지 파일 확인
      if (!contentType.startsWith('image/')) {
        toast.error('이미지 파일만 업로드할 수 있습니다')
        return
      }

      // if (visibility === 'public') {
      //   setVisibleWarnigModal(true)
      // }

      // Presigned URL 받아오기
      const presignedResponse = await contentApi.GetPresignedUrl(file.name, `.${extension || 'jpg'}`, 5)

      if (presignedResponse.data.result.err !== 0 || !presignedResponse.data.presignedUrl) {
        throw new Error('이미지 업로드를 위한 URL을 받아오지 못했습니다')
      }

      const presignedUrl = presignedResponse.data.presignedUrl
      const s3FilePath = presignedResponse.data.path

      // 이미지 압축
      const reader = new FileReader()
      reader.readAsDataURL(file)

      reader.onload = async event => {
        const img = new window.Image()
        img.src = event.target?.result as string

        img.onload = async () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          // 이미지 최대 크기 설정 (가로/세로 최대 1024px)
          const MAX_SIZE = 1024
          let width = img.width
          let height = img.height

          if (width > height && width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width)
            width = MAX_SIZE
          } else if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height)
            height = MAX_SIZE
          }

          canvas.width = width
          canvas.height = height
          ctx?.drawImage(img, 0, 0, width, height)

          // 압축된 이미지를 Blob으로 변환
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8)

          // Base64 데이터 URL에서 바이너리 데이터 추출
          const base64Data = dataUrl.split(',')[1]
          const binaryData = atob(base64Data)
          const arrayBuffer = new ArrayBuffer(binaryData.length)
          const uint8Array = new Uint8Array(arrayBuffer)

          for (let i = 0; i < binaryData.length; i++) {
            uint8Array[i] = binaryData.charCodeAt(i)
          }

          const blob = new Blob([uint8Array], { type: 'image/jpeg' })

          // S3에 이미지 업로드
          try {
            await fetch(presignedUrl, {
              method: 'PUT',
              body: blob,
              headers: {
                'Content-Type': 'image/jpeg',
              },
            })

            console.log(isNormalImage, isAdultImage)

            if (isNormalImage) {
              if (isAdultImage) {
                setAdultNormalImage(s3FilePath)
              } else {
                setNormalImage(s3FilePath)
              }
            } else {
              setAdultImage(s3FilePath)
            }

            toast.success('이미지가 성공적으로 업로드되었습니다')
            // router.push('/my-characters')
          } catch (error) {
            console.error('이미지 업로드 중 오류:', error)
            toast.error('이미지 업로드 중 오류가 발생했습니다')
          }
        }
      }
    } catch (error) {
      console.error('이미지 처리 중 오류:', error)
      toast.error('이미지 업로드 중 오류가 발생했습니다')
    }
  }

  // 전체 이용가 이미지 삭제
  const handleImageDelete = () => {
    console.log('click delete')
    setNormalImage('')
  }

  // 성인 노멀 이미지 삭제
  const handleImageDeleteAdultNormal = () => {
    setAdultNormalImage('')
  }

  // 성인 이미지 삭제
  const handleImageDeleteAdult = () => {
    setAdultImage('')
  }

  return (
    <div className="space-y-6">
      {/* 이용등급 */}
      <RatingSelect rating={formData.rating} onRatingSelect={handleRatingSelect} />

      {/* 이미지 그리드 */}
      <div className="flex">
        {/* 이미지 표시 - 전체 이용가인 경우 */}
        {formData.rating === 'all' && (
          <div className="flex flex-col justify-between min-w-[150px] md:min-w-[300px]">
            <div className="text-center">
              <h3 className="text-lg font-medium text-secondary-700 dark:text-dark-secondary-400">기본 이미지</h3>
              <p className="text-sm text-secondary-500 dark:text-dark-secondary-500 mb-4">
                일반 모드에서 표시되는 기본 이미지입니다.
              </p>
            </div>
            {/* 현재 이미지 표시 */}
            {formData.imgUrl ? (
              <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary-500 dark:border-dark-primary-500">
                <Image src={imgNormal} alt="캐릭터 일반 이미지" fill className="object-cover" />
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-primary-500/90 text-white text-xs rounded-full whitespace-nowrap">
                  전체이용가 이미지
                </div>
                <div
                  className="absolute top-1 right-1 cursor-pointer hover:text-red-500 transition-colors duration-200"
                  onClick={() => handleImageDelete()}
                >
                  <Trash2 />
                </div>
              </div>
            ) : (
              <label className="block aspect-square rounded-lg border-2 border-dashed border-secondary-300 dark:border-dark-secondary-300/20 hover:border-primary-500 dark:hover:border-dark-primary-500 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleImageUpload(e, false, true)}
                  className="hidden"
                />
                <div className="h-full flex flex-col items-center justify-center text-secondary-500 dark:text-dark-secondary-500 p-2 text-center">
                  <FontAwesomeIcon icon={faUpload} className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
                  <span className="text-xs sm:text-sm">{formData.imgUrl ? '이미지 교체' : '이미지 업로드'}</span>
                </div>
              </label>
            )}
          </div>
        )}

        {/* 이미지 표시 - 성인 전용인 경우 */}
        {formData.rating === 'adult' && isAdultModeEnabled && (
          <div className="flex flex-col md:flex-row gap-6 md:gap-12 w-full items-center">
            <div className="flex flex-col justify-between w-[300px] max-w-full">
              {/* 기본 이미지 섹션 */}
              <div className="text-center">
                <h3 className="text-lg font-medium text-secondary-700 dark:text-dark-secondary-400">기본 이미지</h3>
                <p className="text-sm text-secondary-500 dark:text-dark-secondary-500 mb-4">
                  짜릿 모드에서 표시되는 기본 이미지입니다.
                </p>
              </div>

              {/* 기본 이미지 표시 */}
              {formData.imgWebUrl ? (
                <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary-500 dark:border-dark-primary-500">
                  <Image src={imgNormalWeb} alt="캐릭터 기본 이미지" fill className="object-cover" />
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-primary-500/90 text-white text-xs rounded-full whitespace-nowrap">
                    기본 이미지
                  </div>
                  <div
                    className="absolute top-1 right-1 cursor-pointer hover:text-red-500 transition-colors duration-200"
                    onClick={() => handleImageDeleteAdultNormal()}
                  >
                    <Trash2 />
                  </div>
                </div>
              ) : (
                <label className="block aspect-square rounded-lg border-2 border-dashed border-secondary-300 dark:border-dark-secondary-300/20 hover:border-primary-500 dark:hover:border-dark-primary-500 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageUpload(e, true, true)}
                    className="hidden"
                  />
                  <div className="h-full flex flex-col items-center justify-center text-secondary-500 dark:text-dark-secondary-500 p-2 text-center">
                    <FontAwesomeIcon icon={faUpload} className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
                    <span className="text-sm">{formData.imgUrl ? '기본 이미지 교체' : '기본 이미지 업로드'}</span>
                  </div>
                </label>
              )}
            </div>
            <div className="flex flex-col items-center justify-center gap-2 text-secondary-500 py-4 md:py-0">
              <div className="rotate-90 md:rotate-0">
                <ArrowRight />
              </div>
              <div className="text-center">첫번째 대화 이후</div>
            </div>
            <div className="flex flex-col justify-between w-[300px] max-w-full">
              {/* 성인 이미지 섹션 */}
              <div className="text-center">
                <h3 className="text-lg font-medium text-secondary-700 dark:text-dark-secondary-400">
                  짜릿 모드 이미지
                </h3>
                <p className="text-sm text-secondary-500 dark:text-dark-secondary-500 mb-4">
                  성인 모드에서만 표시되는 이미지입니다.
                </p>
              </div>

              {/* 성인 이미지 표시 */}
              {formData.imgUrlNsfw ? (
                <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary-500 dark:border-dark-primary-500">
                  <Image src={imgNsfw} alt="캐릭터 성인 이미지" fill className="object-cover" />
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-primary-500/90 text-white text-xs rounded-full whitespace-nowrap">
                    짜릿 모드 이미지
                  </div>
                  <div
                    className="absolute top-1 right-1 cursor-pointer hover:text-red-500 transition-colors duration-200"
                    onClick={() => handleImageDeleteAdult()}
                  >
                    <Trash2 />
                  </div>
                </div>
              ) : (
                <label className="block aspect-square rounded-lg border-2 border-dashed border-secondary-300 dark:border-dark-secondary-300/20 hover:border-primary-500 dark:hover:border-dark-primary-500 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleImageUpload(e, true, false)}
                    className="hidden"
                  />
                  <div className="h-full flex flex-col items-center justify-center text-secondary-500 dark:text-dark-secondary-500 p-2 text-center">
                    <FontAwesomeIcon icon={faUpload} className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
                    <span className="text-sm">
                      {formData.imgUrlNsfw ? '짜릿 모드 이미지 교체' : '짜릿 모드 이미지 업로드'}
                    </span>
                  </div>
                </label>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 이미지가 없을 때 안내 메시지 */}
      {formData.rating === 'all' && !formData.imgUrl ? (
        <div className="text-center p-4 bg-secondary-50 dark:bg-dark-secondary-100/5 rounded-lg">
          <p className="text-sm text-secondary-500 dark:text-dark-secondary-500">
            이미지가 없습니다. 이미지를 업로드해주세요.
          </p>
        </div>
      ) : null}

      {formData.rating === 'adult' && !formData.imgUrl && !formData.imgUrlNsfw ? (
        <div className="text-center p-4 bg-secondary-50 dark:bg-dark-secondary-100/5 rounded-lg">
          <p className="text-sm text-secondary-500 dark:text-dark-secondary-500">
            이미지가 없습니다. 이미지를 업로드해주세요.
          </p>
        </div>
      ) : null}

      {/* 이용등급별 경고문구 */}
      <div className="rounded-lg bg-secondary-50 p-4 dark:bg-dark-secondary-100/5">
        <h3 className="mb-2 text-sm font-medium text-secondary-800 dark:text-dark-secondary-300">
          {formData.rating === 'all'
            ? '전체 이용가 캐릭터 이미지 업로드 시 주의사항'
            : '성인 캐릭터 이미지 업로드 시 주의사항'}
        </h3>
        <div className="space-y-2 text-sm text-secondary-600 dark:text-dark-secondary-500">
          {formData.rating === 'all' ? (
            <>
              <p>• 성인용 이미지 업로드 시 별도의 경고 없이 차단될 수 있습니다.</p>
              <p>• 초상권, 저작권 침해 이미지는 통보 없이 삭제될 수 있습니다.</p>
            </>
          ) : (
            <>
              <p>
                • 기본 이미지는 모든 유저가 볼 수 있기 때문에 성인용 이미지 업로드 시 별도의 경고 없이 차단될 수
                있습니다.
              </p>
              <p>• 성기 노출, 잔인한 장면, 그외 사회 통념상 허용할 수 없는 이미지는 통보 없이 삭제될 수 있습니다.</p>
              <p>• 초상권, 저작권 침해 이미지는 통보 없이 삭제될 수 있습니다.</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
