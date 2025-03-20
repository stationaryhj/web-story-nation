'use client'

import Footer from '@/components/common/footer'
import Header from '@/components/common/header'
import PageTransition from '@/components/motion/PageTransition'
<<<<<<< HEAD
import ChatList from '@/components/chat/ChatList'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ReqGetChatList } from '@/services/hooks/DataListManager'
export default function ChatListPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  

=======
import { faSearch, faSort } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'
import { useState } from 'react'

export default function ChatListPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('all') // 'all', 'favorites'
  const [searchQuery, setSearchQuery] = useState('')

>>>>>>> d52f283b589cf3627df43245f82c281c5d3b5553
  // 더미 채팅 데이터
  const chatList = [
    {
      id: '1',
      characterId: '1',
      name: '에단 카터',
      lastMessage: '안녕하세요! 오늘 경기 준비는 잘 되고 있나요?',
      time: '오전 11:56',
      imageUrl: '/images/character1.jpg',
    },
    {
      id: '2',
      characterId: '2',
      name: '리아 김',
      lastMessage: '새로운 보안 취약점을 발견했어요. 확인해보세요.',
      time: '어제',
      imageUrl: '/images/character1.jpg',
    },
    {
      id: '3',
      characterId: '3',
      name: '마르코 발렌티',
      lastMessage: '오늘의 특별 요리는 트러플 리조또입니다.',
      time: '2일 전',
      imageUrl: '/images/character1.jpg',
    },
  ]

<<<<<<< HEAD

  const { data, isLoading, error, refetch } = ReqGetChatList(10, 1);
  console.log('ReqGetChatList :: ', data);

  // 검색 핸들러 - 실제로는 API 호출 등으로 구현
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('검색어:', query);
    // 추후 서버 API 연동 처리
=======
  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    // 검색 로직 구현
    console.log('검색어:', searchQuery)
>>>>>>> d52f283b589cf3627df43245f82c281c5d3b5553
  }

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col">
<<<<<<< HEAD
              <ChatList 
                chats={chatList} 
                onSearch={handleSearch} 
              />
=======
              <motion.div
                className="bg-white dark:bg-dark-background-light rounded-xl shadow-sm p-4 w-full mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold mb-4 text-secondary-900 dark:text-dark-secondary-700">대화</h2>

                <div className="flex mb-4 border-b border-secondary-100 dark:border-dark-secondary-200">
                  <button
                    className={`py-2 px-4 font-medium text-sm ${
                      activeTab === 'all'
                        ? 'text-primary-600 dark:text-dark-primary-600 border-b-2 border-primary-500 dark:border-dark-primary-500'
                        : 'text-secondary-500 dark:text-dark-secondary-500'
                    }`}
                    onClick={() => setActiveTab('all')}
                  >
                    모든 대화
                  </button>
                  <button
                    className={`py-2 px-4 font-medium text-sm ${
                      activeTab === 'favorites'
                        ? 'text-primary-600 dark:text-dark-primary-600 border-b-2 border-primary-500 dark:border-dark-primary-500'
                        : 'text-secondary-500 dark:text-dark-secondary-500'
                    }`}
                    onClick={() => setActiveTab('favorites')}
                  >
                    즐겨찾기
                  </button>

                  <div className="ml-auto">
                    <button className="p-2 text-secondary-500 dark:text-dark-secondary-500 hover:text-primary-500 dark:hover:text-dark-primary-600">
                      <FontAwesomeIcon icon={faSort} />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSearch} className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="캐릭터 이름으로 검색"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full py-2 px-4 pr-10 bg-secondary-50 dark:bg-dark-secondary-100/10 text-secondary-900 dark:text-dark-secondary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500"
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-500 dark:text-dark-secondary-500"
                    >
                      <FontAwesomeIcon icon={faSearch} />
                    </button>
                  </div>
                </form>

                <div className="space-y-3">
                  {chatList.map(chat => (
                    <motion.div
                      key={chat.id}
                      className="flex items-center p-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-dark-secondary-100/10 cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => router.push(`/chat/${chat.id}`)}
                    >
                      <div className="relative w-12 h-12 rounded-full overflow-hidden mr-3">
                        <Image src={chat.imageUrl} alt={chat.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="font-medium text-secondary-900 dark:text-dark-secondary-700 truncate">
                            {chat.name}
                          </h3>
                          <span className="text-xs text-secondary-500 dark:text-dark-secondary-500 whitespace-nowrap ml-2">
                            {chat.time}
                          </span>
                        </div>
                        <p className="text-sm text-secondary-600 dark:text-dark-secondary-500 truncate">
                          {chat.lastMessage}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {chatList.length === 0 && (
                  <div className="py-20 text-center">
                    <p className="text-secondary-500 dark:text-dark-secondary-500">아직 대화 내역이 없습니다.</p>
                  </div>
                )}
              </motion.div>
>>>>>>> d52f283b589cf3627df43245f82c281c5d3b5553
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  )
}
