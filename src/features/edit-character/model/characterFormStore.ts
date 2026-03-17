'use client'

import { create } from 'zustand'
import type { exampleDatas } from '@/lib/utils/storyNationUtil'
import type { LikeAbilityData, MultiImageData } from '@/services/define'

// ─── 타입 ───

export type CharacterGender = 'male' | 'female' | 'unspecified'
export type CharacterVisibility = 'public' | 'private'
export type CharacterRating = 'all' | 'adult'
export type ImageType = 'normal' | 'adult'
export type TabType = 'basic' | 'detail' | 'image' | 'last'

export interface Tag {
  c_chrbot_tag_key: number
  tag: string
  group: number
  sort: number
}

export interface CharacterFormData {
  // 기본 설정
  name: string // 캐릭터 이름 (서버: title)
  subject: string // 캐릭터 제목 (서버: subject)
  gender: CharacterGender // 성별 (서버: gender) - male/female/unspecified ↔ 1/2/0
  visibility: CharacterVisibility // 게시 범위 (서버: show_yn) - public/private ↔ 1/0
  rating: CharacterRating // 이용 등급 (서버: nsfw) - adult/all ↔ 1/2
  bio: string // 한줄 소개 (서버: intro)
  firstMessage: string // 첫 메시지 (서버: first_talk)
  hashtags: Array<string> // 캐릭터 태그 (서버: tags)
  examplesVisibility: CharacterVisibility // 대화 예시 공개 여부 (서버: example_show_yn)
  detailVisibility: CharacterVisibility // 상세 설명 공개 여부 (서버: content_show_yn)

  // 상세 설정
  content: string // 비공개 설명 (서버: content)
  content_public: string // 공개 설명 (서버: content_public)
  conversationExamples: exampleDatas[] // 대화 예시 목록 (서버: example)

  // 이미지
  imgUrl: string // 기본 이미지 경로 (서버: img_url)
  imgUrlNsfw: string // 성인 이미지 경로 (서버: img_url_nsfw)

  // 메타
  world_list_detail_chrbot_key?: string // 캐릭터 고유 ID (서버 발급)
  isVisibilityLock?: boolean // 공개 후 비공개 전환 잠금

  // 호감도
  likeability_yn?: number // 호감도 시스템 활성화 여부 - 0/1
  likeabilities?: LikeAbilityData[] // 호감도 레벨별 데이터
  likeability_max_lv?: number // 호감도 최대 레벨

  // 멀티이미지
  multi_images_original: MultiImageData[] // 멀티이미지 원본 (변경 감지용 스냅샷)
  multi_image_count: number // 멀티이미지 개수
  multi_images: MultiImageData[] // 멀티이미지 목록

  property: string // 마무리 설정 데이터 (서버: property)
  writer_note: string // 작가 노트 (서버: writer_note)

  [key: string]: any
}

export interface DmMultiImage {
  hash: string
  img_url: string
  rules: string
  idx: number
  chrbot_multi_image_key: number
  default_yn: number
  lv: number
  show_yn: number
  world_list_detail_chrbot_key: number
}

export interface DmFormData {
  // 기본 설정
  name: string
  gender: CharacterGender
  visibility: CharacterVisibility
  rating: CharacterRating
  bio: string
  hashtags: Array<string>

  // 이미지
  imgUrl: string

  // 인트로
  intro_bubbles: any[]
  intro_active_speaker: string

  // 멀티이미지
  multi_images_original: DmMultiImage[]
  multi_images: DmMultiImage[]

  [key: string]: any
}

// ─── 초깃값 ───

const defaultFormData: CharacterFormData = {
  name: '',
  subject: '',
  gender: 'unspecified',
  visibility: 'private',
  examplesVisibility: 'private',
  detailVisibility: 'public',
  rating: 'all',
  bio: '',
  content: '',
  content_public: '',
  firstMessage: '',
  hashtags: [],
  conversationExamples: [],
  imgUrl: '',
  imgUrlNsfw: '',
  isVisibilityLock: false,
  likeability_yn: 0,
  likeabilities: [],
  likeability_max_lv: 0,
  multi_images_original: [],
  multi_image_count: 0,
  multi_images: [],
  property: '',
  writer_note: '',
}

// ─── 스토어 인터페이스 ───

interface CharacterFormStore {
  activeTab: TabType
  formData: CharacterFormData
  availableTags: Tag[]
  isLoadingData: boolean
  isLoadingTags: boolean
  isSaving: boolean
  isSavingTags: boolean
  isValid: boolean
  error: any

  // 기본 액션
  setValid: (valid: boolean) => void
  setActiveTab: (tab: TabType) => void
  setFormField: <K extends keyof CharacterFormData>(field: K, value: CharacterFormData[K]) => void
  setAvailableTags: (tags: Tag[]) => void
  setLoading: (key: 'isLoadingData' | 'isLoadingTags' | 'isSaving' | 'isSavingTags', value: boolean) => void
  setError: (error: any) => void
  resetForm: () => void

  // 태그
  addHashtag: (tag: string) => boolean
  removeHashtag: (tag: string) => void

  // 대화 예시
  addConversationExample: () => void
  updateConversationExample: (data: exampleDatas) => void
  updateConversationExampleTitle: (id: number, title: string) => void
  removeConversationExample: (id: number) => void

  // 이미지
  setNormalImage: (path: string) => void
  setAdultImage: (path: string) => void

  // 호감도
  updateLikeAbilityData: (data: LikeAbilityData) => void
  updateLikeAbilityLevel: (lv: number) => void

  // 멀티이미지
  updateMultiImageData: (data: MultiImageData) => void
  updateMultiImageDatas: (data: MultiImageData[]) => void
  addMultiImageDatas: (data: MultiImageData[]) => void
  deleteMultiImageData: (hash: string, idx: number, lv: number, chrbot_multi_image_key: number, img_url: string) => void
  changeMultiImageShow: (idx: number, lv: number, chrbot_multi_image_key: number, img_url: string) => void
  changeMultiImageDefault: (idx: number, lv: number, chrbot_multi_image_key: number, img_url: string) => void
  changeMultiImageRules: (
    idx: number,
    lv: number,
    chrbot_multi_image_key: number,
    img_url: string,
    rules: string
  ) => void
  changeMultiImageImage: (
    idx: number,
    lv: number,
    chrbot_multi_image_key: number,
    img_url: string,
    url_path: string
  ) => void
}

// ─── 스토어 ───

export const useCharacterFormStore = create<CharacterFormStore>((set, get) => ({
  activeTab: 'basic',
  formData: { ...defaultFormData },
  availableTags: [],
  isLoadingData: false,
  isLoadingTags: false,
  isSaving: false,
  isSavingTags: false,
  isValid: false,
  error: null,

  // 기본 액션
  setValid: valid => set({ isValid: valid }),
  setActiveTab: tab => set({ activeTab: tab, isValid: false }),
  setFormField: (field, value) =>
    set(state => ({
      formData: { ...state.formData, [field]: value },
    })),
  setAvailableTags: tags => set({ availableTags: tags }),
  setLoading: (key, value) => set({ [key]: value }),
  setError: error => set({ error }),
  resetForm: () => set({ formData: { ...defaultFormData }, error: null, isValid: false }),

  // 태그
  addHashtag: tag => {
    const { formData } = get()
    if (formData.hashtags.includes(tag) || formData.hashtags.length >= 7) {
      return false
    }
    set(state => ({
      formData: { ...state.formData, hashtags: [...state.formData.hashtags, tag] },
    }))
    return true
  },

  removeHashtag: tag => {
    set(state => ({
      formData: { ...state.formData, hashtags: state.formData.hashtags.filter(t => t !== tag) },
    }))
  },

  // 대화 예시
  addConversationExample: () => {
    if (get().formData.conversationExamples.length >= 3) return

    let addIndex = get().formData.conversationExamples.length
    for (let i = 0; i < get().formData.conversationExamples.length; i++) {
      if (get().formData.conversationExamples[i].index !== i) {
        addIndex = i
        break
      }
    }

    set(state => ({
      formData: {
        ...state.formData,
        conversationExamples: [
          ...state.formData.conversationExamples,
          { index: addIndex, title: '', userMsg: '', characterMsg: '', textLength: 0 },
        ],
      },
    }))
  },

  updateConversationExample: data => {
    set(state => ({
      formData: {
        ...state.formData,
        conversationExamples: state.formData.conversationExamples.map(ex => (ex.index === data.index ? data : ex)),
      },
    }))
  },

  updateConversationExampleTitle: (id, title) => {
    set(state => ({
      formData: {
        ...state.formData,
        conversationExamples: state.formData.conversationExamples.map(ex => (ex.index === id ? { ...ex, title } : ex)),
      },
    }))
  },

  removeConversationExample: id => {
    set(state => ({
      formData: {
        ...state.formData,
        conversationExamples: state.formData.conversationExamples.filter(ex => ex.index !== id),
      },
    }))
  },

  // 이미지
  setNormalImage: path => set(state => ({ formData: { ...state.formData, imgUrl: path } })),

  setAdultImage: path => set(state => ({ formData: { ...state.formData, imgUrlNsfw: path } })),

  // 호감도
  updateLikeAbilityData: data => {
    set(state => ({
      formData: {
        ...state.formData,
        likeabilities: state.formData.likeabilities?.map(item => (item.lv === data.lv ? data : item)) || [],
      },
    }))
  },

  updateLikeAbilityLevel: lv => {
    const currentMaxLv = get().formData.likeability_max_lv || 0
    const beforeLikeabilities = [...(get().formData.likeabilities || [])]

    let newLikeabilities = [...beforeLikeabilities]

    if (lv > currentMaxLv) {
      for (let i = currentMaxLv + 1; i <= lv; i++) {
        if (!newLikeabilities.find(item => item.lv === i)) {
          newLikeabilities.push({
            lv: i,
            features: '',
            lv_name: '',
            rules: '',
            world_list_detail_chrbot_key: Number(get().formData.world_list_detail_chrbot_key) || 0,
          })
        }
      }
    } else if (lv < currentMaxLv) {
      newLikeabilities = newLikeabilities.filter(item => item.lv <= lv)
    }

    newLikeabilities.sort((a, b) => a.lv - b.lv)

    set(state => ({
      formData: {
        ...state.formData,
        likeability_max_lv: lv,
        likeabilities: newLikeabilities,
      },
    }))
  },

  // 멀티이미지
  updateMultiImageData: data => {
    set(state => ({
      formData: {
        ...state.formData,
        multi_images: state.formData.multi_images.map(item =>
          item.chrbot_multi_image_key === data.chrbot_multi_image_key && item.lv === data.lv && item.idx === data.idx
            ? data
            : item
        ),
      },
    }))
  },

  updateMultiImageDatas: data => {
    set(state => ({
      formData: { ...state.formData, multi_images: data },
    }))
  },

  addMultiImageDatas: data => {
    set(state => ({
      formData: { ...state.formData, multi_images: [...state.formData.multi_images, ...data] },
    }))
  },

  deleteMultiImageData: (hash, idx, lv, chrbot_multi_image_key, img_url) => {
    const deleteData = get().formData.multi_images.find(
      item =>
        item.img_url === img_url &&
        item.lv === lv &&
        item.chrbot_multi_image_key === chrbot_multi_image_key &&
        item.idx === idx
    )

    const isDefaultChange = deleteData?.default_yn === 1

    set(state => ({
      formData: {
        ...state.formData,
        multi_images: state.formData.multi_images.filter(item => item !== deleteData),
      },
    }))

    // 디폴트 이미지 삭제 시 다음 이미지를 디폴트로
    if (isDefaultChange) {
      const sameLvImages = get().formData.multi_images.filter(item => item.lv === lv)
      if (sameLvImages.length > 0) {
        get().updateMultiImageData({ ...sameLvImages[0], default_yn: 1, show_yn: 1 })
      }
    }
  },

  changeMultiImageShow: (idx, lv, chrbot_multi_image_key, img_url) => {
    const target = get().formData.multi_images.find(
      item =>
        item.img_url === img_url &&
        item.lv === lv &&
        item.chrbot_multi_image_key === chrbot_multi_image_key &&
        item.idx === idx
    )

    set(state => ({
      formData: {
        ...state.formData,
        multi_images: state.formData.multi_images.map(item =>
          item === target ? { ...item, show_yn: item.show_yn === 1 ? 0 : 1 } : item
        ),
      },
    }))
  },

  changeMultiImageDefault: (idx, lv, chrbot_multi_image_key, img_url) => {
    const target = get().formData.multi_images.find(
      item =>
        item.img_url === img_url &&
        item.lv === lv &&
        item.chrbot_multi_image_key === chrbot_multi_image_key &&
        item.idx === idx
    )

    const sameLvImages = get().formData.multi_images.filter(item => item.lv === lv)
    const beforeDefault = sameLvImages.find(item => item.default_yn === 1)
    const afterDefault = sameLvImages.find(item => item === target)

    if (beforeDefault) {
      get().updateMultiImageData({ ...beforeDefault, default_yn: 0, show_yn: 0 })
    }
    if (afterDefault) {
      get().updateMultiImageData({ ...afterDefault, default_yn: 1, show_yn: 1 })
    }
  },

  changeMultiImageRules: (idx, lv, chrbot_multi_image_key, img_url, rules) => {
    const target = get().formData.multi_images.find(
      item =>
        item.img_url === img_url &&
        item.lv === lv &&
        item.chrbot_multi_image_key === chrbot_multi_image_key &&
        item.idx === idx
    )

    set(state => ({
      formData: {
        ...state.formData,
        multi_images: state.formData.multi_images.map(item => (item === target ? { ...item, rules } : item)),
      },
    }))
  },

  changeMultiImageImage: (idx, lv, chrbot_multi_image_key, img_url, url_path) => {
    const target = get().formData.multi_images.find(
      item =>
        item.img_url === img_url &&
        item.lv === lv &&
        item.chrbot_multi_image_key === chrbot_multi_image_key &&
        item.idx === idx
    )

    set(state => ({
      formData: {
        ...state.formData,
        multi_images: state.formData.multi_images.map(item =>
          item === target ? { ...item, img_url: url_path } : item
        ),
      },
    }))
  },
}))
