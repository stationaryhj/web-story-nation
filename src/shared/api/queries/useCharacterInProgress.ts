import { useQuery } from '@tanstack/react-query'
import { instance } from '@/shared/api/instance/instance'
import { apiRoute } from '@/shared/config/apiRoute'
import { bridgeCharacterInProgressToCharacter } from '@/src/features/edit-character/lib/characterFormBridge'
import type { CharbotInprogressResponse } from '@/types/api'

export const useCharacterInProgress = (characterId: number) => {
  return useQuery({
    queryKey: ['characterInProgress', characterId],
    queryFn: async () => {
      const response = await instance.post(apiRoute.charbot.inprogress.get, {
        world_list_detail_chrbot_key: characterId,
      })
      return response.data as CharbotInprogressResponse
    },
    select: (data) => bridgeCharacterInProgressToCharacter(data.chrbot),
    enabled: !!characterId,
  })
}
