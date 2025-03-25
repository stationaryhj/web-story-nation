'use client'

import { faCheck, faUpload, faTimes, faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import type { ChangeEvent, MouseEvent } from 'react'
import { useState, useEffect, useMemo } from 'react'

import { useCharacterFormStore, useImageStore } from '../../store/useCharacterFormStore'
import DetailCharacterPage from '../../app/(routes)/my-characters/create/detail/page'
import { useSettingsStore } from '../../store/useStoreSettings'
import { useModalStore } from '@/store/useStoreModal'
import ToggleSwitch from './ToggleSwitch'
import CharacterVisibilityWarningModal from '@/components/modal/CharacterVisibilityWarningModal'

// 해시태그 데이터
const AVAILABLE_HASHTAGS = [
  '#집착',
  '#로맨스',
  '#판타지',
  '#중세판타지',
  '#남매/형제/자매',
  '#BL',
  '#GL',
  '#SF',
  '#호러',
  '#코미디',
  '#드라마',
  '#액션',
  '#스릴러',
  '#미스터리',
  '#차원이동',
  '#빙의',
  '#환생',
  '#성장',
  '#착취',
  '#감금',
  '#학대',
  '#폭력',
  '#고문',
  '#복수',
]

interface CharacterFormProps {
  formType: 'create' | 'edit'
  mode: 'basic' | 'detail' | 'image'
  onValidationChange?: (isValid: boolean) => void
}

export default function CharacterForm({ formType = 'create', mode, onValidationChange }: CharacterFormProps) {
  const { formData, setFormField, addHashtag, removeHashtag } = useCharacterFormStore()

  const { images, activeImageTab, setActiveImageTab, addImage, removeImage } = useImageStore()

  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const { isAdultModeEnabled, toggleAdultMode } = useSettingsStore()
  const { openModal } = useModalStore()

  const [isVisibilityWarningOpen, setIsVisibilityWarningOpen] = useState(false)
  const [pendingVisibility, setPendingVisibility] = useState<'public' | 'private' | null>(null)

  // 이미지 배열이 없는 경우를 대비한 안전 조치
  useEffect(() => {
    if (!formData.images) {
      setFormField('images', [])
    }
  }, [formData, setFormField])

  // 이미지 기본 이미지 유효성 검사
  useEffect(() => {
    if (mode === 'image' && onValidationChange) {
      // 이미지가 있고 기본 이미지가 설정되어 있으면 유효함
      const isValid = images?.length > 0 && selectedImage !== null
      onValidationChange(isValid)
    }
  }, [mode, images, selectedImage, onValidationChange])

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
    // 디버깅을 위한 로그 추가
    console.log(`가시성 선택 요청: ${visibility}, 현재 폼타입: ${formType}, 현재 가시성: ${formData.visibility}`)

    // 수정 모드에서는 변경 불가능
    if (formType === 'edit') {
      console.log('수정 모드에서는 가시성을 변경할 수 없습니다.')
      return
    }

    if (visibility === 'private') {
      // 비공개 선택 시 바로 적용
      setFormField('visibility', visibility)
      console.log('비공개 상태로 변경됨, 변경 후 상태:', visibility)
    } else {
      // 공개 선택 시 경고 모달 표시
      console.log('공개 버튼 클릭 - 경고 모달 열기')
      setPendingVisibility('public')
      setIsVisibilityWarningOpen(true)
    }
  }

  // 모달 확인 버튼 핸들러
  const handleVisibilityConfirm = () => {
    console.log('모달 확인 버튼 클릭됨, 변경 전 상태:', formData.visibility)

    // 공개로 상태 변경
    setFormField('visibility', 'public')

    // 약간의 지연 후 변경된 상태 확인 (비동기 업데이트 확인용)
    console.log('공개 상태로 변경 요청됨')
    setTimeout(() => {
      console.log('지연 후 visibility 상태:', formData.visibility)
    }, 100)

    // 모달 닫기
    setIsVisibilityWarningOpen(false)
    setPendingVisibility(null)
  }

  // 해시태그 토글 핸들러
  const handleHashtagToggle = (tag: string) => {
    if (formData.hashtags.includes(tag)) {
      removeHashtag(tag)
    } else {
      if (formData.hashtags.length < 7) {
        addHashtag(tag)
      } else {
        alert('최대 7개의 태그만 선택할 수 있습니다.')
      }
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

    if ((images?.length || 0) + files.length > 30) {
      alert('최대 30개의 이미지만 업로드할 수 있습니다.')
      return
    }

    // 업로드 중 UI 표시 (필요시 구현)

    for (const file of Array.from(files)) {
      // 파일 크기 확인 (10MB 제한)
      if (file.size > 10 * 1024 * 1024) {
        alert(`파일 크기가 너무 큽니다: ${file.name} (최대 10MB)`)
        continue
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

        // 압축된 이미지 저장
        addImage(compressedImage, activeImageTab)
      } catch (error) {
        console.error('이미지 처리 오류:', error)
        alert(`이미지 처리 중 오류가 발생했습니다: ${file.name}`)
      }
    }

    // 파일 입력 초기화 (같은 파일 다시 선택 가능하도록)
    e.target.value = ''
  }

  // 이미지 삭제 핸들러
  const handleImageDelete = (id: string, e?: MouseEvent) => {
    // 이벤트가 있으면 이벤트 전파 중지
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }

    console.log('Deleting image with id:', id)
    console.log('Current images:', images)

    // 이미지 삭제
    removeImage(id)

    // 약간의 지연 후 로그 확인
    setTimeout(() => {
      console.log('Images after deletion:', images)
    }, 100)

    // 선택된 이미지인 경우 선택 취소
    if (selectedImage === id) {
      setSelectedImage(null)
    }
  }

  // 이미지 필터 기능 예시 (성인 이미지 필터링)
  const filteredImages = useMemo(() => {
    if (isAdultModeEnabled) {
      // 성인 모드가 활성화되면 모든 이미지 표시
      return images || []
    } else {
      // 성인 모드가 비활성화되면 성인 이미지 필터링
      return (images || []).filter(img => img.type !== 'adult')
    }
  }, [images, isAdultModeEnabled])

  // 상세 설정 탭을 렌더링합니다
  if (mode === 'detail') {
    return <DetailCharacterPage />
  }

  // 기본 설정 폼 렌더링
  if (mode === 'basic') {
    return (
      <div className="space-y-6">
        {/* 이름 입력 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="name" className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
              이름
            </label>
            <span className="text-xs text-secondary-500 dark:text-dark-secondary-500">{formData.name.length}/25</span>
          </div>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="캐릭터 이름을 입력해 주세요."
            className="w-full px-4 py-3 rounded-lg border border-secondary-200 dark:border-dark-secondary-200/10 bg-white dark:bg-dark-background-light focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500 dark:text-dark-secondary-400"
            maxLength={25}
          />
        </div>

        {/* 성별 선택 */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400 mb-2">성별</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleGenderSelect('male')}
              className={`px-3 py-2 rounded-lg text-center transition-colors text-sm ${
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
              className={`px-3 py-2 rounded-lg text-center transition-colors text-sm ${
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
              className={`px-3 py-2 rounded-lg text-center transition-colors text-sm ${
                formData.gender === 'unspecified'
                  ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                  : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
              }`}
            >
              알 수 없음
            </button>
          </div>
        </div>

        {/* 게시 범위 */}
        <div>
          <div className="flex justify-between items-start mb-2">
            <label className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
              게시 범위 0 / 3
            </label>
            <button type="button" className="text-xs text-primary-500 dark:text-dark-primary-500 underline">
              게시 범위에 따라 무엇이 달라지나요?
            </button>
          </div>
          <p className="text-xs text-secondary-500 dark:text-dark-secondary-500 mb-2 w-full">
            캐릭터의 게시범위를 정해요!
            {formType === 'edit' && (
              <span className="ml-1 text-red-500 font-medium">(캐릭터 생성 후에는 게시 범위를 변경할 수 없습니다)</span>
            )}
          </p>
          <div className="flex flex-col gap-5 items-start">
            {/* 왼쪽 버튼 영역 */}
            <div className="flex gap-3 w-full">
              <button
                type="button"
                onClick={() => handleVisibilitySelect('private')}
                disabled={formType === 'edit'}
                className={`px-3 py-2 rounded-lg text-center transition-colors text-sm ${
                  formData.visibility === 'private'
                    ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                    : formType === 'edit'
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                }`}
              >
                비공개
              </button>
              <button
                type="button"
                onClick={() => handleVisibilitySelect('public')}
                disabled={formType === 'edit'}
                className={`px-3 py-2 rounded-lg text-center transition-colors text-sm ${
                  formData.visibility === 'public'
                    ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                    : formType === 'edit'
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                }`}
              >
                공개
              </button>
            </div>

            {/* 오른쪽 설명 영역 */}
            <div className="flex-1 bg-secondary-50 dark:bg-dark-secondary-100/5 rounded-lg p-3 w-full">
              {formData.visibility === 'private' ? (
                <div>
                  <h3 className="font-medium text-sm text-secondary-800 dark:text-dark-secondary-300 mb-1">비공개</h3>
                  <ul className="text-xs text-secondary-600 dark:text-dark-secondary-500 space-y-1">
                    <li>• 나만 캐릭터와 대화할 수 있어요.</li>
                    <li>• 캐릭터가 검색되지 않아요.</li>
                    <li>• 최대 3개만 보유할 수 있어요.</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <h3 className="font-medium text-sm text-secondary-800 dark:text-dark-secondary-300 mb-1">공개</h3>
                  <ul className="text-xs text-secondary-600 dark:text-dark-secondary-500 space-y-1">
                    <li>• 모든 유저가 캐릭터와 대화할 수 있어요.</li>
                    <li>• 생성한 공개 캐릭터는 비공개로 바꿀 수 없어요.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 한줄 소개 */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="bio" className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
              한줄 소개
            </label>
            <span className="text-xs text-secondary-500 dark:text-dark-secondary-500">{formData.bio.length}/80</span>
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
            <label
              htmlFor="firstMessage"
              className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400"
            >
              첫 메세지
            </label>
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
            <label className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
              캐릭터 태그
            </label>
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
                      onClick={() => removeHashtag(tag)}
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
            {AVAILABLE_HASHTAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => handleHashtagToggle(tag)}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                  formData.hashtags.includes(tag)
                    ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                    : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                }`}
              >
                {tag}
                {formData.hashtags.includes(tag) && <FontAwesomeIcon icon={faCheck} className="ml-1" />}
              </button>
            ))}
          </div>
        </div>

        {/* 성인 모드 토글 스위치 */}
        <ToggleSwitch className="mt-4" />
      </div>
    )
  }

  // 이미지 업로드 폼 렌더링
  if (mode === 'image') {
    // 이미지 필터링
    const filteredImages = images?.filter(img => img.type === activeImageTab) || []

    // 성인 탭 클릭 핸들러 - 짜릿모드 체크
    const handleAdultTabClick = () => {
      if (!isAdultModeEnabled) {
        alert('짜릿모드 이미지를 보려면 짜릿모드를 활성화해주세요!')
      } else {
        setActiveImageTab('adult')
      }
    }

    // 기본 이미지 설정 메시지
    const renderValidationMessage = () => {
      if (images?.length === 0) {
        return <p className="text-red-500 dark:text-red-400 text-sm mt-2">이미지를 하나 이상 업로드해주세요.</p>
      } else if (!selectedImage) {
        return <p className="text-red-500 dark:text-red-400 text-sm mt-2">기본 이미지를 설정해주세요.</p>
      }
      return null
    }

    return (
      <div className="space-y-6">
        {/* 이미지 탭 */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveImageTab('normal')}
              className={`px-4 py-2 rounded-lg text-sm ${
                activeImageTab === 'normal'
                  ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                  : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
              }`}
            >
              전체
            </button>
            <button
              onClick={handleAdultTabClick}
              className={`px-4 py-2 rounded-lg text-sm ${
                activeImageTab === 'adult' && isAdultModeEnabled
                  ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                  : !isAdultModeEnabled
                    ? 'bg-secondary-100/70 text-secondary-400 dark:bg-dark-secondary-700/30 dark:text-dark-secondary-500 cursor-not-allowed'
                    : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
              }`}
            >
              짜릿모드
            </button>
          </div>
          <button
            type="button"
            onClick={() => setSelectedImage(selectedImage ? null : filteredImages[0]?.id)}
            className={`px-4 py-2 rounded-lg text-sm ${
              selectedImage
                ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
            }`}
            disabled={filteredImages.length === 0}
          >
            {selectedImage ? '기본 이미지 해제' : '기본 이미지 설정'}
          </button>
        </div>

        {/* 이미지 그리드 */}
        <div className="grid grid-cols-5 gap-4">
          {/* 이미지 목록 (먼저 렌더링) */}
          {filteredImages.map(img => (
            <div
              key={img.id}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                selectedImage === img.id
                  ? 'border-primary-500 dark:border-dark-primary-500'
                  : 'border-secondary-200 dark:border-dark-secondary-200/10'
              }`}
              onClick={() => setSelectedImage(img.id)}
            >
              <Image src={img.url} alt="Character image" fill className="object-cover" />
              <button
                onClick={e => handleImageDelete(img.id, e)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faTimes} className="w-3 h-3" />
              </button>
              {selectedImage === img.id && (
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-primary-500/90 text-white text-xs rounded-full whitespace-nowrap">
                  기본 이미지
                </div>
              )}
            </div>
          ))}

          {/* 이미지 업로드 버튼 (항상 마지막에 위치) */}
          <label className="block aspect-square rounded-lg border-2 border-dashed border-secondary-300 dark:border-dark-secondary-300/20 hover:border-primary-500 dark:hover:border-dark-primary-500 cursor-pointer">
            <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
            <div className="h-full flex flex-col items-center justify-center text-secondary-500 dark:text-dark-secondary-500">
              <FontAwesomeIcon icon={faUpload} className="w-6 h-6 mb-2" />
              <span className="text-sm">이미지 업로드</span>
              <span className="text-xs mt-1">(최대 30개)</span>
            </div>
          </label>
        </div>

        {/* 유효성 검사 메시지 */}
        {renderValidationMessage()}

        {/* 이미지 가이드라인 경고 메시지 */}
        <div className="mt-4 p-4 bg-secondary-50 dark:bg-dark-secondary-100/5 rounded-lg">
          <p className="text-sm text-secondary-800 dark:text-dark-secondary-400 leading-relaxed">
            {activeImageTab === 'adult' && (
              <span className="text-red-500 dark:text-red-400">부적절한 콘텐츠는 업로드가 제한될 수 있습니다.</span>
            )}
            {activeImageTab === 'adult' && <br />}
            성기 노출, 잔인한 장면, 그외 사회 통념상 허용할 수 없는 이미지는 통보 없이 삭제될 수 있습니다.
            <br />
            초상권, 저작권 침해 이미지는 통보 없이 삭제될 수 있습니다.
          </p>
        </div>

        <CharacterVisibilityWarningModal
          isOpen={isVisibilityWarningOpen}
          onClose={() => setIsVisibilityWarningOpen(false)}
          onConfirm={handleVisibilityConfirm}
        />
      </div>
    )
  }

  // 기본 설정 폼 렌더링
  return (
    <div className="space-y-6">
      {/* 이름 입력 */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="name" className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
            이름
          </label>
          <span className="text-xs text-secondary-500 dark:text-dark-secondary-500">{formData.name.length}/25</span>
        </div>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="캐릭터 이름을 입력해 주세요."
          className="w-full px-4 py-3 rounded-lg border border-secondary-200 dark:border-dark-secondary-200/10 bg-white dark:bg-dark-background-light focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500 dark:text-dark-secondary-400"
          maxLength={25}
        />
      </div>

      {/* 성별 선택 */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400 mb-2">성별</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleGenderSelect('male')}
            className={`px-3 py-2 rounded-lg text-center transition-colors text-sm ${
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
            className={`px-3 py-2 rounded-lg text-center transition-colors text-sm ${
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
            className={`px-3 py-2 rounded-lg text-center transition-colors text-sm ${
              formData.gender === 'unspecified'
                ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
            }`}
          >
            알 수 없음
          </button>
        </div>
      </div>

      {/* 게시 범위 */}
      <div>
        <div className="flex justify-between items-start mb-2">
          <label className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
            게시 범위 0 / 3
          </label>
          <button type="button" className="text-xs text-primary-500 dark:text-dark-primary-500 underline">
            게시 범위에 따라 무엇이 달라지나요?
          </button>
        </div>
        <p className="text-xs text-secondary-500 dark:text-dark-secondary-500 mb-2 w-full">
          캐릭터의 게시범위를 정해요!
          {formType === 'edit' && (
            <span className="ml-1 text-red-500 font-medium">(캐릭터 생성 후에는 게시 범위를 변경할 수 없습니다)</span>
          )}
        </p>
        <div className="flex flex-col gap-5 items-start">
          {/* 왼쪽 버튼 영역 */}
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={() => handleVisibilitySelect('private')}
              disabled={formType === 'edit'}
              className={`px-3 py-2 rounded-lg text-center transition-colors text-sm ${
                formData.visibility === 'private'
                  ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                  : formType === 'edit'
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
              }`}
            >
              비공개
            </button>
            <button
              type="button"
              onClick={() => handleVisibilitySelect('public')}
              disabled={formType === 'edit'}
              className={`px-3 py-2 rounded-lg text-center transition-colors text-sm ${
                formData.visibility === 'public'
                  ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                  : formType === 'edit'
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
              }`}
            >
              공개
            </button>
          </div>

          {/* 오른쪽 설명 영역 */}
          <div className="flex-1 bg-secondary-50 dark:bg-dark-secondary-100/5 rounded-lg p-3">
            {formData.visibility === 'private' ? (
              <div>
                <h3 className="font-medium text-sm text-secondary-800 dark:text-dark-secondary-300 mb-1">비공개</h3>
                <ul className="text-xs text-secondary-600 dark:text-dark-secondary-500 space-y-1">
                  <li>• 나만 캐릭터와 대화할 수 있어요.</li>
                  <li>• 캐릭터가 검색되지 않아요.</li>
                  <li>• 최대 3개만 보유할 수 있어요.</li>
                </ul>
              </div>
            ) : (
              <div>
                <h3 className="font-medium text-sm text-secondary-800 dark:text-dark-secondary-300 mb-1">공개</h3>
                <ul className="text-xs text-secondary-600 dark:text-dark-secondary-500 space-y-1">
                  <li>• 모든 유저가 캐릭터와 대화할 수 있어요.</li>
                  <li>• 생성한 공개 캐릭터는 비공개로 바꿀 수 없어요.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 한줄 소개 */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="bio" className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
            한줄 소개
          </label>
          <span className="text-xs text-secondary-500 dark:text-dark-secondary-500">{formData.bio.length}/80</span>
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
          <label
            htmlFor="firstMessage"
            className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400"
          >
            첫 메세지
          </label>
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
          <label className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
            캐릭터 태그
          </label>
          <span className="text-xs text-secondary-500 dark:text-dark-secondary-500">{formData.hashtags.length}/7</span>
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
                    onClick={() => removeHashtag(tag)}
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
          {AVAILABLE_HASHTAGS.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => handleHashtagToggle(tag)}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                formData.hashtags.includes(tag)
                  ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                  : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
              }`}
            >
              {tag}
              {formData.hashtags.includes(tag) && <FontAwesomeIcon icon={faCheck} className="ml-1" />}
            </button>
          ))}
        </div>
      </div>

      {/* 성인 모드 토글 스위치 */}
      <ToggleSwitch className="mt-4" />
    </div>
  )
}
