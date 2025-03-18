'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SectionTransition, FadeIn } from '@/components/ui/motion/PageTransition'
import { useCharacterFormStore } from '../../../../store/useCharacterFormStore'
import CharacterForm from '../components/CharacterForm'
import Card from '@/components/ui/features/card/Card'

export default function CreateCharacterPage() {
  const router = useRouter()
  const { activeTab, setActiveTab, formData } = useCharacterFormStore()

  // 유효성 검사 상태
  const [isFormValid, setIsFormValid] = useState(false)

  // 폼 유효성 검사
  useEffect(() => {
    const validateForm = () => {
      if (activeTab === 'basic') {
        return formData.name.trim() !== '' && formData.bio.trim() !== '' && formData.firstMessage.trim() !== ''
      } else if (activeTab === 'detail') {
        // 상세 설정에서의 유효성 검사 - 최소한 상세 설명이 있어야 함
        return formData.bioDetail.trim() !== ''
      }

      return true
    }

    setIsFormValid(validateForm())
  }, [activeTab, formData])

  // 다음 버튼 클릭 핸들러
  const handleNext = () => {
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
      // API 호출 (실제 구현 시 추가)
      // const response = await fetch('/api/characters', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // })

      // 임시 처리 (성공으로 가정)
      alert('캐릭터가 성공적으로 생성되었습니다!')
      router.push('/my-characters')
    } catch (error) {
      console.error('캐릭터 생성 실패:', error)
      alert('캐릭터 생성에 실패했습니다. 다시 시도해주세요.')
    }
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
                <CharacterForm formType="create" mode={activeTab} />
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
                    : 'bg-primary-300 text-white cursor-not-allowed dark:bg-dark-primary-800 dark:text-dark-secondary-300'
                }`}
              >
                {activeTab === 'image' ? '완료' : '다음'}
              </button>
            </div>
          </div>
        </div>
      </SectionTransition>
    </div>
  )
}
