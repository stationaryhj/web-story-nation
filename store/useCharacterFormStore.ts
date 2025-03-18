'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type CharacterGender = 'male' | 'female' | 'unspecified'
export type CharacterVisibility = 'public' | 'private'

// 이미지 타입 정의
export type ImageType = 'all' | 'adult' | 'adult2'

// 이미지 인터페이스 정의
export interface CharacterImage {
  id: string
  url: string
  type: ImageType
}

// 대화 예시 타입 정의
export interface ConversationExample {
  id: string
  text: string
  isEditing?: boolean
  visibility: CharacterVisibility
}

// 캐릭터 데이터 타입 정의
export interface CharacterFormData {
  // 기본 설정
  name: string
  gender: CharacterGender
  visibility: CharacterVisibility
  bio: string
  firstMessage: string
  hashtags: string[]

  // 상세 설정
  bioDetail: string
  conversationExamples: ConversationExample[]
  favoriteTopics: string[]
  avoidanceTopics: string[]

  // 이미지 설정 - 실제 데이터는 별도 스토어에 저장
  images: CharacterImage[]
}

// 이미지 스토어 인터페이스 - 메모리에만 저장되는 별도 스토어
interface ImageStore {
  images: CharacterImage[]
  activeImageTab: ImageType
  setActiveImageTab: (tab: ImageType) => void
  addImage: (url: string, type: ImageType) => void
  removeImage: (id: string) => void
  updateImageType: (id: string, type: ImageType) => void
  clearImages: () => void
}

interface CharacterFormStore {
  // 현재 활성화된 탭
  activeTab: 'basic' | 'detail' | 'image'

  // 폼 데이터
  formData: CharacterFormData

  // 수정 함수들
  setActiveTab: (tab: 'basic' | 'detail' | 'image') => void
  setFormField: <K extends keyof CharacterFormData>(field: K, value: CharacterFormData[K]) => void
  addHashtag: (tag: string) => void
  removeHashtag: (tag: string) => void

  // 대화 예시 관련 함수들
  addConversationExample: () => void
  updateConversationExample: (id: string, text: string) => void
  removeConversationExample: (id: string) => void
  setConversationExampleEditMode: (id: string, isEditing: boolean) => void
  setConversationExampleVisibility: (id: string, visibility: CharacterVisibility) => void

  resetForm: () => void
}

// 고유 ID 생성 함수
const generateId = () => Math.random().toString(36).substring(2, 11)

// 기본값 정의
const defaultFormData: CharacterFormData = {
  name: '',
  gender: 'unspecified',
  visibility: 'private',
  bio: '',
  firstMessage: '',
  hashtags: [],
  bioDetail: '',
  conversationExamples: [],
  favoriteTopics: [],
  avoidanceTopics: [],
  images: [], // 실제 이미지 데이터는 imageStore에 저장
}

// 이미지 스토어 생성 - 메모리에만 저장 (persist 사용하지 않음)
export const useImageStore = create<ImageStore>(set => ({
  images: [],
  activeImageTab: 'all',

  setActiveImageTab: tab => set({ activeImageTab: tab }),

  addImage: (url, type) =>
    set(state => {
      const newImage: CharacterImage = {
        id: generateId(),
        url,
        type,
      }

      return { images: [...state.images, newImage] }
    }),

  removeImage: id =>
    set(state => {
      console.log('Store: Removing image with id:', id)
      console.log('Store: Current images:', state.images)

      if (!state.images || state.images.length === 0) {
        console.log('Store: No images to remove')
        return state
      }

      const updatedImages = state.images.filter(img => img.id !== id)
      console.log('Store: Updated images:', updatedImages)

      return { images: updatedImages }
    }),

  updateImageType: (id, type) =>
    set(state => {
      if (!state.images) return state

      return {
        images: state.images.map(img => (img.id === id ? { ...img, type } : img)),
      }
    }),

  clearImages: () => set({ images: [] }),
}))

// 이미지 정보만 추출하는 함수 (base64 데이터 없이)
export const getImageInfoForSubmit = () => {
  const { images } = useImageStore.getState()

  // 이미지 URL 데이터를 제외한 메타데이터만 추출
  return images.map(img => ({
    id: img.id,
    type: img.type,
    // 실제 API 연동 시 서버에 업로드된 URL로 대체
    url: img.url.substring(0, 100) + '...', // URL 정보는 간략히 저장
  }))
}

// 이미지를 서버에 업로드하는 함수 (실제 구현 시 추가)
export const uploadImagesToServer = async () => {
  const { images } = useImageStore.getState()

  // 실제 구현에서는 이미지를 FormData로 변환하여 서버에 업로드
  // 예시 코드:
  /*
  const formData = new FormData();
  
  // base64 이미지를 Blob으로 변환하여 추가
  for (const image of images) {
    const blob = await fetch(image.url).then(r => r.blob());
    formData.append('images', blob, `image_${image.id}.jpg`);
    formData.append('types', image.type);
  }
  
  // API 요청
  const response = await fetch('/api/upload-images', {
    method: 'POST',
    body: formData
  });
  
  // 응답에서 업로드된 이미지 URL 배열 추출
  const uploadedUrls = await response.json();
  
  // 업로드된 URL 반환
  return uploadedUrls;
  */

  // 임시 구현: 이미지가 업로드된 것처럼 처리
  console.log(`${images.length}개 이미지 업로드 요청 시뮬레이션`)
  return images.map(img => ({
    id: img.id,
    type: img.type,
    url: `https://example.com/uploads/${img.id}.jpg`,
  }))
}

// 캐릭터 폼 스토어 생성
export const useCharacterFormStore = create<CharacterFormStore>()(
  persist(
    set => ({
      activeTab: 'basic',
      formData: { ...defaultFormData },

      setActiveTab: tab => set({ activeTab: tab }),

      setFormField: (field, value) =>
        set(state => ({
          formData: {
            ...state.formData,
            [field]: value,
          },
        })),

      addHashtag: tag =>
        set(state => {
          // 이미 태그가 존재하거나 최대 개수에 도달한 경우
          if (state.formData.hashtags.includes(tag) || state.formData.hashtags.length >= 7) {
            return state
          }

          return {
            formData: {
              ...state.formData,
              hashtags: [...state.formData.hashtags, tag],
            },
          }
        }),

      removeHashtag: tag =>
        set(state => ({
          formData: {
            ...state.formData,
            hashtags: state.formData.hashtags.filter(t => t !== tag),
          },
        })),

      // 대화 예시 추가
      addConversationExample: () =>
        set(state => {
          // 최대 3개까지만 추가 가능
          if (state.formData.conversationExamples.length >= 3) {
            return state
          }

          const newExample: ConversationExample = {
            id: generateId(),
            text: '',
            isEditing: true,
            visibility: 'private',
          }

          return {
            formData: {
              ...state.formData,
              conversationExamples: [...state.formData.conversationExamples, newExample],
            },
          }
        }),

      // 대화 예시 수정
      updateConversationExample: (id, text) =>
        set(state => {
          const updatedExamples = state.formData.conversationExamples.map(example =>
            example.id === id ? { ...example, text } : example
          )

          return {
            formData: {
              ...state.formData,
              conversationExamples: updatedExamples,
            },
          }
        }),

      // 대화 예시 삭제
      removeConversationExample: id =>
        set(state => ({
          formData: {
            ...state.formData,
            conversationExamples: state.formData.conversationExamples.filter(example => example.id !== id),
          },
        })),

      // 대화 예시 편집 모드 설정
      setConversationExampleEditMode: (id, isEditing) =>
        set(state => {
          const updatedExamples = state.formData.conversationExamples.map(example =>
            example.id === id ? { ...example, isEditing } : example
          )

          return {
            formData: {
              ...state.formData,
              conversationExamples: updatedExamples,
            },
          }
        }),

      // 대화 예시 공개 여부 설정
      setConversationExampleVisibility: (id, visibility) =>
        set(state => {
          const updatedExamples = state.formData.conversationExamples.map(example =>
            example.id === id ? { ...example, visibility } : example
          )

          return {
            formData: {
              ...state.formData,
              conversationExamples: updatedExamples,
            },
          }
        }),

      resetForm: () => set({ formData: { ...defaultFormData }, activeTab: 'basic' }),
    }),
    {
      name: 'character-form-storage',
      storage: createJSONStorage(() => sessionStorage),
      // 이미지 데이터는 저장하지 않도록 설정
      partialize: state => ({
        ...state,
        formData: {
          ...state.formData,
          // 이미지 데이터는 제외하고 저장
          images: [],
        },
      }),
    }
  )
)
