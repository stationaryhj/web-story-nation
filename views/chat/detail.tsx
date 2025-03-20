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
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import type { FormEvent } from 'react'
import { useEffect, useState, useRef } from 'react'

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
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isAdultMode, setIsAdultMode] = useState(false)

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

  // 캐릭터 정보 로드
  useEffect(() => {
    if (characters.length > 0) {
      const foundCharacter = characters.find(char => char.id === characterId)
      if (foundCharacter) {
        setCharacter(foundCharacter)

        // 초기 메시지 설정 - 더 많은 대화 데이터 추가
        setChatHistory([
          {
            id: '1',
            sender: 'character',
            message: `안녕하세요! 저는 ${foundCharacter.name}입니다. 당신과 대화하게 되어 기쁩니다. 어떤 이야기를 나누고 싶으신가요?`,
            timestamp: new Date(Date.now() - 3600000),
          },
          {
            id: '2',
            sender: 'user',
            message: '안녕하세요! 저는 당신이 어떤 캐릭터인지 궁금해요.',
            timestamp: new Date(Date.now() - 3500000),
          },
          {
            id: '3',
            sender: 'character',
            message: `저는 ${foundCharacter.name}입니다. ${foundCharacter.description || '다양한 주제에 대해 이야기할 수 있어요. 특히 제가 관심있는 분야에 대해 대화하는 것을 좋아합니다.'}`,
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
              '저는 비가 내리는 날을 좋아해요. 창문에 떨어지는 빗방울 소리를 들으며 책을 읽거나 음악을 듣는 것이 저의 취미입니다. 당신은 어떤 날씨를 좋아하시나요?',
            timestamp: new Date(Date.now() - 3200000),
          },
        ])
      }
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

    // 캐릭터 응답 시뮬레이션 (실제로는 API 호출 등으로 대체)
    setTimeout(() => {
      const characterResponse = {
        id: (Date.now() + 1).toString(),
        sender: 'character' as const,
        message: `${message.trim()}에 대한 ${character.name}의 응답입니다. 이것은 데모용 응답입니다.`,
        timestamp: new Date(),
      }

      setChatHistory(prev => [...prev, characterResponse])
    }, 1000)
  }

  // 날짜 포맷팅 함수
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const handleModeSelect = (mode: string) => {
    setCurrentMode(mode)
    setShowModeDropdown(false)
  }

  // 마지막 AI 응답 새로고침
  const handleRefreshLastAIMessage = () => {
    // 마지막 AI 메시지 찾기
    const lastAIMessageIndex = [...chatHistory].reverse().findIndex(msg => msg.sender === 'character')

    if (lastAIMessageIndex !== -1) {
      const actualIndex = chatHistory.length - 1 - lastAIMessageIndex

      // 새 메시지로 교체 (실제로는 API 호출)
      const updatedMessages = [...chatHistory]
      updatedMessages[actualIndex] = {
        ...updatedMessages[actualIndex],
        message: `새로고침된 ${character?.name}의 응답입니다. 이것은 데모용 응답입니다.`,
        timestamp: new Date(),
      }

      setChatHistory(updatedMessages)
    }
  }

  // 마지막 AI 응답 삭제
  const handleDeleteLastAIMessage = () => {
    // 마지막 AI 메시지 찾기
    const lastAIMessageIndex = [...chatHistory].reverse().findIndex(msg => msg.sender === 'character')

    if (lastAIMessageIndex !== -1) {
      const actualIndex = chatHistory.length - 1 - lastAIMessageIndex

      // 메시지 삭제
      const updatedMessages = [...chatHistory]
      updatedMessages.splice(actualIndex, 1)

      setChatHistory(updatedMessages)
    }
  }

  // 상황 설명 모드 토글
  const [isActionMode, setIsActionMode] = useState(false)
  const toggleActionMode = () => {
    setIsActionMode(!isActionMode)
  }

  // 성인 모드 토글
  const toggleAdultMode = () => {
    setIsAdultMode(!isAdultMode)
  }

  // 채팅 삭제 핸들러
  const handleDeleteChat = () => {
    // 삭제 로직 구현
    console.log('채팅을 삭제합니다')
    setShowDeleteModal(false)
    // 삭제 후 채팅 목록으로 이동
    window.location.href = '/chat'
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
        <div className="flex items-center">
          {/* 1: 뒤로가기 버튼 */}
          <Link href="/chat" className="mr-3">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center transition-colors hover:bg-gray-200">
              <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
            </div>
          </Link>

          {/* 캐릭터 프로필 */}
          <div className="flex items-center">
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

            <div>
              <div className="flex items-center">
                {/* 캐릭터 이름 */}
                <h2 className="font-medium text-gray-800">{character.name}</h2>
                {/* 2: 프로필 상세 버튼 */}
                <Link href={`/chat/character/${characterId}`} className="ml-2 text-violet-500 hover:text-violet-600">
                  <FontAwesomeIcon icon={faArrowLeft} className="transform rotate-180" />
                </Link>
              </div>

              {/* 해시태그 */}
              <div className="flex flex-wrap gap-1 mt-0.5">
                {character.hashtags?.map((tag: string, index: number) => (
                  <span key={index} className="text-xs text-gray-500">
                    #{tag}
                  </span>
                )) || (
                  <>
                    <span className="text-xs text-gray-500">#태그</span>
                    <span className="text-xs text-gray-500">#태그</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 헤더 우측 아이콘들 - space-between으로 정렬 */}
        <div className="flex items-center space-x-4">
          {/* 3: 무료 재화 */}
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
              <FontAwesomeIcon icon={faGift} />
            </div>
            <span className="ml-1.5 text-sm font-semibold text-gray-700">121</span>
          </div>

          {/* 4: 짜릿모드 드롭다운 */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white px-3 py-1.5 rounded-full transition-colors shadow-sm"
              onClick={() => setShowModeDropdown(!showModeDropdown)}
            >
              <span className="text-sm font-medium">{currentMode}</span>
              <FontAwesomeIcon icon={faCaretDown} className="text-xs ml-1.5" />
            </button>

            {showModeDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 border border-gray-100 overflow-hidden animate-fadeIn">
                <div className="py-2 px-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white text-sm font-medium">
                  채팅 모드 선택
                </div>
                <ul>
                  <li
                    className={`px-4 py-3 hover:bg-violet-50 cursor-pointer border-b border-gray-100 flex items-center ${
                      currentMode === '일반모드' ? 'bg-violet-50' : ''
                    }`}
                    onClick={() => handleModeSelect('일반모드')}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border mr-2 flex-shrink-0 ${
                        currentMode === '일반모드'
                          ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 border-violet-500 ring-2 ring-violet-200'
                          : 'border-gray-300'
                      }`}
                    >
                      {currentMode === '일반모드' && (
                        <span className="flex items-center justify-center text-white text-xs">✓</span>
                      )}
                    </div>
                    <div>
                      <div
                        className={`text-sm font-medium ${
                          currentMode === '일반모드' ? 'text-violet-700' : 'text-gray-800'
                        }`}
                      >
                        일반모드
                      </div>
                      <div className="text-xs text-gray-500">기본 대화 모드</div>
                    </div>
                  </li>
                  <li
                    className={`px-4 py-3 hover:bg-violet-50 cursor-pointer border-b border-gray-100 flex items-center ${
                      currentMode === '짜릿모드1' ? 'bg-violet-50' : ''
                    }`}
                    onClick={() => handleModeSelect('짜릿모드1')}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border mr-2 flex-shrink-0 ${
                        currentMode === '짜릿모드1'
                          ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 border-violet-500 ring-2 ring-violet-200'
                          : 'border-gray-300'
                      }`}
                    >
                      {currentMode === '짜릿모드1' && (
                        <span className="flex items-center justify-center text-white text-xs">✓</span>
                      )}
                    </div>
                    <div>
                      <div
                        className={`text-sm font-medium ${
                          currentMode === '짜릿모드1' ? 'text-violet-700' : 'text-gray-800'
                        }`}
                      >
                        짜릿모드1
                      </div>
                      <div className="text-xs text-gray-500">보다 자유로운 대화</div>
                    </div>
                  </li>
                  <li
                    className={`px-4 py-3 hover:bg-violet-50 cursor-pointer flex items-center ${
                      currentMode === '짜릿모드2' ? 'bg-violet-50' : ''
                    }`}
                    onClick={() => handleModeSelect('짜릿모드2')}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border mr-2 flex-shrink-0 ${
                        currentMode === '짜릿모드2'
                          ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 border-violet-500 ring-2 ring-violet-200'
                          : 'border-gray-300'
                      }`}
                    >
                      {currentMode === '짜릿모드2' && (
                        <span className="flex items-center justify-center text-white text-xs">✓</span>
                      )}
                    </div>
                    <div>
                      <div
                        className={`text-sm font-medium ${
                          currentMode === '짜릿모드2' ? 'text-violet-700' : 'text-gray-800'
                        }`}
                      >
                        짜릿모드2
                      </div>
                      <div className="text-xs text-gray-500">완전 자유로운 대화</div>
                    </div>
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* 5: 유료 재화 */}
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9 0C4.05 0 0 4.05 0 9C0 13.95 4.05 18 9 18C13.95 18 18 13.95 18 9C18 4.05 13.95 0 9 0ZM9 16.2C5.04 16.2 1.8 12.96 1.8 9C1.8 5.04 5.04 1.8 9 1.8C12.96 1.8 16.2 5.04 16.2 9C16.2 12.96 12.96 16.2 9 16.2Z"
                  fill="#FF6B00"
                />
                <path
                  d="M9 4.5C8.17 4.5 7.5 5.17 7.5 6C7.5 6.83 8.17 7.5 9 7.5C9.83 7.5 10.5 6.83 10.5 6C10.5 5.17 9.83 4.5 9 4.5Z"
                  fill="#FF6B00"
                />
                <path d="M9 9C8.4 9 7.5 9.3 7.5 10.5V13.5H10.5V10.5C10.5 9.3 9.6 9 9 9Z" fill="#FF6B00" />
              </svg>
            </div>
            <span className="ml-1.5 text-sm font-semibold text-gray-700">600</span>
          </div>

          {/* 6: 나가기 버튼 */}
          <div
            className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center text-red-500 cursor-pointer hover:bg-red-100 transition-colors"
            onClick={() => setShowDeleteModal(true)}
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
          </div>
        </div>
      </header>

      {/* 메인 채팅 영역 */}
      <main className="flex flex-1 overflow-hidden">
        {/* 7: 왼쪽 캐릭터 이미지 영역 - 1/3로 조정 */}
        <div className="relative w-full md:w-1/3 hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-transparent"></div>
          <Image
            src={character.imageUrl || '/images/character1.jpg'}
            alt={character.name}
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-3xl font-bold text-white drop-shadow-md text-center">{character.name}</h2>
          </div>
        </div>

        {/* 오른쪽 채팅 영역 */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-50 to-white">
          {/* 채팅 내용 */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="space-y-6 max-w-3xl mx-auto">
              {chatHistory.map(chat => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {chat.sender === 'character' && (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0 shadow-sm border border-gray-200">
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
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                      chat.sender === 'user'
                        ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-tr-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{chat.message}</p>
                    <p
                      className={`text-xs mt-1.5 text-right ${
                        chat.sender === 'user' ? 'text-violet-200' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(chat.timestamp)}
                    </p>
                  </motion.div>

                  {/* 마지막 AI 메시지인 경우 새로고침/삭제 버튼 표시 */}
                  {chat.sender === 'character' &&
                    chat.id === chatHistory.filter(msg => msg.sender === 'character').slice(-1)[0]?.id && (
                      <div className="flex ml-2 items-center">
                        {/* 11: 새로고침 버튼 */}
                        <button
                          onClick={handleRefreshLastAIMessage}
                          className="w-8 h-8 rounded-full bg-violet-50 flex items-center justify-center text-violet-500 hover:text-violet-600 hover:bg-violet-100 transition-colors mr-1.5 shadow-sm"
                          title="응답 새로고침"
                        >
                          <FontAwesomeIcon icon={faSync} size="sm" />
                        </button>

                        {/* 12: 삭제 버튼 */}
                        <button
                          onClick={handleDeleteLastAIMessage}
                          className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-100 transition-colors shadow-sm"
                          title="응답 삭제"
                        >
                          <FontAwesomeIcon icon={faTrashAlt} size="sm" />
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
              {/* 13: 상황 설명 버튼 */}
              <button
                type="button"
                onClick={toggleActionMode}
                className={`mr-3 p-2.5 rounded-full transition-colors ${
                  isActionMode ? 'bg-violet-100 text-violet-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                title={isActionMode ? '일반 대화 모드로 전환' : '상황 설명 모드로 전환'}
              >
                <FontAwesomeIcon icon={faInfoCircle} />
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={
                    isActionMode
                      ? '상황 설명을 입력하세요. (예) 캐릭터가 웃으며...'
                      : '대화를 입력하세요. (예) 안녕! 뭐해?'
                  }
                  className="w-full py-3 px-4 bg-gray-100 text-gray-800 rounded-l-xl border-0 focus:outline-none focus:ring-2 focus:ring-violet-200 transition-all"
                />
              </div>

              {/* 14: 전송 버튼 */}
              <button
                type="submit"
                className={`py-3 px-5 rounded-r-xl transition-colors ${
                  message.trim()
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white hover:from-violet-600 hover:to-fuchsia-600'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
                disabled={!message.trim()}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* 채팅 삭제 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">채팅 삭제</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <p className="text-gray-600 mb-6">삭제된 채팅 내용은 복구할 수 없습니다. 그래도 삭제하시겠습니까?</p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDeleteChat}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-colors shadow-sm"
              >
                삭제
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
