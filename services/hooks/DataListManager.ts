import { useQuery } from '@tanstack/react-query';

import type { CharbotTop10Response, LoginResponse, ModuleCharacter, CharbotListResponse } from '@/types/api';

import { contentApi } from '../api/storyNationApi';
import { useAccountStore } from '@/store/useStoreData';

export type CategoryId = 'all' | 'male' | 'female' | 'unknown';
type Category = {
  id: CategoryId;
  name: string;
  type: string;
};

export const CATEGORIES: Array<Category> = [
  { id: 'all', name: '추천', type: 'recommend' },
  { id: 'male', name: '남성', type: '1' },
  { id: 'female', name: '여성', type: '2' },
  { id: 'unknown', name: '성별모름', type: '3' },
];

export const ReqTop10Characters = () => {
  const { data, isLoading, error, refetch } = useQuery<CharbotTop10Response>({
    queryKey: [ 'RequestTop10' ],
    queryFn: async() => {
      const response = await contentApi.GetTop10();
      
      return response?.data as CharbotTop10Response;
    },
  });

  return { data, isLoading, error, refetch };
};

export const ReqGetCharacterList = (
  activeCategory: string,
  nsfw: number | 0,
  page: number | 1,
  paginate: number | 10,
  order: string | 'latest',
) => {
  const { data, isLoading, error, refetch } = useQuery<CharbotListResponse>({
    queryKey: [ 'characters', activeCategory ],
    queryFn: async() => {
      const category = CATEGORIES.find(cat => cat.id === activeCategory);
      if (!category || category.id === 'all') {
        // 빈 CharbotListResponse 반환
        return {
          current_page: 1,
          data: [],
          first_page_url: '',
          from: 0,
          last_page: 1,
          last_page_url: '',
          links: [],
          next_page_url: null,
          path: '',
          per_page: 10,
          prev_page_url: null,
          to: 0,
          total: 0,
          result: { err: 0, msg: '' }
        };
      }

      const response = await contentApi.GetList(
        category.type, // type (1: 남자, 2: 여자, 3: 모름)
        '', // chrbot_tag_keys
        nsfw, // nsfw
        order, // order
        page, // page
        paginate, // paginate
      );

      // 응답 데이터 유효성 검사
      if (!response || !response.data) {
        console.error('Invalid response data:', response);
        return {
          current_page: 1,
          data: [],
          first_page_url: '',
          from: 0,
          last_page: 1,
          last_page_url: '',
          links: [],
          next_page_url: null,
          path: '',
          per_page: 10,
          prev_page_url: null,
          to: 0,
          total: 0,
          result: { err: 0, msg: '' }
        };
      }

      return response.data as CharbotListResponse;
    },
  });

  return { data, isLoading, error, refetch };
};


export const ReqLogin = (nick_nm: string) => {
  const { data, isLoading, error, refetch } = useQuery<LoginResponse>({
    queryKey: [ 'loginGuest' ],
    queryFn: async() => {
      const response = await contentApi.LoginGuest(nick_nm);
      return response.data as LoginResponse;
    }
  });

  return { data, isLoading, error, refetch };
};
