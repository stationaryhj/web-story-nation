'use client'

import { SectionTransition, FadeIn } from '@/components/motion/PageTransition'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useCharacterFormStore } from '@/store/useCharacterFormStore'
import { useCreateCharacterData } from '@/store/useCreateCharacterData'

import CharacterForm from '@/components/form/CharacterForm'
import { toast } from 'react-toastify'

export default function CreateCharacterPage() {
  const router = useRouter()
  const { activeTab, setActiveTab } = useCharacterFormStore()
  const { formData, checkValidData } = useCreateCharacterData()

  // 유효성 검사 상태
  const [isFormValid, setIsFormValid] = useState(false)
  // 이미지 유효성 검사를 위한 별도 상태
  const [isImageValid, setIsImageValid] = useState(false)

  // 폼 유효성 검사
  useEffect(() => {
    const validateForm = () => {
      if (activeTab === 'basic') {
        return formData.name.trim() !== '' && formData.bio.trim() !== '' && formData.firstMessage.trim() !== ''
      } else if (activeTab === 'detail') {
        // 상세 설정에서의 유효성 검사 - 최소한 상세 설명이 있어야 함
        return formData.bioDetail.trim() !== ''
      } else if (activeTab === 'image') {
        // 이미지 탭에서는 별도의 상태로 관리
        return isImageValid
      }

      return true
    }

    setIsFormValid(validateForm())
  }, [activeTab, formData, isImageValid])

  useEffect(() => {
    setIsFormValid(checkValidData(activeTab))
  }, [formData])

  useEffect(() => {
    console.log('@@@@ isFormValid :: ', isFormValid)
  }, [isFormValid])

  // 이미지 유효성 상태 업데이트 핸들러
  const handleImageValidationChange = (isValid: boolean) => {
    setIsImageValid(isValid)
  }

  // 다음 버튼 클릭 핸들러
  const handleNext = () => {
    if (activeTab === 'basic') {
      setActiveTab('detail')
    } else if (activeTab === 'detail') {
      setActiveTab('image')
    // } else if (activeTab === 'image') {
    //   // 최종 완료 처리
    //   handleSubmit()
    // }
    } else if (activeTab === 'image') {
      setActiveTab('last')
    }
    else if (activeTab === 'last') {
      // 최종 완료 처리
      handleSubmit()
    }
  }

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    try {
      toast.success('캐릭터가 성공적으로 생성되었습니다!')
      // router.push('/my-characters')
    } catch (error) {
      console.error('캐릭터 생성 실패:', error)
      toast.error('캐릭터 생성에 실패했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark-background pb-20">
      <SectionTransition>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white dark:bg-dark-background-light rounded-xl shadow-sm overflow-hidden">
            {/* 상단 탭 네비게이션 */}
            <div className="border-b border-secondary-200 dark:border-dark-secondary-200/10 flex"
              style={{
                wordBreak: 'keep-all',
              }}
            >
              <button
                className={`flex-1 py-4 px-2 text-center ${
                  activeTab === 'basic'
                    ? 'bg-primary-50 dark:bg-dark-primary-900/10 text-primary-600 dark:text-dark-primary-500 font-medium'
                    : 'text-secondary-500 dark:text-dark-secondary-500'
                }`}
                onClick={() => setActiveTab('basic')}
              >
                <p>기본 프로필</p>
              </button>
              <button
                className={`flex-1 py-4 px-2 text-center ${
                  activeTab === 'detail'
                    ? 'bg-primary-50 dark:bg-dark-primary-900/10 text-primary-600 dark:text-dark-primary-500 font-medium'
                    : 'text-secondary-500 dark:text-dark-secondary-500'
                }`}
                onClick={() => setActiveTab('detail')}
              >
                <p>고급 설정</p>
              </button>
              <button
                className={`flex-1 py-4 px-2 text-center ${
                  activeTab === 'image'
                    ? 'bg-primary-50 dark:bg-dark-primary-900/10 text-primary-600 dark:text-dark-primary-500 font-medium'
                    : 'text-secondary-500 dark:text-dark-secondary-500'
                }`}
                onClick={() => setActiveTab('image')}
              >
                <p>멀티 이미지</p>
              </button>
              <button
                className={`flex-1 py-4 px-2 text-center ${
                  activeTab === 'last'
                    ? 'bg-primary-50 dark:bg-dark-primary-900/10 text-primary-600 dark:text-dark-primary-500 font-medium'
                    : 'text-secondary-500 dark:text-dark-secondary-500'
                }`}
                onClick={() => setActiveTab('last')}
              >
                <p>마무리 설정</p>
              </button>
            </div>

            {/* 폼 컨텐츠 */}
            <div className="p-6">
              <FadeIn>
                <CharacterForm
                  formType="create"
                  mode={activeTab}
                  // onValidationChange={activeTab === 'image' ? handleImageValidationChange : undefined}
                />
              </FadeIn>
            </div>

            {/* 하단 버튼 */}
            <div className="p-6 border-t border-secondary-200 dark:border-dark-secondary-200/10 flex justify-between">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 bg-secondary-100 hover:bg-secondary-200 text-secondary-700 rounded-lg transition-colors dark:bg-dark-secondary-100/10 dark:hover:bg-dark-secondary-100/20 dark:text-dark-secondary-400"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!isFormValid}
                className={`px-6 py-3 rounded-lg transition-colors ${
                  isFormValid
                    ? 'bg-primary-500 hover:bg-primary-600 text-white dark:bg-dark-primary-500 dark:hover:bg-dark-primary-600'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                {activeTab === 'last' ? '완료' : '다음'}
              </button>
            </div>
          </div>
        </div>
      </SectionTransition>
    </div>
  )
}
