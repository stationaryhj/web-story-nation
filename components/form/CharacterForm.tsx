'use client'

import React, { useEffect } from 'react'
import { useCreateCharacterData } from '@/store/useCreateCharacterData'

import BasicInfoForm from './character/BasicInfoForm'
import DetailInfoForm from './character/DetailInfoForm'
import ImageUploadForm from './character/ImageUploadForm'

// 필수 입력값 표시 컴포넌트 - 공통 컴포넌트로 export
export const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-1">
    {children}
    <span className="text-orange-500">*</span>
  </div>
)

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
    setAdultNormalImage,
    fetchTagList,
    saveHashtags,
    availableTags,
    isLoadingTags
  } = useCreateCharacterData()

  // 최초 마운트시에만 태그 데이터 로드
  useEffect(() => {
    if (mode === 'basic') {
      fetchTagList()
    }
  }, [mode]) // mode만 의존성으로 추가

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



  // 컴포넌트 모드에 따라 다른 컴포넌트 렌더링
  if (mode === 'basic') {
    return (
      <BasicInfoForm 
        formData={formData}
        setFormField={setFormField}
        addHashtag={async (tag: string) => {
          await addHashtag(tag);
          return;
        }}
        removeHashtag={async (tag: string) => {
          await removeHashtag(tag);
          return;
        }}
        fetchTagList={async () => {
          // BasicInfoForm에서는 fetchTagList를 직접 호출하지 않도록 빈 함수로 처리
          return;
        }}
        saveHashtags={async () => {
        await saveHashtags();
          return;
        }}
        availableTags={availableTags}
        isLoadingTags={isLoadingTags}
        onValidationChange={onValidationChange}
      />
    )
  }

  if (mode === 'detail') {
    return (
      <DetailInfoForm 
        formData={formData}
        setFormField={setFormField}
        addConversationExample={addConversationExample}
        updateConversationExample={updateConversationExample}
        removeConversationExample={removeConversationExample}
        setConversationExampleEditMode={setConversationExampleEditMode}
        setConversationExampleVisibility={setConversationExampleVisibility}
        onValidationChange={onValidationChange}
      />
    )
  }

  if (mode === 'image') {
    return (
      <ImageUploadForm 
        formData={formData}
        setFormField={setFormField}
        setNormalImage={setNormalImage}
        setAdultImage={setAdultImage}
        setAdultNormalImage={setAdultNormalImage}
        onValidationChange={onValidationChange}
      />
    )
  }

  return null
}
