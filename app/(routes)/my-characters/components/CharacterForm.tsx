'use client'

import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faUpload, faTimes } from '@fortawesome/free-solid-svg-icons'
import { useCharacterFormStore, useImageStore } from '../../../../store/useCharacterFormStore'
import DetailCharacterPage from '../create/detail/page'

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
}

export default function CharacterForm({ formType, mode }: CharacterFormProps) {
  const { formData, setFormField, addHashtag, removeHashtag } = useCharacterFormStore()

  const { images, activeImageTab, setActiveImageTab, addImage, removeImage } = useImageStore()

  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // 이미지 배열이 없는 경우를 대비한 안전 조치
  useEffect(() => {
    if (!formData.images) {
      setFormField('images', [])
    }
  }, [formData, setFormField])

  // 입력 필드 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const img = new Image()
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
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  const handleImageDelete = (id: string, e?: React.MouseEvent) => {
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
          </p>
          <div className="flex space-x-6 items-start">
            {/* 왼쪽 버튼 영역 */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleVisibilitySelect('private')}
                className={`px-3 py-2 rounded-lg text-center transition-colors text-sm ${
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
                className={`px-3 py-2 rounded-lg text-center transition-colors text-sm ${
                  formData.visibility === 'public'
                    ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
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
      </div>
    )
  }

  // 이미지 설정 폼 렌더링
  return (
    <div className="space-y-6">
      <div>
        <div className="flex border-b border-secondary-200 dark:border-dark-secondary-200/10 mb-6">
          <button
            onClick={() => setActiveImageTab('all')}
            className={`py-3 px-6 font-medium ${
              activeImageTab === 'all'
                ? 'text-primary-600 border-b-2 border-primary-500 dark:text-dark-primary-500 dark:border-dark-primary-500'
                : 'text-secondary-500 dark:text-dark-secondary-500'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setActiveImageTab('adult')}
            className={`py-3 px-6 font-medium ${
              activeImageTab === 'adult'
                ? 'text-primary-600 border-b-2 border-primary-500 dark:text-dark-primary-500 dark:border-dark-primary-500'
                : 'text-secondary-500 dark:text-dark-secondary-500'
            }`}
          >
            성인
          </button>
          <button
            onClick={() => setActiveImageTab('adult2')}
            className={`py-3 px-6 font-medium ${
              activeImageTab === 'adult2'
                ? 'text-primary-600 border-b-2 border-primary-500 dark:text-dark-primary-500 dark:border-dark-primary-500'
                : 'text-secondary-500 dark:text-dark-secondary-500'
            }`}
          >
            성인2
          </button>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
              이미지 등록
            </label>
            <span className="text-xs text-secondary-500 dark:text-dark-secondary-500">{images?.length || 0}/30</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
            {/* 이미지 업로드 버튼 */}
            <label className="relative flex flex-col items-center justify-center h-40 border-2 border-dashed border-secondary-300 dark:border-dark-secondary-300/20 rounded-lg cursor-pointer bg-secondary-50 dark:bg-dark-secondary-100/5 hover:bg-secondary-100 dark:hover:bg-dark-secondary-100/10 transition-colors">
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <FontAwesomeIcon
                  icon={faUpload}
                  className="text-secondary-400 dark:text-dark-secondary-500 text-xl mb-2"
                />
                <span className="text-secondary-500 dark:text-dark-secondary-500 text-sm">이미지 업로드</span>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} multiple />
            </label>

            {/* 이미지 그리드 - 현재 선택된 탭에 해당하는 이미지만 표시 */}
            {images
              ?.filter(img => activeImageTab === 'all' || img.type === activeImageTab)
              .map(image => (
                <div
                  key={image.id}
                  className={`relative rounded-lg overflow-hidden h-40 group ${
                    selectedImage === image.id ? 'ring-2 ring-primary-500 dark:ring-dark-primary-500' : ''
                  }`}
                  onClick={() => setSelectedImage(image.id)}
                >
                  <img src={image.url} alt="Character Image" className="w-full h-full object-cover" />
                  <div className="absolute top-0 right-0 p-2 z-20" onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      className="bg-secondary-800/80 hover:bg-red-600 text-white w-8 h-8 flex items-center justify-center rounded-full shadow-md transition-colors"
                      onClick={e => handleImageDelete(image.id, e)}
                      aria-label="이미지 삭제"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                  <div className="absolute inset-0 bg-secondary-900/10 group-hover:bg-secondary-900/0 transition-colors"></div>
                </div>
              ))}
          </div>
        </div>

        <div className="text-xs text-secondary-600 dark:text-dark-secondary-500 space-y-1 p-4 bg-secondary-50 dark:bg-dark-secondary-100/5 rounded-lg">
          <p>• 성기 노출, 잔인한 장면, 그외 사회 통념상 허용할 수 없는 이미지는 통보 없이 삭제될 수 있습니다.</p>
          <p>• 초상권, 저작권 침해 이미지는 통보 없이 삭제될 수 있습니다.</p>
          <p>• 10MB 이하의 이미지만 업로드할 수 있습니다.</p>
        </div>
      </div>
    </div>
  )
}
