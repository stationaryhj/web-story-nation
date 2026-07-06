'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import CharacterForm from '@/components/form/CharacterForm';
import { FadeIn, SectionTransition } from '@/components/motion/PageTransition';
import { useCharacterFormStore } from '@/store/useCharacterFormStore';
import { useCreateCharacterData } from '@/store/useCreateCharacterData';

export default function CreateCharacterPage() {
  const router = useRouter();
  const { activeTab, setActiveTab } = useCharacterFormStore();
  const { formData, checkValidData } = useCreateCharacterData();

  // 유효성 검사 상태
  const [isFormValid, setIsFormValid] = useState(false);
  // 이미지 유효성 검사를 위한 별도 상태
  const [isImageValid, setIsImageValid] = useState(false);

  // 폼 유효성 검사
  useEffect(() => {
    const validateForm = () => {
      if (activeTab === 'basic') {
        return (
          formData.name.trim() !== '' &&
          formData.bio.trim() !== '' &&
          formData.firstMessage.trim() !== ''
        );
      } else if (activeTab === 'detail') {
        // 상세 설정에서의 유효성 검사 - 최소한 상세 설명이 있어야 함
        return formData.bioDetail.trim() !== '';
      } else if (activeTab === 'image') {
        // 이미지 탭에서는 별도의 상태로 관리
        return isImageValid;
      }

      return true;
    };

    setIsFormValid(validateForm());
  }, [activeTab, formData, isImageValid]);

  useEffect(() => {
    setIsFormValid(checkValidData(activeTab));
  }, [formData]);

  useEffect(() => {
    console.log('@@@@ isFormValid :: ', isFormValid);
  }, [isFormValid]);

  // 이미지 유효성 상태 업데이트 핸들러
  const handleImageValidationChange = (isValid: boolean) => {
    setIsImageValid(isValid);
  };

  // 다음 버튼 클릭 핸들러
  const handleNext = () => {
    if (activeTab === 'basic') {
      setActiveTab('detail');
    } else if (activeTab === 'detail') {
      setActiveTab('image');
      // } else if (activeTab === 'image') {
      //   // 최종 완료 처리
      //   handleSubmit()
      // }
    } else if (activeTab === 'image') {
      setActiveTab('last');
    } else if (activeTab === 'last') {
      // 최종 완료 처리
      handleSubmit();
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    try {
      toast.success('캐릭터가 성공적으로 생성되었습니다!');
      // router.push('/my-characters')
    } catch (error) {
      console.error('캐릭터 생성 실패:', error);
      toast.error('캐릭터 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className='min-h-screen bg-surface pb-20'>
      <SectionTransition>
        <div className='container mx-auto px-4 py-8'>
          <div className='bg-surface-elevated rounded-xl shadow-sm overflow-hidden'>
            {/* 상단 탭 네비게이션 */}
            <div
              className='border-b border-border-default flex'
              style={{
                wordBreak: 'keep-all',
              }}
            >
              <button
                type='button'
                className={`flex-1 py-4 px-2 text-center ${
                  activeTab === 'basic' ? 'bg-brand/10 text-brand font-medium' : 'text-text-muted'
                }`}
                onClick={() => setActiveTab('basic')}
              >
                <p>기본 프로필</p>
              </button>
              <button
                type='button'
                className={`flex-1 py-4 px-2 text-center ${
                  activeTab === 'detail' ? 'bg-brand/10 text-brand font-medium' : 'text-text-muted'
                }`}
                onClick={() => setActiveTab('detail')}
              >
                <p>고급 설정</p>
              </button>
              <button
                type='button'
                className={`flex-1 py-4 px-2 text-center ${
                  activeTab === 'image' ? 'bg-brand/10 text-brand font-medium' : 'text-text-muted'
                }`}
                onClick={() => setActiveTab('image')}
              >
                <p>멀티 이미지</p>
              </button>
              <button
                type='button'
                className={`flex-1 py-4 px-2 text-center ${
                  activeTab === 'last' ? 'bg-brand/10 text-brand font-medium' : 'text-text-muted'
                }`}
                onClick={() => setActiveTab('last')}
              >
                <p>마무리 설정</p>
              </button>
            </div>

            {/* 폼 컨텐츠 */}
            <div className='p-6'>
              <FadeIn>
                <CharacterForm
                  formType='create'
                  mode={activeTab}
                  // onValidationChange={activeTab === 'image' ? handleImageValidationChange : undefined}
                />
              </FadeIn>
            </div>

            {/* 하단 버튼 */}
            <div className='p-6 border-t border-border-default flex justify-between'>
              <button
                type='button'
                onClick={() => router.back()}
                className='px-6 py-3 border border-border-default bg-surface-elevated hover:bg-surface-elevated-hover text-text-primary rounded-lg transition-colors'
              >
                취소
              </button>
              <button
                type='button'
                onClick={handleNext}
                disabled={!isFormValid}
                className={`px-6 py-3 rounded-lg transition-colors ${
                  isFormValid
                    ? 'bg-brand hover:bg-brand-hover text-text-inverse'
                    : 'bg-surface-elevated-hover text-text-muted cursor-not-allowed'
                }`}
              >
                {activeTab === 'last' ? '완료' : '다음'}
              </button>
            </div>
          </div>
        </div>
      </SectionTransition>
    </div>
  );
}
