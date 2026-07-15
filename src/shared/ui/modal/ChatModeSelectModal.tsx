'use client';

import { faPiggyBank, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createApi } from '@/services/api';
import { CENTER_FADE_EXPAND_ANIMATION } from '@/shared/config/animations';
import useModalStore from '@/shared/model/stores/useModalStore';
import { CharbotInprogressResponse } from '@/types/api';
import Modal from './base/Modal';

interface ChatModeSelectModalProps {
  /**
   * 한도 초과(err===4) 시 호출되는 선택적 콜백. 전역 `limitCharacter` 모달(GlobalModalHost)이
   * 항상 열리므로 필수는 아니며, 호출부(예: views/my-characters/home.tsx)가 별도 처리를
   * 원할 때만 추가로 넘긴다.
   */
  onLimitError?: () => void;
}

export default function ChatModeSelectModal({ onLimitError }: ChatModeSelectModalProps) {
  const router = useRouter();
  const { closeModal, openModal } = useModalStore();
  const modeList = [
    {
      title: '캐릭터',
      description: '1:1 채팅, DM에 특화된 캐릭터를 손쉽게 만들어요.',
      img: '/images/bg_character_room.png',
      mode: 1,
    },
    {
      title: '스토리',
      description: '더 많은 설정과 탄탄한 서사의 스토리를 만들어요.',
      img: '/images/bg_story_room.png',
      mode: 0,
    },
  ];

  const handleModeSelect = async (chatRoomMode: number) => {
    const response = await createApi.GetCreateChatBotInProgress(null, chatRoomMode);
    const data = response.data as CharbotInprogressResponse;
    console.log('data :: ', data);
    if (data?.result.err === 4) {
      console.log('에러터짐');
      closeModal();
      onLimitError?.();
      openModal({ type: 'limitCharacter' });
      return;
    }

    if (data?.chrbot && data?.result.err === 0) {
      router.push(`/my-characters/edit/${data.chrbot.world_list_detail_chrbot_key}`);
      closeModal();
    }
  };
  return (
    <Modal>
      <Modal.Backdrop />
      <Modal.Content
        {...CENTER_FADE_EXPAND_ANIMATION}
        className='pt-5 pb-6 px-6 max-w-[600px] w-full space-y-6'
      >
        <div className='flex items-center justify-between'>
          <h3 className='font-semibold text-base md:text-xl '>만들기</h3>
          <FontAwesomeIcon
            icon={faTimes}
            className='w-4 h-4 md:h-6 md:w-6 cursor-pointer'
            onClick={closeModal}
          />
        </div>
        <div className='flex gap-3 flex-col md:flex-row'>
          {modeList.map((mode) => (
            <div
              key={mode.mode}
              className='group flex flex-col rounded-xl border overflow-hidden border-border-default cursor-pointer'
              onClick={() => handleModeSelect(mode.mode)}
            >
              <div className='relative overflow-hidden aspect-[267/166]'>
                <Image
                  className='group-hover:scale-105 transition-all duration-300 object-cover'
                  src={mode.img}
                  alt={mode.title}
                  fill
                />
              </div>
              <div className='py-3 px-4 border-t border-border-default space-y-1'>
                <h4 className='font-bold text-lg  group-hover:text-brand-hover'>{mode.title}</h4>
                <p className='text-[15px] font-medium text-text-muted leading-[1.4] group-hover:text-text-primary/70 '>
                  {mode.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Modal.Content>
    </Modal>
  );
}
