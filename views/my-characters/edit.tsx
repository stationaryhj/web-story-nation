'use client'

import { SectionTransition, FadeIn } from '@/components/motion/PageTransition'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useCreateCharacterData, isFormValid as checkFormValidity } from '@/store/useCreateCharacterData'
import CharacterForm from '@/components/form/CharacterForm'
import { toast } from 'react-toastify'

export default function EditCharacterPage() {
  const params = useParams()
  const characterId = params?.id as string

  const router = useRouter()
  const {
    activeTab,
    setActiveTab,
    formData,
    resetForm,
    fetchInProgressData,
    saveInProgress,
    isLoadingData,
    isSaving,
    error: storeError,
  } = useCreateCharacterData()

  // 유효성 검사 상태
  const [isFormValid, setIsFormValid] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  // 폼 유효성 검사
  useEffect(() => {
    const validateCurrentForm = () => {
      return checkFormValidity(formData, activeTab)
    }

    setIsFormValid(validateCurrentForm())
  }, [activeTab, formData])

  // 다음 버튼 클릭 핸들러
  const handleNext = async () => {
    // 현재 단계 저장
    const saveResult = await saveInProgress()
    if (!saveResult) return

    if (activeTab === 'basic') {
      setActiveTab('detail')
    } else if (activeTab === 'detail') {
      setActiveTab('image')
    } else if (activeTab === 'image') {
      // 최종 완료 처리
      handleSubmit()
    }
  }

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    try {
      // 완료 상태로 저장

      // 기본 설정 부분에서 필수값 미입력 시 저장 불가, 미입력한 부분으로 페이지 이동 및 focus
      // 기본 설정 부분에서 필수값 미입력 시 저장 불가, 미입력한 부분으로 페이지 이동 및 focus
      // 기본 설정 부분에서 필수값 미입력 시 저장 불가, 미입력한 부분으로 페이지 이동 및 focus

      const saveResult = await saveInProgress(1)
      if (!saveResult) return

      toast.success('캐릭터가 성공적으로 수정되었습니다!')
      router.push('/my-characters')
    } catch (error) {
      console.error('캐릭터 수정 실패:', error)
      toast.error('캐릭터 수정에 실패했습니다. 다시 시도해주세요.')
    }
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-background flex items-center justify-center">
        <div className="animate-pulse text-secondary-500 dark:text-dark-secondary-500">
          캐릭터 정보를 불러오는 중...
        </div>
      </div>
    )
  }

  if (storeError || error) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-background flex items-center justify-center">
        <div className="text-red-500 dark:text-red-400">{error || '데이터를 불러오는데 실패했습니다.'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-background pb-20">
      <SectionTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white dark:bg-dark-background-light rounded-xl shadow-sm overflow-hidden">
            {/* 상단 탭 네비게이션 */}
            <div className="border-b border-secondary-200 dark:border-dark-secondary-200/10 flex">
              <button
                className={`flex-1 py-4 px-6 text-center ${
                  activeTab === 'basic'
                    ? 'bg-primary-50 dark:bg-dark-primary-900/10 text-primary-600 dark:text-dark-primary-500 font-medium'
                    : 'text-secondary-500 dark:text-dark-secondary-500'
                }`}
                onClick={() => setActiveTab('basic')}
              >
                기본설정
              </button>
              <button
                className={`flex-1 py-4 px-6 text-center ${
                  activeTab === 'detail'
                    ? 'bg-primary-50 dark:bg-dark-primary-900/10 text-primary-600 dark:text-dark-primary-500 font-medium'
                    : 'text-secondary-500 dark:text-dark-secondary-500'
                }`}
                onClick={() => setActiveTab('detail')}
              >
                상세설정
              </button>
              <button
                className={`flex-1 py-4 px-6 text-center ${
                  activeTab === 'image'
                    ? 'bg-primary-50 dark:bg-dark-primary-900/10 text-primary-600 dark:text-dark-primary-500 font-medium'
                    : 'text-secondary-500 dark:text-dark-secondary-500'
                }`}
                onClick={() => setActiveTab('image')}
              >
                이미지
              </button>
            </div>

            {/* 폼 컨텐츠 */}
            <div className="p-6">
              <FadeIn>
                <CharacterForm formType="edit" mode={activeTab} onValidationChange={setIsFormValid} />
              </FadeIn>
            </div>

            {/* 하단 버튼 */}
            <div className="p-6 border-t border-secondary-200 dark:border-dark-secondary-200/10 flex justify-between">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 rounded-lg transition-colors dark:bg-dark-secondary-100/10 dark:hover:bg-dark-secondary-100/20 dark:text-dark-secondary-400"
                disabled={isSaving}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!isFormValid || isSaving}
                className={`px-6 py-3 rounded-lg transition-colors ${
                  isFormValid && !isSaving
                    ? 'bg-primary-500 hover:bg-primary-600 text-white dark:bg-dark-primary-500 dark:hover:bg-dark-primary-600'
                    : 'bg-primary-300 text-white cursor-not-allowed dark:bg-dark-primary-800 dark:text-dark-secondary-300'
                }`}
              >
                {isSaving ? '저장 중...' : activeTab === 'image' ? '완료' : '다음'}
              </button>
            </div>
          </div>
        </div>
      </SectionTransition>
    </div>
  )
}
