'use client'

import { useState } from 'react'
import BaseModal from './BaseModal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faPiggyBank, faBookOpen, faFire, faRocket } from '@fortawesome/free-solid-svg-icons'
import { useChatModeStore } from '@/store/useStoreData'
import { bridgeChatModeDataToChatMode } from '@/lib/utils/storyNationUtil'
import Image from 'next/image'

export interface ChatMode {
  id: number
  name: string
  description: string
  penCost: number
  ai: string
  icon: any // 아이콘을 위한 프로퍼티 추가
  discount: number
  original_coin: number
  isShow: boolean
}

interface ChatModeModalProps {
  isOpen: boolean
  onClose: () => void
  currentModeId: number
  onSelectMode: (mode: ChatMode) => void
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
  },
  {
    id: 2,
    name: '스토리모드',
    description: '이야기 생성과 연속성이 필요한 대화에 적합합니다.',
    penCost: 3,
    ai: 'Sonnet 3.5 v2',
    icon: faBookOpen,
    discount: 0,
    original_coin: 0,
    isShow: true,
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
  },
  {
    id: 4,
    name: '짜릿모드 2.0',
    description: '가장 높은 품질과 창의성을 제공하는 최고급 모드입니다.',
    penCost: 7,
    ai: 'Sonnet 3.5 v2',
    icon: faRocket,
    discount: 0,
    original_coin: 0,
    isShow: true,
  },
]

export default function ChatModeModal({ isOpen, onClose, currentModeId, onSelectMode }: ChatModeModalProps) {
  const { chatMode } = useChatModeStore()
  const chatModes = chatMode.map((mode, index) => bridgeChatModeDataToChatMode(mode, customChatModes[index]))

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="채팅 모드 선택"
      size="lg"
      contentClassName="p-0"
      bodyClassName="p-0"
    >
      <div className="py-4">
        <p className="px-4 sm:px-6 pb-4 text-secondary-600 text-sm dark:text-dark-secondary-400 border-b border-secondary-100 dark:border-dark-secondary-800">
          원하는 채팅 모드를 선택하세요. 각 모드는 대화 품질과 특성이 다르며, 소모되는 펜 개수가 다릅니다.
        </p>
        <ul className="divide-y divide-secondary-100 dark:divide-dark-secondary-800">
          {chatModes
            .filter(mode => mode.isShow)
            .map(mode => (
              <li
                key={mode.id}
                className={`px-4 sm:px-6 py-3 sm:py-4 cursor-pointer hover:bg-secondary-50 dark:hover:bg-dark-secondary-800/30 ${
                  currentModeId === mode.id ? 'bg-primary-50 dark:bg-dark-primary-900/30' : ''
                }`}
                onClick={() => onSelectMode(mode)}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span
                        className={`flex items-center text-sm sm:text-base font-medium ${
                          currentModeId === mode.id
                            ? 'text-primary-700 dark:text-dark-primary-400'
                            : 'text-secondary-900 dark:text-dark-secondary-200'
                        }`}
                      >
                        <FontAwesomeIcon
                          icon={mode.icon}
                          className="mr-2 text-xs sm:text-sm"
                          style={{
                            color:
                              currentModeId === mode.id ? 'var(--color-primary-600)' : 'var(--color-secondary-500)',
                          }}
                        />
                        {mode.name}
                      </span>
                      {currentModeId === mode.id && (
                        <FontAwesomeIcon
                          icon={faCheckCircle}
                          className="ml-2 text-primary-600 dark:text-dark-primary-500"
                          size="sm"
                        />
                      )}
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-secondary-600 dark:text-dark-secondary-400">
                      {mode.description}
                    </p>
                    <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-secondary-500 dark:text-dark-secondary-500">
                      <span className="mr-2">{mode.ai}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 sm:ml-4">
                    <div className="flex items-center bg-primary-100 dark:bg-dark-primary-900/60 px-2 sm:px-3 py-1 rounded-full">
                      <span className="text-primary-700 dark:text-dark-primary-400 font-medium flex items-center text-xs sm:text-sm">
                        <Image src="/images/pen/pen_primary.svg" alt="pen" width={11} height={11} className="mr-1" />
                        {mode.penCost}
                      </span>
                      <span className="ml-1 text-[10px] sm:text-xs text-primary-600 dark:text-dark-primary-500">
                        {' '}
                        / 메시지
                      </span>
                      {mode.discount > 0 && (
                        <div className="ml-1.5 flex items-center">
                          <span className="text-[10px] sm:text-xs text-green-500 font-medium">
                            {mode.discount}% 할인
                          </span>
                          <span className="ml-1 text-[10px] sm:text-xs text-gray-400 line-through">
                            {mode.original_coin}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </BaseModal>
  )
}
