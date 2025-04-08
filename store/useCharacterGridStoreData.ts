import { create } from 'zustand'
import { contentApi } from '@/services/api'
import { Character } from '@/store/useStoreData'
import { CATEGORIES } from '@/services/hooks/DataListManager'
import { bridgeCharacterDataToCharacter } from '@/lib/utils/storyNationUtil'

// 태그 인터페이스 정의
interface Tag {
  c_chrbot_tag_key: number
  tag: string
  group: number
  sort: number
}

// 필터 인터페이스
interface Filter {
  order: number // 1: 인기순(기본값), 2: 최신순
  nsfw: number // 1: 짜릿모드 가능, 2: 전체 이용가(기본값), 3: 이용등급 전체
}

// 상태 인터페이스
interface CharacterGridState {
  // 기본 데이터
  characters: Character[]
  tags: Tag[]

  // 필터 및 카테고리 설정
  currentCategory: string
  currentTags: string[]
  filter: Filter

  // 페이지네이션
  pagination: {
    page: number
    total: number
    hasMore: boolean
  }

  // 로딩 상태
  isLoading: boolean
  isTagsLoading: boolean
  error: Error | null
  tagsError: Error | null

  // 데이터 없음 플래그
  isEmpty: boolean
}

// 액션 인터페이스
interface CharacterGridActions {
  // 초기화 및 데이터 로드
  changeCategory: (categoryId: string) => Promise<void>
  updateFilter: (newFilter: Partial<Filter>) => Promise<void>
  updateTags: (tagIds: string[]) => Promise<void>
  loadMore: () => Promise<void>
  reset: () => void
}

// 전체 스토어 타입
type CharacterGridStore = CharacterGridState & CharacterGridActions

export const useCharacterGridStoreData = create<CharacterGridStore>((set, get) => ({
  // 기본 데이터
  characters: [],
  tags: [],

  // 필터 및 카테고리 설정
  currentCategory: 'all',
  currentTags: [],
  filter: {
    order: 2, // 최신순으로 변경
    nsfw: 2, // 전체 이용가
  },

  // 페이지네이션
  pagination: {
    page: 1,
    total: 0,
    hasMore: false,
  },

  // 로딩 상태
  isLoading: false,
  isTagsLoading: false,
  error: null,
  tagsError: null,

  // 데이터 없음 플래그
  isEmpty: false,

  /**
   * 카테고리 변경 및 데이터 초기화
   */
  changeCategory: async (categoryId: string) => {
    // 이미 같은 카테고리면 아무것도 하지 않음
    if (get().currentCategory === categoryId) return

    // 상태 초기화 및 로딩 시작
    set({
      isLoading: true,
      error: null,
      currentCategory: categoryId,
      currentTags: [], // 카테고리 변경 시 태그 초기화
      pagination: {
        page: 1,
        total: 0,
        hasMore: false,
      },
      characters: [], // 캐릭터 목록 초기화
      isEmpty: false, // 데이터 없음 상태 초기화
    })

    // 병렬로 태그 데이터 로드 시작 (별도 함수로 분리)
    const categoryIdNum = CATEGORIES.find(cat => cat.id === categoryId)?.type || 1
    loadTagsForCategory(Number(categoryIdNum))

    try {
      // 캐릭터 데이터 로드
      const { filter } = get()
      const response = await contentApi.GetList(
        categoryId === 'all' ? 'recommend' : categoryIdNum.toString(),
        '', // 태그 초기화 (빈 문자열)
        filter.nsfw,
        filter.order,
        1, // 페이지 1로 초기화
        10 // 한 번에 가져올 아이템 수
      )

      const data = response?.data

      if (data?.chrbotList?.data && data.chrbotList.data.length > 0) {
        // ModuleCharacter 형식으로 변환
        const moduleData = data.chrbotList.data.map(item => ({
          world_list_detail_chrbot_key: item.world_list_detail_chrbot_key,
          title: item.title,
          intro: item.intro,
          img_url: item.img_url,
          img_web_url: item.img_web_url || item.img_url,
          lv: item.lv,
          tags: item.tags,
          chat_cnt: item.chat_cnt,
          msg_cnt: item.msg_cnt,
          like_cnt: item.like_cnt,
          create_dt: item.create_dt,
          nick_nm: item.nick_nm,
          nsfw: item.nsfw,
          module_id: 0,
          sort: 0,
        }))

        // Character 형식으로 변환
        const newCharacters = bridgeCharacterDataToCharacter(moduleData)

        // 상태 업데이트
        set({
          characters: newCharacters,
          pagination: {
            page: 1,
            total: data.chrbotList.total || 0,
            hasMore: data.chrbotList.current_page < data.chrbotList.last_page,
          },
          isLoading: false,
          isEmpty: false,
        })
      } else {
        // 데이터가 없는 경우
        set({
          characters: [],
          pagination: {
            page: 1,
            total: 0,
            hasMore: false,
          },
          isLoading: false,
          isEmpty: true,
        })
      }
    } catch (error) {
      console.error('카테고리 변경 후 데이터 로드 중 오류 발생:', error)
      set({
        isLoading: false,
        error: error as Error,
        isEmpty: true,
      })
    }
  },

  /**
   * 필터 업데이트 (정렬, NSFW 등)
   */
  updateFilter: async (newFilter: Partial<Filter>) => {
    // 현재 필터와 새 필터 병합
    const updatedFilter = { ...get().filter, ...newFilter }

    // 변경이 없으면 아무것도 하지 않음
    if (JSON.stringify(updatedFilter) === JSON.stringify(get().filter)) {
      return
    }

    // 필터 업데이트 및 로딩 시작
    set({
      filter: updatedFilter,
      isLoading: true,
      error: null,
      pagination: {
        page: 1, // 페이지 1로 초기화
        total: 0,
        hasMore: false,
      },
      characters: [], // 캐릭터 목록 초기화
      isEmpty: false, // 데이터 없음 상태 초기화
    })

    try {
      const { currentCategory, currentTags } = get()
      const response = await contentApi.GetList(
        currentCategory === 'all' ? 'recommend' : CATEGORIES.find(cat => cat.id === currentCategory)?.type || '1',
        currentTags.join(','),
        updatedFilter.nsfw,
        updatedFilter.order,
        1, // 페이지 1로 초기화
        10 // 한 번에 가져올 아이템 수
      )

      const data = response?.data

      if (data?.chrbotList?.data && data.chrbotList.data.length > 0) {
        // ModuleCharacter 형식으로 변환
        const moduleData = data.chrbotList.data.map(item => ({
          world_list_detail_chrbot_key: item.world_list_detail_chrbot_key,
          title: item.title,
          intro: item.intro,
          img_url: item.img_url,
          img_web_url: item.img_web_url || item.img_url,
          lv: item.lv,
          tags: item.tags,
          chat_cnt: item.chat_cnt,
          msg_cnt: item.msg_cnt,
          like_cnt: item.like_cnt,
          create_dt: item.create_dt,
          nick_nm: item.nick_nm,
          nsfw: item.nsfw,
          module_id: 0,
          sort: 0,
        }))

        // Character 형식으로 변환
        const newCharacters = bridgeCharacterDataToCharacter(moduleData)

        // 상태 업데이트
        set({
          characters: newCharacters,
          pagination: {
            page: 1,
            total: data.chrbotList.total || 0,
            hasMore: data.chrbotList.current_page < data.chrbotList.last_page,
          },
          isLoading: false,
          isEmpty: false,
        })
      } else {
        // 데이터가 없는 경우
        set({
          characters: [],
          pagination: {
            page: 1,
            total: 0,
            hasMore: false,
          },
          isLoading: false,
          isEmpty: true,
        })
      }
    } catch (error) {
      console.error('필터 변경 후 데이터 로드 중 오류 발생:', error)
      set({
        isLoading: false,
        error: error as Error,
        isEmpty: true,
      })
    }
  },

  /**
   * 태그 업데이트
   */
  updateTags: async (tagIds: string[]) => {
    // 이미 같은 태그 선택이면 아무것도 하지 않음
    if (JSON.stringify(get().currentTags) === JSON.stringify(tagIds)) {
      return
    }

    // 태그 업데이트 및 로딩 시작
    set({
      currentTags: tagIds,
      isLoading: true,
      error: null,
      pagination: {
        page: 1, // 페이지 1로 초기화
        total: 0,
        hasMore: false,
      },
      characters: [], // 캐릭터 목록 초기화
      isEmpty: false, // 데이터 없음 상태 초기화
    })

    try {
      const { currentCategory, filter } = get()
      const response = await contentApi.GetList(
        currentCategory === 'all' ? 'recommend' : CATEGORIES.find(cat => cat.id === currentCategory)?.type || '1',
        tagIds.join(','),
        filter.nsfw,
        filter.order,
        1, // 페이지 1로 초기화
        10 // 한 번에 가져올 아이템 수
      )

      const data = response?.data

      if (data?.chrbotList?.data && data.chrbotList.data.length > 0) {
        // ModuleCharacter 형식으로 변환
        const moduleData = data.chrbotList.data.map(item => ({
          world_list_detail_chrbot_key: item.world_list_detail_chrbot_key,
          title: item.title,
          intro: item.intro,
          img_url: item.img_url,
          img_web_url: item.img_web_url || item.img_url,
          lv: item.lv,
          tags: item.tags,
          chat_cnt: item.chat_cnt,
          msg_cnt: item.msg_cnt,
          like_cnt: item.like_cnt,
          create_dt: item.create_dt,
          nick_nm: item.nick_nm,
          nsfw: item.nsfw,
          module_id: 0,
          sort: 0,
        }))

        // Character 형식으로 변환
        const newCharacters = bridgeCharacterDataToCharacter(moduleData)

        // 상태 업데이트
        set({
          characters: newCharacters,
          pagination: {
            page: 1,
            total: data.chrbotList.total || 0,
            hasMore: data.chrbotList.current_page < data.chrbotList.last_page,
          },
          isLoading: false,
          isEmpty: false,
        })
      } else {
        // 데이터가 없는 경우
        set({
          characters: [],
          pagination: {
            page: 1,
            total: 0,
            hasMore: false,
          },
          isLoading: false,
          isEmpty: true,
        })
      }
    } catch (error) {
      console.error('태그 변경 후 데이터 로드 중 오류 발생:', error)
      set({
        isLoading: false,
        error: error as Error,
        isEmpty: true,
      })
    }
  },

  /**
   * 추가 데이터 로드 (페이지네이션)
   */
  loadMore: async () => {
    const { isLoading, pagination, filter, currentCategory, currentTags, characters } = get()

    // 이미 로딩 중이거나 더 로드할 데이터가 없으면 리턴
    if (isLoading || !pagination.hasMore) return

    const nextPage = pagination.page + 1
    set({ isLoading: true })

    try {
      const response = await contentApi.GetList(
        currentCategory === 'all' ? 'recommend' : CATEGORIES.find(cat => cat.id === currentCategory)?.type || '1',
        currentTags.join(','),
        filter.nsfw,
        filter.order,
        nextPage,
        10 // 한 번에 가져올 아이템 수
      )

      const data = response?.data

      if (data?.chrbotList?.data && data.chrbotList.data.length > 0) {
        // ModuleCharacter 형식으로 변환
        const newModuleData = data.chrbotList.data.map(item => ({
          world_list_detail_chrbot_key: item.world_list_detail_chrbot_key,
          title: item.title,
          intro: item.intro,
          img_url: item.img_url,
          img_web_url: item.img_web_url || item.img_url,
          lv: item.lv,
          tags: item.tags,
          chat_cnt: item.chat_cnt,
          msg_cnt: item.msg_cnt,
          like_cnt: item.like_cnt,
          create_dt: item.create_dt,
          nick_nm: item.nick_nm,
          nsfw: item.nsfw,
          module_id: 0,
          sort: 0,
        }))

        // Character 형식으로 변환
        const newCharacters = bridgeCharacterDataToCharacter(newModuleData)

        // 기존 데이터와 병합
        set({
          characters: [...characters, ...newCharacters],
          pagination: {
            page: nextPage,
            total: data.chrbotList.total || 0,
            hasMore: data.chrbotList.current_page < data.chrbotList.last_page,
          },
          isLoading: false,
        })
      } else {
        set({
          isLoading: false,
          pagination: {
            ...pagination,
            hasMore: false,
          },
        })
      }
    } catch (error) {
      console.error('추가 데이터 로딩 중 오류 발생:', error)
      set({
        isLoading: false,
        error: error as Error,
        pagination: {
          ...pagination,
          hasMore: false,
        },
      })
    }
  },

  /**
   * 상태 초기화
   */
  reset: () => {
    set({
      characters: [],
      currentCategory: 'all',
      currentTags: [],
      pagination: {
        page: 1,
        total: 0,
        hasMore: false,
      },
      filter: {
        order: 2, // 최신순으로 변경
        nsfw: 2, // 전체 이용가
      },
      isLoading: false,
      error: null,
      isEmpty: false,
    })
  },
}))

/**
 * 카테고리에 따른 태그 데이터 로드 (내부 함수)
 */
async function loadTagsForCategory(categoryId: number) {
  // 태그 로딩 상태 설정
  useCharacterGridStoreData.setState({ isTagsLoading: true, tagsError: null })

  console.log('categoryID : ', categoryId)

  try {
    // 태그 데이터 요청
    const response = await contentApi.GetTagRankingList(categoryId)
    const data = response?.data

    if (data && data.charbot_tag) {
      useCharacterGridStoreData.setState({
        tags: data.charbot_tag,
        isTagsLoading: false,
      })
    } else {
      useCharacterGridStoreData.setState({
        isTagsLoading: false,
        tagsError: new Error('태그 데이터가 없습니다'),
        tags: [],
      })
    }
  } catch (error) {
    console.error('태그 데이터 로딩 중 오류 발생:', error)
    useCharacterGridStoreData.setState({
      isTagsLoading: false,
      tagsError: error as Error,
    })
  }
}
