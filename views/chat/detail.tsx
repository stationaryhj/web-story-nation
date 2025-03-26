'use client'

import { useAccountStore } from '@/store/useStoreData'
import {
  faPaperPlane,
  faArrowLeft,
  faGift,
  faCaretDown,
  faSync,
  faTrashAlt,
  faInfoCircle,
  faSignOutAlt,
  faCoins,
  faAsterisk,
  faPiggyBank,
  faBookOpen,
  faFire,
  faRocket,
  faDownload,
  faPen,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import type { FormEvent } from 'react'
import { useEffect, useState, useRef } from 'react'
import { useModalStore } from '@/store/useStoreModal'
import type { ChatMode } from '@/components/modal/ChatModeModal'
import { BaseButton } from '@/components/elements/button/BaseButton'
import type { ChrbotData } from '@/types/api'
import { bridgeCharbotDataToCharacter } from '@/lib/utils/storyNationUtil'
import { useNakama } from '@/app/providers/NakamaProviders'
import { useChatModeStore } from '@/store/useStoreData'

// 메시지 타입 정의
interface ChatMessage {
  id: string
  sender: 'user' | 'character'
  message: string
  timestamp: Date
}

interface ChatDetailClientProps {
  characterId: string
  charbotData: ChrbotData | null
}

const defaultNames: Record<number, string> = {
  1: '가성비 모드',
  2: '스토리 모드',
  3: '짜릿모드 1.0',
  4: '짜릿모드 2.0',
}

// 채팅 모드 이름 가져오기 함수
const getChatModeName = (modeId: number) => {
  return defaultNames[modeId] || defaultNames[0]
}

export default function ChatDetailClient({ characterId, charbotData }: ChatDetailClientProps) {
  const { data: accountData } = useAccountStore(state => ({
    isLogin: state.isLogin,
    data: state.data,
  }))

  // Nakama 컨텍스트 사용
  const nakamaContext = useNakama()
  const {
    isConnected,
    isConnecting,
    chatRoomInit,
    disconnectSocket,
    leaveChat,
    chrBotChatKey,
    channelId,
    isInitRoom,
    // 새로운 메시지 관련 필드와 메서드들
    chatMessages,
    sendChatMessage,
    refreshLastAIMessage,
    clearChatHistory,
    addChatMessage,
    updateChatMode,
  } = nakamaContext

  const [message, setMessage] = useState('')
  const hasInitialized = useRef(false)
  const [currentModeId, setCurrentModeId] = useState(1)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isWaitingForAI, setIsWaitingForAI] = useState<boolean>(false) // AI 응답 대기 상태
  const { chatMode } = useChatModeStore()

  const { openModal, closeModal } = useModalStore()

  // 캐릭터 데이터 변환
  const character = bridgeCharbotDataToCharacter(charbotData as ChrbotData)

  // 연결 상태 표시 관련 상태
  const [showConnectedStatus, setShowConnectedStatus] = useState(false)

  // 메시지 디버깅을 위한 로깅 추가
  useEffect(() => {
    console.log('🗨️ chatMessages 변경 감지:', chatMessages.length)
    if (chatMessages.length > 0) {
      const lastMsg = chatMessages[chatMessages.length - 1]
      console.log('마지막 메시지:', {
        sender: lastMsg.sender,
        id: lastMsg.id,
        message: lastMsg.message.substring(0, 50) + (lastMsg.message.length > 50 ? '...' : ''),
        timestamp: lastMsg.timestamp,
        isTemp: lastMsg.id.startsWith('temp_'),
      })

      // 타입별 메시지 수 계산
      const userCount = chatMessages.filter(msg => msg.sender === 'user').length
      const aiCount = chatMessages.filter(msg => msg.sender === 'character').length
      console.log(`메시지 통계: 총 ${chatMessages.length}개 (사용자: ${userCount}, AI: ${aiCount})`)

      // 마지막 메시지 발신자에 따라 AI 응답 대기 상태 업데이트
      // 임시 메시지는 제외하고 실제 메시지만 고려
      if (!lastMsg.id.startsWith('temp_')) {
        if (lastMsg.sender === 'user') {
          setIsWaitingForAI(true)
          console.log('🕒 AI 응답 대기 시작')
        } else if (lastMsg.sender === 'character') {
          setIsWaitingForAI(false)
          console.log('✓ AI 응답 수신 완료, 대기 상태 해제')
        }
      }
    }
  }, [chatMessages])

  // 연결 상태 변화 로깅
  useEffect(() => {
    if (isConnected) {
      setShowConnectedStatus(true)
      const timer = setTimeout(() => {
        setShowConnectedStatus(false)
      }, 3000)
      return () => clearTimeout(timer)
    } else {
      setShowConnectedStatus(false)
    }
  }, [isConnected, isConnecting])

  // 서버 상태와 채널 ID에 따른 UI 처리
  useEffect(() => {
    if (!isConnected && !isConnecting && isInitRoom) {
      // 초기화는 됐지만 연결이 끊어진 경우
      setError('채팅 서버와의 연결이 끊어졌습니다.')
    } else if (isConnected && !channelId && isInitRoom) {
      // 연결은 됐지만 채널 ID가 없는 경우
      setError('채팅 채널 연결에 문제가 발생했습니다.')
    } else {
      // 정상 상태이거나 연결 중인 경우
      setError(null)
    }
  }, [isConnected, isConnecting, channelId, isInitRoom])

  // 채팅방 초기화 로직
  useEffect(() => {
    // 이미 초기화되었거나 필요한 데이터가 없으면 중단
    if (hasInitialized.current || !character?.id || !accountData?.user_key) {
      return
    }

    const initializeChatRoom = async () => {
      try {
        setIsLoading(true)
        setError(null)
        hasInitialized.current = true

        // 사용 가능한 채팅 모드 중 첫번째 선택 (또는 기본값 2번)
        const selectedModeId = chatMode && chatMode.length > 0 ? chatMode[0].chat_mode : 2 // 기본값 스토리 모드

        // 채팅방 초기화 (Nakama 서버 연결 및 인증, 채팅방 참여까지 모두 수행)
        const { success, channelId: newChannelId } = await chatRoomInit(
          accountData.user_key.toString(),
          characterId,
          selectedModeId
        )
        console.log('채팅방 초기화 완료, 연결 상태:', success, '채널 ID:', newChannelId)

        if (!success) {
          throw new Error('채팅방 초기화에 실패했습니다. 다시 시도해주세요.')
        }

        // 초기 메시지 설정 (Provider의 메서드 사용)
        clearChatHistory(); // 기존 메시지 초기화
        
        // 현재 모드 설정 업데이트
        setCurrentModeId(selectedModeId);
        
      } catch (error) {
        console.error('채팅방 초기화 실패:', error);
        setError('채팅방을 초기화하는 중 오류가 발생했습니다. 다시 시도해주세요.');
        hasInitialized.current = false;
      } finally {
        setIsLoading(false);
      }
    };

    initializeChatRoom();

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (channelId) {
        leaveChat(channelId).catch(err => console.error('채팅방 나가기 오류:', err))
      }
      disconnectSocket()
    }
  }, [
    character?.id,
    characterId,
    accountData?.user_key,
    chatRoomInit,
    isConnected,
    disconnectSocket,
    channelId,
    leaveChat,
    clearChatHistory,
    addChatMessage,
    chatMode,
  ])

  // 메시지 전송 처리 (Provider의 메서드 사용)
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()

    // AI 응답 대기 중이면 메시지 전송 금지
    if (isWaitingForAI) {
      console.log('⚠️ AI 응답을 기다리는 중입니다. 메시지 전송이 중단되었습니다.')
      return
    }

    // 필요한 값들이 모두 있는지 확인
    if (!message.trim()) {
      return
    }

    if (!character) {
      setError('캐릭터 정보를 불러오는 중 오류가 발생했습니다.')
      return
    }

    // 입력창 초기화 (먼저 수행하여 UX 향상)
    const messageText = message.trim()
    setMessage('')

    try {
      // Provider의 메서드를 사용하여 메시지 전송
      await sendChatMessage(messageText)

      // 메시지 전송 후 AI 응답 대기 상태로 변경
      setIsWaitingForAI(true)
    } catch (error) {
      console.error('메시지 전송 중 오류:', error)
      setError('메시지 전송에 실패했습니다. 다시 시도해주세요.')
      setIsWaitingForAI(false) // 오류 발생 시 대기 상태 해제
    }
  }

  // 모드에 따른 펜 비용 계산 함수 수정
  const getPenCostByMode = (modeId: number): number => {
    const mode = chatMode.find(m => m.chat_mode === modeId)
    return mode ? mode.coin : 1 // 기본값 1
  }

  // 모드별 원래 코인 가격 가져오기
  const getOriginalCoinByMode = (modeId: number): number => {
    const mode = chatMode.find(m => m.chat_mode === modeId)
    return mode ? mode.original_coin : 2 // 기본값 2
  }

  // 모드별 할인율 가져오기
  const getDiscountByMode = (modeId: number): number => {
    const mode = chatMode.find(m => m.chat_mode === modeId)
    return mode ? mode.discount : 0 // 기본값 0
  }

  // 날짜 포맷팅 함수
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // 모드 선택 핸들러 업데이트
  const handleModeSelect = (mode: ChatMode) => {
    // 이전 모드와 다른 경우에만 처리
    if (currentModeId !== mode.id) {
      setCurrentModeId(mode.id)
      updateChatMode(mode.id)
    }

    // 모달 닫기
    closeModal()
  }

  // 마지막 AI 응답 새로고침 함수 (Provider의 메서드 사용)
  const handleRefreshLastAIMessage = async () => {
    try {
      // Provider의 메서드를 사용하여 마지막 AI 메시지 새로고침
      await refreshLastAIMessage()
    } catch (error) {
      console.error('메시지 새로고침 중 오류:', error)
      setError('메시지 새로고침에 실패했습니다. 다시 시도해주세요.')
    }
  }

  // 마지막 AI 응답 삭제 함수
  const handleDeleteLastAIMessage = () => {
    // 마지막 AI 메시지 찾기
    const lastAIMessageIndex = [...chatMessages].reverse().findIndex(msg => msg.sender === 'character')

    if (lastAIMessageIndex === -1) {
      return
    }

    const actualIndex = chatMessages.length - 1 - lastAIMessageIndex

    // Provider의 메서드를 사용하여 메시지 목록 업데이트
    const newMessages = [...chatMessages]
    newMessages.splice(actualIndex, 1)
    clearChatHistory()
    newMessages.forEach(msg => addChatMessage(msg))
  }

  // 상황 설명 모드 토글
  const [isActionMode, setIsActionMode] = useState(false)
  const toggleActionMode = () => {
    setIsActionMode(!isActionMode)

    // 상황 설명 모드가 활성화되면 입력 필드에 별표 자동 추가
    if (!isActionMode && message.trim() === '') {
      setMessage('*')
    }
  }

  // 상황 설명 모드 입력 처리 함수
  const handleActionInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setMessage(inputValue)

    // 입력 값이 별표로 시작하는지 확인하고, 별표가 올바르게 닫혔는지 체크
    if (isActionMode && !inputValue.startsWith('*')) {
      setMessage(`*${inputValue}`)
    }
  }

  // 채팅방 삭제 함수
  const handleDeleteChat = async () => {
    try {
      // 채팅방에서 나가기
      if (channelId) {
        await leaveChat(channelId)
      }

      // 상태 초기화
      clearChatHistory()
      hasInitialized.current = false

      // 모달 닫기
      closeModal()

      // 페이지 리디렉션
      window.location.href = '/chat'
    } catch (error) {
      console.error('채팅방 삭제 중 오류:', error)
      setError('채팅방 삭제에 실패했습니다. 다시 시도해주세요.')
    }
  }

  // 메시지 내용에서 상황 설명(*로 감싸진 텍스트)를 찾아 스타일을 적용하는 함수
  const formatMessageWithSituations = (message: string) => {
    // 정규식으로 *로 감싸진 텍스트 찾기
    const parts = message.split(/(\*[^*]+\*)/g)

    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        // 상황 설명 부분 (기울임체, 회색, 얇은 폰트)
        const content = part.slice(1, -1) // 별표 제거
        return (
          <span key={index} className="italic text-gray-500 font-light">
            {content}
          </span>
        )
      }
      // 일반 대화 부분
      return <span key={index}>{part}</span>
    })
  }

  // 모드 아이콘 가져오기 함수 수정
  const getModeIcon = (modeId: number) => {
    switch (modeId) {
      case 1:
        return faPiggyBank
      case 2:
        return faBookOpen
      case 3:
        return faFire
      case 4:
        return faRocket
      default:
        return faRocket
    }
  }

  // 이미지 저장 함수
  const handleSaveImage = () => {
    if (!character || !character.imageUrl) return

    // 이미지 URL 가져오기
    const imageUrl = character.imageUrl

    // a 태그를 생성하여 다운로드 링크로 사용
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `${character.name}-image.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 채팅 메시지 항목 렌더링 함수
  const renderChatMessage = (chat: ChatMessage, index: number) => {
    const isLastAiMessage =
      chat.sender === 'character' &&
      chat.id === chatMessages.filter(msg => msg.sender === 'character').slice(-1)[0]?.id &&
      chat.id !== '1'

    return (
      <motion.div
        key={chat.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        {chat.sender === 'character' && (
          <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0 shadow-sm border border-gray-200">
            <Image
              src={character.imageUrl || '/images/character1.jpg'}
              alt={character.name}
              fill
              className="object-cover"
            />
          </div>
        )}

        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className={`max-w-[35%] md:max-w-[35%] rounded-2xl px-5 py-4 shadow-sm ${
            chat.sender === 'user'
              ? 'bg-primary-500 text-white rounded-tr-none'
              : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
          }`}
          style={{ wordBreak: 'break-word', overflow: 'hidden' }}
        >
          <p className="text-base whitespace-pre-wrap leading-relaxed break-words">
            {formatMessageWithSituations(chat.message)}
          </p>
          <p className={`text-xs mt-2 text-right ${chat.sender === 'user' ? 'text-violet-200' : 'text-gray-500'}`}>
            {formatTime(chat.timestamp)}
          </p>
        </motion.div>

        {/* 마지막 AI 메시지인 경우 새로고침/삭제 버튼 표시 */}
        {isLastAiMessage && (
          <div className="flex ml-2 items-center">
            {/* 새로고침 버튼 */}
            <button
              onClick={handleRefreshLastAIMessage}
              className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center text-violet-500 hover:text-violet-600 hover:bg-violet-100 transition-colors mr-1.5 shadow-sm"
              title="응답 새로고침"
            >
              <FontAwesomeIcon icon={faSync} className="text-base" />
            </button>

            {/* 삭제 버튼 */}
            <button
              onClick={handleDeleteLastAIMessage}
              className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-100 transition-colors shadow-sm"
              title="응답 삭제"
            >
              <FontAwesomeIcon icon={faTrashAlt} className="text-base" />
            </button>
          </div>
        )}
      </motion.div>
    )
  }

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-600">
          <p>{error}</p>
        </div>
        <BaseButton color="primary" onClick={() => window.location.reload()}>
          다시 시도
        </BaseButton>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  // 나머지 UI 부분은 이전과 동일하게 유지
  return (
    <div className="flex flex-col h-screen max-h-screen w-full bg-gray-50">
      {/* 상단 헤더 */}
      <header className="bg-white shadow-sm px-5 py-3 flex items-center justify-between border-b border-gray-200 z-10">
        {/* 왼쪽 그룹: 뒤로가기 + 캐릭터 프로필 */}
        <div className="flex items-center min-w-0">
          {/* 1: 뒤로가기 버튼 */}
          <Link href="/chat-list" className="mr-3">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center transition-colors hover:bg-gray-200">
              <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
            </div>
          </Link>

          {/* 캐릭터 프로필 */}
          <div className="flex items-center min-w-0 overflow-hidden">
            {/* 캐릭터 프로필 이미지 */}
            <Link href={`/chat/character/${characterId}`}>
              <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 border border-gray-200 flex-shrink-0 hover:opacity-90 transition-opacity shadow-sm">
                <Image
                  src={character.imageUrl || '/images/character1.jpg'}
                  alt={character.name}
                  fill
                  className="object-cover"
                />
              </div>
            </Link>

            <div className="min-w-0 overflow-hidden">
              <div className="flex items-center">
                {/* 캐릭터 이름 */}
                <h2 className="font-medium text-gray-800 truncate">{character.name}</h2>
                {/* 프로필 상세 버튼 */}
                <Link
                  href={`/chat/character/${characterId}`}
                  className="ml-2 text-violet-500 hover:text-violet-600 flex-shrink-0"
                >
                  <FontAwesomeIcon icon={faInfoCircle} size="sm" />
                </Link>
              </div>

              {/* 해시태그 */}
              <div className="flex flex-wrap gap-1 mt-0.5 overflow-hidden">
                {character.hashtags?.slice(0, 2).map((tag: string, index: number) => (
                  <span key={index} className="text-xs text-gray-500 truncate">
                    #{tag}
                  </span>
                )) || (
                  <>
                    <span className="text-xs text-gray-500">#태그</span>
                    <span className="text-xs text-gray-500">#태그</span>
                  </>
                )}
                {character.hashtags && character.hashtags.length > 2 && (
                  <span className="text-xs text-gray-500">+{character.hashtags.length - 2}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 헤더 우측 아이콘들 */}
        <div className="flex items-center space-x-4">
          {/* 짜릿모드 버튼 - 클릭 시 모달 */}
          <BaseButton
            color="gradient"
            size="sm"
            onClick={() =>
              openModal('chatMode', {
                currentModeId: currentModeId,
                onSelectMode: handleModeSelect,
              })
            }
            className="flex items-center"
          >
            <FontAwesomeIcon icon={getModeIcon(currentModeId)} className="mr-1.5" />
            <span className="text-sm font-medium md:inline hidden">{getChatModeName(currentModeId)}</span>
            <FontAwesomeIcon icon={faCaretDown} className="text-xs ml-1.5" />
          </BaseButton>

          {/* 무료 재화 (펜) - 클릭 시 사이드바 */}
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <FontAwesomeIcon icon={faGift} />
            </div>
            <span className="ml-1.5 text-sm font-semibold text-gray-700">{accountData?.coin_free || 0}</span>
          </div>

          {/* 유료 재화 (펜) - 클릭 시 사이드바 */}
          <div className="hidden md:flex items-center">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <FontAwesomeIcon icon={faCoins} className="h-4 w-4" />
            </div>
            <span className="ml-1.5 text-sm font-semibold text-gray-700">{accountData?.coin_user || 0}</span>
          </div>

          {/* 채팅방 삭제 버튼 */}
          <div
            className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-500 cursor-pointer hover:bg-red-100 transition-colors"
            onClick={() => {
              openModal('confirmAction', {
                title: '채팅 삭제',
                description: '삭제된 채팅 내용은 복구할 수 없습니다. 그래도 삭제하시겠습니까?',
                onConfirm: handleDeleteChat,
                confirmText: '삭제',
                confirmButtonClass: 'bg-red-500 hover:bg-red-600 text-white',
              })
            }}
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
          </div>
        </div>
      </header>

      {/* 메인 채팅 영역 */}
      <main className="flex flex-1 overflow-hidden">
        {/* 왼쪽 캐릭터 이미지 영역 - 최대 너비 600px로 제한 */}
        <div className="relative hidden md:block" style={{ maxWidth: '600px', width: '40%', flexShrink: 0 }}>
          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-transparent z-10 pointer-events-none"></div>

          {/* 이미지 컨테이너 */}
          <div className="relative h-full w-full group">
            <Image
              src={character.imageUrl || '/images/character1.jpg'}
              alt={character.name}
              fill
              className="object-cover cursor-pointer"
              sizes="(max-width: 768px) 100vw, 600px"
              style={{
                objectPosition: 'center top',
              }}
              priority
              onClick={handleSaveImage}
            />

            {/* 이미지 저장 버튼 - 호버 시에만 표시 */}
            <div
              className="absolute bottom-16 right-4 bg-black/70 rounded-full p-3 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-30"
              onClick={handleSaveImage}
              title="이미지 저장하기"
            >
              <FontAwesomeIcon icon={faDownload} className="text-white text-lg" />
            </div>
          </div>

          {/* 하단 그라데이션 오버레이 */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent z-10 pointer-events-none"></div>

          {/* 캐릭터 이름 */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white drop-shadow-md text-center">
              {character.name}
            </h2>
          </div>
        </div>

        {/* 오른쪽 채팅 영역 - 남은 공간 모두 차지 */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-50 to-white" style={{ minWidth: 0 }}>
          {/* 연결 상태 표시 */}
          {!isConnected && !isConnecting && (
            <div className="bg-red-50 p-3 border-b border-red-100 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></div>
                <p className="text-red-700 text-sm">
                  서버 연결이 끊어졌습니다. 메시지를 보낼 수 없습니다.
                  {error && <span className="ml-2 font-medium">({error})</span>}
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-medium transition-colors flex items-center"
              >
                <FontAwesomeIcon icon={faSync} className="mr-1.5" />
                새로고침
              </button>
            </div>
          )}

          {isConnecting && (
            <div className="bg-yellow-50 p-3 border-b border-yellow-100 flex items-center">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse"></div>
              <p className="text-yellow-700 text-sm flex items-center">
                서버에 연결 중입니다. 잠시만 기다려주세요...
                <span className="ml-2 bg-yellow-100 px-2 py-0.5 rounded-full text-xs">채팅 초기화 중</span>
              </p>
            </div>
          )}

          {showConnectedStatus && (
            <div className="bg-green-50 p-2.5 border-b border-green-100 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <p className="text-green-700 text-sm">
                  서버에 연결됨
                  {isInitRoom ? (
                    <span className="ml-2 bg-green-100 px-2 py-0.5 rounded-full text-xs">채팅방 초기화 완료</span>
                  ) : (
                    <span className="ml-2 bg-yellow-100 px-2 py-0.5 rounded-full text-xs">채팅방 초기화 필요</span>
                  )}
                </p>
              </div>
              {channelId && (
                <div className="flex items-center">
                  <p className="text-xs text-green-600">채널: {channelId.substring(0, 8)}...</p>
                  {chrBotChatKey && (
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                      Chat ID: {chrBotChatKey}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 채팅 내용 */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="flex flex-col space-y-12 max-w-3xl mx-auto">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  <p>메시지가 없습니다. 채팅을 시작해보세요!</p>
                </div>
              ) : (
                chatMessages.map((chat, index) => renderChatMessage(chat, index))
              )}
            </div>
          </div>

          {/* 메시지 입력 */}
          <div className="bg-white p-4 border-t border-gray-200 shadow-sm">
            <form onSubmit={handleSendMessage} className="flex items-center max-w-3xl mx-auto">
              {/* 상황 설명 버튼 (별표 아이콘) */}
              <button
                type="button"
                onClick={toggleActionMode}
                className={`mr-3 p-3 rounded-full transition-colors ${
                  isActionMode ? 'bg-violet-100 text-violet-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                title={isActionMode ? '일반 대화 모드로 전환' : '상황 설명 모드로 전환'}
                disabled={isWaitingForAI}
              >
                <FontAwesomeIcon icon={faAsterisk} className="text-lg" />
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={isActionMode ? handleActionInput : e => setMessage(e.target.value)}
                  placeholder={
                    isWaitingForAI
                      ? 'AI가 응답 중입니다. 잠시만 기다려주세요...'
                      : isActionMode
                        ? '상황 설명을 입력하세요. (예: 캐릭터가 웃으며)'
                        : '대화를 입력하세요. (예: 안녕! 뭐해?)'
                  }
                  className={`w-full py-4 px-5 text-base bg-gray-100 text-gray-800 rounded-l-xl border-0 focus:outline-none focus:ring-2 ${
                    isWaitingForAI ? 'bg-gray-200 text-gray-500' : 'focus:ring-violet-200'
                  } transition-all`}
                  disabled={isWaitingForAI}
                />
                {isActionMode && !isWaitingForAI && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                    <span className="bg-violet-100 px-2 py-0.5 rounded text-violet-600 font-medium">
                      <FontAwesomeIcon icon={faAsterisk} className="mr-1 text-xs" />
                      상황 설명 모드
                    </span>
                  </div>
                )}
                {isWaitingForAI && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="flex items-center space-x-1">
                      <div
                        className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      ></div>
                      <div
                        className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      ></div>
                      <div
                        className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* 전송 버튼 - BaseButton으로 변경 */}
              <BaseButton
                type="submit"
                color={message.trim() && !isWaitingForAI ? 'gradient' : 'secondary'}
                disabled={!message.trim() || isWaitingForAI}
                className="rounded-l-none rounded-r-xl py-4 px-5"
              >
                <FontAwesomeIcon icon={faPaperPlane} className="text-lg" />
              </BaseButton>
            </form>

            {/* 사용중인 모드와 펜 소모량 안내 */}
            <div className="mt-3 text-center text-sm text-gray-500">
              <span className="mr-2">현재 모드: {getChatModeName(currentModeId)}</span>
              <span className="text-primary-600 flex items-center justify-center">
                (<FontAwesomeIcon icon={getModeIcon(currentModeId)} className="mr-1" size="xs" />
                {getPenCostByMode(currentModeId)}
                /메시지
                {getDiscountByMode(currentModeId) > 0 && (
                  <span className="ml-1 text-green-500">
                    {getDiscountByMode(currentModeId)}% 할인
                    <span className="line-through text-gray-400 ml-1">{getOriginalCoinByMode(currentModeId)}</span>
                  </span>
                )}
                )
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
