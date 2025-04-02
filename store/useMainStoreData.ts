import { CharbotTop10NewResponse } from '@/types/api'
import { create } from 'zustand'
import { contentApi } from '@/services/api'
import { QueryClient } from '@tanstack/react-query'
import { Character } from '@/store/useStoreData'
import { bridgeModuleCreatorToCharacter, bridgeTop10DataToModuleCharacter, bridgeCharacterDataToCharacter } from '@/lib/utils/storyNationUtil'
import { useAccountStore } from '@/store/useAccountStore'

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


// 추천 캐릭터 데이터 스토어
interface MainStoreData {
    characters: CharbotTop10NewResponse | null
    rankingCharacters: Array<Character> | [];
    rankingCreaters: Array<Character> | [];
    
    modules_1: Array<Character> | [];
    modules_2: Array<Character> | [];
    modules_3: Array<Character> | [];
    modules_sum: Array<Character> | [];

    rankingCharactersSlide: Array<Character> | [];
    rankingCreatersSlide: Array<Character> | [];
    modules_sumSlide: Array<Character> | [];
  
    isLoading: boolean;
    error: Error | null;
  
    initialize: () => Promise<void>;
    invalidateData: () => Promise<void>;

    UpdateRankingTopCharacter: (countryCode: string, ranking_type: number, gender: number, isSlide: boolean | false) => Promise<Character[]>;
    UpdateRankingTopCreater: (countryCode: string, ranking_type: number, isSlide: boolean | false) => Promise<Character[]>;
    UpdateLatestCharacters: (ranking_type: number, gender: number, isSlide: boolean | false) => Promise<Character[]>;
    UpdateLatestCharactersPaging: (ranking_type: number, gender: number, page: number, pageSize: number) => Promise<Character[]>;
}
  
export const useRecommendSectionStoreData = create<MainStoreData>((set, get) => ({
  characters: null,
  rankingCharacters: [],
  rankingCreaters: [],

  modules_1: [],
  modules_2: [],
  modules_3: [],
  modules_sum: [],

  modules_sumSlide: [],
  rankingCharactersSlide: [],
  rankingCreatersSlide: [],


  isLoading: false,
  error: null,

  // TopCharacter
  UpdateRankingTopCharacter: async (countryCode: string, ranking_type: number, gender: number, isSlide: boolean = false) => {
    try {
      const data = await queryClient.fetchQuery({
        queryKey: ['rankingCharacters', countryCode, ranking_type, gender, isSlide],
        queryFn: async () => {
          const response = await contentApi.GetTop10Ranking(countryCode, ranking_type, gender);
          const moduleCharacters = response.data?.module_9.map(item => ({
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
            sort: item.sort
          }));
          return bridgeCharacterDataToCharacter(moduleCharacters);
        },
        staleTime: 0
      });
      
      if (data) {
        if (isSlide) {
          set({ rankingCharactersSlide: data });
        } else {
          set({ rankingCharacters: data });
        }
        return data;
      }
      return [];
    } catch (error) {
      console.error("TopCharacter 데이터 로딩 중 오류 발생:", error);
      return [];
    }
  },

  // TopCreater
  UpdateRankingTopCreater: async (countryCode: string, ranking_type: number, isSlide: boolean = false) => {
    try {
      const data = await queryClient.fetchQuery({
        queryKey: ['rankingCreaters', countryCode, ranking_type],
        queryFn: async () => {
          const response = await contentApi.GetTop10RankingCreater(countryCode, ranking_type);
          const moduleCreaters = response.data?.module_10.map(item => ({
            intro: item.intro || '',
            module_id: item.module_id,
            module_type: item.module_type,
            nick_nm: item.nick_nm,
            profile_url: item.profile_url,
            user_key: item.user_key,
            withdraw_pen: item.withdraw_pen
          }));
          const creaters = bridgeModuleCreatorToCharacter(moduleCreaters);
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
              isActive: true
            },
            category: 'unspecified' as const
          }));
        },
        staleTime: 0
      });
      
      if (data) {
        if (isSlide) {
          set({ rankingCreatersSlide: data });
        } else {
          set({ rankingCreaters: data });
        }
        return data;
      }
      return [];
    } catch (error) {
      console.error("TopCreater 데이터 로딩 중 오류 발생:", error);
      return [];
    }
  },

  // LatestCharacters
  UpdateLatestCharacters: async (ranking_type: number, gender: number, isSlide: boolean = false) => {
    try {
      const data = await queryClient.fetchQuery({
        queryKey: ['latestCharacters', ranking_type, gender],
        queryFn: async () => {
          const response = await contentApi.GetListRcmnd(9, ranking_type, 1, 10, gender);
          const moduleCharacters = response.data?.module_9.map(item => ({
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
            sort: item.sort || 0
          }));
          return bridgeCharacterDataToCharacter(moduleCharacters);
        },
        staleTime: 0
      });
      
      if (data) {
        if (isSlide) {
          set({ modules_sumSlide: data });
        } else {
          set({ modules_sum: data });
        }
        return data;
      }
      return [];
    } catch (error) {
      console.error("LatestCharacters 데이터 로딩 중 오류 발생:", error);
      return [];
    }
  },


  // LatestCharacters
  UpdateLatestCharactersPaging: async (ranking_type: number, gender: number, page: number, pageSize: number) => {
    try {
      const data = await queryClient.fetchQuery({
        queryKey: ['latestCharacters', ranking_type, gender, page, pageSize],
        queryFn: async () => {
          const response = await contentApi.GetListRcmnd(9, ranking_type, page, pageSize, gender);
          const moduleCharacters = response.data?.module_9.map(item => ({
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
            sort: item.sort || 0
          }));
          return bridgeCharacterDataToCharacter(moduleCharacters);
        },
        staleTime: 0
      });
      
      if (data) {
        // 기존 데이터와 새로운 데이터를 합치기
        const currentData = get().modules_sumSlide || [];
        
        // 중복 제거를 위해 Map 사용 (id 기준)
        const uniqueMap = new Map();
        
        // 기존 데이터 먼저 Map에 추가
        currentData.forEach(item => {
          uniqueMap.set(item.id, item);
        });
        
        // 새로운 데이터 추가 (중복시 덮어쓰기)
        data.forEach(item => {
          uniqueMap.set(item.id, item);
        });
        
        // Map을 배열로 변환
        const mergedData = Array.from(uniqueMap.values());
        
        set({ modules_sumSlide: mergedData });
        return mergedData;
      }
      return [];
    } catch (error) {
      console.error("LatestCharacters 데이터 로딩 중 오류 발생:", error);
      return [];
    }
  },


  // 초기 데이터 불러오기
  initialize: async () => {
    // 로딩 상태 설정
    set({ isLoading: true, error: null });
    
    try {
      // React Query를 통해 데이터 요청
      const data = await queryClient.fetchQuery({
        queryKey: ['mainData'],
        queryFn: async () => {
          const response = await contentApi.GetTop10New();
          return response?.data;
        },
        staleTime: 1000 * 60 * 5 // 5분
      });
      
      if (data) {
        // Zustand 스토어 업데이트
        set({ 
          characters: data,
          rankingCharacters: bridgeTop10DataToModuleCharacter(data?.modules?.module_9) as Character[]  || [],
          rankingCreaters: bridgeModuleCreatorToCharacter(data?.modules?.module_10) as unknown as Character[] || [],
          modules_1: bridgeTop10DataToModuleCharacter(data?.modules?.module_1) as Character[] || [],
          modules_2: bridgeTop10DataToModuleCharacter(data?.modules?.module_2) as Character[] || [],
          modules_3: bridgeTop10DataToModuleCharacter(data?.modules?.module_3) as Character[] || [],
          isLoading: false
        });
      } else {
        set({ isLoading: false, error: new Error('데이터가 없습니다') });
      }
    } catch (error) {
      console.error("데이터 로딩 중 오류 발생:", error);
      set({ isLoading: false, error: error as Error });
    }
  },
  
  // 데이터를 무효화하고 다시 가져오는 함수
  invalidateData: async () => {
    await queryClient.invalidateQueries({ queryKey: ['mainData'] });
    get().initialize();
  }
}))
