'use client'

import Footer from '@/components/common/footer'
import Header from '@/components/common/header'
import PageTransition from '@/components/motion/PageTransition'
import { bridgeCharbotChatDataToChatList } from '@/lib/utils/storyNationUtil'
import { contentApi, chatApi } from '@/services/api/storyNationApi'
import { ReqGetChatList } from '@/services/hooks/DataListManager'
import { faSearch, faSort, faThumbtack, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'
import { useState } from 'react'
import DeleteConfirmModal from '@/components/modal/DeleteConfirmModal'

export default function ChatListPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('all') // 'all', 'favorites'
  const [searchQuery, setSearchQuery] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [chatToDelete, setChatToDelete] = useState<{ id: number; name: string } | null>(null)

  const { data: chatDataList, isLoading, error, refetch } = ReqGetChatList(10, 1)
  const chatList = bridgeCharbotChatDataToChatList(chatDataList?.chrbot_chat?.data || [])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    // 검색 로직 구현
    console.log('검색어:', searchQuery)
  }

  const handleDeleteClick = (e: React.MouseEvent, chat: { id: number; name: string }) => {
    e.stopPropagation() // 버블링 방지
    setChatToDelete(chat)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!chatToDelete) return

    try {
      await chatApi.CloseChat(chatToDelete.id)
      // API 호출이 성공하면 목록 다시 불러오기
      await refetch()
      setIsDeleteModalOpen(false)
      setChatToDelete(null)
    } catch (error) {
      console.error('Failed to delete chat:', error)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false)
    setChatToDelete(null)
  }

  const handleTogglePin = async (e: React.MouseEvent, bot_key: number, _fixed: number) => {
    e.stopPropagation() // 버블링 방지

    try {
      await contentApi.GetChatTopFixed(bot_key, _fixed > 0 ? 0 : 1)
      // API 호출이 성공하면 목록 다시 불러오기
      await refetch()
    } catch (error) {
      console.error('Failed to update chat fixed status:', error)
    }
  }

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col">
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
                      className="flex items-center p-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-dark-secondary-100/10 cursor-pointer group"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => router.push(`/chat/${chat.characterId}`)}
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
                          onClick={e => handleTogglePin(e, Number(chat.id), Number(chat.fixed))}
                          className={`p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-dark-secondary-200/10 transition-colors ${
                            Number(chat.fixed) === 1
                              ? 'text-yellow-500 dark:text-yellow-400'
                              : 'text-secondary-400 dark:text-dark-secondary-400'
                          }`}
                        >
                          <FontAwesomeIcon icon={faThumbtack} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={e => handleDeleteClick(e, { id: Number(chat.id), name: chat.name })}
                          className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/10 text-red-400 dark:text-red-400 hover:text-red-500 dark:hover:text-red-500 transition-colors"
                        >
                          <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                        </button>
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
            </div>
          </div>
        </main>

        <Footer />

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={handleDeleteCancel}
          title="채팅 삭제"
          entityName={chatToDelete?.name}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </PageTransition>
  )
}
