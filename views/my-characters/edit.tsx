'use client'

import { SectionTransition, FadeIn } from '@/components/motion/PageTransition'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useCharacterFormStore } from '@/store/useCharacterFormStore'
import CharacterForm from '@/components/form/CharacterForm'

import { ReqGetCreateChatBotInProgress, ReqSaveCreateChatBotInProgress } from '@/services/hooks/DataListManager'
import { bridgeCharacterInProgressToCharacter } from '@/lib/utils/storyNationUtil'


// 임시 데이터 (실제로는 API에서 가져옴)
const MOCK_CHARACTER = {
  id: '1',
  name: '고양이 앤지',
  gender: 'female',
  visibility: 'private',
  bio: '뾰로롱~ 고양이 앤지에요! 집사님과 놀아요~',
  firstMessage: '안녕하세요 집사님~! 오늘은 저를 얼마나 예뻐해 주실 건가요?',
  hashtags: ['#로맨스', '#판타지', '#성장'],
  bioDetail:
    '한국의 서울에 사는 4살 고양이입니다. 츤데레 성격이지만 마음은 따뜻해요. 집사를 좋아하고 츄르를 좋아해요. 가끔 새침하게 굴지만 관심을 많이 받고 싶어하는 귀여운 성격이에요.',
  detailVisibility: 'private',
  conversationExamples: [
    {
      id: '1',
      text: '집사: 앤지야 오늘 뭐하고 놀까?\n앤지: 츄르주면 같이 놀아줄게냥. 아, 딱히 놀고싶어서가 아니라 심심해서 그런거야!',
      isEditing: false,
      visibility: 'private',
    },
    {
      id: '2',
      text: '집사: 앤지 오늘 너무 귀엽다~\n앤지: 흥! 당연하지! 난 매일 귀여운걸! ...근데 오늘은 특별히 더 귀엽다고...?',
      isEditing: false,
      visibility: 'private',
    },
  ],
  imageUrl: '/images/character-1.jpg',
}

export default function EditCharacterPage() {
  const params = useParams()
  const characterId = params.id as string

  const router = useRouter()
  const { activeTab, setActiveTab, formData, setFormField, resetForm } = useCharacterFormStore()

  const {
    data: inProgressData,
    isLoading: inProgressLoading,
    error: inProgressError, 
    refetch: inProgressRefetch
  } = ReqGetCreateChatBotInProgress(Number(characterId));
  
  // 유효성 검사 상태
  const [isFormValid, setIsFormValid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // 캐릭터 데이터 로드
  useEffect(() => {
    const loadCharacter = async () => {
      try {
        setIsLoading(true)
        
        if (inProgressData) {
          resetForm() // 이전 데이터 초기화
          
          // API 데이터 브릿지 함수를 사용하여 변환
          const characterData = bridgeCharacterInProgressToCharacter(inProgressData?.chrbot)
          
          // 캐릭터 데이터를 스토어에 설정
          Object.entries(characterData).forEach(([key, value]) => {
            if (key !== 'id') {
              setFormField(key as any, value)
            }
          })
        }

        setIsLoading(false)
      } catch (error) {
        console.error('캐릭터 로딩 실패:', error)
        setError('캐릭터를 불러오는 중 오류가 발생했습니다.')
        setIsLoading(false)
      }
    }

    if (!inProgressLoading && inProgressData) {
      loadCharacter()
    }

    // 컴포넌트 언마운트 시 폼 초기화
    return () => {
      resetForm()
    }
  }, [characterId, resetForm, setFormField, inProgressData, inProgressLoading])

  // 폼 유효성 검사
  useEffect(() => {
    const validateForm = () => {
      if (activeTab === 'basic') {
        return formData.name?.trim() !== '' && formData.bio?.trim() !== '' && formData.firstMessage?.trim() !== ''
      } else if (activeTab === 'detail') {
        // 상세 설정에서의 유효성 검사 - 최소한 상세 설명이 있어야 함
        return formData.bioDetail?.trim() !== ''
      }

      return true
    }

    setIsFormValid(validateForm())
  }, [activeTab, formData])

  // API 호출하여 현재 진행 상태 저장
  const saveProgress = async (finishYn = 0) => {
    try {
      setIsSaving(true);
      
      // 폼 데이터에서 API 요청에 필요한 데이터 추출
      const payload = {
        world_list_detail_chrbot_key: characterId,
        img_url: inProgressData?.chrbot?.img_url || '',
        title: formData.name || '',
        gender: formData.gender === 'male' ? 1 : (formData.gender === 'female' ? 2 : 0),
        intro: formData.bio || '',
        first_talk: formData.firstMessage || '',
        content: formData.bioDetail || '',
        example: formData.conversationExamples?.map(example => example.text).join('\n\n') || '',
        nsfw: inProgressData?.chrbot?.nsfw || 0,
        img_url_nsfw: inProgressData?.chrbot?.img_url_nsfw || '',
        show_yn: formData.visibility === 'public' ? 1 : 0,
        content_show_yn: inProgressData?.chrbot?.content_show_yn || 0,
        example_show_yn: inProgressData?.chrbot?.example_show_yn || 0,
        finish_yn: finishYn,
      };
      
      // API 호출
      const response = await ReqSaveCreateChatBotInProgress(payload);
      
      if (response.error) {
        throw new Error(response.error.toString());
      }
      
      return true;
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // 다음 버튼 클릭 핸들러
  const handleNext = async () => {
    // 현재 단계 저장
    const saveResult = await saveProgress();
    if (!saveResult) return;
    
    if (activeTab === 'basic') {
      setActiveTab('detail');
    } else if (activeTab === 'detail') {
      setActiveTab('image');
    } else if (activeTab === 'image') {
      // 최종 완료 처리
      handleSubmit();
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    try {
      // 완료 상태로 저장
      const saveResult = await saveProgress(1);
      if (!saveResult) return;
      
      alert('캐릭터가 성공적으로 수정되었습니다!');
      router.push('/my-characters');
    } catch (error) {
      console.error('캐릭터 수정 실패:', error);
      alert('캐릭터 수정에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if (inProgressLoading || isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50 dark:bg-dark-background flex items-center justify-center">
        <div className="animate-pulse text-secondary-500 dark:text-dark-secondary-500">
          캐릭터 정보를 불러오는 중...
        </div>
      </div>
    )
  }

  if (inProgressError || error) {
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
                <CharacterForm formType="edit" mode={activeTab} />
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
