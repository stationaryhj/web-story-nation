'use client';

import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CardGrid from '@/components/elements/card/CardGrid';
import DeleteConfirmModal from '@/components/modal/DeleteConfirmModal';
import LimitCharacterModal from '@/components/modal/LimitCharacterModal';
import { SectionTransition } from '@/components/motion/PageTransition';
import { bridgeCharbotGetListMineDataToCharacter } from '@/lib/utils/storyNationUtil';
import { createApi } from '@/services/api/storyNationApi';
import { GetCreateChatBotListMine } from '@/services/hooks/DataListManager';
import useModalStore from '@/shared/model/stores/useModalStore';
import type { Character } from '@/store/useStoreData';
import { useAccountStore } from '@/store/useStoreData';
import { CharbotInprogressResponse } from '@/types/api';

export default function MyCharacterPage() {
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);
  const { openModal } = useModalStore();
  const myNickName = useAccountStore.getState().data?.nick_nm;

  const { data: inProgressData, refetch: refetchInProgress } = GetCreateChatBotListMine(
    myNickName || '',
    1,
    50
  );

  useEffect(() => {
    if (inProgressData?.result.err === 4) {
      setIsLimitModalOpen(true);
    }
  }, [inProgressData?.result.err]);

  const myCharacters = bridgeCharbotGetListMineDataToCharacter(
    inProgressData?.chrbotList.data || []
  ).map((char) => ({
    ...char,
    creator: {
      id: char.creator.id,
      nickname: '',
      username: '',
      profileImageUrl: null,
      isActive: true,
    },
    category: (char.category || 'unspecified') as 'unspecified' | 'male' | 'female',
  }));

  // 캐릭터 카드 클릭 처리
  const handleCardClick = (character: Character) => {
    if (character.finish_yn === 1) {
      router.push(`/chat/${character.id}`);
    }
  };

  // 수정 버튼 클릭 처리
  const handleEditClick = (character: Character) => {
    console.log('character :: ', character);

    // if(character.block_type === 1) {
    //   // 신고된놈
    //   return
    // }

    router.push(`/my-characters/edit/${character.id}`);
  };

  // 삭제 버튼 클릭 처리
  const handleDeleteClick = (character: Character) => {
    setCharacterToDelete(character);
    setIsDeleteModalOpen(true);
  };

  // 캐릭터 삭제 확인
  const confirmDelete = async () => {
    if (characterToDelete) {
      // 실제로는 API 호출 등으로 삭제 처리
      const response = await createApi.DeleteChatBot(Number(characterToDelete.id));

      if (response.data?.result.err === 0) {
        refetchInProgress();
      }

      setIsDeleteModalOpen(false);
      setCharacterToDelete(null);
    }
  };
  const handleLimitError = () => {
    setIsLimitModalOpen(true);
  };

  const handleCreateCharacter = async () => {
    openModal({
      type: 'chatModeSelect',
      props: {
        onLimitError: handleLimitError,
      },
    });
  };
  return (
    <SectionTransition>
      <div className='container mx-auto px-4 py-8'>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-2xl font-bold text-text-primary'>내 캐릭터</h1>
          <button
            type='button'
            onClick={handleCreateCharacter}
            className='flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-text-inverse rounded-lg transition-colors'
          >
            <FontAwesomeIcon icon={faPlus} />
            <span>캐릭터 생성</span>
          </button>
        </div>

        {myCharacters.length === 0 ? (
          <div className='flex flex-col items-center justify-center space-y-4 py-12'>
            <button
              type='button'
              className='flex items-center space-x-2 rounded-lg bg-brand px-6 py-3 text-text-inverse transition-colors hover:bg-brand-hover'
              onClick={handleCreateCharacter}
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>첫 캐릭터 만들기</span>
            </button>
          </div>
        ) : (
          <CardGrid
            customData={myCharacters}
            variant='my-character'
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            useSwiper={false}
          />
        )}

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title='캐릭터 삭제'
          entityName={characterToDelete?.name}
          onConfirm={confirmDelete}
        />

        <LimitCharacterModal isOpen={isLimitModalOpen} onClose={() => setIsLimitModalOpen(false)} />
      </div>
    </SectionTransition>
  );
}
