'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type CharacterGender = 'male' | 'female' | 'unspecified'
export type CharacterVisibility = 'public' | 'private'
export type CharacterRating = 'all' | 'adult'

// 이미지 타입 정의
export type ImageType = 'normal' | 'adult'

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
  examplesVisibility: CharacterVisibility
  detailVisibility: CharacterVisibility
  rating: CharacterRating
  bio: string
  firstMessage: string
  hashtags: Array<string>

  // 상세 설정
  bioDetail: string
  conversationExamples: Array<ConversationExample>
  favoriteTopics: Array<string>
  avoidanceTopics: Array<string>

  // 이미지 설정 - 실제 데이터는 별도 스토어에 저장
  images: Array<CharacterImage>

  // S3에 업로드된 이미지 URL (edit.tsx에서 사용)
  imgUrl?: string
  imgUrlNsfw?: string

  // 추가 API 호환성 속성
  imageUrl?: string
  img_url?: string
  img_url_nsfw?: string

  // 추가 속성을 위한 인덱스 시그니처
  [key: string]: any
}

// 이미지 스토어 인터페이스 - 메모리에만 저장되는 별도 스토어
interface ImageStore {
  normalImage: CharacterImage | null
  adultImage: CharacterImage | null
  activeImageTab: ImageType
  setActiveImageTab: (tab: ImageType) => void
  addNormalImage: (url: string) => void
  addAdultImage: (url: string) => void
  clearImages: () => void
  getImages: () => Array<CharacterImage>
}

interface CharacterFormStore {
  // 현재 활성화된 탭
  activeTab: 'basic' | 'detail' | 'image' | 'last'

  // 폼 데이터
  formData: CharacterFormData

  // 수정 함수들
  setActiveTab: (tab: 'basic' | 'detail' | 'image' | 'last') => void
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
  examplesVisibility: 'private',
  detailVisibility: 'public',
  rating: 'all',
  bio: '',
  firstMessage: '',
  hashtags: [],
  bioDetail: '',
  conversationExamples: [],
  favoriteTopics: [],
  avoidanceTopics: [],
  images: [], // 실제 이미지 데이터는 imageStore에 저장
  imgUrl: '', // 일반 이미지 URL (API 연동 시 사용)
  imgUrlNsfw: '', // 성인 이미지 URL (API 연동 시 사용)
  imageUrl: '',
  img_url: '',
  img_url_nsfw: '',
}

// 이미지 스토어 생성 - 메모리에만 저장 (persist 사용하지 않음)
export const useImageStore = create<ImageStore>(set => ({
  normalImage: null,
  adultImage: null,
  activeImageTab: 'normal',

  setActiveImageTab: tab => set({ activeImageTab: tab }),

  addNormalImage: url =>
    set(_state => {
      const newImage: CharacterImage = {
        id: generateId(),
        url,
        type: 'normal',
      }
      return { normalImage: newImage }
    }),

  addAdultImage: url =>
    set(_state => {
      const newImage: CharacterImage = {
        id: generateId(),
        url,
        type: 'adult',
      }
      return { adultImage: newImage }
    }),

  clearImages: () => set({ normalImage: null, adultImage: null }),

  // 호환성을 위한 getImages 함수
  getImages: () => {
    const state = useImageStore.getState()
    const images: CharacterImage[] = []

    if (state.normalImage) images.push(state.normalImage)
    if (state.adultImage) images.push(state.adultImage)

    return images
  },
}))

// 이미지 정보만 추출하는 함수 (base64 데이터 없이)
export const getImageInfoForSubmit = () => {
  const { normalImage, adultImage } = useImageStore.getState()
  const images: Array<Partial<CharacterImage>> = []

  if (normalImage) {
    images.push({
      id: normalImage.id,
      type: normalImage.type,
      url: normalImage.url.substring(0, 100) + '...', // URL 정보는 간략히 저장
    })
  }

  if (adultImage) {
    images.push({
      id: adultImage.id,
      type: adultImage.type,
      url: adultImage.url.substring(0, 100) + '...', // URL 정보는 간략히 저장
    })
  }

  return images
}

// 이미지를 서버에 업로드하는 함수 (실제 구현 시 추가)
export const uploadImagesToServer = async () => {
  const { normalImage, adultImage } = useImageStore.getState()
  const images: Array<CharacterImage> = []

  if (normalImage) images.push(normalImage)
  if (adultImage) images.push(adultImage)

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
