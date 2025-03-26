'use client'

import { useModalStore } from '@/store/useStoreModal'
import { faComment, faHeart, faTimes, faShieldHalved, faMessage } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getImageUri } from '@/lib/utils/storyNationUtil'
import { motion, AnimatePresence } from 'framer-motion'

// 목업 데이터
const mockFirstMessage = {
  situation: '어두운 밤, 비가 내리는 거리에서',
  message:
    '안녕하세요. 저는 도시의 수호자입니다. 이 도시에서 일어나는 모든 사건을 조사하고 있죠. 당신과 함께 이 도시의 비밀을 파헤치고 싶습니다.',
}

// 대화 예시 목업 데이터
const mockConversationExamples = [
  {
    user: '당신은 누구인가요?',
    character:
      '저는 도시의 그림자 속에서 활동하는 수호자입니다. 제 본명은 알려드릴 수 없지만, 많은 사람들은 저를 "나이트워커"라고 부릅니다.',
  },
  {
    user: '왜 이 일을 하고 있나요?',
    character:
      '5년 전, 이 도시에서 제 가족을 잃었습니다. 그 이후로 다른 사람들이 같은 고통을 겪지 않도록 범죄와 부패에 맞서고 있습니다. 이것은 복수가 아닌, 정의를 위한 일입니다.',
  },
  {
    user: '도와드릴 수 있을까요?',
    character:
      '위험한 일입니다만... 당신이 정말 도울 의향이 있다면, 몇 가지 정보가 필요합니다. 하지만 경고하겠습니다. 이 일에 발을 들이면, 돌이킬 수 없는 길이 될 수도 있습니다.',
  },
]

interface CharactorModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CharactorModal({ isOpen, onClose }: CharactorModalProps) {
  const router = useRouter()
  const { selectedCharacter, setSelectedCharacter } = useModalStore()
  const [expanded, setExpanded] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  // 모달 열릴 때 이미지 미리 로딩
  useEffect(() => {
    if (selectedCharacter?.imageUrl) {
      const img = new window.Image()
      img.src = getImageUri(selectedCharacter.imageUrl)
      img.onload = () => setIsImageLoaded(true)
    }
  }, [selectedCharacter])

  // 모달이 열릴 때 배경 스크롤 방지
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    if (isOpen) {
      // 스크롤바 너비만큼 패딩을 추가하여 레이아웃 이동 방지
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      // 컴포넌트 언마운트 또는 isOpen 상태 변경 시 원래 스타일로 복원
      if (isOpen) {
        document.body.style.overflow = originalStyle
        document.body.style.paddingRight = '0px'
      }
    }
  }, [isOpen])

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

  // 모달 애니메이션 변수
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 오버레이 */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={overlayVariants}
            onClick={handleClose}
          />

          {/* 모달 */}
          <motion.div
            className="relative mx-auto w-full max-w-[1300px] max-h-[90vh] bg-white dark:bg-dark-background-light rounded-lg shadow-xl overflow-hidden"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
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
                        src={getImageUri(selectedCharacter.imageUrl)}
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
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-dark-secondary-100 mb-4">
                    캐릭터 소개
                  </h3>
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-secondary-700 dark:text-dark-secondary-300">
                      {selectedCharacter.detailDescription || selectedCharacter.description || '설명이 없습니다.'}
                    </p>
                  </div>
                </div>

                {/* 첫 메시지 미리보기 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-dark-secondary-100 mb-4">
                    첫 메시지
                  </h3>
                  <div className="bg-secondary-50 dark:bg-dark-secondary-800 rounded-lg p-4">
                    <p className="text-xs text-secondary-500 dark:text-dark-secondary-400 mb-2">
                      {mockFirstMessage.situation}
                    </p>
                    <p className="text-secondary-700 dark:text-dark-secondary-300">{mockFirstMessage.message}</p>
                  </div>
                </div>

                {/* 대화 예시 */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-dark-secondary-100 mb-4">
                    대화 예시
                  </h3>
                  <div className="space-y-4">
                    {mockConversationExamples.map((conv, index) => (
                      <div key={`conv-${index}`} className="space-y-2">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-200 dark:bg-dark-secondary-700"></div>
                          <div className="ml-2 p-3 bg-secondary-100 dark:bg-dark-secondary-800 rounded-lg max-w-[90%]">
                            <p className="text-secondary-800 dark:text-dark-secondary-200">{conv.user}</p>
                          </div>
                        </div>
                        <div className="flex items-start justify-end">
                          <div className="mr-2 p-3 bg-primary-100 dark:bg-dark-primary-900/30 rounded-lg max-w-[90%]">
                            <p className="text-secondary-800 dark:text-dark-secondary-200">{conv.character}</p>
                          </div>
                          <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
                            {selectedCharacter.imageUrl && (
                              <Image
                                src={getImageUri(selectedCharacter.imageUrl)}
                                alt={selectedCharacter.name || '캐릭터'}
                                width={32}
                                height={32}
                                className="object-cover"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 대화 시작 버튼 */}
                <div className="mt-auto">
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
