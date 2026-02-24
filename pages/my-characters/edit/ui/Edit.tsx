'use client';

import { useParams } from 'next/navigation';
import { useCharacterInProgress } from '@/shared/api/queries/useCharacterInProgress';
import { EditStory } from '@/widgets/edit-story';

export default function Edit() {
  const params = useParams();
  const characterId = Number(params?.id);

  const { data, isLoading, error } = useCharacterInProgress(characterId);
  const chatRoomMode = data?.chrbot?.chat_room_mode;

  if (isLoading) {
    return (
      <div className='min-h-screen bg-secondary-50 dark:bg-dark-background flex items-center justify-center'>
        <div className='animate-pulse text-secondary-500 dark:text-dark-secondary-500'>
          캐릭터 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-secondary-50 dark:bg-dark-background flex items-center justify-center'>
        <div className='text-red-500 dark:text-red-400'>캐릭터 정보를 불러올 수 없습니다.</div>
      </div>
    );
  }

  if (chatRoomMode === 1) {
    // TODO: DM 모드 페이지 구현 후 교체
    return <div>DM 모드 (준비 중)</div>;
  }

  return <EditStory />;
}
