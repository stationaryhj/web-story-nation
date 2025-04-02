import { ModuleCharacter } from '@/types/api'
import { create } from 'zustand'
import { contentApi } from '@/services/api'
import { QueryClient } from '@tanstack/react-query'
import { Character } from '@/store/useStoreData'
import { CATEGORIES } from '@/services/hooks/DataListManager'
import { bridgeCharacterDataToCharacter } from '@/lib/utils/storyNationUtil'

// 태그 인터페이스 정의
interface Tag {
  c_chrbot_tag_key: number;
  tag: string;
  group: number;
  sort: number;
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

//   그 외 남자, 여자, 성별모름
interface MainStoreCharacterGridStoreData {
  // 캐릭터 데이터 관련
  characters: Array<Character> | [];
  moduleCharacters: Array<ModuleCharacter> | [];
  currentCategory: string;
  currentTags: string[];
  pagination: {
    page: number;
    total: number;
    hasMore: boolean;
  };
  filter: {
    order: number; // 1: 인기순(기본값), 2: 최신순
    nsfw: number; // 1: 짜릿모드 가능, 2: 전체 이용가(기본값), 3: 이용등급 전체
  };
  
  // 태그 데이터 관련
  tags: Array<Tag>;
  isTagsLoading: boolean;
  tagsError: Error | null;
  
  isLoading: boolean;
  error: Error | null;
  
  initialize: (categoryId: string, tags?: string[]) => Promise<void>;
  invalidateData: () => Promise<void>;
  updateFilter: (filter: { order?: number; nsfw?: number }) => void;
  loadMore: () => Promise<void>;
  loadTags: (categoryId: number) => Promise<void>;
}

export const useCharacterGridStoreData = create<MainStoreCharacterGridStoreData>((set, get) => ({
  // 캐릭터 데이터 초기값
  characters: [],
  moduleCharacters: [],
  currentCategory: 'all',
  currentTags: [],
  pagination: {
    page: 1,
    total: 0,
    hasMore: false
  },
  filter: {
    order: 1, // 인기순
    nsfw: 2, // 전체 이용가
  },
  
  // 태그 데이터 초기값
  tags: [],
  isTagsLoading: false,
  tagsError: null,
  
  isLoading: false,
  error: null,

  // 태그 데이터 로드 메서드
  loadTags: async (categoryId: number) => {
    set({ isTagsLoading: true, tagsError: null });
    
    try {
      // React Query를 통해 태그 데이터 요청
      const data = await queryClient.fetchQuery({
        queryKey: ['tagRanking', categoryId],
        queryFn: async () => {
          const response = await contentApi.GetTagRankingList(categoryId);
          return response?.data;
        },
        staleTime: 1000 * 60 * 10 // 10분
      });
      
      if (data && data.charbot_tag) {
        set({ tags: data.charbot_tag, isTagsLoading: false });
      } else {
        set({ 
          isTagsLoading: false, 
          tagsError: new Error('태그 데이터가 없습니다'), 
          tags: [] 
        });
      }
    } catch (error) {
      console.error("태그 데이터 로딩 중 오류 발생:", error);
      set({ isTagsLoading: false, tagsError: error as Error });
    }
  },

  // 초기 데이터 불러오기
  initialize: async (categoryId, tags = []) => {
    // 초기화 및 로딩 상태 설정
    set({ 
      isLoading: true, 
      error: null,
      currentCategory: categoryId,
      currentTags: tags,
      pagination: {
        page: 1,
        total: 0,
        hasMore: false
      },
      characters: []
    });
    
    try {
      const { filter, currentTags } = get();
      
      // React Query를 통해 데이터 요청
      const data = await queryClient.fetchQuery({
        queryKey: ['characterGrid', categoryId, filter.nsfw, filter.order, tags.join(',')],
        queryFn: async () => {
          const response = await contentApi.GetList(
            categoryId === 'all' ? 'recommend' : CATEGORIES.find(cat => cat.id === categoryId)?.type || '1',
            tags.join(','),
            filter.nsfw,
            filter.order,
            1, // 페이지
            10 // 한 번에 가져올 아이템 수
          );
          return response?.data;
        },
        staleTime: 1000 * 60 * 5 // 5분
      });
      
      if (data?.chrbotList?.data) {
        // ModuleCharacter 형식으로 변환
        const moduleData = data.chrbotList.data.map(item => ({
          world_list_detail_chrbot_key: item.world_list_detail_chrbot_key,
          title: item.title,
          intro: item.intro,
          img_url: item.img_url,
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
        }));
        
        // Character 형식으로 변환
        const newCharacters = bridgeCharacterDataToCharacter(moduleData);
        
        // Zustand 스토어 업데이트
        set({ 
          moduleCharacters: moduleData,
          characters: newCharacters,
          pagination: {
            page: 1,
            total: data.chrbotList.total || 0,
            hasMore: data.chrbotList.current_page < data.chrbotList.last_page
          },
          isLoading: false
        });
      } else {
        set({ 
          isLoading: false, 
          error: new Error('데이터가 없습니다'),
          characters: []
        });
      }
    } catch (error) {
      console.error("캐릭터 그리드 데이터 로딩 중 오류 발생:", error);
      set({ isLoading: false, error: error as Error });
    }
  },
  
  // 데이터를 무효화하고 다시 가져오는 함수
  invalidateData: async () => {
    const { currentCategory, currentTags, filter } = get();
    const categoryIdNumber = Number(CATEGORIES.find(cat => cat.id === currentCategory)?.type || 0);
    
    // 캐릭터 데이터 무효화
    await queryClient.invalidateQueries({ 
      queryKey: ['characterGrid', currentCategory, filter.nsfw, filter.order, currentTags.join(',')]
    });
    
    // 태그 데이터 무효화
    await queryClient.invalidateQueries({ 
      queryKey: ['tagRanking', categoryIdNumber]
    });
    
    // 데이터 다시 로드
    get().initialize(currentCategory, currentTags);
  },
  
  // 필터 업데이트
  updateFilter: (filterUpdate) => {
    const currentFilter = get().filter;
    set({ 
      filter: { ...currentFilter, ...filterUpdate } 
    });
    // 필터 변경 시 데이터 다시 로드
    setTimeout(() => {
      get().invalidateData();
    }, 0);
  },
  
  // 더 많은 데이터 로드 (페이지네이션)
  loadMore: async () => {
    const { isLoading, pagination, filter, currentCategory, currentTags, characters, moduleCharacters } = get();
    
    // 이미 로딩 중이거나 더 로드할 데이터가 없으면 리턴
    if (isLoading || !pagination.hasMore) return;
    
    const nextPage = pagination.page + 1;
    set({ isLoading: true });
    
    try {
      const response = await contentApi.GetList(
        currentCategory === 'all' ? 'recommend' : CATEGORIES.find(cat => cat.id === currentCategory)?.type || '1',
        currentTags.join(','),
        filter.nsfw,
        filter.order,
        nextPage,
        10 // 한 번에 가져올 아이템 수
      );
      
      const data = response?.data;
      
      if (data?.chrbotList?.data) {
        // ModuleCharacter 형식으로 변환
        const newModuleData = data.chrbotList.data.map(item => ({
          world_list_detail_chrbot_key: item.world_list_detail_chrbot_key,
          title: item.title,
          intro: item.intro,
          img_url: item.img_url,
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
        }));
        
        // Character 형식으로 변환
        const newCharacters = bridgeCharacterDataToCharacter(newModuleData);
        
        // 기존 데이터와 병합
        set({
          moduleCharacters: [...moduleCharacters, ...newModuleData],
          characters: [...characters, ...newCharacters],
          pagination: {
            page: nextPage,
            total: data.chrbotList.total || 0,
            hasMore: data.chrbotList.current_page < data.chrbotList.last_page
          },
          isLoading: false
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("추가 데이터 로딩 중 오류 발생:", error);
      set({ isLoading: false, error: error as Error });
    }
  }
}))



