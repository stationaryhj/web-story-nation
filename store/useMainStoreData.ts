import { ModuleCharacter, CharbotTop10NewResponse } from '@/types/api'
import { create } from 'zustand'
import { contentApi } from '@/services/api'
import { QueryClient } from '@tanstack/react-query'
import { Character } from '@/store/useStoreData'
import { CATEGORIES } from '@/services/hooks/DataListManager'
import { bridgeCharacterDataToCharacter } from '@/lib/utils/storyNationUtil'

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
    rankingCharacters: Array<ModuleCharacter> | [];
    rankingCreaters: Array<ModuleCharacter> | [];
    modules_1: Array<ModuleCharacter> | [];
    modules_2: Array<ModuleCharacter> | [];
    modules_3: Array<ModuleCharacter> | [];
  
    isLoading: boolean;
    error: Error | null;
  
    initialize: () => Promise<void>;
    invalidateData: () => Promise<void>;
}
  
export const useRecommendSectionStoreData = create<MainStoreData>((set, get) => ({
  characters: null,
  rankingCharacters: [],
  rankingCreaters: [],
  modules_1: [],
  modules_2: [],
  modules_3: [],

  isLoading: false,
  error: null,

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
          rankingCharacters: data?.modules?.module_9 || [],
          rankingCreaters: data?.modules?.module_10 || [],
          modules_1: data?.modules?.module_1 || [],
          modules_2: data?.modules?.module_2 || [],
          modules_3: data?.modules?.module_3 || [],
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