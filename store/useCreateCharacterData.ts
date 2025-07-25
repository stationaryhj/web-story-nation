'use client'

import { create } from 'zustand'
import { createApi, contentApi } from '@/services/api'
import { toast } from 'react-toastify'
import { bridgeCharacterInProgressToCharacter, exampleDatas, exampleDatasToConversationJson } from '@/lib/utils/storyNationUtil'
import type { LikeAbilityData, MultiImageData } from '@/services/define'


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
  subject: string
  gender: CharacterGender
  visibility: CharacterVisibility
  rating: CharacterRating
  bio: string
  firstMessage: string
  hashtags: Array<string>
  examplesVisibility: CharacterVisibility
  detailVisibility: CharacterVisibility

  // 상세 설정
  content: string
  content_public: string

  conversationExamples: exampleDatas[]

  // 이미지 설정 - 경로만 저장
  imgUrl: string // 기본 이미지 경로
  imgUrlNsfw: string // 성인 이미지 경로

  // API 호환성 속성
  world_list_detail_chrbot_key?: string
  isVisibilityLock?: boolean

  likeability_yn?: number
  likeabilities?: LikeAbilityData[]
  likeability_max_lv?: number


  // 멀티이미지
  multi_images_original: MultiImageData[]

  multi_image_count: number
  multi_images: MultiImageData[]
  
  property: string

  writer_note: string

  // 추가 속성을 위한 인덱스 시그니처
  [key: string]: any
}

// CreateCharacterStore 인터페이스 정의
interface CreateCharacterStore {
  // 현재 활성화된 탭
  activeTab: 'basic' | 'detail' | 'image' | 'last'

  // 폼 데이터
  formData: CharacterFormData

  // 태그 데이터
  availableTags: Tag[]

  // 로딩 상태
  isLoadingData: boolean
  isLoadingTags: boolean
  isSaving: boolean
  isSavingTags: boolean


  // vaild 상태
  isVaild: boolean

  // 에러 상태
  error: any

  // 함수들
  setVaild: (vaild: boolean) => void
  setActiveTab: (tab: 'basic' | 'detail' | 'image' | 'last') => void
  setFormField: <K extends keyof CharacterFormData>(field: K, value: CharacterFormData[K]) => void
  addHashtag: (tag: string) => Promise<boolean>
  removeHashtag: (tag: string) => Promise<boolean>

  // 대화 예시 관련 함수들
  addConversationExample: () => void
  updateConversationExample: (data: exampleDatas) => void
  updateConversationExampleTitle: (id: number, title: string) => void
  removeConversationExample: (id: number) => void

  // 이미지 관련 함수들
  setNormalImage: (path: string) => void
  setAdultImage: (path: string) => void
  setAdultNormalImage: (path: string) => void

  // API 연동 함수들
  fetchInProgressData: (characterId: number | null) => Promise<void>
  fetchTagList: () => Promise<void>
  saveInProgress: (finishYn?: number) => Promise<boolean>
  saveMultiImages: () => Promise<boolean>
  saveHashtags: () => Promise<boolean>
  saveProperty: () => Promise<boolean>
  resetForm: () => void
  



  // 호감도
  updateLikeAbilityData: (data: LikeAbilityData) => void
  updateLikeAbilityLevel: (lv: number) => void

  // 멀티이미지 관련
  updateMultiImageDatas: (data: MultiImageData[]) => void
  updateMultiImageData: (data: any) => void
  addMultiImageDatas: (data: MultiImageData[]) => void

  deleteMultiImageData: (hash: string, idx: number, lv: number, chrbot_multi_image_key: number, img_url: string) => Promise<void>
  changeMultiImageShow: (idx: number, lv: number, chrbot_multi_image_key: number, img_url: string) => void
  changeMultiImageDefault: (idx: number, lv: number, chrbot_multi_image_key: number, img_url: string) => void
  changeMultiImageRules: (idx: number, lv: number, chrbot_multi_image_key: number, img_url: string, rules: string) => void
  changeMultiImageImage: (idx: number, lv: number, chrbot_multi_image_key: number, img_url: string, url_path: string) => void

  checkValidData: (type: 'basic' | 'detail' | 'image' | 'last') => boolean
}

// 고유 ID 생성 함수
const generateId = () => Math.random().toString(36).substring(2, 11)

// 기본값 정의
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
  isVaild: false,

  // 상태 변경 함수들
  setVaild: (vaild: boolean) => set({ isVaild: vaild }),
  setActiveTab: tab => set({ activeTab: tab, isVaild: false }),

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
  addConversationExample: () => {
    if (get().formData.conversationExamples.length >= 3) {
      return
    }

    let addIndex = get().formData.conversationExamples.length
    for(let i = 0; i < get().formData.conversationExamples.length; i++) {
      const beforeData = get().formData.conversationExamples[i]
      const index = i
      
      if(beforeData.index !== index) {
        addIndex = index
        break
      }
    }

    const newExample = {
      index: addIndex,
      title: '',
      userMsg: '',
      characterMsg: '',
      textLength: 0,
    }

    set(state => ({
      formData: {
        ...state.formData,
        conversationExamples: [...state.formData.conversationExamples, newExample],
      },
    }))
  },

  removeConversationExample: (id) => {
    set(state => ({
      formData: {
        ...state.formData,
        conversationExamples: state.formData.conversationExamples.filter(ex => ex.index !== id),
      },
    }))
  },

  updateConversationExample: (data) => {
    set(state => ({
      formData: {
        ...state.formData,
        conversationExamples: state.formData.conversationExamples.map(ex => (ex.index === data.index) ? data : ex),
      },
    }))
  },

  updateConversationExampleTitle: (id, title) => {
    set(state => ({
      formData: {
        ...state.formData,
        conversationExamples: state.formData.conversationExamples.map(ex => (ex.index === id) ? { ...ex, title } : ex),
      },
    }))
  },

  updateLikeAbilityData: (data: LikeAbilityData) => {
    console.log('변경 전 데이타 :: ', get().formData.likeabilities)

    set(state => ({
      formData: {
        ...state.formData,
        likeabilities: state.formData.likeabilities?.map(item => item.lv === data.lv ? data : item) || [],
      },
    }))

    console.log('변경 후 데이타 :: ', get().formData.likeabilities)
  },


  updateLikeAbilityLevel: (lv: number) => {
    const currentMaxLv = get().formData.likeability_max_lv || 0
    const beforeLikeabilities = get().formData.likeabilities || []
    
    // ✅ 최대 레벨 설정
    set(state => ({
      formData: {
        ...state.formData,
        likeability_max_lv: lv,
      },
    }))

    // 레벨 변경 후 데이터 추가
    // 레벨 변경되는 값을 본 뒤 기존 데이터는 남겨두고
    // 레벨이 전보다 높아졌으면 빈 데이터를 추가
    // 레벨이 전보다 낮아졌으면 데이터 삭제

    let newLikeabilities = [...beforeLikeabilities]

    if (lv > currentMaxLv) {
      for (let i = currentMaxLv + 1; i <= lv; i++) {
        const existingItem = newLikeabilities.find(item => item.lv === i)
        if (!existingItem) {
          newLikeabilities.push({
            lv: i,
            features: '',
            lv_name: ``,
            rules: '',
            world_list_detail_chrbot_key: Number(get().formData.world_list_detail_chrbot_key) || 0,
          })
        }
      }
    } else if (lv < currentMaxLv) {
      newLikeabilities = newLikeabilities.filter(item => item.lv <= lv)
    }

    // ✅ 레벨 순서로 정렬
    newLikeabilities.sort((a, b) => a.lv - b.lv)

    // ✅ 상태 업데이트
    set(state => ({
      formData: {
        ...state.formData,
        likeabilities: newLikeabilities,
      },
    }))
  },


  // 멀티이미지 관련
  updateMultiImageData: (data: MultiImageData) => {
    set(state => ({
      formData: {
        ...state.formData,
        multi_images: state.formData.multi_images.map(item =>
          item.chrbot_multi_image_key === data.chrbot_multi_image_key &&
          item.lv === data.lv &&
          item.idx === data.idx
          ? data : item),
      },
    }))
    console.log('updateMultiImageData :: ' , get().formData.multi_images)
  },

  updateMultiImageDatas: (data: MultiImageData[]) => {
    set(state => ({
      formData: {
        ...state.formData,
        multi_images: data,
      },
    }))
  },


  addMultiImageDatas: (data: MultiImageData[]) => {
    set(state => ({
      formData: {
        ...state.formData,
        multi_images: [...state.formData.multi_images, ...data],
      },
    }))
  },


  deleteMultiImageData: async (hash: string, idx: number, lv: number, chrbot_multi_image_key: number, img_url: string) => {
    const deleteData = get().formData.multi_images.find(
      (item) => 
      item.img_url === img_url &&
      item.lv === lv &&
      item.chrbot_multi_image_key === chrbot_multi_image_key &&
      item.idx === idx
    )

    const isDefaultChange = (deleteData?.default_yn === 1)

    set(state => ({
      formData: {
        ...state.formData,
        multi_images: state.formData.multi_images.filter(
          (item) => item !== deleteData),
      },
    }))
    

    if(chrbot_multi_image_key) {
      const result = await createApi.DeleteMultiImageData(chrbot_multi_image_key)
      console.log('@@@@ result :: ' , result)
    }
    

    // 디폴트 이미지 삭제 시 디폴트 이미지 설정
    if(isDefaultChange) {
      const defaultData = get().formData.multi_images.filter(filter => filter.lv === lv)
      if(defaultData && defaultData.length > 0) {
        get().updateMultiImageData({
          ...defaultData[0],
          default_yn: 1,
          show_yn: 1
        })
      }
    }
  },



  changeMultiImageShow: (idx: number, lv: number, chrbot_multi_image_key: number, img_url: string) => {
    const changeData = get().formData.multi_images.find(
      (item) => item.img_url === img_url &&
      item.lv === lv &&
      item.chrbot_multi_image_key === chrbot_multi_image_key &&
      item.idx === idx
    )

    set(state => ({
      formData: {
        ...state.formData,
        multi_images: state.formData.multi_images.map(item => item === changeData ? { ...item, show_yn: item.show_yn === 1 ? 0 : 1 } : item),
      },
    }))
  },

  changeMultiImageDefault: (idx: number, lv: number, chrbot_multi_image_key: number, img_url: string) => {
    const changeData = get().formData.multi_images.find(
      (item) => item.img_url === img_url &&
      item.lv === lv &&
      item.chrbot_multi_image_key === chrbot_multi_image_key &&
      item.idx === idx
    )

    // 해당 레벨의 모든 데이터의 default_yn을 0으로 변경
    const changeDatas = get().formData.multi_images.filter((item) => item.lv === lv)
    const beforeDefaultData = changeDatas.find(item => item.default_yn === 1)
    const afterDefaultData = changeDatas.find(item => item === changeData)


    if(beforeDefaultData) {
      beforeDefaultData.default_yn = 0
      beforeDefaultData.show_yn = 0
      get().updateMultiImageData(beforeDefaultData)
    }

    if(afterDefaultData) {
      afterDefaultData.default_yn = 1
      afterDefaultData.show_yn = 1
      get().updateMultiImageData(afterDefaultData)
    }
  },


  changeMultiImageRules: (idx: number, lv: number, chrbot_multi_image_key: number, img_url: string, rules: string) => {
    const changeData = get().formData.multi_images.find(
      (item) => item.img_url === img_url &&
      item.lv === lv &&
      item.chrbot_multi_image_key === chrbot_multi_image_key &&
      item.idx === idx
    )

    set(state => ({
      formData: {
        ...state.formData,
        multi_images: state.formData.multi_images.map(item => item === changeData ? { ...item, rules: rules } : item),
      },
    }))
  },


  changeMultiImageImage: (idx: number, lv: number, chrbot_multi_image_key: number, img_url: string, url_path: string) => {
    const changeData = get().formData.multi_images.find(
      (item) => item.img_url === img_url &&
      item.lv === lv &&
      item.chrbot_multi_image_key === chrbot_multi_image_key &&
      item.idx === idx
    )

    set(state => ({
      formData: {
        ...state.formData,
        multi_images: state.formData.multi_images.map(item => item === changeData ? { ...item, img_url: url_path } : item),
      },
    }))
  },


  checkValidData: (type: 'basic' | 'detail' | 'image' | 'last') => {
    const { formData } = get()
    const nextTab = type
    const currentTab = get().activeTab

    /**
     * 현재 탭 상황을 체크 type이 전단계로 가려고하면 통과
     */
    switch(currentTab) {
      case 'basic':
        {
          if(formData.imgUrl === '') {
            console.log('@@@@ imgUrl :: ', formData.imgUrl)
            return false
          }
          if(formData.name.trim() === '') {
            console.log('@@@@ name :: ', formData.name)
            return false
          }
          if(formData.bio.trim() === '') {
            console.log('@@@@ bio :: ', formData.bio)
            return false
          }
          if(formData.firstMessage.trim() === '') {
            console.log('@@@@ firstMessage :: ', formData.firstMessage)
            return false
          }
          if(formData.hashtags.length === 0) {
            console.log('@@@@ hashtags :: ', formData.hashtags)
            return false
          }
        }
        break;

      case 'detail':
        {
          if(nextTab === 'basic') return true

          if(formData.likeability_yn === 1) {
            if(formData.likeabilities && formData.likeabilities.length !== 0) {
              for(const item of formData.likeabilities) {
                if(item.lv_name.trim() === '') {
                  return false
                }
                if(item.features.trim() === '') {
                  return false
                }
                if(item.rules.trim() === '') {
                  return false
                }
              }
            }
          }
        }
        break;

      case 'image':
        {
          if(nextTab === 'basic') return true
          if(nextTab === 'detail') return true

          console.log('@@@@ formData.multi_images :: ', formData.multi_images)

          if(formData.multi_images.length !== 0) {
            let checkImages: any[] = []

            if(formData.likeability_yn === 1) {
              checkImages = formData.multi_images.filter(item => item.lv > 0)
            }
            else {
              checkImages = formData.multi_images.filter(item => item.lv === 0)
            }
            
            for(const item of checkImages) {
              if(item.default_yn !== 1) {
                if(item.img_url.trim() !== '') {
                  if(item.rules.trim() === '') {
                    return false
                  }
                }
              }
            }
          }
        }
        break;
    }
    
    return true
  },


  // 이미지 관련 함수들
  setNormalImage: (path: string) =>
    set(state => {
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


        /**
         * 마이그레이션
         * 1. 성인용 이미지가 있으면 response.data?.chrbot.img_url_nsfw
         *  - multi_images 의 0레벨 0인덱스에 넣고 저장 후 img_url_nsfw 삭제
         * 현재 멀티이미지를 추가 후 저장하면 자동으로 img_url_nsfw 필드에 마지막 추가된 이미지가 들어가는 현상이 있음. 왜지?
        **/

        // console.log('@@@@ formData.imgUrlNsfw :: ', get().formData.imgUrlNsfw)
        const isDefaultImage = get().formData.multi_images.filter(item => item.lv === 0 && item.default_yn === 1)

        if(get().formData.multi_images.length === 0) {
          if(get().formData.imgUrlNsfw) {
            const addImageData: MultiImageData = {
              lv: 0,
              img_url: get().formData.imgUrlNsfw,
              chrbot_multi_image_key: 0,
              idx: 0,
              default_yn: isDefaultImage.length > 0 ? 0 : 1,
              rules: 'migration nsfw images',
              show_yn: isDefaultImage.length > 0 ? 0 : 1,
              world_list_detail_chrbot_key: characterId || 0,
            }
  
            get().addMultiImageDatas([addImageData])
            get().setAdultImage('')
            await get().saveMultiImages()
          }
        }
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
      const isLock = formData.finish_yn === 1 && formData.visibility === 'public'

      // 폼 데이터에서 API 요청에 필요한 데이터 추출
      const payload = {
        world_list_detail_chrbot_key: formData.world_list_detail_chrbot_key || '',
        // 이미지 URL (있는 경우에만 포함)
        img_url: formData.imgUrl || '',
        // 성인 이미지 URL (있는 경우에만 포함)
        img_url_nsfw: formData.imgUrlNsfw || '',
        title: formData.name || '',
        subject: formData.subject || '',
        gender: formData.gender === 'male' ? 1 : formData.gender === 'female' ? 2 : 0,
        intro: formData.bio || '',
        first_talk: formData.firstMessage || '',
        content: formData.content || '',
        content_public: formData.content_public || '',
        // 대화 예시 - 없는 경우 빈 문자열 전달
        example:
          formData.conversationExamples && formData.conversationExamples.length > 0
            ? JSON.stringify(exampleDatasToConversationJson(formData.conversationExamples))
            : '',
        // 성인 등급 설정
        nsfw: formData.rating === 'adult' ? 1 : 2,
        // 게시범위 (공개=1, 비공개=0)
        show_yn: formData.visibility === 'public' ? 1 : 0,
        // 상세설명 (공개=1, 비공개=0)
        content_show_yn: formData.detailVisibility === 'public' ? 1 : 0,
        // 대화 예시 (공개=1, 비공개=0) - 대화 예시가 없을 경우 0 설정
        example_show_yn:
          formData.conversationExamples && formData.conversationExamples.length > 0
            ? formData.examplesVisibility === 'public'
              ? 1
              : 0
            : 0,

        finish_yn: formData.finish_yn ? formData.finish_yn : finishYn,

        likeability_yn: formData.likeability_yn || 0,
        likeabilities: formData.likeabilities || [],
        isVisibilityLock: isLock,

        writer_note: formData.writer_note || '',
      }

      const jsonData = JSON.stringify(payload.likeabilities)
      const pako = require('pako');
		  const gzip = pako.gzip(jsonData)  // ✅ gzip 압축 사용
      const imageFile = new File([gzip], 'multiimage.txt', {
        type: 'application/gzip',
      });
      
      // ✅ Postman과 똑같이 FormData로 전체 변경
      const apiFormData = new FormData()
      {
        // 모든 필드를 FormData에 추가 (Postman과 동일하게)
        apiFormData.append('world_list_detail_chrbot_key', payload.world_list_detail_chrbot_key)
        apiFormData.append('content', payload.content)
        apiFormData.append('content_public', payload.content_public)
        apiFormData.append('content_show_yn', payload.content_show_yn.toString())
        apiFormData.append('example', payload.example)
        apiFormData.append('example_show_yn', payload.example_show_yn.toString())
        apiFormData.append('finish_yn', payload.finish_yn.toString())
        apiFormData.append('first_talk', payload.first_talk)
        apiFormData.append('gender', payload.gender.toString())
        apiFormData.append('image', imageFile)  // ✅ File 객체로 추가
        apiFormData.append('img_url', payload.img_url)
        apiFormData.append('img_url_nsfw', payload.img_url_nsfw)
        apiFormData.append('intro', payload.intro)
        apiFormData.append('likeability_yn', payload.likeability_yn.toString())
        apiFormData.append('nsfw', payload.nsfw.toString())
        apiFormData.append('show_yn', payload.show_yn.toString())
        apiFormData.append('subject', payload.subject)
        apiFormData.append('title', payload.title)
        apiFormData.append('writer_note', payload.writer_note)
        apiFormData.append('countryCode', 'KR')
      }
      

      // API 호출 (FormData 전송)
      const response = await createApi.SaveInProgressFormData(apiFormData)
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


      // property 저장
      if(finishYn === 1) {
        try {
          await get().saveProperty()
        } catch (propertyError) {
          console.error('property 저장 실패:', propertyError)
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


  saveProperty: async () => {
    interface PropertyData {
      img_selected_key: number
      img_selected_url: string
      img_public_key: number[]
    }

    const { formData } = get()
    // 여기 조건이좀 이상하다.?
    /**
     * 1. 멀티이미지가 없으면 저장 안함??
     * 2. 멀티이미지가 있으면 첫번째 이미지 선택
    */

    const firstOpenImages = formData.multi_images.filter(item => item.lv === 0 || item.lv === 1)

    let firstOpenImage = null
    let img_public_keys: number[] = []

    if(firstOpenImages && firstOpenImages.length > 0) {
      const images = firstOpenImages.filter(item => item.default_yn === 1 || item.show_yn === 1)

      if(images && images.length > 0) {
        firstOpenImage = images[0]
      }
    }

    if(formData.multi_images && formData.multi_images.length > 0) {
      // 공개 이미지 키 추출
      img_public_keys = formData.multi_images.filter(
        item => item.show_yn === 1 || (item.default_yn === 1 && item.lv === 0 || item.default_yn === 1 && item.lv === 1)
      ).map(item => item.chrbot_multi_image_key)
    }

    console.log('@@@@ firstOpenImage :: ' , firstOpenImage)
    const propertyData: PropertyData = {
      img_selected_key: firstOpenImage?.chrbot_multi_image_key || 0,
      img_selected_url: firstOpenImage?.img_url || '',
      img_public_key: img_public_keys,
    }

    const apiFormData = new FormData()
    {
      // 모든 필드를 FormData에 추가 (Postman과 동일하게)
      apiFormData.append('world_list_detail_chrbot_key', formData.world_list_detail_chrbot_key || '')
      apiFormData.append('property', JSON.stringify(propertyData) || '')
    }

    const response = await createApi.SaveInProgressFormData(apiFormData)
    if (!response.data || (response.data.result && response.data.result.err !== 0)) {
      throw new Error(response.data?.result?.msg || '저장에 실패했습니다.')
    }

    return true
  },


  saveMultiImages: async () => {
    console.log('saveMultiImages')
    
    const { formData } = get()
    /*
      formData.multi_images 와 formData.multi_images_original 비교해서 차이나는 부분만 취합
    */
    const multiImagesWithIdx = formData.multi_images.filter(item => {
      const originalItem = formData.multi_images_original.find(original => 
        original.idx === item.idx && 
        original.chrbot_multi_image_key === item.chrbot_multi_image_key &&
        original.default_yn === item.default_yn &&
        original.img_url === item.img_url && 
        original.lv === item.lv && 
        original.rules === item.rules &&
        original.show_yn === item.show_yn
      )
      return originalItem === undefined
    })


    console.log('@@@@ multiImagesWithIdx :: ' , multiImagesWithIdx)


    // 필요한 데이터만 취합해서 gzip
    const saveDatas = multiImagesWithIdx.map(item => ({
      idx: item.idx || 0,
      chrbot_multi_image_key: item.chrbot_multi_image_key || 0,
      default_yn: item.default_yn,
      img_url: item.img_url,
      lv: item.lv,
      rules: item.rules,
      show_yn: item.show_yn,
      world_list_detail_chrbot_key: Number(formData.world_list_detail_chrbot_key),
    }))

    const jsonData = JSON.stringify(saveDatas)
    const pako = require('pako');
    const gzip = pako.gzip(jsonData)  // ✅ gzip 압축 사용
    const imageFile = new File([gzip], 'multiimage.txt', {
      type: 'application/gzip',
    });

    const apiFormData = new FormData()
    {
      apiFormData.append('world_list_detail_chrbot_key', formData.world_list_detail_chrbot_key || '')
      apiFormData.append('likeability_yn', formData.likeability_yn?.toString() || '')
      apiFormData.append('image', imageFile)  // ✅ File 객체로 추가
    }
    const response = await createApi.SaveMultiImageData(apiFormData)
    if (!response.data || (response.data.result && response.data.result.err !== 0)) {
      throw new Error(response.data?.result?.msg || '저장에 실패했습니다.')
    }

    const multiImageData = response.data.multi_image_data
    if(multiImageData) {
      // get().updateMultiImageDatas(multiImageData)
      set(state => {
        // ✅ 서버에서 받은 chrbot_multi_image_key로 기존 이미지들 업데이트
        const updatedMultiImages = state.formData.multi_images.map(existingImage => {
          // chrbot_multi_image_key가 0인 이미지만 업데이트 대상
          if (existingImage.chrbot_multi_image_key === 0) {
            // idx, lv, img_url, rules로 매칭되는 서버 이미지 찾기
            const matchedServerImage = multiImageData.find((serverImage: any) => 
              existingImage.idx === serverImage.idx &&
              existingImage.lv === serverImage.lv &&
              existingImage.img_url === serverImage.img_url &&
              existingImage.rules === serverImage.rules
            )
            
            // 매칭된 서버 이미지가 있으면 chrbot_multi_image_key 업데이트
            if (matchedServerImage) {
              return {
                ...existingImage,
                chrbot_multi_image_key: matchedServerImage.chrbot_multi_image_key
              }
            }
          }
          
          return existingImage
        })

        return {
          formData: {
            ...state.formData,
            multi_images: updatedMultiImages,
            multi_images_original: updatedMultiImages,
          },
        }
      })
    }

    return true
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
      isVaild: false,
    }),
}))

// 폼 유효성 검사 함수
export const isFormValid = (formData: CharacterFormData, tab: 'basic' | 'detail' | 'image' | 'last'): boolean => {
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
