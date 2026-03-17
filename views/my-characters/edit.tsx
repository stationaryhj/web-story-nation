'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import { toast } from 'react-toastify'
import CharacterForm from '@/components/form/CharacterForm'
import { FadeIn, SectionTransition } from '@/components/motion/PageTransition'
import { GetCreateChatBotListMine } from '@/services/hooks/DataListManager'
import { useAccountStore } from '@/store/useAccountStore'
import { isFormValid as checkFormValidity, useCreateCharacterData } from '@/store/useCreateCharacterData'
import { useModalStore } from '@/store/useStoreModal'

export default function EditCharacterPage() {
  const myNickName = useAccountStore.getState().data?.nick_nm
  const { data: inProgressData } = GetCreateChatBotListMine(myNickName || '', 1, 50)
  const privateOpenCharacterCount =
    inProgressData?.chrbotList.data.filter(char => char.finish_yn === 1 && char.show_yn === 0).length || 0

  const { openModal, closeModal } = useModalStore()

  const params = useParams()
  const characterId = params?.id as string

  const router = useRouter()
  const {
    activeTab,
    formData,
    isLoadingData,
    isSaving,
    error: storeError,
    setActiveTab,
    resetForm,
    fetchInProgressData,
    saveInProgress,
    saveMultiImages,
    checkValidData,
    setVaild,
  } = useCreateCharacterData()

  // 유효성 검사 상태
  const [error, setError] = useState<string | null>(null)
  // 유효하지 않은 필드 상태 관리
  const [invalidFields, setInvalidFields] = useState<{ [key: string]: boolean }>({
    name: false,
    bio: false,
    firstMessage: false,
    hashtags: false,
    imgUrl: false,
    imgUrlNsfw: false,
    image: false,
  })

  // 폼 제출 시도 중임을 나타내는 상태 설정
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 캐릭터 데이터 로드
  useEffect(() => {
    const loadCharacter = async () => {
      try {
        await fetchInProgressData(Number(characterId))
      } catch (loadError) {
        console.error('캐릭터 로딩 실패:', loadError)
        setError('캐릭터를 불러오는 중 오류가 발생했습니다.')
      }
    }

    loadCharacter()

    // 컴포넌트 언마운트 시 폼 초기화
    return () => {
      resetForm()
    }
  }, [characterId, resetForm, fetchInProgressData])

  // 이 부분은 유지: 각 개별 필드 값이 입력되었을 때만 해당 필드의 에러 상태 초기화
  useEffect(() => {
    if (formData.name.trim()) {
      setInvalidFields(prev => ({ ...prev, name: false }))
    }
  }, [formData.name])

  useEffect(() => {
    if (formData.bio.trim()) {
      setInvalidFields(prev => ({ ...prev, bio: false }))
    }
  }, [formData.bio])

  useEffect(() => {
    if (formData.firstMessage.trim()) {
      setInvalidFields(prev => ({ ...prev, firstMessage: false }))
    }
  }, [formData.firstMessage])

  useEffect(() => {
    if (formData.hashtags.length > 0) {
      setInvalidFields(prev => ({ ...prev, hashtags: false }))
    }
  }, [formData.hashtags])

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    try {
      // 기본 설정 부분에서 필수값 미입력 시 저장 불가, 미입력한 부분으로 페이지 이동 및 focus
      const isFormValid = checkFormValidity(formData, activeTab)

      if (!isFormValid) {
        // 유효하지 않은 필드 표시
        const newInvalidFields = {
          name: !formData.name?.trim(),
          bio: !formData.bio?.trim(),
          firstMessage: !formData.firstMessage?.trim(),
          hashtags: formData.hashtags.length === 0,
          imgUrl: !formData.imgUrl?.trim(),
          imgUrlNsfw: !formData.imgUrlNsfw?.trim(),
          image:
            formData.rating === 'adult'
              ? !formData.imgUrl?.trim() || !formData.imgUrlNsfw?.trim()
              : !formData.imgUrl?.trim(),
        }

        // 먼저 invalidFields 설정 - 이를 참조하는 다른 UI 업데이트보다 먼저 실행
        setInvalidFields(newInvalidFields)

        // 폼 제출 시도 중임을 나타내는 상태 설정
        setIsSubmitting(true)

        // 일정 시간 후 제출 시도 상태 초기화
        setTimeout(() => setIsSubmitting(false), 2000)

        // flushSync를 사용하여 탭 변경을 즉시 완료한 후 invalidFields 설정
        await flushSync(() => {
          // 이용 등급에 따라 필요한 이미지 확인
          if (formData.rating === 'adult') {
            // 성인 등급인 경우: 성인 이미지 또는 기본 이미지가 없으면 이미지 탭으로 이동
            if (newInvalidFields.imgUrlNsfw || newInvalidFields.imgUrl) {
              setActiveTab('image')
            } else {
              setActiveTab('basic')
            }
          } else {
            // 전체 이용가인 경우: 기본 이미지가 없으면 이미지 탭으로 이동
            if (newInvalidFields.imgUrl) {
              setActiveTab('image')
            } else {
              setActiveTab('basic')
            }
          }
        })

        // 필수 입력 항목 누락 시 탭에 따라 다른 메시지 표시
        if (activeTab === 'image') {
          // 이미지 탭에서는 toast 메시지를 표시하지 않음 (ImageUploadForm에서 처리)
        } else {
          toast.error('필수값이 입력되지 않았습니다.')
        }
        return
      }

      if (formData.finish_yn === 0 && formData.visibility === 'public') {
        openModal('confirmAction', {
          title: '캐릭터 공개 시 주의사항',
          description: '한 번 공개한 캐릭터는 비공개로 전환할 수 없어요!',
          onConfirm: async () => {
            const saveResult = await saveInProgress(1)
            if (!saveResult) return
            setActiveTab('basic')
            closeModal()
            router.push('/my-characters')
          },
          confirmText: '확인',
          confirmButtonClass: 'bg-red-500 hover:bg-red-600 text-white',
        })
        return
      }

      const saveResult = await saveInProgress(1)
      setActiveTab('basic')
      router.push('/my-characters')
    } catch (error) {
      console.error('캐릭터 수정 실패:', error)
      toast.error('캐릭터 수정에 실패했습니다. 다시 시도해주세요.')
    }
  }

  useEffect(() => {
    // 뒤로가기를 포함한 모든 라우트 변경 전에 실행
    setActiveTab('basic')

    // 뒤로가기 감지를 위한 이벤트 리스너
    const handleRouteChange = () => {
      setActiveTab('basic')
    }

    window.addEventListener('popstate', handleRouteChange)

    // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [])

  const handleSaveToNextStep = async () => {
    console.log('handleSaveToNextStep')

    if (activeTab === 'basic') {
      const result = handleNextStep('detail')
      if (result) await saveInProgress()
    } else if (activeTab === 'detail') {
      const result = handleNextStep('image')
      if (result) await saveInProgress()
    } else if (activeTab === 'image') {
      const result = handleNextStep('last')
      if (result) await saveMultiImages()
    } else if (activeTab === 'last') {
      // 최종 완료 처리
      handleSubmit()
    }
  }

  const handleNextStep = (type: 'basic' | 'detail' | 'image' | 'last') => {
    const isFormValid = checkValidData(type)

    if (!isFormValid) {
      setVaild(true)
      toast.error('필수값이 입력되지 않았습니다.')
      return false
    }

    setActiveTab(type)
    return true
  }

  if (isLoadingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary-50 dark:bg-dark-background">
        <div className="animate-pulse text-secondary-500 dark:text-dark-secondary-500">
          캐릭터 정보를 불러오는 중...
        </div>
      </div>
    )
  }

  if (storeError || error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary-50 dark:bg-dark-background">
        <div className="text-red-500 dark:text-red-400">{error || '데이터를 불러오는데 실패했습니다.'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50 pb-20 dark:bg-dark-background">
      <SectionTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-dark-background-light">
            {/* 상단 탭 네비게이션 */}
            <div
              className="flex border-b border-secondary-200 dark:border-dark-secondary-200/10"
              style={{ wordBreak: 'keep-all' }}
            >
              <button
                type="button"
                className={`flex-1 px-2 py-4 text-center ${
                  activeTab === 'basic'
                    ? 'bg-primary-50 font-medium text-primary-600 dark:bg-dark-primary-900/10 dark:text-dark-primary-500'
                    : 'text-secondary-500 dark:text-dark-secondary-500'
                }`}
                onClick={() => handleNextStep('basic')}
              >
                <p>기본 프로필</p>
              </button>
              <button
                type="button"
                className={`flex-1 px-2 py-4 text-center ${
                  activeTab === 'detail'
                    ? 'bg-primary-50 font-medium text-primary-600 dark:bg-dark-primary-900/10 dark:text-dark-primary-500'
                    : 'text-secondary-500 dark:text-dark-secondary-500'
                }`}
                onClick={() => handleNextStep('detail')}
              >
                <p>고급 설정</p>
              </button>
              <button
                className={`flex-1 px-2 py-4 text-center ${
                  activeTab === 'image'
                    ? 'bg-primary-50 font-medium text-primary-600 dark:bg-dark-primary-900/10 dark:text-dark-primary-500'
                    : 'text-secondary-500 dark:text-dark-secondary-500'
                }`}
                onClick={() => handleNextStep('image')}
              >
                <p>멀티 이미지</p>
              </button>
              <button
                type="button"
                className={`flex-1 px-2 py-4 text-center ${
                  activeTab === 'last'
                    ? 'bg-primary-50 font-medium text-primary-600 dark:bg-dark-primary-900/10 dark:text-dark-primary-500'
                    : 'text-secondary-500 dark:text-dark-secondary-500'
                }`}
                onClick={() => handleNextStep('last')}
              >
                <p>마무리 설정</p>
              </button>
            </div>

            {/* 폼 컨텐츠 */}
            <div className="p-6">
              <FadeIn>
                <CharacterForm
                  formType="edit"
                  mode={activeTab}
                  invalidFields={invalidFields}
                  isSubmitting={isSubmitting}
                  privateOpenCharacterCount={privateOpenCharacterCount}
                />
              </FadeIn>
            </div>

            {/* 하단 버튼 */}
            <div className="flex justify-between border-t border-secondary-200 p-6 dark:border-dark-secondary-200/10">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-lg bg-secondary-100 px-6 py-3 text-xs text-secondary-700 transition-colors hover:bg-secondary-200 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400 dark:hover:bg-dark-secondary-100/20 sm:text-base"
                disabled={isSaving}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveToNextStep}
                disabled={isSaving}
                className={`rounded-lg px-6 py-3 transition-colors ${
                  !isSaving
                    ? 'bg-primary-500 text-xs text-white hover:bg-primary-600 dark:bg-dark-primary-500 dark:hover:bg-dark-primary-600 sm:text-base'
                    : 'cursor-not-allowed bg-primary-300 text-white dark:bg-dark-primary-800 dark:text-dark-secondary-300'
                }`}
              >
                {isSaving ? '저장 중...' : activeTab === 'last' ? '완료' : '다음'}
              </button>
            </div>
          </div>

          <div id="scrollRef"></div>
        </div>
      </SectionTransition>
    </div>
  )
}
