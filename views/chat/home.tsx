'use client'

import Footer from '@/components/common/footer'
import Header from '@/components/common/header'
import PageTransition from '@/components/motion/PageTransition'
import { faSearch, faSort, faStar, faEllipsisV, faThumbtack, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import type { FormEvent } from 'react'
import { useState, useEffect } from 'react'
import { bridgeCharbotChatDataToChatList } from '@/lib/utils/storyNationUtil'
import { ReqGetChatList } from '@/services/hooks/DataListManager'
import { chatApi, contentApi } from '@/services/api/storyNationApi'



export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const characterId = searchParams.get('characterId')
  const [activeTab, setActiveTab] = useState('all') // 'all', 'favorites'
  const [searchQuery, setSearchQuery] = useState('')

  const { data: chatDataList, isLoading, error, refetch } = ReqGetChatList(10, 1);
  const chatList = bridgeCharbotChatDataToChatList(chatDataList?.chrbot_chat?.data || []);

  // 캐릭터 ID로 채팅방 찾기
  useEffect(() => {
    if (characterId) {
      // 실제로는 여기서 해당 캐릭터와의 채팅방으로 이동하는 로직 구현
      console.log(`캐릭터 ID ${characterId}와의 채팅방으로 이동`)
    }
  }, [characterId])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    // 검색 로직 구현
    console.log('검색어:', searchQuery)
  }

  const handleDeleteChat = async (e: React.MouseEvent, bot_key: number) => {
    e.stopPropagation();  // 버블링 방지
    try {
      await chatApi.CloseChat(bot_key);
      // API 호출이 성공하면 목록 다시 불러오기
      await refetch();
    } catch (error) {
      console.error('Failed to update chat fixed status:', error);
    }
  };

  const handleTogglePin = async (e: React.MouseEvent, bot_key: number, _fixed: number) => {
    e.stopPropagation();  // 버블링 방지

    try {
      await contentApi.GetChatTopFixed(bot_key, _fixed > 0 ? 0 : 1);
      // API 호출이 성공하면 목록 다시 불러오기
      await refetch();
    } catch (error) {
      console.error('Failed to update chat fixed status:', error);
    }
  };

  return (
    <PageTransition>
      <main className="min-h-screen pb-20">
        <Header />

        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* 왼쪽 사이드바 - 채팅 목록 */}
            <div className="w-full md:w-1/3 lg:w-1/4">
              <motion.div
                className="bg-white dark:bg-dark-background-light rounded-xl shadow-sm p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-bold mb-4 text-secondary-900 dark:text-dark-secondary-700">대화</h2>

                {/* 탭 네비게이션 */}
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

                {/* 검색 */}
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

                {/* 채팅 목록 */}
                <div className="space-y-3">
                  {chatList.map(chat => (
                    <motion.div
                      key={chat.id}
                      className="flex items-center p-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-dark-secondary-100/10 cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => router.push(`/chat?characterId=${chat.characterId}`)}
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
                      <div className="grid grid-cols-2 gap-2 ml-3 transition-opacity">
                        <button
                          onClick={(e) => handleTogglePin(e, Number(chat.id), Number(chat.fixed))}
                          className={`p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-dark-secondary-200/10 transition-colors ${
                            Number(chat.fixed) === 1 ? 'text-yellow-500 dark:text-yellow-400' : 'text-secondary-400 dark:text-dark-secondary-400'
                          }`}
                        >
                          <FontAwesomeIcon icon={faThumbtack} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteChat(e, Number(chat.id))}
                          className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/10 text-red-400 dark:text-red-400 hover:text-red-500 dark:hover:text-red-500 transition-colors"
                        >
                          <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* 오른쪽 - 채팅 내용 */}
            <div className="w-full md:w-2/3 lg:w-3/4">
              <motion.div
                className="bg-white dark:bg-dark-background-light rounded-xl shadow-sm h-[600px] flex flex-col"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                {characterId ? (
                  <>
                    {/* 채팅방 헤더 */}
                    <div className="p-4 border-b border-secondary-100 dark:border-dark-secondary-200 flex items-center">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                        <Image src="/images/character1.jpg" alt="Character" fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-secondary-900 dark:text-dark-secondary-700">
                          {chatList.find(c => c.characterId === characterId)?.name || '캐릭터 이름'}
                        </h3>
                        <div className="flex space-x-2">
                          <span className="text-xs text-primary-500 dark:text-dark-primary-600 bg-primary-50 dark:bg-dark-primary-100/10 px-2 py-0.5 rounded-full">
                            #태그1
                          </span>
                          <span className="text-xs text-primary-500 dark:text-dark-primary-600 bg-primary-50 dark:bg-dark-primary-100/10 px-2 py-0.5 rounded-full">
                            #태그2
                          </span>
                        </div>
                      </div>
                      <button className="p-2 text-secondary-500 dark:text-dark-secondary-500 hover:text-primary-500 dark:hover:text-dark-primary-600">
                        <FontAwesomeIcon icon={faStar} />
                      </button>
                      <button className="p-2 text-secondary-500 dark:text-dark-secondary-500 hover:text-primary-500 dark:hover:text-dark-primary-600">
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </button>
                    </div>

                    {/* 채팅 내용 */}
                    <div className="flex-1 overflow-y-auto p-4 bg-secondary-50 dark:bg-dark-secondary-100/5">
                      <div className="space-y-4">
                        {/* 상대방 메시지 */}
                        <div className="flex items-start">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                            <Image src="/images/character1.jpg" alt="Character" fill className="object-cover" />
                          </div>
                          <div>
                            <div className="bg-white dark:bg-dark-background-DEFAULT p-3 rounded-lg rounded-tl-none max-w-md shadow-sm">
                              <p className="text-secondary-900 dark:text-dark-secondary-700">
                                안녕하세요! 오늘 어떻게 지내세요?
                              </p>
                            </div>
                            <span className="text-xs text-secondary-500 dark:text-dark-secondary-500 mt-1 inline-block">
                              오전 11:30
                            </span>
                          </div>
                        </div>

                        {/* 내 메시지 */}
                        <div className="flex items-start justify-end">
                          <div>
                            <div className="bg-primary-500 dark:bg-dark-primary-600 p-3 rounded-lg rounded-tr-none max-w-md shadow-sm">
                              <p className="text-white">안녕하세요! 잘 지내고 있어요. 오늘 날씨가 정말 좋네요.</p>
                            </div>
                            <span className="text-xs text-secondary-500 dark:text-dark-secondary-500 mt-1 inline-block text-right w-full">
                              오전 11:32
                            </span>
                          </div>
                        </div>

                        {/* 상대방 메시지 */}
                        <div className="flex items-start">
                          <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
                            <Image src="/images/character1.jpg" alt="Character" fill className="object-cover" />
                          </div>
                          <div>
                            <div className="bg-white dark:bg-dark-background-DEFAULT p-3 rounded-lg rounded-tl-none max-w-md shadow-sm">
                              <p className="text-secondary-900 dark:text-dark-secondary-700">
                                네, 정말 좋은 날씨예요! 오늘 계획이 있으신가요?
                              </p>
                            </div>
                            <span className="text-xs text-secondary-500 dark:text-dark-secondary-500 mt-1 inline-block">
                              오전 11:35
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 메시지 입력 */}
                    <div className="p-4 border-t border-secondary-100 dark:border-dark-secondary-200">
                      <form className="flex items-center">
                        <input
                          type="text"
                          placeholder="메시지를 입력하세요..."
                          className="flex-1 py-2 px-4 bg-secondary-50 dark:bg-dark-secondary-100/10 text-secondary-900 dark:text-dark-secondary-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500"
                        />
                        <button
                          type="submit"
                          className="ml-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full text-sm font-medium transition-colors dark:bg-dark-primary-600 dark:hover:bg-dark-primary-700"
                        >
                          전송
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  // 선택된 채팅방이 없을 때
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-24 h-24 bg-secondary-100 dark:bg-dark-secondary-200/20 rounded-full flex items-center justify-center mb-4">
                      <FontAwesomeIcon
                        icon={faSearch}
                        className="text-3xl text-secondary-400 dark:text-dark-secondary-500"
                      />
                    </div>
                    <h3 className="text-xl font-medium text-secondary-900 dark:text-dark-secondary-700 mb-2">
                      대화할 캐릭터를 선택하세요
                    </h3>
                    <p className="text-secondary-600 dark:text-dark-secondary-500 max-w-md">
                      왼쪽 목록에서 캐릭터를 선택하거나, 홈 화면에서 캐릭터 카드를 클릭하여 대화를 시작할 수 있습니다.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </PageTransition>
  )
}
