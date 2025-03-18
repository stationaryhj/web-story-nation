'use client'

import type { Character } from '@/store/useStoreData'
import { useStoreData } from '@/store/useStoreData'
import { faPaperPlane, faArrowLeft, faGift, faCaretDown, faEllipsisH } from '@fortawesome/free-solid-svg-icons'
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

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* 상단 헤더 - Figma 디자인 기반으로 수정 */}
      <div className="bg-white dark:bg-dark-background-light shadow-sm px-4 py-3 flex items-center border-b border-gray-200 dark:border-gray-700">
        <Link href="/chat" className="text-gray-500">
          <FontAwesomeIcon icon={faArrowLeft} />
        </Link>

        <div className="flex items-center mx-4">
          <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 border border-gray-200">
            <Image
              src={character.imageUrl || '/images/character1.jpg'}
              alt={character.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center">
              <h2 className="font-medium text-black dark:text-white">{character.name}</h2>
              <Link href={`/chat/character/${characterId}`} className="ml-2 text-primary-500">
                <FontAwesomeIcon icon={faArrowLeft} className="transform rotate-180" />
              </Link>
            </div>
            <div className="flex gap-1">
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

        {/* 헤더 우측 아이콘들 - Figma 디자인 기반으로 수정 */}
        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faGift} className="text-gray-500" />
            <span className="ml-1 text-sm font-semibold">121</span>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              className="flex items-center space-x-1 bg-violet-500 text-white px-3 py-1.5 rounded-3xl"
              onClick={() => setShowModeDropdown(!showModeDropdown)}
            >
              <span className="text-sm">{currentMode}</span>
              <FontAwesomeIcon icon={faCaretDown} className="text-xs" />
            </button>

            {showModeDropdown && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
                <ul>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleModeSelect('일반모드')}
                  >
                    일반모드
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleModeSelect('짜릿모드1')}
                  >
                    짜릿모드1
                  </li>
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer bg-gray-100"
                    onClick={() => handleModeSelect('짜릿모드2')}
                  >
                    짜릿모드2
                  </li>
                </ul>
              </div>
            )}
          </div>

          <span className="font-semibold">600</span>

          <button className="text-gray-500">
            <FontAwesomeIcon icon={faEllipsisH} />
          </button>
        </div>
      </div>

      {/* 메인 채팅 영역 */}
      <div className="flex flex-1 overflow-hidden bg-neutral-100">
        {/* 왼쪽 이미지 영역 */}
        <div className="hidden md:block w-1/2 relative">
          <div className="absolute inset-0 flex flex-col justify-center items-center">
            <div className="relative w-full h-full">
              <Image
                src={character.imageUrl || '/images/character1.jpg'}
                alt={character.name}
                fill
                className="object-cover object-center"
                priority
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <h1 className="text-4xl font-bold text-white text-shadow-lg">{character.name}</h1>
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽 채팅 영역 - Figma 디자인 기반으로 수정 */}
        <div className="w-full md:w-1/2 flex flex-col bg-white">
          {/* 채팅 내용 */}
          <div className="flex-1 overflow-y-auto p-4 bg-neutral-100">
            <div className="space-y-4">
              {chatHistory.map(chat => (
                <motion.div
                  key={chat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {chat.sender === 'character' && (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                      <Image
                        src={character.imageUrl || '/images/character1.jpg'}
                        alt={character.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-2 ${
                      chat.sender === 'user'
                        ? 'bg-violet-500 text-white'
                        : 'bg-white text-gray-800 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{chat.message}</p>
                    <p
                      className={`text-xs mt-1 text-right ${
                        chat.sender === 'user' ? 'text-violet-200' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(chat.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 메시지 입력 */}
          <div className="bg-white p-3 border-t border-gray-200">
            <form onSubmit={handleSendMessage} className="flex items-center">
              <input
                type="text"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="대화를 입력하세요. (예) 안녕! 뭐해?"
                className="flex-1 py-2 px-3 bg-neutral-100 text-gray-800 rounded-l-lg border-0 focus:outline-none"
              />
              <button
                type="submit"
                className="py-2 px-3 bg-white text-violet-500 rounded-r-lg transition-colors hover:text-violet-600"
                disabled={!message.trim()}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
