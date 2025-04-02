import { create } from 'zustand'
import { contentApi } from '@/services/api'
import { QueryClient } from '@tanstack/react-query'
import { Character } from '@/store/useStoreData'
import { bridgeCharacterDataToCharacter } from '@/lib/utils/storyNationUtil'
import { toast } from 'react-toastify'

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

interface SearchStoreState {
  // 검색 파라미터
  searchQuery: string;
  searchOption: 'character' | 'creator';
  sortType: number; // 1: 인기순, 2: 최신순
  
  // 검색 결과 데이터
  characters: Array<Character> | [];
  
  // 페이지네이션
  pagination: {
    currentPage: number;
    totalItems: number;
    totalPages: number;
    hasMore: boolean;
    itemsPerPage: number;
  };
  
  // 상태
  isLoading: boolean;
  error: Error | null;
  
  // 액션
  setSearchQuery: (query: string) => void;
  setSearchOption: (option: 'character' | 'creator') => void;
  setSortType: (type: number) => void;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  
  // 검색 기능
  search: () => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
}

export const useSearchStore = create<SearchStoreState>((set, get) => ({
  // 초기 상태
  searchQuery: '',
  searchOption: 'character',
  sortType: 1, // 인기순
  
  characters: [],
  
  pagination: {
    currentPage: 1,
    totalItems: 0,
    totalPages: 0,
    hasMore: false,
    itemsPerPage: 30,
  },
  
  isLoading: false,
  error: null,
  
  // 액션 메서드
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setSearchOption: (option) => set({ 
    searchOption: option,
    pagination: {
      ...get().pagination,
      currentPage: 1, // 옵션 변경 시 첫 페이지로 초기화
    },
    characters: [] // 결과 초기화
  }),
  
  setSortType: (type) => set({ 
    sortType: type,
    pagination: {
      ...get().pagination,
      currentPage: 1, // 정렬 변경 시 첫 페이지로 초기화
    },
    characters: [] // 결과 초기화
  }),
  
  setCurrentPage: (page) => set({ 
    pagination: {
      ...get().pagination,
      currentPage: page
    }
  }),
  
  setItemsPerPage: (count) => set({
    pagination: {
      ...get().pagination,
      itemsPerPage: count
    }
  }),
  
  // 검색 실행
  search: async () => {
    const { searchQuery, searchOption, sortType, pagination } = get();
    const { itemsPerPage, currentPage } = pagination;
    
    // 검색어가 없으면 검색하지 않음
    if (!searchQuery.trim()) {
      set({ 
        characters: [],
        pagination: {
          ...pagination,
          totalItems: 0,
          totalPages: 0,
          hasMore: false
        }
      });
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      // 검색 옵션에 따라 다른 API 호출
      const response = searchOption === 'character'
        ? await contentApi.GetSearch(searchQuery, sortType, itemsPerPage, currentPage)
        : await contentApi.GetCreateChatBotList(searchQuery, currentPage, itemsPerPage);
        
      const data = response?.data;
      
      if (data?.chrbotList?.data) {
        // 캐릭터 데이터 변환
        const characterItems = data.chrbotList.data.map(item => ({
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
          nick_nm: searchOption === 'character' ? item.nick_nm : searchQuery,
          nsfw: item.nsfw,
          module_id: 0,
          sort: 0,
        }));
        
        // Character 형식으로 변환
        const newCharacters = bridgeCharacterDataToCharacter(characterItems);
        
        // 페이지네이션 정보 업데이트
        const totalItems = data.chrbotList.total || 0;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        set({
          characters: newCharacters,
          pagination: {
            ...pagination,
            totalItems,
            totalPages,
            hasMore: currentPage < totalPages
          },
          isLoading: false
        });
      } else {
        // 검색 결과가 없는 경우
        set({
          characters: [],
          pagination: {
            ...pagination,
            totalItems: 0,
            totalPages: 0,
            hasMore: false
          },
          isLoading: false
        });
      }
    } catch (error) {
      console.error('검색 오류:', error);
      set({ 
        isLoading: false, 
        error: error as Error,
        characters: []
      });
      toast.error('검색 중 오류가 발생했습니다.');
    }
  },
  
  // 더 많은 결과 로드 (무한 스크롤용)
  loadMore: async () => {
    const { isLoading, pagination, searchQuery, searchOption, sortType, characters } = get();
    const { itemsPerPage, currentPage, hasMore } = pagination;
    
    // 이미 로딩 중이거나 더 로드할 데이터가 없으면 리턴
    if (isLoading || !hasMore) return;
    
    const nextPage = currentPage + 1;
    set({ isLoading: true });
    
    try {
      // 검색 옵션에 따라 다른 API 호출
      const response = searchOption === 'character'
        ? await contentApi.GetSearch(searchQuery, sortType, itemsPerPage, nextPage)
        : await contentApi.GetCreateChatBotList(searchQuery, nextPage, itemsPerPage);
        
      const data = response?.data;
      
      if (data?.chrbotList?.data && data.chrbotList.data.length > 0) {
        // 캐릭터 데이터 변환
        const newItems = data.chrbotList.data.map(item => ({
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
        const newCharacters = bridgeCharacterDataToCharacter(newItems);
        
        // 페이지네이션 정보 업데이트
        const totalItems = data.chrbotList.total || 0;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        set({
          characters: [...characters, ...newCharacters],
          pagination: {
            ...pagination,
            currentPage: nextPage,
            totalItems,
            totalPages,
            hasMore: nextPage < totalPages
          },
          isLoading: false
        });
      } else {
        // 더 이상 결과가 없는 경우
        set({
          pagination: {
            ...pagination,
            hasMore: false
          },
          isLoading: false
        });
      }
    } catch (error) {
      console.error('추가 데이터 로딩 오류:', error);
      set({ 
        isLoading: false, 
        error: error as Error 
      });
      toast.error('추가 데이터를 불러오는 중 오류가 발생했습니다.');
    }
  },
  
  // 검색 상태 초기화
  reset: () => set({
    searchQuery: '',
    characters: [],
    pagination: {
      currentPage: 1,
      totalItems: 0,
      totalPages: 0,
      hasMore: false,
      itemsPerPage: 30,
    },
    isLoading: false,
    error: null
  })
}));

export default useSearchStore;
