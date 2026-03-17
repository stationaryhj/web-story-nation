'use client'

import { useParams } from 'next/navigation'
import Header from '@/components/common/header'
import { useCharacterInProgress } from '@/shared/api/queries/useCharacterInProgress'
import { EditDm, EditStory } from '@/widgets/edit-character'

export default function Edit() {
  const params = useParams()
  const characterId = Number(params?.id)

  const { data, isLoading, error } = useCharacterInProgress(characterId)
  const chatRoomMode = data?.chat_room_mode

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary-50 dark:bg-dark-background">
        <div className="animate-pulse text-secondary-500 dark:text-dark-secondary-500">
          캐릭터 정보를 불러오는 중...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-secondary-50 dark:bg-dark-background">
        <div className="text-red-500 dark:text-red-400">캐릭터 정보를 불러올 수 없습니다.</div>
      </div>
    )
  }

  if (chatRoomMode === 1) {
    return <EditDm data={data!} />
  }

  return (
    <>
      <Header />
      <EditStory />
    </>
  )
}
