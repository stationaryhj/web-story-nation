import { useQuery } from '@tanstack/react-query';

import type { CharbotTop10Response, ModuleCharacter } from '@/types/api';

import { contentApi } from '../api/storyNationApi';

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
      return response as CharbotTop10Response;
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
  const { data, isLoading, error, refetch } = useQuery<Array<ModuleCharacter>>({
    queryKey: [ 'characters', activeCategory ],
    queryFn: async() => {
      const category = CATEGORIES.find(cat => cat.id === activeCategory);
      if (!category || category.id === 'all') return [];

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
        return [];
      }

      return response.data;
    },
  });

  return { data, isLoading, error, refetch };
};
