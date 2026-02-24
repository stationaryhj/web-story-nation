import { useQuery } from '@tanstack/react-query'
import { instance } from '@/shared/api/instance/instance'
import { apiRoute } from '@/shared/config/apiRoute'
import type { Tag } from '@/features/character-form/model/characterFormStore'

export const useTagList = () => {
  return useQuery<Tag[]>({
    queryKey: ['tagList'],
    queryFn: async () => {
      const response = await instance.post(apiRoute.charbot.tag.get)
      if (!response.data) throw new Error('태그 데이터를 불러올 수 없습니다.')

      const allTags: Tag[] = []
      const tagGroups = response.data.charbot_tag
      Object.keys(tagGroups).forEach(groupKey => {
        allTags.push(...tagGroups[groupKey])
      })
      return allTags
    },
  })
}
