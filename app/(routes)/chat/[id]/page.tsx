'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/layout/header'
import PageTransition from '@/components/ui/motion/PageTransition'
import { motion } from 'framer-motion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'
import { useStoreData, Character } from '@/store/useStoreData'
import Link from 'next/link'

export default function ChatDetailPage() {
  const params = useParams()
  const characterId = params.id as string
  const { characters } = useStoreData()
  const [character, setCharacter] = useState<Character | null>(null)
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<Array<{
    id: string;
    sender: 'user' | 'character';
    message: string;
    timestamp: Date;
  }>>([])
  
  // 캐릭터 정보 로드
  useEffect(() => {
    if (characters.length > 0) {
      const foundCharacter = characters.find(char => char.id === characterId)
      if (foundCharacter) {
        setCharacter(foundCharacter)
        
        // 초기 메시지 설정
        setChatHistory([
          {
            id: '1',
            sender: 'character',
            message: `안녕하세요! 저는 ${foundCharacter.name}입니다. 당신과 대화하게 되어 기쁩니다. 어떤 이야기를 나누고 싶으신가요?`,
            timestamp: new Date()
          }
        ])
      }
    }
  }, [characterId, characters])
  
  // 메시지 전송 처리
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim() || !character) return
    
    // 사용자 메시지 추가
    const userMessage = {
      id: Date.now().toString(),
      sender: 'user' as const,
      message: message.trim(),
      timestamp: new Date()
    }
    
    setChatHistory(prev => [...prev, userMessage])
    setMessage('')
    
    // 캐릭터 응답 시뮬레이션 (실제로는 API 호출 등으로 대체)
    setTimeout(() => {
      const characterResponse = {
        id: (Date.now() + 1).toString(),
        sender: 'character' as const,
        message: `${message.trim()}에 대한 ${character.name}의 응답입니다. 이것은 데모용 응답입니다.`,
        timestamp: new Date()
      }
      
      setChatHistory(prev => [...prev, characterResponse])
    }, 1000)
  }
  
  // 날짜 포맷팅 함수
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
  
  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }
  
  return (
    <PageTransition>
      <main className="min-h-screen flex flex-col">
        <Header />
        
        {/* 채팅 헤더 */}
        <div className="bg-white dark:bg-dark-background-light shadow-sm">
          <div className="container mx-auto px-4 py-3 flex items-center">
            <Link href="/chat-list" className="mr-4 text-secondary-500 dark:text-dark-secondary-500 hover:text-primary-500 dark:hover:text-dark-primary-600">
              <FontAwesomeIcon icon={faArrowLeft} />
            </Link>
            
            <div className="flex items-center">
              <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                <Image
                  src={character.imageUrl}
                  alt={character.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="font-bold text-secondary-900 dark:text-dark-secondary-700">
                  {character.name}
                </h2>
                <p className="text-xs text-secondary-500 dark:text-dark-secondary-500">
                  {character.isAdult ? '19+ 캐릭터' : '전체 이용가능'}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* 채팅 내용 */}
        <div className="flex-1 bg-secondary-50 dark:bg-dark-background-DEFAULT overflow-y-auto p-4">
          <div className="container mx-auto max-w-4xl space-y-4">
            {chatHistory.map((chat) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {chat.sender === 'character' && (
                  <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                    <Image
                      src={character.imageUrl}
                      alt={character.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                
                <div className={`max-w-[70%] rounded-lg p-3 ${
                  chat.sender === 'user' 
                    ? 'bg-primary-500 dark:bg-dark-primary-600 text-white' 
                    : 'bg-white dark:bg-dark-background-light text-secondary-900 dark:text-dark-secondary-700'
                }`}>
                  <p className="text-sm">{chat.message}</p>
                  <p className={`text-xs mt-1 ${
                    chat.sender === 'user' 
                      ? 'text-primary-100 dark:text-dark-primary-300' 
                      : 'text-secondary-500 dark:text-dark-secondary-500'
                  }`}>
                    {formatTime(chat.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* 메시지 입력 */}
        <div className="bg-white dark:bg-dark-background-light shadow-t p-4">
          <div className="container mx-auto max-w-4xl">
            <form onSubmit={handleSendMessage} className="flex items-center">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`${character.name}에게 메시지 보내기...`}
                className="flex-1 py-3 px-4 bg-secondary-50 dark:bg-dark-secondary-100/10 text-secondary-900 dark:text-dark-secondary-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500"
              />
              <button
                type="submit"
                className="py-3 px-4 bg-primary-500 hover:bg-primary-600 dark:bg-dark-primary-600 dark:hover:bg-dark-primary-700 text-white rounded-r-lg transition-colors"
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </form>
          </div>
        </div>
      </main>
    </PageTransition>
  )
} 