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
  invalidFields?: { [key: string]: boolean }
}

export default function CharacterForm({ mode, invalidFields = {} }: CharacterFormProps) {
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
        formData={formData}
        setFormField={setFormField}
        addCustomTag={addHashtag}
        addHashtag={async (tag: string) => {
          return await addHashtag(tag)
        }}
        removeHashtag={async (tag: string) => {
          return await removeHashtag(tag)
        }}
        fetchTagList={fetchTagList}
        saveHashtags={async () => {
          return await saveHashtags()
        }}
        availableTags={availableTags}
        isLoadingTags={isLoadingTags}
        invalidFields={invalidFields}
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
        setConversationExampleTitle={setFormField}
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
      />
    )
  }

  return null
}
