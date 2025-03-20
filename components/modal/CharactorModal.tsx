'use client'

import { useModalStore } from '@/store/useStoreModal'
import { faComment, faHeart, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import BaseModal from './BaseModal'

interface CharactorModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CharactorModal({ isOpen, onClose }: CharactorModalProps) {
  const router = useRouter()
  const { selectedCharacter, setSelectedCharacter } = useModalStore()
  const [expanded, setExpanded] = useState(false)

  // 모달이 닫힐 때 선택된 캐릭터 초기화
  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setSelectedCharacter(null)
    }, 300) // 애니메이션 종료 후 상태 초기화
  }

  // 대화 시작 버튼 클릭 시 채팅 페이지로 이동
  const handleStartChat = () => {
    if (selectedCharacter) {
      handleClose()
      router.push(`/chat/${selectedCharacter.id}`)
    }
  }

  // 더 보기 토글
  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  if (!selectedCharacter) return null

  const footerContent = (
    <div className="flex justify-center">
      <button
        onClick={handleStartChat}
        className="flex items-center justify-center rounded-full bg-primary-500 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-600 dark:bg-dark-primary-500 dark:hover:bg-dark-primary-600"
      >
        <FontAwesomeIcon icon={faComment} className="mr-2" />
        대화 시작하기
      </button>
    </div>
  )

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      className="overflow-hidden"
      bodyClassName="p-0"
      footerContent={footerContent}
      footerClassName="bg-white p-6 dark:bg-dark-background-light"
      hideHeader={true}
    >
      {/* 캐릭터 이미지 */}
      <div className="relative h-64 w-full bg-gradient-to-b from-primary-100 to-primary-50 dark:from-dark-primary-900 dark:to-dark-primary-800">
        {selectedCharacter.imageUrl && (
          <Image src={selectedCharacter.imageUrl} alt={selectedCharacter.name} fill className="object-contain" />
        )}
      </div>

      {/* 캐릭터 정보 */}
      <div className="bg-white p-6 dark:bg-dark-background-light">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-dark-secondary-100">
            {selectedCharacter.name}
          </h2>
          <div className="flex items-center space-x-2">
            <button className="flex items-center rounded-full bg-red-50 p-2 text-red-500 transition-colors hover:bg-red-100 dark:bg-dark-red-900 dark:text-dark-red-300 dark:hover:bg-dark-red-800">
              <FontAwesomeIcon icon={faHeart} className="h-5 w-5" />
            </button>
            <span className="text-secondary-500 dark:text-dark-secondary-400">
              {selectedCharacter.commentCount || 0}
            </span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {selectedCharacter.hashtags?.map((tag: string, index: number) => (
              <span
                key={index}
                className="rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-700 dark:bg-dark-primary-900 dark:text-dark-primary-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className={`overflow-hidden transition-all ${expanded ? 'max-h-[500px]' : 'max-h-20'}`}>
          <p className="text-secondary-700 dark:text-dark-secondary-300">
            {selectedCharacter.description || '설명이 없습니다.'}
          </p>
        </div>

        {/* 더보기 버튼 */}
        {(selectedCharacter.description?.length || 0) > 100 && (
          <button
            onClick={toggleExpanded}
            className="mt-2 flex w-full items-center justify-center text-sm text-secondary-500 transition-colors hover:text-secondary-700 dark:text-dark-secondary-400 dark:hover:text-dark-secondary-300"
          >
            {expanded ? '접기' : '더 보기'}
            <FontAwesomeIcon
              icon={faChevronDown}
              className={`ml-1 h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        )}
      </div>
    </BaseModal>
  )
}
