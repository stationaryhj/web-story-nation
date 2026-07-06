'use client';

import {
  faBookOpen,
  faCheckCircle,
  faFire,
  faPiggyBank,
  faRocket,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import { bridgeChatModeDataToChatMode } from '@/lib/utils/storyNationUtil';
import { useChatModeStore } from '@/store/useStoreData';
import BaseModal from './BaseModal';

export interface ChatMode {
  id: number;
  name: string;
  description: string;
  penCost: number;
  ai: string;
  icon: any; // 아이콘을 위한 프로퍼티 추가
  discount: number;
  original_coin: number;
  isShow: boolean;
  isAdult: boolean;
}

interface ChatModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentModeId: number;
  nsfw: number;
  onSelectMode: (mode: ChatMode) => void;
}

const customChatModes: ChatMode[] = [
  {
    id: 1,
    name: '가성비모드',
    description: '일반적인 대화에 최적화된 모드입니다.',
    penCost: 1,
    ai: 'Gemini 1.5 Flash',
    icon: faPiggyBank,
    discount: 0,
    original_coin: 0,
    isShow: true,
    isAdult: false,
  },
  {
    id: 2,
    name: '스토리모드',
    description: '이야기 생성과 연속성이 필요한 대화에 적합합니다.',
    penCost: 3,
    ai: 'Claude Sonnet 3.5 v2',
    icon: faBookOpen,
    discount: 0,
    original_coin: 0,
    isShow: true,
    isAdult: false,
  },
  {
    id: 3,
    name: '짜릿모드 1.0',
    description: '보다 자유롭고 창의적인 대화를 원할 때 사용하세요.',
    penCost: 4,
    ai: 'Gemini 1.5 Pro',
    icon: faFire,
    discount: 0,
    original_coin: 0,
    isShow: true,
    isAdult: true,
  },
  {
    id: 4,
    name: '짜릿모드 2.0',
    description: '가장 높은 품질과 창의성을 제공하는 최고급 모드입니다.',
    penCost: 7,
    ai: 'Claude Sonnet 3.5 v2',
    icon: faRocket,
    discount: 0,
    original_coin: 0,
    isShow: true,
    isAdult: true,
  },
];

export default function ChatModeModal({
  isOpen,
  onClose,
  currentModeId,
  nsfw,
  onSelectMode,
}: ChatModeModalProps) {
  const { chatMode } = useChatModeStore();
  const chatModes = chatMode.map((mode, index) =>
    bridgeChatModeDataToChatMode(mode, customChatModes[index])
  );
  console.log('nsfw :::: ', nsfw);
  console.log(chatModes);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title='채팅 모드 선택'
      size='lg'
      contentClassName='p-0'
      bodyClassName='p-0'
    >
      <div className='py-4'>
        <p className='px-4 sm:px-6 pb-4 text-text-muted text-sm border-b border-border-default'>
          원하는 채팅 모드를 선택하세요. 각 모드는 대화 품질과 특성이 다르며, 소모되는 펜 개수가
          다릅니다.
        </p>
        <ul className='divide-y divide-border-default'>
          {chatModes
            .filter((mode) => mode.isShow)
            .map((mode) => {
              if (nsfw !== 1) {
                if (mode.id === 3 || mode.id === 4) return null;
              }
              return (
                <li
                  key={mode.id}
                  className={`px-4 sm:px-6 py-3 sm:py-4 cursor-pointer hover:bg-surface-elevated ${
                    currentModeId === mode.id ? 'bg-brand/10' : ''
                  }`}
                  onClick={() => onSelectMode(mode)}
                >
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4'>
                    <div className='flex-1'>
                      <div className='flex items-center'>
                        <span
                          className={`flex items-center text-sm sm:text-base font-medium ${
                            currentModeId === mode.id ? 'text-brand' : 'text-text-primary'
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={mode.icon}
                            className='mr-2 text-xs sm:text-sm'
                            style={{
                              color:
                                currentModeId === mode.id
                                  ? 'rgb(var(--color-brand))'
                                  : 'rgb(var(--color-text-muted))',
                            }}
                          />
                          {mode.name}
                        </span>
                        {currentModeId === mode.id && (
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className='ml-2 text-brand'
                            size='sm'
                          />
                        )}
                      </div>
                      <p className='mt-1 text-xs sm:text-sm text-text-muted'>{mode.description}</p>
                      <div className='mt-1 sm:mt-2 text-[10px] sm:text-xs text-text-muted'>
                        <span className='mr-2'>{mode.ai}</span>
                      </div>
                    </div>
                    <div className='flex-shrink-0 sm:ml-4'>
                      <div className='flex items-center bg-brand/10 px-2 sm:px-3 py-1 rounded-full'>
                        <span className='text-brand font-medium flex items-center text-xs sm:text-sm'>
                          <Image
                            src='/images/pen/pen_primary.svg'
                            alt='pen'
                            width={11}
                            height={11}
                            className='mr-1'
                          />
                          {mode.penCost}
                        </span>
                        <span className='ml-1 text-[10px] sm:text-xs text-brand'> / 메시지</span>
                        {mode.discount > 0 && (
                          <div className='ml-1.5 flex items-center'>
                            <span className='text-[10px] sm:text-xs text-green-500 font-medium'>
                              {mode.discount}% 할인
                            </span>
                            <span className='ml-1 text-[10px] sm:text-xs text-gray-400 line-through'>
                              {mode.original_coin}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
    </BaseModal>
  );
}
