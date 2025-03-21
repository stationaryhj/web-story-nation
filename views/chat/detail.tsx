'use client'

import type { Character } from '@/store/useStoreData'
import { useStoreData } from '@/store/useStoreData'
import {
  faPaperPlane,
  faArrowLeft,
  faGift,
  faCaretDown,
  faEllipsisH,
  faSync,
  faTrashAlt,
  faInfoCircle,
  faTimes,
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

interface ChatDetailClientProps {
  characterId: string
}

export default function ChatDetailClient({ characterId }: ChatDetailClientProps) {
  const { characters } = useStoreData()
  const [character, setCharacter] = useState<Character | null>(null)
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<
    Array<{
      id: string
      sender: 'user' | 'character'
      message: string
      timestamp: Date
    }>
  >([])
  const [showModeDropdown, setShowModeDropdown] = useState(false)
  const [currentMode, setCurrentMode] = useState('짜릿모드2')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [isAdultMode, setIsAdultMode] = useState(false)
  const [currentModeId, setCurrentModeId] = useState('')

  const { openModal, closeModal } = useModalStore()

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowModeDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // 캐릭터 정보 로드 - 최적화된 버전
  useEffect(() => {
    // 데이터가 없으면 빈 캐릭터 정보를 생성하여 빠르게 UI 렌더링
    if (!characters || characters.length === 0) {
      // 캐릭터 데이터가 없는 경우 기본값 설정
      const defaultCharacter: Character = {
        id: characterId,
        name: '캐릭터',
        description: '로딩 중...',
        imageUrl: '/images/character1.jpg',
        commentCount: 0,
        hashtags: ['로딩중'],
        isAdult: false,
        creator: {
          id: '',
          nickname: '',
          username: '',
          profileImageUrl: null,
          isActive: true,
        },
        category: 'unspecified',
      }

      setCharacter(defaultCharacter)
      setCurrentModeId('exciting2')
      setCurrentMode('짜릿모드 2.0')

      // 기본 메시지 설정
      setChatHistory([
        {
          id: '1',
          sender: 'character',
          message: `*반갑게* 안녕하세요! 채팅을 시작합니다.`,
          timestamp: new Date(),
        },
      ])
      return
    }

    // 캐릭터 정보 찾기
    const foundCharacter = characters.find(char => char.id === characterId)
    if (foundCharacter) {
      setCharacter(foundCharacter)
      setCurrentModeId('exciting2')
      setCurrentMode('짜릿모드 2.0')

      // 초기 메시지 설정
      setChatHistory([
        {
          id: '1',
          sender: 'character',
          message: `*미소를 지으며 반갑게 인사한다* 안녕하세요! 저는 ${foundCharacter.name}입니다. 당신과 대화하게 되어 기쁩니다. 어떤 이야기를 나누고 싶으신가요?`,
          timestamp: new Date(Date.now() - 3600000),
        },
        {
          id: '2',
          sender: 'user',
          message: '*호기심 가득한 표정으로* 안녕하세요! 저는 당신이 어떤 캐릭터인지 궁금해요.',
          timestamp: new Date(Date.now() - 3500000),
        },
        {
          id: '3',
          sender: 'character',
          message: `*생각에 잠긴 듯 고개를 살짝 기울이며* 저는 ${foundCharacter.name}입니다. ${foundCharacter.description || '다양한 주제에 대해 이야기할 수 있어요. 특히 제가 관심있는 분야에 대해 대화하는 것을 좋아합니다.'}`,
          timestamp: new Date(Date.now() - 3400000),
        },
        {
          id: '4',
          sender: 'user',
          message: '오늘 날씨가 정말 좋네요. 당신은 어떤 날씨를 좋아하나요?',
          timestamp: new Date(Date.now() - 3300000),
        },
        {
          id: '5',
          sender: 'character',
          message:
            '*창밖을 바라보는 듯한 표정으로* 저는 비가 내리는 날을 좋아해요. 창문에 떨어지는 빗방울 소리를 들으며 책을 읽거나 음악을 듣는 것이 저의 취미입니다. 당신은 어떤 날씨를 좋아하시나요?',
          timestamp: new Date(Date.now() - 3200000),
        },
      ])
    }
  }, [characterId, characters])

  // 메시지 전송 처리
  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault()

    if (!message.trim() || !character) return

    // 사용자 메시지 추가
    const userMessage = {
      id: Date.now().toString(),
      sender: 'user' as const,
      message: message.trim(),
      timestamp: new Date(),
    }

    setChatHistory(prev => [...prev, userMessage])
    setMessage('')

    // 현재 선택된 모드에 따른 펜 차감 로직 (실제로는 API 호출)
    const penCost = getPenCostByMode(currentModeId)
    console.log(`${penCost} 펜이 차감되었습니다.`)

    // 캐릭터 응답 시뮬레이션 - 딜레이 단축
    setTimeout(() => {
      const characterResponse = {
        id: (Date.now() + 1).toString(),
        sender: 'character' as const,
        message: `*잠시 생각하는 표정을 짓더니* ${message.trim()}에 대한 ${character.name}의 응답입니다. 이것은 데모용 응답입니다. *미소를 지으며* 더 궁금한 점이 있으신가요?`,
        timestamp: new Date(),
      }

      setChatHistory(prev => [...prev, characterResponse])
    }, 300) // 딜레이 시간 단축
  }

  // 모드에 따른 펜 비용 계산 함수 추가
  const getPenCostByMode = (modeId: string): number => {
    switch (modeId) {
      case 'economic':
        return 1
      case 'story':
        return 3
      case 'exciting1':
        return 4
      case 'exciting2':
        return 7
      default:
        return 1
    }
  }

  // 날짜 포맷팅 함수
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleModeSelect = (mode: string) => {
    setCurrentMode(mode)
    setShowModeDropdown(false)
  }

  // 마지막 AI 응답 새로고침 함수 수정 (펜 차감 추가)
  const handleRefreshLastAIMessage = () => {
    // 마지막 AI 메시지 찾기
    const lastAIMessageIndex = [...chatHistory].reverse().findIndex(msg => msg.sender === 'character')

    if (lastAIMessageIndex !== -1) {
      const actualIndex = chatHistory.length - 1 - lastAIMessageIndex

      // 펜 차감 로직
      const penCost = getPenCostByMode(currentModeId)
      console.log(`새로고침: ${penCost} 펜이 차감되었습니다.`)

      // 새 메시지로 교체 (실제로는 API 호출)
      const updatedMessages = [...chatHistory]
      updatedMessages[actualIndex] = {
        ...updatedMessages[actualIndex],
        message: `*표정이 밝아지며* 새로고침된 ${character?.name}의 응답입니다. 이것은 데모용 응답입니다. *살짝 웃으며* 더 이야기해볼까요?`,
        timestamp: new Date(),
      }

      setChatHistory(updatedMessages)
    }
  }

  // 마지막 AI 응답 삭제 함수 수정 (모달 사용)
  const handleDeleteLastAIMessage = () => {
    // 마지막 AI 메시지 찾기
    const lastAIMessageIndex = [...chatHistory].reverse().findIndex(msg => msg.sender === 'character')

    if (lastAIMessageIndex !== -1) {
      const actualIndex = chatHistory.length - 1 - lastAIMessageIndex

      // 삭제 모달 표시
      openModal('confirmAction', {
        title: '메시지 삭제',
        description: '삭제된 채팅 내용은 복구할 수 없습니다. 그래도 삭제하시겠습니까?',
        onConfirm: () => {
          // 메시지 삭제
          const updatedMessages = [...chatHistory]
          updatedMessages.splice(actualIndex, 1)
          setChatHistory(updatedMessages)
        },
        confirmText: '삭제',
        confirmButtonClass: 'bg-red-500 hover:bg-red-600 text-white',
      })
    }
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

  // 상황 설명 모드 입력 처리 함수 추가
  const handleActionInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    setMessage(inputValue)

    // 입력 값이 별표로 시작하는지 확인하고, 별표가 올바르게 닫혔는지 체크
    if (isActionMode && !inputValue.startsWith('*')) {
      setMessage(`*${inputValue}`)
    }
  }

  // 채팅 삭제 핸들러
  const handleDeleteChat = () => {
    // 삭제 로직 구현
    console.log('채팅을 삭제합니다')
    // 삭제 후 채팅 목록으로 이동
    window.location.href = '/chat'
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

  // 모드 아이콘 가져오기 함수
  const getModeIcon = (modeId: string) => {
    switch (modeId) {
      case 'economic':
        return faPiggyBank
      case 'story':
        return faBookOpen
      case 'exciting1':
        return faFire
      case 'exciting2':
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

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen max-h-screen w-full bg-gray-50">
      {/* 상단 헤더 */}
      <header className="bg-white shadow-sm px-5 py-3 flex items-center justify-between border-b border-gray-200 z-10">
        {/* 왼쪽 그룹: 뒤로가기 + 캐릭터 프로필 */}
        <div className="flex items-center min-w-0">
          {/* 1: 뒤로가기 버튼 */}
          <Link href="/chat" className="mr-3">
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
                currentMode: currentModeId,
                onSelectMode: (mode: ChatMode) => {
                  setCurrentMode(mode.name)
                  setCurrentModeId(mode.id)
                  closeModal()
                },
              })
            }
            className="flex items-center"
          >
            <FontAwesomeIcon icon={getModeIcon(currentModeId)} className="mr-1.5" />
            <span className="text-sm font-medium md:inline hidden">{currentMode}</span>
            <FontAwesomeIcon icon={faCaretDown} className="text-xs ml-1.5" />
          </BaseButton>

          {/* 무료 재화 (펜) - 클릭 시 사이드바 */}
          <div className="flex items-center cursor-pointer" onClick={() => openModal('credit')}>
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
              <FontAwesomeIcon icon={faGift} />
            </div>
            <span className="ml-1.5 text-sm font-semibold text-gray-700">121</span>
          </div>

          {/* 유료 재화 (펜) - 클릭 시 사이드바 */}
          <div className="hidden md:flex items-center cursor-pointer" onClick={() => openModal('credit')}>
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <FontAwesomeIcon icon={faCoins} className="h-4 w-4" />
            </div>
            <span className="ml-1.5 text-sm font-semibold text-gray-700">600</span>
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
        <div className="relative hidden md:block" style={{ maxWidth: '600px', width: '40%' }}>
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
        <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-50 to-white">
          {/* 채팅 내용 */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="flex flex-col space-y-12 max-w-3xl mx-auto">
              {chatHistory.map(chat => (
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
                    className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 shadow-sm ${
                      chat.sender === 'user'
                        ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-tr-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                    }`}
                  >
                    <p className="text-base whitespace-pre-wrap leading-relaxed">
                      {formatMessageWithSituations(chat.message)}
                    </p>
                    <p
                      className={`text-xs mt-2 text-right ${
                        chat.sender === 'user' ? 'text-violet-200' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(chat.timestamp)}
                    </p>
                  </motion.div>

                  {/* 마지막 AI 메시지인 경우 새로고침/삭제 버튼 표시 */}
                  {chat.sender === 'character' &&
                    chat.id === chatHistory.filter(msg => msg.sender === 'character').slice(-1)[0]?.id &&
                    chat.id !== '1' && ( // 첫 번째 자동 메시지(id가 1인 경우)에는 버튼 표시하지 않음
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
              ))}
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
              >
                <FontAwesomeIcon icon={faAsterisk} className="text-lg" />
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={isActionMode ? handleActionInput : e => setMessage(e.target.value)}
                  placeholder={
                    isActionMode
                      ? '상황 설명을 입력하세요. (예: 캐릭터가 웃으며)'
                      : '대화를 입력하세요. (예: 안녕! 뭐해?)'
                  }
                  className="w-full py-4 px-5 text-base bg-gray-100 text-gray-800 rounded-l-xl border-0 focus:outline-none focus:ring-2 focus:ring-violet-200 transition-all"
                />
                {isActionMode && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                    <span className="bg-violet-100 px-2 py-0.5 rounded text-violet-600 font-medium">
                      <FontAwesomeIcon icon={faAsterisk} className="mr-1 text-xs" />
                      상황 설명 모드
                    </span>
                  </div>
                )}
              </div>

              {/* 전송 버튼 - BaseButton으로 변경 */}
              <BaseButton
                type="submit"
                color={message.trim() ? 'gradient' : 'secondary'}
                disabled={!message.trim()}
                className="rounded-l-none rounded-r-xl py-4 px-5"
              >
                <FontAwesomeIcon icon={faPaperPlane} className="text-lg" />
              </BaseButton>
            </form>

            {/* 사용중인 모드와 펜 소모량 안내 */}
            <div className="mt-3 text-center text-sm text-gray-500">
              <span className="mr-2">현재 모드: {currentMode}</span>
              <span className="text-primary-600 flex items-center justify-center">
                ( <FontAwesomeIcon icon={faPen} className="mr-1" size="xs" />
                {getPenCostByMode(currentModeId)}
                /메시지)
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
