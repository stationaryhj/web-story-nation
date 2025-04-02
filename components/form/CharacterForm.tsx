'use client'

import React from 'react'
import { faCheck, faUpload, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import type { ChangeEvent, MouseEvent } from 'react'
import { useState, useEffect, useMemo, useRef } from 'react'

import { useCreateCharacterData, Tag } from '@/store/useCreateCharacterData'
import { useSettingsStore } from '../../store/useStoreSettings'
import { useModalStore } from '@/store/useStoreModal'

import ConfirmActionModal from '../modal/ConfirmActionModal'
import { toast } from 'react-toastify'
import { contentApi } from '@/services/api'

// 고유 ID 생성 함수
const generateId = () => Math.random().toString(36).substring(2, 11)

// 필수 입력값 표시 컴포넌트
const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-1">
    {children}
    <span className="text-orange-500">*</span>
  </div>
)

// 더이상 하드코딩된 해시태그 목록을 사용하지 않음
// const AVAILABLE_HASHTAGS = [ ... ]

interface CharacterFormProps {
  formType: 'create' | 'edit'
  mode: 'basic' | 'detail' | 'image'
  onValidationChange?: (isValid: boolean) => void
}

export default function CharacterForm({ mode, onValidationChange }: CharacterFormProps) {
  const {
    formData,
    setFormField,
    addHashtag,
    removeHashtag,
    addConversationExample,
    updateConversationExample,
    removeConversationExample,
    setConversationExampleEditMode,
    setConversationExampleVisibility,
    setNormalImage,
    setAdultImage,
    fetchTagList,
    saveHashtags,
    availableTags,
    isLoadingTags
  } = useCreateCharacterData()

  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [visibleWarnigModal, setVisibleWarnigModal] = useState(false)
  // 태그 그룹 상태는 더 이상 필요없음
  // const [activeTagGroup, setActiveTagGroup] = useState<number>(1)

  const { isAdultModeEnabled, toggleAdultMode } = useSettingsStore()
  const { openModal } = useModalStore()

  // 대화 예시 관련 ref 추가
  const exampleRefs = useRef<{ [key: string]: HTMLTextAreaElement }>({})

  // 태그 데이터 로드
  useEffect(() => {
    fetchTagList();
  }, [fetchTagList]);

  // 그룹별로 태그 정리하기
  const allAvailableTags = useMemo(() => {
    // 모든 그룹의 태그를 하나의 배열로 합치기
    const allTags = [...availableTags];
    
    // 정렬 (그룹 순서로 정렬, 같은 그룹 내에서는 sort 값으로 정렬)
    allTags.sort((a, b) => {
      if (a.group !== b.group) {
        return a.group - b.group;
      }
      return a.sort - b.sort;
    });
    
    return allTags;
  }, [availableTags]);

  // 그룹 이름 (이제 사용하지 않음)
  // const groupNames = { ... };

  // 이미지 배열이 없는 경우를 대비한 안전 조치
  useEffect(() => {
    if (!formData.images) {
      setFormField('images', [])
    }
  }, [formData, setFormField])

  // 유효성 검사
  useEffect(() => {
    if (mode === 'basic' && onValidationChange) {
      // 기본 정보 탭은 필수 입력 항목이 많음
      const isValid = !!(
        formData.name?.trim() &&
        formData.bio?.trim() &&
        formData.firstMessage?.trim()
      )
      onValidationChange(isValid)
    } else if (mode === 'detail' && onValidationChange) {
      // 상세 정보 탭은 bioDetail만 필수
      const isValid = !!formData.bioDetail?.trim()
      onValidationChange(isValid)
    } else if (mode === 'image' && onValidationChange) {
      // 이미지 탭은 필수 항목이 없음
      onValidationChange(true)
    }
  }, [formData, mode, onValidationChange])

  // 최초 대화 예시가 없는 경우 자동으로 하나만 생성합니다
  useEffect(() => {
    if (mode === 'detail' && formData.conversationExamples.length === 0) {
      addConversationExample()
    }
  }, [mode, formData.conversationExamples.length, addConversationExample])

  // 입력 필드 변경 핸들러
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // 글자 수 제한 검사
    if (name === 'name' && value.length > 25) return
    if ((name === 'bio' || name === 'firstMessage') && value.length > 80) return

    setFormField(name as any, value)
  }

  // 성별 선택 핸들러
  const handleGenderSelect = (gender: 'male' | 'female' | 'unspecified') => {
    setFormField('gender', gender)
  }

  // 게시 범위 선택 핸들러
  const handleVisibilitySelect = (visibility: 'public' | 'private') => {
    setFormField('visibility', visibility)
    if (visibility === 'public') {
      setVisibleWarnigModal(true)
    }
  }

  // 이용등급 선택 핸들러
  const handleRatingSelect = (rating: 'all' | 'adult') => {
    if (rating === 'adult' && !isAdultModeEnabled) {
      openModal('adultVerification')
      return
    }
    setFormField('rating', rating)
  }

  // 해시태그 토글 핸들러
  const handleHashtagToggle = async (tag: string) => {
    try {
      if (formData.hashtags.includes(tag)) {
        // 태그 제거
        await removeHashtag(tag);
      } else {
        // 태그 추가 (최대 7개 제한)
        if (formData.hashtags.length < 7) {
          await addHashtag(tag);
        } else {
          toast.error('최대 7개의 태그만 선택할 수 있습니다.')
          return;
        }
      }
      
      // 태그 변경 후 API 호출하여 저장
      if (formData.world_list_detail_chrbot_key) {
        await saveHashtags();
      }
    } catch (error) {
      console.error('태그 처리 중 오류:', error);
    }
  }

  // 이미지 압축 함수
  const compressImage = (imageDataUrl: string, maxWidth = 1200, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.src = imageDataUrl

      img.onload = () => {
        const canvas = document.createElement('canvas')

        // 이미지 크기 계산
        let width = img.width
        let height = img.height

        // 너비가 최대값을 초과하면 비율에 맞게 조정
        if (width > maxWidth) {
          const ratio = maxWidth / width
          width = maxWidth
          height = height * ratio
        }

        // 캔버스 크기 설정
        canvas.width = width
        canvas.height = height

        // 이미지 그리기
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context를 가져올 수 없습니다.'))
          return
        }

        ctx.drawImage(img, 0, 0, width, height)

        // 압축된 이미지 데이터 URL 생성
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality)
        resolve(compressedDataUrl)
      }

      img.onerror = () => {
        reject(new Error('이미지 로딩에 실패했습니다.'))
      }
    })
  }

  // 이미지 업로드 핸들러
  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // 첫 번째 파일만 처리
    const file = files[0]
    
    // 파일 크기 확인 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(`파일 크기가 너무 큽니다: ${file.name} (최대 10MB)`)
      e.target.value = ''
      return
    }

    try {
      // 파일을 dataURL로 변환
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      // 이미지 압축
      const compressedImage = await compressImage(dataUrl)

      // 파일 확장자 추출
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpeg'
      const fileType = `.${fileExtension}`

      // api 호출하여 presigned URL 가져오기
      const response = await contentApi.GetPresignedUrl(file.name, fileType, 5)
      console.log('response :::: ', response)

      if (response?.data?.result?.err === 0 && response?.data?.presignedUrl) {
        // Base64 데이터 URL에서 실제 바이너리 데이터 추출
        const base64Data = compressedImage.split(',')[1]
        const binaryData = atob(base64Data)
        const byteArray = new Uint8Array(binaryData.length)
        for (let i = 0; i < binaryData.length; i++) {
          byteArray[i] = binaryData.charCodeAt(i)
        }
        const blob = new Blob([byteArray], { type: `image/${fileExtension}` })

        // presigned URL을 이용하여 S3에 이미지 업로드 (PUT 요청)
        try {
          const uploadResponse = await fetch(response.data.presignedUrl, {
            method: 'PUT',
            body: blob,
            headers: {
              'Content-Type': `image/${fileExtension}`
            }
          })

          if (uploadResponse.ok) {
            console.log('이미지 업로드 성공')
            // 이미지 경로 가져오기
            const imgPath = response.data.path
            
            // 이용등급에 따라 다른 이미지 저장
            if (formData.rating === 'all') {
              // 일반 이미지 저장
              setNormalImage(compressedImage)
              
              // formData에 저장된 img_url을 업데이트
              setFormField('imgUrl', imgPath)
              
            } else if (formData.rating === 'adult') {
              // 성인 이미지 저장
              setAdultImage(compressedImage)
              
              // formData에 저장된 이미지 URL을 업데이트
              setFormField('imgUrlNsfw', imgPath)
            }
            
            // 이미지 업로드 성공 메시지 표시
            toast.success('이미지가 성공적으로 업로드되었습니다.')
          } else {
            console.error('이미지 업로드 실패:', uploadResponse.statusText)
            toast.error('이미지 업로드에 실패했습니다.')
          }
        } catch (uploadError) {
          console.error('이미지 업로드 중 오류 발생:', uploadError)
          toast.error('이미지 업로드 중 오류가 발생했습니다.')
        }
      } else {
        console.error('Presigned URL 획득 실패')
        toast.error('이미지 업로드 준비 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('이미지 처리 오류:', error)
      toast.error(`이미지 처리 중 오류가 발생했습니다: ${file.name}`)
    }

    // 파일 입력 초기화 (같은 파일 다시 선택 가능하도록)
    e.target.value = ''
  }

  // 대화 예시 텍스트 변경 핸들러
  const handleExampleTextChange = (id: string, text: string) => {
    if (text.length <= 1500) {
      updateConversationExample(id, text)
    }
  }

  // 대화 예시 편집 모드 설정
  const handleEditExample = (id: string) => {
    // 모든 예시를 편집 모드 해제
    formData.conversationExamples.forEach(ex => {
      if (ex.id !== id && ex.isEditing) {
        setConversationExampleEditMode(ex.id, false)

        // 빈 텍스트 자동 삭제
        if (ex.text.trim() === '') {
          removeConversationExample(ex.id)
        }
      }
    })

    setConversationExampleEditMode(id, true)
    // 편집 모드로 전환 후 해당 textarea에 포커스
    setTimeout(() => {
      if (exampleRefs.current[id]) {
        exampleRefs.current[id].focus()
      }
    }, 0)
  }

  // 대화 예시 편집 완료
  const handleCompleteEdit = (id: string) => {
    const example = formData.conversationExamples.find(ex => ex.id === id)
    // 빈 텍스트인 경우 자동 삭제
    if (example && example.text.trim() === '') {
      removeConversationExample(id)
    } else {
      setConversationExampleEditMode(id, false)
    }
  }

  // 대화 예시 삭제 버튼 핸들러
  const handleDeleteExample = (id: string) => {
    if (confirm('정말로 이 대화 예시를 삭제하시겠습니까?')) {
      removeConversationExample(id)
    }
  }

  // 대화 예시 blur 이벤트 핸들러
  const handleExampleBlur = (id: string, oldText: string) => {
    const example = formData.conversationExamples.find(ex => ex.id === id)
    if (example) {
      // 빈 텍스트인 경우 자동 삭제
      if (example.text.trim() === '') {
        removeConversationExample(id)
      }
      // 텍스트가 변경되지 않았으면 편집 모드만 종료
      else if (example.text === oldText) {
        setConversationExampleEditMode(id, false)
      }
      // 변경된 경우 저장 (최적화)
      else {
        handleCompleteEdit(id)
      }
    }
  }

  // 대화 예시 가시성 변경 핸들러
  const handleExampleVisibilityChange = (id: string, visibility: 'public' | 'private') => {
    setConversationExampleVisibility(id, visibility)
  }

  // 텍스트 길이 표시 형식
  const formatTextLength = (current: number, max: number) => {
    return `(${current}/${max})`
  }

  // 상세 설명 입력 변경 핸들러
  const handleBioDetailChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= 3500) {
      setFormField('bioDetail', value)
    }
  }

  // 이미지가 있는데 selectedImage가 없으면 첫 번째 이미지를 기본 이미지로 설정
  useEffect(() => {
    if (mode === 'image') {
      if (formData.images && formData.images.length > 0 && !selectedImage) {
        setSelectedImage(formData.images[0].id)
      }
    }
  }, [mode, formData.images, selectedImage])

  // 이미지 업로드 폼 렌더링
  if (mode === 'image') {
    // 호환성을 위해 이미지 배열 가져오기
    const images = formData.images || []
    
    // 기본 이미지 설정 메시지
    const renderValidationMessage = () => {
      // 이미지가 필수가 아니므로 유효성 메시지 표시 안함
      return null
    }

    return (
      <div className="space-y-6">
        {/* 이용등급 */}
        <div>
          <RequiredLabel>
            <label className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
              이용등급
            </label>
          </RequiredLabel>
          <div className="mt-2 grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleRatingSelect('all')}
              className={`rounded-lg px-4 py-3 text-center transition-colors ${
                formData.rating === 'all'
                  ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                  : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
              }`}
            >
              전체 이용가
            </button>
            <button
              type="button"
              onClick={() => handleRatingSelect('adult')}
              disabled={!isAdultModeEnabled}
              className={`rounded-lg px-4 py-3 text-center transition-colors ${
                formData.rating === 'adult' && isAdultModeEnabled
                  ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                  : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
              } ${!isAdultModeEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              성인 전용
            </button>
          </div>
          {!isAdultModeEnabled && formData.rating === 'adult' && (
            <p className="mt-2 text-sm text-red-500">성인 인증이 필요합니다.</p>
          )}
        </div>

        {/* 이미지 그리드 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
          {/* 현재 이미지 표시 - 이용등급에 따라 이미지 표시 */}
          {formData.rating === 'all' && formData.images && formData.images.find(img => img.type === 'normal') && (
            <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary-500 dark:border-dark-primary-500">
              <Image src={formData.images.find(img => img.type === 'normal')!.url} alt="캐릭터 일반 이미지" fill className="object-cover" />
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-primary-500/90 text-white text-xs rounded-full whitespace-nowrap">
                전체이용가 이미지
              </div>
            </div>
          )}
          
          {formData.rating === 'adult' && isAdultModeEnabled && formData.images && formData.images.find(img => img.type === 'adult') && (
            <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary-500 dark:border-dark-primary-500">
              <Image src={formData.images.find(img => img.type === 'adult')!.url} alt="캐릭터 성인 이미지" fill className="object-cover" />
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-primary-500/90 text-white text-xs rounded-full whitespace-nowrap">
                성인 이미지
              </div>
            </div>
          )}

          {/* 이미지 업로드 버튼 */}
          <label className="block aspect-square rounded-lg border-2 border-dashed border-secondary-300 dark:border-dark-secondary-300/20 hover:border-primary-500 dark:hover:border-dark-primary-500 cursor-pointer">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              className="hidden" 
            />
            <div className="h-full flex flex-col items-center justify-center text-secondary-500 dark:text-dark-secondary-500 p-2 text-center">
              <FontAwesomeIcon icon={faUpload} className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
              <span className="text-xs sm:text-sm">
                {formData.rating === 'all' && formData.images && formData.images.find(img => img.type === 'normal')
                  ? '이미지 교체' 
                  : formData.rating === 'adult' && isAdultModeEnabled && formData.images && formData.images.find(img => img.type === 'adult')
                    ? '이미지 교체'
                    : '이미지 업로드'
                }
              </span>
            </div>
          </label>
        </div>

        {/* 이미지가 없을 때 안내 메시지 */}
        {(formData.rating === 'all' && !formData.images || formData.rating === 'adult' && !formData.images) ? (
          <div className="text-center p-4 bg-secondary-50 dark:bg-dark-secondary-100/5 rounded-lg">
            <p className="text-sm text-secondary-500 dark:text-dark-secondary-500">
              이미지가 없습니다. 이미지를 업로드해주세요.
            </p>
          </div>
        ) : null}

        {/* 이미지 가이드라인 경고 메시지 */}
        <div className="mt-4 p-4 bg-secondary-50 dark:bg-dark-secondary-100/5 rounded-lg">
          <p className="text-sm text-secondary-800 dark:text-dark-secondary-400 leading-relaxed">
            성기 노출, 잔인한 장면, 그외 사회 통념상 허용할 수 없는 이미지는 통보 없이 삭제될 수 있습니다.
            <br />
            초상권, 저작권 침해 이미지는 통보 없이 삭제될 수 있습니다.
          </p>
        </div>

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
                <p>• 성기 노출, 잔인한 장면, 그외 사회 통념상 허용할 수 없는 이미지는 통보 없이 삭제될 수 있습니다.</p>
                <p>• 초상권, 저작권 침해 이미지는 통보 없이 삭제될 수 있습니다.</p>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 기본 설정 탭을 렌더링합니다
  if (mode === 'detail') {
    return (
      <div className="space-y-8">
        {/* 상세 설명 */}
        <div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">상세 설명</h3>
              <p className="text-xs text-secondary-500 dark:text-dark-secondary-500">
                성격, 외모, 상황 등의 정보를 알려주세요!
              </p>
            </div>
            <span className="text-xs text-secondary-500 dark:text-dark-secondary-500">
              {formatTextLength(formData.bioDetail.length, 3500)}
            </span>
          </div>

          {/* 공개/비공개 선택 버튼 */}
          <div className="grid grid-cols-2 gap-4 w-full sm:w-1/2 md:w-1/3 mb-4">
            <button
              type="button"
              onClick={() => handleVisibilitySelect('private')}
              className={`w-full px-3 py-2 text-base rounded-lg text-center transition-colors ${
                formData.visibility === 'private'
                  ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                  : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
              }`}
            >
              비공개
            </button>
            <button
              type="button"
              onClick={() => handleVisibilitySelect('public')}
              className={`w-full px-3 py-2 text-base rounded-lg text-center transition-colors ${
                formData.visibility === 'public'
                  ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                  : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
              }`}
            >
              공개
            </button>
          </div>

          <textarea
            id="bioDetail"
            value={formData.bioDetail}
            onChange={handleBioDetailChange}
            placeholder='예시) 유키는 차가운 첫인상을 가진 고등학교 3학년으로 공부와 운동 모두 뛰어난 완벽주의자다. 겉으로는 "귀찮게 하지마" 라며 주변을 밀어내지만 사실은 누구보다 친구들의 사소한 행동도 기억하며 배려하는 속 깊은 성격을 가졌다.'
            rows={8}
            className="w-full px-4 py-3 rounded-lg border border-secondary-200 dark:border-dark-secondary-200/10 bg-white dark:bg-dark-background-light focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500 dark:text-dark-secondary-400 resize-none"
            maxLength={3500}
          />
        </div>

        {/* 구분선 */}
        <hr className="border-secondary-200 dark:border-dark-secondary-200/10" />

        {/* 대화 예시 섹션 */}
        <div>
          <div className="mb-4">
            <div>
              <h3 className="text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
                대화 예시(최대 3개)
              </h3>
              <p className="text-xs text-secondary-500 dark:text-dark-secondary-500">
                캐릭터의 말투가 채팅에 반영될 거에요!
              </p>
            </div>
          </div>

          {/* 대화 예시 목록 */}
          <div className="space-y-6">
            {formData.conversationExamples.map((example, index) => (
              <div key={example.id} className="relative">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
                    대화 예시 {index + 1}
                  </h4>
                  <span className="text-xs text-secondary-500 dark:text-dark-secondary-500">
                    {formatTextLength(example.text.length, 1500)}
                  </span>
                </div>

                {/* 공개/비공개 선택 버튼 */}
                <div className="grid grid-cols-2 gap-4 w-full sm:w-1/2 md:w-1/3 mb-4">
                  <button
                    type="button"
                    onClick={() => handleExampleVisibilityChange(example.id, 'private')}
                    className={`w-full px-3 py-2 rounded-lg text-center text-sm transition-colors ${
                      example.visibility === 'private'
                        ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                        : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                    }`}
                  >
                    비공개
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExampleVisibilityChange(example.id, 'public')}
                    className={`w-full px-3 py-2 rounded-lg text-center text-sm transition-colors ${
                      example.visibility === 'public'
                        ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                        : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                    }`}
                  >
                    공개
                  </button>
                </div>

                <div className="relative">
                  {/* 텍스트 영역 */}
                  <textarea
                    ref={el => {
                      if (el) exampleRefs.current[example.id] = el
                    }}
                    value={example.text}
                    onChange={e => handleExampleTextChange(example.id, e.target.value)}
                    onFocus={() => handleEditExample(example.id)}
                    onBlur={() => handleExampleBlur(example.id, example.text)}
                    placeholder="대화 예시를 입력하세요"
                    rows={4}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      example.isEditing
                        ? 'border-primary-300 dark:border-dark-primary-500/50'
                        : 'border-secondary-200 dark:border-dark-secondary-200/10'
                    } bg-white dark:bg-dark-background-light focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500 dark:text-dark-secondary-400 resize-none`}
                    maxLength={1500}
                  />

                  {/* 편집 모드일 때 표시되는 버튼들 */}
                  {example.isEditing && (
                    <div
                      className="absolute bottom-3 right-3 flex gap-2 opacity-0 transition-opacity duration-200 animate-fadeIn"
                      style={{ opacity: 1 }}
                    >
                      <button
                        type="button"
                        onClick={() => handleCompleteEdit(example.id)}
                        className="px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 text-xs"
                      >
                        저장
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditExample(example.id)}
                        className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded hover:bg-primary-200 dark:bg-dark-primary-900/20 dark:text-dark-primary-400 dark:hover:bg-dark-primary-900/30 text-xs"
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteExample(example.id)}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 text-xs"
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* 빈 대화 예시 추가 구역 */}
            {formData.conversationExamples.length < 3 && (
              <div
                className="flex items-center justify-center border-2 border-dashed border-secondary-200 dark:border-dark-secondary-200/10 rounded-lg p-4 mt-4 cursor-pointer hover:border-primary-300 dark:hover:border-dark-primary-500/30 transition-colors"
                onClick={() => addConversationExample()}
              >
                <div className="flex flex-col items-center text-secondary-500 dark:text-dark-secondary-500">
                  <FontAwesomeIcon icon={faPlus} className="mb-2 text-xl" />
                  <span className="text-sm">대화 예시 추가하기</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 기본 설정 폼 렌더링
  if (mode === 'basic') {
    return (
      <>
        <ConfirmActionModal
          isOpen={visibleWarnigModal}
          onClose={() => setVisibleWarnigModal(false)}
          title="캐릭터 공개 시 주의사항"
          description="한 번 공개한 캐릭터는 비공개로 전환할 수 없어요!"
          confirmText="확인했어요"
          cancelText="돌아갈래요"
          onConfirm={() => {
            setVisibleWarnigModal(false)
            setFormField('visibility', 'public')
          }}
          onCancel={() => {
            setVisibleWarnigModal(false)
            setFormField('visibility', 'private')
          }}
        />
        <div className="space-y-8">
          {/* 기본 설정 */}
          <div className="space-y-6">
            {/* 이용등급 */}
            <div>
              <RequiredLabel>
                <label className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
                  이용등급
                </label>
              </RequiredLabel>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleRatingSelect('all')}
                  className={`rounded-lg px-4 py-3 text-center transition-colors ${
                    formData.rating === 'all'
                      ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                      : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                  }`}
                >
                  전체 이용가
                </button>
                <button
                  type="button"
                  onClick={() => handleRatingSelect('adult')}
                  disabled={!isAdultModeEnabled}
                  className={`rounded-lg px-4 py-3 text-center transition-colors ${
                    formData.rating === 'adult'
                      ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                      : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                  } ${!isAdultModeEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  성인 전용
                </button>
              </div>
              {!isAdultModeEnabled && formData.rating === 'adult' && (
                <p className="mt-2 text-sm text-red-500">성인 인증이 필요합니다.</p>
              )}
            </div>
            {/* 이름 */}
            <div>
              <RequiredLabel>
                <label className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
                  캐릭터 이름
                </label>
              </RequiredLabel>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="캐릭터의 이름을 입력하세요"
                className="mt-1 block w-full rounded-lg border border-secondary-200 px-4 py-3 text-secondary-900 placeholder-secondary-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-secondary-200/10 dark:bg-dark-background-light dark:text-dark-secondary-200 dark:placeholder-dark-secondary-500"
                maxLength={25}
              />
            </div>

            {/* 성별 */}
            <div>
              <RequiredLabel>
                <label className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
                  성별
                </label>
              </RequiredLabel>
              <div className="mt-2 grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => handleGenderSelect('male')}
                  className={`rounded-lg px-4 py-3 text-center transition-colors ${
                    formData.gender === 'male'
                      ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                      : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                  }`}
                >
                  남성
                </button>
                <button
                  type="button"
                  onClick={() => handleGenderSelect('female')}
                  className={`rounded-lg px-4 py-3 text-center transition-colors ${
                    formData.gender === 'female'
                      ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                      : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                  }`}
                >
                  여성
                </button>
                <button
                  type="button"
                  onClick={() => handleGenderSelect('unspecified')}
                  className={`rounded-lg px-4 py-3 text-center transition-colors ${
                    formData.gender === 'unspecified'
                      ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                      : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                  }`}
                >
                  미정
                </button>
              </div>
            </div>

            {/* 게시 범위 */}
            <div>
              <RequiredLabel>
                <label className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
                  게시 범위
                </label>
              </RequiredLabel>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleVisibilitySelect('private')}
                  className={`rounded-lg px-4 py-3 text-center transition-colors ${
                    formData.visibility === 'private'
                      ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                      : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                  }`}
                >
                  비공개
                </button>
                <button
                  type="button"
                  onClick={() => handleVisibilitySelect('public')}
                  className={`rounded-lg px-4 py-3 text-center transition-colors ${
                    formData.visibility === 'public'
                      ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                      : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                  }`}
                >
                  공개
                </button>
              </div>
            </div>

            {/* 한줄 소개 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <RequiredLabel>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400"
                  >
                    한줄 소개
                  </label>
                </RequiredLabel>
                <span className="text-xs text-secondary-500 dark:text-dark-secondary-500">
                  {formData.bio.length}/80
                </span>
              </div>
              <p className="text-xs text-secondary-500 dark:text-dark-secondary-500 mb-2">
                내 캐릭터를 간단히 소개해 보세요!
              </p>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="예시)까칠한 뱀파이어"
                rows={2}
                className="w-full px-4 py-3 rounded-lg border border-secondary-200 dark:border-dark-secondary-200/10 bg-white dark:bg-dark-background-light focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500 dark:text-dark-secondary-400 resize-none"
                maxLength={80}
              />
            </div>

            {/* 첫 메시지 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <RequiredLabel>
                  <label
                    htmlFor="firstMessage"
                    className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400"
                  >
                    첫 메세지
                  </label>
                </RequiredLabel>

                <span className="text-xs text-secondary-500 dark:text-dark-secondary-500">
                  {formData.firstMessage.length}/80
                </span>
              </div>
              <p className="text-xs text-secondary-500 dark:text-dark-secondary-500 mb-2">
                재미있는 선톡으로 유저의 답장을 이끌어내 보세요!
              </p>
              <textarea
                id="firstMessage"
                name="firstMessage"
                value={formData.firstMessage}
                onChange={handleInputChange}
                placeholder="캐릭터가 보내는 첫 메세지를 입력하세요"
                rows={2}
                className="w-full px-4 py-3 rounded-lg border border-secondary-200 dark:border-dark-secondary-200/10 bg-white dark:bg-dark-background-light focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500 dark:text-dark-secondary-400 resize-none"
                maxLength={80}
              />
            </div>

            {/* 캐릭터 태그 */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <RequiredLabel>
                  <label className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
                    캐릭터 태그
                  </label>
                </RequiredLabel>
                <span className="text-xs text-secondary-500 dark:text-dark-secondary-500">
                  {formData.hashtags.length}/7
                </span>
              </div>
              <p className="text-xs text-secondary-500 dark:text-dark-secondary-500 mb-2">
                내 캐릭터를 태그로 설명한다면? (최대7개)
              </p>
              <div className="relative w-full">
                <div className="flex flex-wrap gap-1.5 items-center w-full px-3 py-2 min-h-[52px] rounded-lg border border-secondary-200 dark:border-dark-secondary-200/10 bg-white dark:bg-dark-background-light">
                  {formData.hashtags.length > 0 ? (
                    formData.hashtags.map(tag => (
                      <div
                        key={tag}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-primary-100 text-primary-700 dark:bg-dark-primary-900/20 dark:text-dark-primary-400"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          className="ml-1.5 text-primary-500 hover:text-primary-700 dark:text-dark-primary-400 dark:hover:text-dark-primary-300"
                          onClick={() => handleHashtagToggle(tag)}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="text-secondary-400 dark:text-dark-secondary-600">
                      캐릭터의 특징을 나타내는 태그를 선택하세요!
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {isLoadingTags ? (
                  <div className="w-full py-4 text-center text-secondary-500 dark:text-dark-secondary-400">
                    태그 목록을 불러오는 중...
                  </div>
                ) : allAvailableTags.length > 0 ? (
                  allAvailableTags.map(tagItem => (
                    <button
                      key={tagItem.c_chrbot_tag_key}
                      type="button"
                      onClick={() => handleHashtagToggle(tagItem.tag)}
                      className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                        formData.hashtags.includes(tagItem.tag)
                          ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                          : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                      }`}
                    >
                      {tagItem.tag}
                      {formData.hashtags.includes(tagItem.tag) && <FontAwesomeIcon icon={faCheck} className="ml-1" />}
                    </button>
                  ))
                ) : (
                  <div className="w-full py-4 text-center text-secondary-500 dark:text-dark-secondary-400">
                    사용 가능한 태그가 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
}
