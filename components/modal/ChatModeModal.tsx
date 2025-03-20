'use client'

import { useState } from 'react'
import BaseModal from './BaseModal'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faPiggyBank, faBookOpen, faFire, faRocket, faPen } from '@fortawesome/free-solid-svg-icons'

export interface ChatMode {
  id: string
  name: string
  description: string
  penCost: number
  ai: string
  icon: any // 아이콘을 위한 프로퍼티 추가
}

interface ChatModeModalProps {
  isOpen: boolean
  onClose: () => void
  currentMode: string
  onSelectMode: (mode: ChatMode) => void
}

export default function ChatModeModal({ isOpen, onClose, currentMode, onSelectMode }: ChatModeModalProps) {
  const chatModes: ChatMode[] = [
    {
      id: 'economic',
      name: '가성비모드',
      description: '일반적인 대화에 최적화된 모드입니다.',
      penCost: 1,
      ai: 'GPT-3.5',
      icon: faPiggyBank,
    },
    {
      id: 'story',
      name: '스토리모드',
      description: '이야기 생성과 연속성이 필요한 대화에 적합합니다.',
      penCost: 3,
      ai: 'GPT-4o',
      icon: faBookOpen,
    },
    {
      id: 'exciting1',
      name: '짜릿모드 1.0',
      description: '보다 자유롭고 창의적인 대화를 원할 때 사용하세요.',
      penCost: 4,
      ai: 'Gemini 1.5 Pro',
      icon: faFire,
    },
    {
      id: 'exciting2',
      name: '짜릿모드 2.0',
      description: '가장 높은 품질과 창의성을 제공하는 최고급 모드입니다.',
      penCost: 7,
      ai: 'Claude 3.5 Sonnet',
      icon: faRocket,
    },
  ]

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="채팅 모드 선택"
      size="md"
      contentClassName="p-0"
      bodyClassName="p-0"
    >
      <div className="py-4">
        <p className="px-6 pb-4 text-secondary-600 text-sm dark:text-dark-secondary-400 border-b border-secondary-100 dark:border-dark-secondary-800">
          원하는 채팅 모드를 선택하세요. 각 모드는 대화 품질과 특성이 다르며, 소모되는 펜 개수가 다릅니다.
        </p>
        <ul className="mt-2">
          {chatModes.map(mode => (
            <li
              key={mode.id}
              className={`px-6 py-4 cursor-pointer border-b border-secondary-100 dark:border-dark-secondary-800 last:border-0 hover:bg-secondary-50 dark:hover:bg-dark-secondary-800/30 ${
                currentMode === mode.id ? 'bg-primary-50 dark:bg-dark-primary-900/30' : ''
              }`}
              onClick={() => onSelectMode(mode)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span
                      className={`flex items-center text-base font-medium ${
                        currentMode === mode.id
                          ? 'text-primary-700 dark:text-dark-primary-400'
                          : 'text-secondary-900 dark:text-dark-secondary-200'
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={mode.icon}
                        className="mr-2 text-sm"
                        style={{
                          color: currentMode === mode.id ? 'var(--color-primary-600)' : 'var(--color-secondary-500)',
                        }}
                      />
                      {mode.name}
                    </span>
                    {currentMode === mode.id && (
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className="ml-2 text-primary-600 dark:text-dark-primary-500"
                        size="sm"
                      />
                    )}
                  </div>
                  <p className="text-sm text-secondary-600 dark:text-dark-secondary-400 mt-1">{mode.description}</p>
                  <div className="mt-2 text-xs text-secondary-500 dark:text-dark-secondary-500">
                    <span className="mr-2">{mode.ai}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="flex items-center bg-primary-100 dark:bg-dark-primary-900/60 px-3 py-1 rounded-full">
                    <span className="text-primary-700 dark:text-dark-primary-400 font-medium flex items-center">
                      <FontAwesomeIcon icon={faPen} size="xs" className="mr-1" />
                      {mode.penCost}
                    </span>
                    <span className="ml-1 text-xs text-primary-600 dark:text-dark-primary-500"> / 메시지</span>
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
