'use client'

import DeleteConfirmModal from '@/components/modal/DeleteConfirmModal'
import CardGrid from '@/components/elements/card/CardGrid'
import { SectionTransition } from '@/components/motion/PageTransition'
import type { Character } from '@/store/useStoreData'
import { useAccountStore } from '@/store/useStoreData'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createApi } from '@/services/api/storyNationApi'
import { CharbotInprogressResponse } from '@/types/api'
import { GetCreateChatBotListMine } from '@/services/hooks/DataListManager'
import { bridgeCharbotGetListMineDataToCharacter } from '@/lib/utils/storyNationUtil'

export default function MyCharacterPage() {
  const router = useRouter()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null)

  const myNickName = useAccountStore.getState().data?.nick_nm
  const { data: inProgressData, refetch: refetchInProgress } = GetCreateChatBotListMine(myNickName || '', 1, 10)
  console.log(inProgressData)

  const myCharacters = bridgeCharbotGetListMineDataToCharacter(inProgressData?.chrbotList.data || []).map(char => ({
    ...char,
    creator: {
      id: char.creator.id,
      nickname: '',
      username: '',
      profileImageUrl: null,
      isActive: true,
    },
    category: (char.category || 'unspecified') as 'unspecified' | 'male' | 'female',
  }))

  // 캐릭터 카드 클릭 처리
  const handleCardClick = (character: Character) => {
    router.push(`/my-characters/edit/${character.id}`)
  }

  // 수정 버튼 클릭 처리
  const handleEditClick = (character: Character) => {
    router.push(`/my-characters/edit/${character.id}`)
  }

  // 삭제 버튼 클릭 처리
  const handleDeleteClick = (character: Character) => {
    setCharacterToDelete(character)
    setIsDeleteModalOpen(true)
  }

  // 캐릭터 삭제 확인
  const confirmDelete = async () => {
    if (characterToDelete) {
      // 실제로는 API 호출 등으로 삭제 처리
      const response = await createApi.DeleteChatBot(Number(characterToDelete.id))

      if (response.data?.result.err === 0) {
        refetchInProgress()
      }

      setIsDeleteModalOpen(false)
      setCharacterToDelete(null)
    }
  }

  const handleCreateCharacter = async () => {
    const response = await createApi.GetCreateChatBotInProgress(null)
    const data = response.data as CharbotInprogressResponse

    if (data?.chrbot && data?.result.err === 0) {
      router.push(`/my-characters/edit/${data.chrbot.world_list_detail_chrbot_key}`)
    }
  }

  return (
    <SectionTransition>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-dark-secondary-700">내 캐릭터</h1>
          <button
            onClick={handleCreateCharacter}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors dark:bg-dark-primary-600 dark:hover:bg-dark-primary-700"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>캐릭터 생성</span>
          </button>
        </div>

        {myCharacters.length === 0 ? (
          <div className="bg-white dark:bg-dark-background-light rounded-xl p-8 text-center">
            <p className="text-secondary-500 dark:text-dark-secondary-500 mb-4">아직 생성한 캐릭터가 없습니다.</p>
            <button
              onClick={handleCreateCharacter}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors dark:bg-dark-primary-600 dark:hover:bg-dark-primary-700"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>첫 캐릭터 만들기</span>
            </button>
          </div>
        ) : (
          <CardGrid
            customData={myCharacters}
            variant="my-character"
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            useSwiper={false}
          />
        )}

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="캐릭터 삭제"
          entityName={characterToDelete?.name}
          onConfirm={confirmDelete}
        />
      </div>
    </SectionTransition>
  )
}
