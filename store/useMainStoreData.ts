import { CharbotTop10NewResponse, ModuleCharacter } from '@/types/api'
import { create } from 'zustand'
import { contentApi } from '@/services/api'
import { QueryClient } from '@tanstack/react-query'
import { Character } from '@/store/useStoreData'
import {
  bridgeModuleCreatorToCharacter,
  bridgeTop10DataToModuleCharacter,
  bridgeCharacterDataToCharacter,
} from '@/lib/utils/storyNationUtil'

interface ModuleTitle {
  title: string
  subTitle: string
}

export const moduleForTitleData: { [key: number]: ModuleTitle } = {
  1: {
    title: `아이돌 스캔들의 주인공들`,
    subTitle: `캐릭터와 채팅하고 오리지널 스토리도 읽어보세요!`,
  },
  2: {
    title: `남친 삼고픈 '진짜' 알파메일`,
    subTitle: '깊은 대화로 그 남자의 숨겨진 매력을 발견하세요!',
  },
  3: {
    title: '취향저격 판타지 캐릭터!',
    subTitle: '독특한 세계관 속 로맨스와 모험이 펼쳐집니다:)',
  },
  4: {
    title: '평범한 고등학생은 없습니다.',
    subTitle: '일진녀부터 마법사까지... 누구랑 엮일래?',
  },
  5: {
    title: '1분만에 손절? 레전드 소개팅!',
    subTitle: '상상도 못한 매칭, 레전드 썰 제조기 등장',
  },
  6: {
    title: '최신 오리지널 캐릭터!',
    subTitle: '스네가 직접 만든 고퀄 캐릭터를 만나보세요 :)',
  },
  7: {
    title: '당신을 사로잡을 여신들',
    subTitle: '당신과 그녀, 둘 만의 은밀한 이야기를 즐겨보세요!',
  },
  8: {
    title: '지금 막 올라온 캐릭터',
    subTitle: '당신과 그녀, 둘 만의 은밀한 이야기를 즐겨보세요!',
  },
}

// 싱글톤 queryClient 생성 (최초 한 번만 생성)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분 동안 데이터를 신선하게 유지
      gcTime: 1000 * 60 * 30, // 30분 동안 데이터 캐싱 (이전의 cacheTime)
      retry: 1, // 실패시 1번 재시도
      refetchOnWindowFocus: false, // 윈도우 포커스시 자동 리페치 비활성화
    },
  },
})

interface sumCharacterData {
  module_id: number
  order: number
  characters: Character[]
}

// 추천 캐릭터 데이터 스토어
interface MainStoreData {
  characters: CharbotTop10NewResponse | null

  // 캐릭터 랭킹
  rankingCharacters: Array<Character> | []

  // 작가 랭킹
  rankingCreaters: Array<any> | []

  // 최신 캐릭터
  latestCharacters: Array<Character> | []

  // 그 외 ...
  modules_sum: Array<sumCharacterData> | []

  rankingCharactersSlide: Array<Character> | []
  rankingCreatersSlide: Array<Character> | []
  modules_sumSlide: Array<Character> | []

  etcCharactersSlide: Array<Character> | []

  isLoading: boolean
  error: Error | null

  initialize: () => Promise<void>
  invalidateData: () => Promise<void>

  UpdateRankingTopCharacter: (
    countryCode: string,
    ranking_type: number,
    gender: number,
    isSlide: boolean | false
  ) => Promise<Character[]>
  UpdateRankingTopCreater: (countryCode: string, ranking_type: number, isSlide: boolean | false) => Promise<Character[]>
  UpdateLatestCharacters: (ranking_type: number, gender: number, isSlide: boolean | false) => Promise<Character[]>
  UpdateLatestCharactersPaging: (
    ranking_type: number,
    gender: number,
    page: number,
    pageSize: number
  ) => Promise<Character[]>
  UpdateEtcCharactersPaging: (
    module_id: number,
    ranking_type: number,
    page: number,
    pageSize: number
  ) => Promise<Character[]>
  ClearEtcCharactersSlide: () => void
  ClearLatestCharactersSlide: () => void
  UpdateharactersPaging: (
    beforeDatas: Character[],
    module_id: number,
    ranking_type: number,
    page: number,
    pageSize: number
  ) => Promise<Character[]>
}

export const useRecommendSectionStoreData = create<MainStoreData>((set, get) => ({
  characters: null,
  rankingCharacters: [],
  rankingCreaters: [],
  latestCharacters: [],

  modules_sum: [],

  modules_sumSlide: [],
  rankingCharactersSlide: [],
  rankingCreatersSlide: [],

  etcCharactersSlide: [],

  isLoading: false,
  error: null,

  // TopCharacter
  UpdateRankingTopCharacter: async (
    countryCode: string,
    ranking_type: number,
    gender: number,
    isSlide: boolean = false
  ) => {
    try {
      console.log('UpdateRankingTopCharacter 호출됨')

      // 직접 데이터 가져오기 (이 경우 contentApi.GetTop10Ranking API를 사용하므로 UpdateharactersPaging 재사용 불가)
      const data = await queryClient.fetchQuery({
        queryKey: ['rankingCharacters', countryCode, ranking_type, gender, isSlide],
        queryFn: async () => {
          const response = await contentApi.GetTop10Ranking(countryCode, ranking_type, gender, 2)
          const moduleCharacters = response.data?.module_9.map((item: ModuleCharacter) => ({
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
            module_id: item.module_id,
            sort: item.sort,
          }))
          return bridgeCharacterDataToCharacter(moduleCharacters)
        },
        staleTime: 0,
      })

      if (data) {
        if (isSlide) {
          set({ rankingCharactersSlide: data })
        } else {
          set({ rankingCharacters: data })
        }
        return data
      }
      return []
    } catch (error) {
      console.error('TopCharacter 데이터 로딩 중 오류 발생:', error)
      return []
    }
  },

  // TopCreater
  UpdateRankingTopCreater: async (countryCode: string, ranking_type: number, isSlide: boolean = false) => {
    try {
      const data = await queryClient.fetchQuery({
        queryKey: ['rankingCreaters', countryCode, ranking_type],
        queryFn: async () => {
          const response = await contentApi.GetTop10RankingCreater(countryCode, ranking_type)
          const moduleCreaters = response.data?.module_10.map(item => ({
            intro: item.intro || '',
            module_id: item.module_id,
            module_type: item.module_type,
            nick_nm: item.nick_nm,
            profile_url: item.profile_url,
            user_key: item.user_key,
            withdraw_pen: item.withdraw_pen,
          }))

          const creaters = bridgeModuleCreatorToCharacter(moduleCreaters)
          return creaters.map(creater => ({
            id: creater.id,
            name: creater.name,
            description: creater.description,
            imageUrl: creater.profileImageUrl,
            commentCount: 0,
            hashtags: [],
            isAdult: false,
            creator: {
              id: creater.id,
              nickname: creater.nickname,
              username: creater.nickname,
              profileImageUrl: creater.profileImageUrl,
              isActive: true,
            },
            category: 'unspecified' as const,
          }))
        },
        staleTime: 0,
      })

      if (data) {
        if (isSlide) {
          set({ rankingCreatersSlide: data })
        } else {
          set({ rankingCreaters: data })
        }
        return data
      }
      return []
    } catch (error) {
      console.error('TopCreater 데이터 로딩 중 오류 발생:', error)
      return []
    }
  },

  // LatestCharacters
  UpdateLatestCharacters: async (ranking_type: number, gender: number, isSlide: boolean = false) => {
    try {
      // 최신 캐릭터 데이터 가져오기 (module_id=8, 최신 캐릭터 모듈)
      const data = await queryClient.fetchQuery({
        queryKey: ['latestCharacters', ranking_type, gender],
        queryFn: async () => {
          const response = await contentApi.GetListRcmnd(8, ranking_type, 1, 10, gender)
          const moduleKey = `module_8` as keyof typeof response.data
          const moduleCharacters = (response.data?.[moduleKey] as ModuleCharacter[])?.map(item => ({
            world_list_detail_chrbot_key: item.world_list_detail_chrbot_key,
            title: item.title,
            intro: item.intro,
            img_url: item.img_url,
            img_web_url: item.img_web_url || item.img_url,
            lv: item.lv || 0,
            tags: item.tags || '',
            chat_cnt: item.chat_cnt || 0,
            msg_cnt: item.msg_cnt || 0,
            like_cnt: item.like_cnt || 0,
            create_dt: item.create_dt || new Date().toISOString(),
            nick_nm: item.nick_nm,
            nsfw: item.nsfw || 0,
            module_id: item.module_id || 0,
            sort: item.sort || 0,
          }))
          return bridgeCharacterDataToCharacter(moduleCharacters)
        },
        staleTime: 0,
      })

      // 데이터 상태 업데이트
      if (data) {
        if (isSlide) {
          set({ modules_sumSlide: data })
        } else {
          set({ modules_sumSlide: data })
        }
        return data
      }
      return []
    } catch (error) {
      console.error('LatestCharacters 데이터 로딩 중 오류 발생:', error)
      return []
    }
  },

  // LatestCharacters
  UpdateLatestCharactersPaging: async (ranking_type: number, gender: number, page: number, pageSize: number) => {
    try {
      // 기존 데이터 가져오기
      const currentData = get().modules_sumSlide || []

      // UpdateharactersPaging 함수를 재사용하여 데이터 가져오기
      const mergedData = await get().UpdateharactersPaging(currentData, 8, ranking_type, page, pageSize)

      // 상태 업데이트
      set({ modules_sumSlide: mergedData })
      return mergedData
    } catch (error) {
      console.error('LatestCharacters 데이터 로딩 중 오류 발생:', error)
      return []
    }
  },

  // EtcCharacters 페이징 처리
  UpdateEtcCharactersPaging: async (module_id: number, ranking_type: number, page: number, pageSize: number) => {
    try {
      // 기존 데이터 가져오기
      const currentData = get().etcCharactersSlide || []

      // UpdateharactersPaging 함수를 재사용하여 데이터 가져오기
      const mergedData = await get().UpdateharactersPaging(currentData, module_id, ranking_type, page, pageSize)

      // 상태 업데이트
      set({ etcCharactersSlide: mergedData })
      return mergedData
    } catch (error) {
      console.error('EtcCharacters 데이터 로딩 중 오류 발생:', error)
      return []
    }
  },

  // Get Characters 페이징 처리
  UpdateharactersPaging: async (
    beforeDatas: Character[],
    module_id: number,
    ranking_type: number,
    page: number,
    pageSize: number
  ) => {
    try {
      const data = await queryClient.fetchQuery({
        queryKey: ['getCharacters', module_id, ranking_type, page, pageSize],
        queryFn: async () => {
          const response = await contentApi.GetListRcmnd(module_id, ranking_type, page, pageSize, 0)
          const moduleKey = `module_${module_id}` as keyof typeof response.data
          const moduleCharacters = (response.data?.[moduleKey] as ModuleCharacter[])?.map(item => ({
            world_list_detail_chrbot_key: item.world_list_detail_chrbot_key,
            title: item.title,
            intro: item.intro,
            img_url: item.img_url,
            img_web_url: item.img_web_url || item.img_url,
            lv: item.lv || 0,
            tags: item.tags || '',
            chat_cnt: item.chat_cnt || 0,
            msg_cnt: item.msg_cnt || 0,
            like_cnt: item.like_cnt || 0,
            create_dt: item.create_dt || new Date().toISOString(),
            nick_nm: item.nick_nm,
            nsfw: item.nsfw || 0,
            module_id: item.module_id || module_id,
            sort: item.sort || 0,
          }))
          return bridgeCharacterDataToCharacter(moduleCharacters || [])
        },
        staleTime: 0,
      })

      if (data) {
        // 중복 제거를 위해 Map 사용 (id 기준)
        const uniqueMap = new Map(beforeDatas.map(item => [item.id, item]))

        // 새로운 데이터 추가 (중복시 덮어쓰기)
        data.forEach(item => uniqueMap.set(item.id, item))

        // Map을 배열로 변환하여 반환
        return Array.from(uniqueMap.values())
      }
      return beforeDatas
    } catch (error) {
      console.error('Characters 데이터 로딩 중 오류 발생:', error)
      return beforeDatas
    }
  },

  // 초기 데이터 불러오기
  initialize: async () => {
    // 로딩 상태 설정
    set({ isLoading: true, error: null })

    try {
      // React Query를 통해 데이터 요청
      const data = await queryClient.fetchQuery({
        queryKey: ['mainData'],
        queryFn: async () => {
          const response = await contentApi.GetTop10()
          return response?.data
        },
        staleTime: 1000 * 60 * 5, // 5분
      })

      if (data?.modules) {
        let modulesSumData: Array<sumCharacterData> = []
        const excludedModules = [8, 9, 10]

        // data.order 배열을 순회하면서 모듈 데이터 수집
        data.order.forEach((moduleNumber, index) => {
          // 8, 9, 10번 모듈 제외하고 처리
          if (!excludedModules.includes(moduleNumber)) {
            const moduleKey = `module_${moduleNumber}` as keyof typeof data.modules
            const moduleData = data.modules[moduleKey] as ModuleCharacter[]

            if (moduleData) {
              const characters = bridgeTop10DataToModuleCharacter(moduleData) as Character[]
              if (characters) {
                modulesSumData.push({
                  module_id: moduleNumber,
                  order: index, // data.order에서의 인덱스를 order로 사용
                  characters: characters,
                })
              }
            }
          }
        })

        // Zustand 스토어 업데이트
        set({
          rankingCharacters: (bridgeTop10DataToModuleCharacter(data.modules.module_9) as Character[]) || [],
          rankingCreaters: (bridgeModuleCreatorToCharacter(data.modules.module_10) as unknown as Character[]) || [],
          latestCharacters: (bridgeTop10DataToModuleCharacter(data.modules.module_8) as Character[]) || [],
          modules_sum: modulesSumData,
          isLoading: false,
        })
      } else {
        set({ isLoading: false, error: new Error('데이터가 없습니다') })
      }
    } catch (error) {
      console.error('데이터 로딩 중 오류 발생:', error)
      set({ isLoading: false, error: error as Error })
    }
  },

  // 데이터를 무효화하고 다시 가져오는 함수
  invalidateData: async () => {
    await queryClient.invalidateQueries({ queryKey: ['mainData'] })
    get().initialize()
  },

  ClearEtcCharactersSlide: () => {
    set({ etcCharactersSlide: [] })
  },

  ClearLatestCharactersSlide: () => {
    set({ modules_sumSlide: [] })
  },
}))
