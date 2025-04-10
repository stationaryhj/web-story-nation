'use client'

import { create } from 'zustand'
import { createApi, contentApi } from '@/services/api'
import { toast } from 'react-toastify'
import { bridgeCharacterInProgressToCharacter } from '@/lib/utils/storyNationUtil'

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

// 태그 타입 정의
export interface Tag {
  c_chrbot_tag_key: number
  tag: string
  group: number
  sort: number
}

// 캐릭터 데이터 타입 정의
export interface CharacterFormData {
  // 기본 설정
  name: string
  gender: CharacterGender
  visibility: CharacterVisibility
  rating: CharacterRating
  bio: string
  firstMessage: string
  hashtags: Array<string>

  // 상세 설정
  bioDetail: string
  conversationExamples: Array<ConversationExample>

  // 이미지 설정 - 경로만 저장
  imgUrl: string // 기본 이미지 경로
  imgUrlNsfw: string // 성인 이미지 경로

  // API 호환성 속성
  world_list_detail_chrbot_key?: string

  finishYn?: number
  isVisibilityLock?: boolean

  // 추가 속성을 위한 인덱스 시그니처
  [key: string]: any
}

// CreateCharacterStore 인터페이스 정의
interface CreateCharacterStore {
  // 현재 활성화된 탭
  activeTab: 'basic' | 'detail' | 'image'

  // 폼 데이터
  formData: CharacterFormData

  // 태그 데이터
  availableTags: Tag[]

  // 로딩 상태
  isLoadingData: boolean
  isLoadingTags: boolean
  isSaving: boolean
  isSavingTags: boolean

  // 에러 상태
  error: any

  // 함수들
  setActiveTab: (tab: 'basic' | 'detail' | 'image') => void
  setFormField: <K extends keyof CharacterFormData>(field: K, value: CharacterFormData[K]) => void
  addHashtag: (tag: string) => Promise<boolean>
  removeHashtag: (tag: string) => Promise<boolean>

  // 대화 예시 관련 함수들
  addConversationExample: () => void
  updateConversationExample: (id: string, text: string) => void
  removeConversationExample: (id: string) => void
  setConversationExampleEditMode: (id: string, isEditing: boolean) => void
  setConversationExampleVisibility: (id: string, visibility: CharacterVisibility) => void

  // 이미지 관련 함수들
  setNormalImage: (path: string) => void
  setAdultImage: (path: string) => void
  setAdultNormalImage: (path: string) => void

  // API 연동 함수들
  fetchInProgressData: (characterId: number | null) => Promise<void>
  fetchTagList: () => Promise<void>
  saveInProgress: (finishYn?: number) => Promise<boolean>
  saveHashtags: () => Promise<boolean>
  resetForm: () => void
}

// 고유 ID 생성 함수
const generateId = () => Math.random().toString(36).substring(2, 11)

// 기본값 정의
const defaultFormData: CharacterFormData = {
  name: '',
  gender: 'unspecified',
  visibility: 'private',
  rating: 'all',
  bio: '',
  firstMessage: '',
  hashtags: [],
  bioDetail: '',
  conversationExamples: [],
  imgUrl: '',
  imgUrlNsfw: '',

  finishYn: 0,
  isVisibilityLock: false,
}

// CreateCharacterStore 생성
export const useCreateCharacterData = create<CreateCharacterStore>((set, get) => ({
  // 상태
  activeTab: 'basic',
  formData: { ...defaultFormData },
  availableTags: [],
  isLoadingData: false,
  isLoadingTags: false,
  isSaving: false,
  isSavingTags: false,
  error: null,

  // 상태 변경 함수들
  setActiveTab: tab => set({ activeTab: tab }),

  setFormField: (field, value) =>
    set(state => ({
      formData: {
        ...state.formData,
        [field]: value,
      },
    })),

  addHashtag: async tag => {
    try {
      set({ isSavingTags: true })

      const { formData } = get()

      // 이미 태그가 존재하거나 최대 개수에 도달한 경우
      if (formData.hashtags.includes(tag) || formData.hashtags.length >= 7) {
        return false
      }

      set(state => ({
        formData: {
          ...state.formData,
          hashtags: [...state.formData.hashtags, tag],
        },
      }))

      return true
    } catch (error) {
      console.error('태그 저장 실패:', error)
      toast.error('태그 저장에 실패했습니다. 다시 시도해주세요.')
      set({ error })
      return false
    } finally {
      set({ isSavingTags: false })
    }
  },

  removeHashtag: async tag => {
    try {
      set({ isSavingTags: true })

      const { formData } = get()

      set(state => ({
        formData: {
          ...state.formData,
          hashtags: state.formData.hashtags.filter(t => t !== tag),
        },
      }))

      return true
    } catch (error) {
      console.error('태그 제거 실패:', error)
      toast.error('태그 제거에 실패했습니다. 다시 시도해주세요.')
      set({ error })
      return false
    } finally {
      set({ isSavingTags: false })
    }
  },

  // 대화 예시 함수들
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

  updateConversationExample: (id, text) =>
    set(state => ({
      formData: {
        ...state.formData,
        conversationExamples: state.formData.conversationExamples.map(ex => (ex.id === id ? { ...ex, text } : ex)),
      },
    })),

  removeConversationExample: id =>
    set(state => ({
      formData: {
        ...state.formData,
        conversationExamples: state.formData.conversationExamples.filter(ex => ex.id !== id),
      },
    })),

  setConversationExampleEditMode: (id, isEditing) =>
    set(state => ({
      formData: {
        ...state.formData,
        conversationExamples: state.formData.conversationExamples.map(ex => (ex.id === id ? { ...ex, isEditing } : ex)),
      },
    })),

  setConversationExampleVisibility: (id, visibility) =>
    set(state => ({
      formData: {
        ...state.formData,
        conversationExamples: state.formData.conversationExamples.map(ex =>
          ex.id === id ? { ...ex, visibility } : ex
        ),
      },
    })),

  // 이미지 관련 함수들
  setNormalImage: (path: string) =>
    set(state => {
      console.log('setNormalImage :: ', path)
      return {
        formData: {
          ...state.formData,
          imgUrl: path,
        },
      }
    }),

  setAdultImage: (path: string) =>
    set(state => {
      return {
        formData: {
          ...state.formData,
          imgUrlNsfw: path,
        },
      }
    }),

  setAdultNormalImage: (path: string) =>
    set(state => {
      return {
        formData: {
          ...state.formData,
          imgUrl: path,
        },
      }
    }),

  // API 연동 함수들
  fetchInProgressData: async characterId => {
    try {
      set({ isLoadingData: true, error: null })

      const response = await createApi.GetCreateChatBotInProgress(characterId)

      if (response.data?.chrbot) {
        // 기존 데이터 초기화
        get().resetForm()

        // API 데이터 변환
        const characterData = bridgeCharacterInProgressToCharacter(response.data?.chrbot)

        // 각 필드 설정
        Object.entries(characterData).forEach(([key, value]) => {
          if (key !== 'id') {
            get().setFormField(key as any, value)
          }
        })

        // 캐릭터 ID 저장
        if (characterId) {
          get().setFormField('world_list_detail_chrbot_key', characterId.toString())
        }

        // 이미지 URL 정리 (중복 필드 정리)
        const imgUrl = characterData.img_url || ''
        const imgUrlNsfw = characterData.img_url_nsfw || ''

        // 한 번에 적절한 필드에만 설정
        set(state => ({
          formData: {
            ...state.formData,
            imgUrl,
            imgUrlNsfw,
            // 스네이크 케이스 필드 제거 (API 통신 시에만 사용)
            img_url: undefined,
            img_url_nsfw: undefined,
            img_web_url: undefined,
          },
        }))
      }
    } catch (error) {
      console.error('캐릭터 데이터 로딩 실패:', error)
      set({ error })
      toast.error('캐릭터 데이터를 불러오는 중 오류가 발생했습니다.')
    } finally {
      set({ isLoadingData: false })
    }
  },

  fetchTagList: async () => {
    try {
      set({ isLoadingTags: true, error: null })

      const response = await contentApi.GetTagList()

      if (response.data) {
        // 모든 그룹의 태그 배열을 하나로 합치기
        const allTags: Tag[] = []
        const tagGroups = response.data.charbot_tag

        // 모든 그룹(group1, group2, group3 등)의 태그를 하나의 배열로 병합
        Object.keys(tagGroups).forEach(groupKey => {
          allTags.push(...tagGroups[groupKey])
        })

        set({ availableTags: allTags })
      }
    } catch (error) {
      console.error('태그 데이터 로딩 실패:', error)
      set({ error })
    } finally {
      set({ isLoadingTags: false })
    }
  },

  saveInProgress: async (finishYn = 0) => {
    try {
      set({ isSaving: true })

      const { formData } = get()

      console.log('formData :: ', formData)

      const isLock = formData.finishYn === 1 && formData.visibility === 'public'

      // 폼 데이터에서 API 요청에 필요한 데이터 추출
      const payload = {
        world_list_detail_chrbot_key: formData.world_list_detail_chrbot_key || '',
        // 이미지 URL (있는 경우에만 포함)
        img_url: formData.imgUrl || '',
        // 성인 이미지 URL (있는 경우에만 포함)
        img_url_nsfw: formData.imgUrlNsfw || '',
        title: formData.name || '',
        gender: formData.gender === 'male' ? 1 : formData.gender === 'female' ? 2 : 0,
        intro: formData.bio || '',
        first_talk: formData.firstMessage || '',
        content: formData.bioDetail || '',
        // 대화 예시 - 없는 경우 빈 문자열 전달
        example:
          formData.conversationExamples && formData.conversationExamples.length > 0
            ? formData.conversationExamples.map(example => example.text).join('\n\n')
            : '',
        // 성인 등급 설정
        nsfw: formData.rating === 'adult' ? 1 : 0,
        // 게시범위 (공개=1, 비공개=0)
        show_yn: formData.visibility === 'public' ? 1 : 0,
        // 상세설명 (공개=1, 비공개=0)
        content_show_yn: formData.visibility === 'public' ? 1 : 0,
        // 대화 예시 (공개=1, 비공개=0) - 대화 예시가 없을 경우 0 설정
        example_show_yn:
          formData.conversationExamples && formData.conversationExamples.length > 0
            ? formData.conversationExamples[0]?.visibility === 'public'
              ? 1
              : 0
            : 0,

        finish_yn: formData.finishYn ? formData.finishYn : finishYn,
        isVisibilityLock: isLock,
      }

      // API 호출
      const response = await createApi.SaveInProgress(
        payload.world_list_detail_chrbot_key,
        payload.img_url,
        payload.title,
        payload.gender,
        payload.intro,
        payload.first_talk,
        payload.content,
        payload.example,
        payload.nsfw,
        payload.img_url_nsfw,
        payload.img_web_url,
        payload.show_yn,
        payload.content_show_yn,
        payload.example_show_yn,
        payload.finish_yn
      )

      if (!response.data || (response.data.result && response.data.result.err !== 0)) {
        throw new Error(response.data?.result?.msg || '저장에 실패했습니다.')
      }

      // 새로 생성된 ID가 있으면 저장
      if (response.data?.world_list_detail_chrbot_key) {
        get().setFormField('world_list_detail_chrbot_key', response.data.world_list_detail_chrbot_key.toString())
      }

      get().setFormField('isVisibilityLock', isLock)

      // 기본 정보 저장 후 태그 정보도 함께 저장
      if (formData.hashtags.length > 0) {
        try {
          await get().saveHashtags()
        } catch (tagError) {
          console.error('태그 저장 실패:', tagError)
          // 태그 저장 실패는 전체 성공 여부에 영향을 주지 않음
        }
      }

      return true
    } catch (error) {
      console.error('저장 실패:', error)
      toast.error('저장에 실패했습니다. 다시 시도해주세요.')
      set({ error })
      return false
    } finally {
      set({ isSaving: false })
    }
  },

  saveHashtags: async () => {
    try {
      set({ isSavingTags: true })

      const { formData, availableTags } = get()

      // world_list_detail_chrbot_key가 없으면 진행할 수 없음
      if (!formData.world_list_detail_chrbot_key) {
        toast.error('캐릭터 ID가 없습니다. 먼저 기본 정보를 저장해주세요.')
        return false
      }

      // 선택된 태그에 해당하는 c_chrbot_tag_key 값을 찾아서 쉼표로 구분된 문자열로 만들기
      const selectedTagKeys = formData.hashtags
        .map(tagName => {
          const tag = availableTags.find(t => t.tag === tagName)
          return tag ? tag.c_chrbot_tag_key : null
        })
        .filter(key => key !== null)
        .join(',')

      // 태그 데이터에서 API 요청에 필요한 데이터 추출
      const payload = {
        world_list_detail_chrbot_key: Number(formData.world_list_detail_chrbot_key),
        hashtags: formData.hashtags.join(','),
        c_chrbot_tag_key: selectedTagKeys, // 선택된 태그의 키 값들
      }

      console.log('저장할 태그 데이터:', payload)

      // API 호출
      const response = await createApi.SaveCreateChatBotTag(
        payload.world_list_detail_chrbot_key,
        payload.hashtags,
        payload.c_chrbot_tag_key
      )

      if (!response.data || (response.data.result && response.data.result.err !== 0)) {
        throw new Error(response.data?.result?.msg || '태그 저장에 실패했습니다.')
      }

      return true
    } catch (error) {
      console.error('태그 저장 실패:', error)
      toast.error('태그 저장에 실패했습니다. 다시 시도해주세요.')
      set({ error })
      return false
    } finally {
      set({ isSavingTags: false })
    }
  },

  resetForm: () =>
    set({
      formData: { ...defaultFormData },
      error: null,
    }),
}))

// 폼 유효성 검사 함수
export const isFormValid = (formData: CharacterFormData, tab: 'basic' | 'detail' | 'image'): boolean => {
  if (tab === 'image') {
    // 기본 정보 필드 검증
    const basicInfoValid = !!(
      formData.name?.trim() &&
      formData.bio?.trim() &&
      formData.firstMessage?.trim() &&
      formData.hashtags.length > 0
    )

    // 이용 등급에 따른 이미지 필드 검증
    if (formData.rating === 'adult') {
      // 성인 등급: imgUrl과 imgUrlNsfw 둘 다 필요
      return !!(basicInfoValid && formData.imgUrl?.trim() && formData.imgUrlNsfw?.trim())
    } else {
      // 일반 등급: imgUrl만 필요
      return !!(basicInfoValid && formData.imgUrl?.trim())
    }
  }

  // 이미지 탭이 아닌 경우 항상 유효
  return true
}

export default useCreateCharacterData
