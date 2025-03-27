'use client'

import { useModalStore } from '@/store/useStoreModal'
import { faComment, faHeart, faTimes, faShieldHalved, faMessage } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { bridgeCharbotDataToCharacter } from '@/lib/utils/storyNationUtil'
import BaseModal from './BaseModal'
import { ReqGetChatBot } from '@/services/hooks/DataListManager'
import { Character } from '@/store/useStoreData'
// 목업 데이터
const mockFirstMessage = {
  situation: '어두운 밤, 비가 내리는 거리에서',
  message:
    '안녕하세요. 저는 도시의 수호자입니다. 이 도시에서 일어나는 모든 사건을 조사하고 있죠. 당신과 함께 이 도시의 비밀을 파헤치고 싶습니다.',
}


interface CharactorModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CharactorModal({ isOpen, onClose }: CharactorModalProps) {
  const router = useRouter()
  const { selectedCharacter, setSelectedCharacter } = useModalStore()
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  const { data: chatBotData, isLoading: chatBotLoading, error: chatBotError } = ReqGetChatBot(Number(selectedCharacter?.id))

  useEffect(() => {
    if(chatBotData) {
      setSelectedCharacter(bridgeCharbotDataToCharacter(chatBotData?.chrbot) as Character)
    }
  }, [chatBotData])

  // 모달 열릴 때 이미지 미리 로딩
  useEffect(() => {
    if (selectedCharacter && selectedCharacter?.imageUrl) {
      const img = new window.Image()
      img.src = selectedCharacter?.imageUrl
      img.onload = () => setIsImageLoaded(true)
    }
  }, [selectedCharacter])

  // 모달이 닫힐 때 선택된 캐릭터 초기화
  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setSelectedCharacter(null)
      setIsImageLoaded(false)
    }, 300)
  }

  // 대화 시작 버튼 클릭 시 채팅 페이지로 이동
  const handleStartChat = () => {
    if (selectedCharacter && selectedCharacter.id) {
      handleClose()
      const chatId = String(selectedCharacter.id).trim()
      if (chatId) {
        router.push(`/chat/${chatId}`)
      }
    }
  }

  if (!selectedCharacter) return null

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      size="full"
      className="mx-auto w-full max-h-[90vh] overflow-hidden"
      showCloseButton={false}
      hideHeader={true}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between p-6 border-b border-secondary-200 dark:border-dark-secondary-700">
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-dark-secondary-100">
          {selectedCharacter.name || '이름 없음'}
        </h2>
        <button
          onClick={handleClose}
          className="rounded-full p-2 text-secondary-500 hover:bg-secondary-100 hover:text-secondary-700 dark:text-dark-secondary-400 dark:hover:bg-dark-secondary-800"
        >
          <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
        </button>
      </div>

      {/* 본문 */}
      <div className="flex h-[calc(90vh-80px)]">
        {/* 왼쪽: 캐릭터 이미지 섹션 (1/3) */}
        <div className="w-1/3 border-r border-secondary-200 dark:border-dark-secondary-700 p-6">
          <div className="relative h-1/2 w-full bg-gradient-to-b from-primary-100 to-primary-50 dark:from-dark-primary-900 dark:to-dark-primary-800 rounded-lg overflow-hidden">
            {selectedCharacter.imageUrl && (
              <>
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-secondary-100 dark:bg-dark-secondary-800 transition-opacity duration-300 ${isImageLoaded ? 'opacity-0' : 'opacity-100'}`}
                >
                  <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
                </div>
                <Image
                  src={selectedCharacter.imageUrl}
                  alt={selectedCharacter.name || '캐릭터'}
                  fill
                  priority
                  className={`object-contain transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoadingComplete={() => setIsImageLoaded(true)}
                />
                {/* 19세 이상 뱃지 */}
                {selectedCharacter.isAdult && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                    <FontAwesomeIcon icon={faShieldHalved} className="mr-1 h-3 w-3" />
                    19+
                  </div>
                )}
              </>
            )}
          </div>

          {/* 캐릭터 정보 */}
          <div className="mt-6 space-y-6">
            {/* 좋아요 & 댓글 수 */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faHeart} className="h-5 w-5 text-red-500" />
                <span className="text-secondary-700 dark:text-dark-secondary-300">
                  {selectedCharacter.likeCount || 0}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faMessage} className="h-5 w-5 text-primary-500" />
                <span className="text-secondary-700 dark:text-dark-secondary-300">
                  {selectedCharacter.commentCount || 0}
                </span>
              </div>
            </div>

            {/* 해시태그 */}
            <div className="flex flex-wrap gap-2">
              {selectedCharacter.hashtags?.slice(0, 7).map((tag: string, index: number) => (
                <span
                  key={`tag-${index}`}
                  className="rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-700 dark:bg-dark-primary-900 dark:text-dark-primary-300"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* 간략 설명 */}
            <p className="text-secondary-700 dark:text-dark-secondary-300 text-sm">
              {selectedCharacter.description || '설명이 없습니다.'}
            </p>
          </div>
        </div>

        {/* 오른쪽: 캐릭터 소개 영역 (2/3) */}
        <div className="w-2/3 p-6 overflow-y-auto">
          {/* 상세 설명 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-dark-secondary-100 mb-4">캐릭터 소개</h3>
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-secondary-700 dark:text-dark-secondary-300">
                {selectedCharacter.detailDescription || selectedCharacter.description || '설명이 없습니다.'}
              </p>
            </div>
          </div>

          {/* 첫 메시지 미리보기 */}
          <div className="flex flex-col justify-between md:min-h-[600px] sm:min-h-[300px] mb-8 bg-secondary-50 dark:bg-dark-secondary-800 rounded-lg p-4">
            <div>
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-dark-secondary-100 mb-4">첫 메시지</h3>
              <div className="p-4">
                <p className="text-xs text-secondary-500 dark:text-dark-secondary-400 mb-2">
                  {mockFirstMessage.situation}
                </p>
                <p className="text-secondary-700 dark:text-dark-secondary-300">{selectedCharacter?.first_talk}</p>
              </div>
            </div>
            <button
              onClick={handleStartChat}
              className="w-full flex items-center justify-center rounded-lg bg-primary-500 px-6 py-4 font-medium text-white transition-colors hover:bg-primary-600 dark:bg-dark-primary-500 dark:hover:bg-dark-primary-600"
            >
              <FontAwesomeIcon icon={faComment} className="mr-2" />
              대화 시작하기
            </button>
          </div>
        </div>
      </div>
    </BaseModal>
  )
}
