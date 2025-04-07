'use client'

import { create } from 'zustand'
import { contentApi } from '@/services/api'
import { Character } from '@/store/useStoreData'
import { bridgeCharacterDataToCharacter } from '@/lib/utils/storyNationUtil'
import { toast } from 'react-toastify'

// 작가 정보 타입 정의
interface Author {
  nickname: string;
  profileImage?: string;
  bio?: string;
  isBlocked: boolean;
}

interface AuthorStoreState {
  // 작가 정보
  author: Author | null;
  
  // 작가의 캐릭터 목록
  characters: Array<Character>;
  
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
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (count: number) => void;
  
  // 작가 정보 검색/조회
  fetchAuthorByNickname: (nickname: string) => Promise<void>;
  loadMoreCharacters: () => Promise<void>;
  reset: () => void;
}

export const useAuthorStore = create<AuthorStoreState>((set, get) => ({
  // 초기 상태
  author: null,
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
  
  // 작가 정보 조회 (nickname으로 검색)
  fetchAuthorByNickname: async (nickname) => {
    if (!nickname.trim()) {
      set({ author: null, characters: [] });
      return;
    }
    
    set({ isLoading: true, error: null });
    
    try {
      const { pagination } = get();
      const { itemsPerPage, currentPage } = pagination;
      
      // 작가의 캐릭터 목록 조회 (작가명으로 검색)
      const response = await contentApi.GetCreateChatBotList(nickname, currentPage, itemsPerPage);
      const data = response?.data;
      
      if (data?.chrbotList?.data) {
        // 캐릭터 데이터 변환
        const characterItems = data.chrbotList.data.map(item => ({
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
          nick_nm: nickname,
          nsfw: item.nsfw,
          module_id: 0,
          sort: 0,
        }));
        
        // Character 형식으로 변환
        const newCharacters = bridgeCharacterDataToCharacter(characterItems);
        
        // 페이지네이션 정보 업데이트
        const totalItems = data.chrbotList.total || 0;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        // 작가 정보 설정 (API에서 작가 정보를 제공하지 않는 경우 nickname만 설정)
        set({
          author: {
            nickname,
            profileImage: '/images/default-profile.jpg', // 기본 이미지
            bio: '',
            isBlocked: false,
          },
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
          author: {
            nickname,
            isBlocked: false,
          },
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
      console.error('작가 정보 조회 오류:', error);
      set({ 
        isLoading: false, 
        error: error as Error,
        characters: []
      });
      toast.error('작가 정보를 불러오는 중 오류가 발생했습니다.');
    }
  },
  
  // 더 많은 캐릭터 로드 (무한 스크롤용)
  loadMoreCharacters: async () => {
    const { isLoading, pagination, author, characters } = get();
    const { itemsPerPage, currentPage, hasMore } = pagination;
    
    // 작가 정보가 없거나 이미 로딩 중이거나 더 로드할 데이터가 없으면 리턴
    if (!author || isLoading || !hasMore) return;
    
    const nextPage = currentPage + 1;
    set({ isLoading: true });
    
    try {
      // 작가의 캐릭터 목록 추가 조회
      const response = await contentApi.GetCreateChatBotList(author.nickname, nextPage, itemsPerPage);
      const data = response?.data;
      
      if (data?.chrbotList?.data && data.chrbotList.data.length > 0) {
        // 캐릭터 데이터 변환
        const newItems = data.chrbotList.data.map(item => ({
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
          nick_nm: author.nickname,
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
      console.error('추가 캐릭터 로딩 오류:', error);
      set({ 
        isLoading: false, 
        error: error as Error 
      });
      toast.error('추가 데이터를 불러오는 중 오류가 발생했습니다.');
    }
  },
  
  // 상태 초기화
  reset: () => set({
    author: null,
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
}))

export default useAuthorStore;
