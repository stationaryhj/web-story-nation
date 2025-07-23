'use client'

import React, { useEffect } from 'react'
import { useCreateCharacterData } from '@/store/useCreateCharacterData'

import BasicInfoForm from './character/BasicInfoForm'
import DetailInfoForm from './character/DetailInfoForm'
import ImageUploadForm from './character/ImageUploadForm'
import LastInfoForm from './character/LastInfoForm'

// 필수 입력값 표시 컴포넌트 - 공통 컴포넌트로 export
export const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-1">
    {children}
    <span className="text-orange-500">*</span>
  </div>
)

interface CharacterFormProps {
  formType: 'create' | 'edit'
  mode: 'basic' | 'detail' | 'image' | 'last'
  invalidFields?: { [key: string]: boolean }
  isSubmitting?: boolean
  privateOpenCharacterCount?: number
}

export default function CharacterForm({ mode, invalidFields = {}, isSubmitting = false, privateOpenCharacterCount }: CharacterFormProps) {
  const {
    setFormField,
    addConversationExample,
    updateConversationExample,
    updateConversationExampleTitle,
    removeConversationExample,
    setNormalImage,
    setAdultImage,
    setAdultNormalImage,
    fetchTagList,
    availableTags,
    isLoadingTags,
  } = useCreateCharacterData()

  // 최초 마운트시에만 태그 데이터 로드
  useEffect(() => {
    if (mode === 'basic') {
      fetchTagList()
    }
  }, [mode]) // mode만 의존성으로 추가

  // 최초 대화 예시가 없는 경우 자동으로 하나만 생성합니다
  // useEffect(() => {
  //   if (mode === 'detail' && formData.conversationExamples.length === 0) {
  //     addConversationExample()
  //   }
  // }, [mode, formData.conversationExamples.length, addConversationExample])

  // 컴포넌트 모드에 따라 다른 컴포넌트 렌더링
  if (mode === 'basic') {
    return (
      <BasicInfoForm
        availableTags={availableTags}
        isLoadingTags={isLoadingTags}
        invalidFields={invalidFields}
        privateOpenCharacterCount={privateOpenCharacterCount}
      />
    )
  }

  if (mode === 'detail') {
    return (
      <DetailInfoForm
        addConversationExample={addConversationExample}
        updateConversationExample={updateConversationExample}
        removeConversationExample={removeConversationExample}
        updateConversationExampleTitle={updateConversationExampleTitle}
      />
    )
  }

  if (mode === 'image') {
    return (
      <ImageUploadForm
        setFormField={setFormField}
        setNormalImage={setNormalImage}
        setAdultImage={setAdultImage}
        setAdultNormalImage={setAdultNormalImage}
        invalidFields={invalidFields}
        isSubmitting={isSubmitting}
      />
    )
  }


  if(mode === 'last') {
    return (
      <LastInfoForm
        setFormField={setFormField}
        addConversationExample={addConversationExample}
        updateConversationExample={updateConversationExample}
        removeConversationExample={removeConversationExample}
        updateConversationExampleTitle={updateConversationExampleTitle}
      />
    )
  }

  return null
}
