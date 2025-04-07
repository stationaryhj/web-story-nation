'use client'

import Footer from '@/components/common/footer'
import Header from '@/components/common/header'
import PageTransition from '@/components/motion/PageTransition'
import { bridgeCharbotChatDataToChatList } from '@/lib/utils/storyNationUtil'
import { createApi, contentApi, chatApi } from '@/services/api/storyNationApi'
import { ReqGetChatList } from '@/services/hooks/DataListManager'
import { faSearch, faSort, faThumbtack, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'
import { useState, useEffect, useCallback } from 'react'
import DeleteConfirmModal from '@/components/modal/DeleteConfirmModal'
import { BaseSelectBox } from '@/components/elements/selectbox/BaseSelectBox'

const chatListOptions = [
  { value: 'latest', label: '최근 대화순' },
  { value: 'oldest', label: '오래된 대화순' },
  { value: 'mostChats', label: '대화 많은 순' },
  { value: 'fewestChats', label: '대화 적은 순' },
]

// Toast 알림 컴포넌트
interface ToastProps {
  message: string
  isVisible: boolean
  onClose: () => void
}

const Toast = ({ message, isVisible, onClose }: ToastProps) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-secondary-800 dark:bg-dark-secondary-900 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
        >
          <span className="mr-2">{message}</span>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-secondary-700 dark:hover:bg-dark-secondary-800 transition-colors"
          >
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function ChatListPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('all') // 'all', 'favorites'
  const [searchQuery, setSearchQuery] = useState('')
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [chatToDelete, setChatToDelete] = useState<{ id: number; name: string } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedOption, setSelectedOption] = useState({ value: 'latest', label: '최근 대화순' })

  // Toast 알림 상태
  const [customToast, setCustomToast] = useState({
    message: '',
    isVisible: false,
  })

  // Toast 표시 함수
  const showCustomToast = (message: string) => {
    setCustomToast({
      message,
      isVisible: true,
    })
  }

  // Toast 닫기 함수
  const closeCustomToast = () => {
    setCustomToast(prev => ({
      ...prev,
      isVisible: false,
    }))
  }

  // 채팅 목록 데이터 가져오기
  const { data: chatDataList, isLoading, error, refetch } = ReqGetChatList(itemsPerPage, currentPage)

  // 전체 채팅 목록
  const [chatList, setChatList] = useState<
    Array<{
      id: string
      characterId: string
      name: string
      lastMessage: string
      time: string
      imageUrl: string
      fixed: number
    }>
  >([])

  // 필터링된 채팅 목록
  const [filteredChatList, setFilteredChatList] = useState<
    Array<{
      id: string
      characterId: string
      name: string
      lastMessage: string
      time: string
      imageUrl: string
      fixed: number
    }>
  >([])

  const [likeList, setLikeList] = useState<
    {
      id: string
      characterId: string
      name: string
      lastMessage: string
      time: string
    }[]
  >([])

  // 데이터가 변경될 때마다 채팅 목록 업데이트
  useEffect(() => {
    if (chatDataList?.chrbot_chat) {
      const chats = bridgeCharbotChatDataToChatList(chatDataList.chrbot_chat.data || [])
      setChatList(chats)
      setTotalPages(chatDataList.chrbot_chat.last_page || 1)
    }
  }, [chatDataList])

  // 검색어 및 탭 변경 시 필터링 적용
  useEffect(() => {
    let filtered = [...chatList]

    // 탭에 따른 필터링
    if (activeTab === 'favorites') {
      filtered = filtered.filter(chat => Number(chat.fixed) > 0)
    }

    // 검색어에 따른 필터링
    if (searchQuery.trim()) {
      filtered = filtered.filter(chat => chat.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    setFilteredChatList(filtered)
  }, [chatList, activeTab, searchQuery])

  // 검색 핸들러
  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    // 페이지를 1로 리셋하고 검색 쿼리 적용
    setCurrentPage(1)
    // refetch는 필요 없음, useEffect에서 필터링함
  }

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  // 탭 변경 핸들러
  const handleTabChange = useCallback((tab: 'all' | 'favorites') => {
    setActiveTab(tab)
    setCurrentPage(1) // 탭 변경 시 페이지 초기화
  }, [])

  // 페이지 변경 또는 검색 쿼리 변경 시 데이터 새로 가져오기
  useEffect(() => {
    refetch()
  }, [currentPage, refetch])

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

    // 즐겨찾기 추가하려는 경우
    if (_fixed === 0) {
      try {
        // 최신 데이터 가져오기 위해 즐겨찾기 상태 먼저 확인
        await refetch()

        // 현재 즐겨찾기 개수 정확히 계산
        const pinnedChatsCount = chatList.filter(chat => Number(chat.fixed) === 1).length

        console.log('현재 즐겨찾기 개수:', pinnedChatsCount)

        // 이미 10개가 즐겨찾기되어 있으면 토스트 메시지 표시하고 함수 종료
        if (pinnedChatsCount >= 10) {
          showCustomToast('즐겨찾기는 최대 10개까지만 가능합니다.')
          return
        }

        // 즐겨찾기 설정 API 호출
        await contentApi.GetChatTopFixed(bot_key, 1)
        // 목록 다시 불러오기
        await refetch()
      } catch (error) {
        console.error('Failed to update chat fixed status:', error)
        showCustomToast('즐겨찾기 설정 중 오류가 발생했습니다.')
      }
    } else {
      // 즐겨찾기 해제
      try {
        await contentApi.GetChatTopFixed(bot_key, 0)
        await refetch()
      } catch (error) {
        console.error('Failed to update chat fixed status:', error)
        showCustomToast('즐겨찾기 해제 중 오류가 발생했습니다.')
      }
    }
  }

  const handleOptionChange = (option: { value: string; label: string }) => {
    setSelectedOption(option)
    //   if (query.trim()) {
    // const filteredResults = MOCK_SEARCH_RESULTS[option.value as keyof typeof MOCK_SEARCH_RESULTS].filter(item =>
    //   item.name.toLowerCase().includes(query.toLowerCase())
    // )
    // setSearchResults(filteredResults)
    // setShowNoResults(filteredResults.length === 0)
  }

  // 페이지네이션 렌더링
  const renderPagination = () => {
    if (totalPages <= 1) return null

    return (
      <div className="flex justify-center mt-6 gap-2">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md ${
            currentPage === 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
          }`}
        >
          이전
        </button>

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          // 현재 페이지를 중심으로 최대 5개의 페이지 번호를 표시
          let pageNum = currentPage - 2 + i
          if (pageNum < 1) pageNum += 5
          if (pageNum > totalPages) return null

          return (
            <button
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`px-3 py-1 rounded-md ${
                currentPage === pageNum
                  ? 'bg-primary-500 text-white'
                  : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
              }`}
            >
              {pageNum}
            </button>
          )
        })}

        <button
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md ${
            currentPage === totalPages
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
          }`}
        >
          다음
        </button>
      </div>
    )
  }

  const handleOnClickChatData = async (chat: { characterId: string }) => {
    console.log('chat :: ', chat)

    const response = await createApi.GetChatBot(Number(chat.characterId))
    console.log('response :: ', response.data.chrbot.block_type)
    if (response.data.result.err === 0) {
      if (response.data.chrbot.block_type !== 0) {
        toast.error('정책 위반 사항이 포함되어 비공개된 캐릭터입니다.')
        return
      }

      if (response.data.chrbot.delete_yn !== 0) {
        toast.error('삭제된 캐릭터입니다.')
        return
      }

      router.push(`/chat/${chat.characterId}`)
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

                <div className="flex md:flex-row pb-4 mb-4 justify-between border-b border-secondary-100 dark:border-dark-secondary-200">
                  <div className="flex mb-2 md:mb-0">
                    <button
                      className={`py-1 px-2 md:py-2 md:px-4 font-medium text-xs md:text-sm ${
                        activeTab === 'all'
                          ? 'text-primary-600 dark:text-dark-primary-600 border-b-2 border-primary-500 dark:border-dark-primary-500'
                          : 'text-secondary-500 dark:text-dark-secondary-500'
                      }`}
                      onClick={() => handleTabChange('all')}
                    >
                      모든 대화
                    </button>
                    <button
                      className={`py-1 px-2 md:py-2 md:px-4 font-medium text-xs md:text-sm ${
                        activeTab === 'favorites'
                          ? 'text-primary-600 dark:text-dark-primary-600 border-b-2 border-primary-500 dark:border-dark-primary-500'
                          : 'text-secondary-500 dark:text-dark-secondary-500'
                      }`}
                      onClick={() => handleTabChange('favorites')}
                    >
                      즐겨찾기
                    </button>
                  </div>
                  <BaseSelectBox
                    options={chatListOptions}
                    selectedOption={selectedOption}
                    onChange={handleOptionChange}
                    className="w-full md:w-auto"
                  />
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

                {isLoading ? (
                  <div className="py-10 text-center">
                    <p className="text-secondary-500 dark:text-dark-secondary-500">로딩 중...</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {filteredChatList.length > 0 ? (
                        filteredChatList.map(chat => (
                          <motion.div
                            key={chat.id}
                            className="flex items-center p-3 rounded-lg hover:bg-secondary-50 dark:hover:bg-dark-secondary-100/10 cursor-pointer group"
                            whileHover={{ scale: 1.02 }}
                            onClick={() => handleOnClickChatData(chat)}
                          >
                            <div className="relative w-12 h-12 rounded-full overflow-hidden mr-3">
                              <Image
                                src={chat.imageUrl}
                                alt={chat.name || '캐릭터 이미지'}
                                fill
                                className="object-cover"
                              />
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
                        ))
                      ) : (
                        <div className="py-20 text-center">
                          <p className="text-secondary-500 dark:text-dark-secondary-500 mb-4">
                            {searchQuery
                              ? '검색 결과가 없습니다.'
                              : activeTab === 'favorites'
                                ? '즐겨찾기한 대화가 없습니다.'
                                : '아직 대화를 시작한 캐릭터가 없습니다.'}
                          </p>
                          {!searchQuery && activeTab === 'all' && (
                            <Link
                              href="/my-characters/create"
                              className="inline-flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors dark:bg-dark-primary-600 dark:hover:bg-dark-primary-700"
                            >
                              <span className="mr-1">+</span> 첫캐릭터 만들기
                            </Link>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 페이지네이션 */}
                    {renderPagination()}
                  </>
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

        {/* Toast 알림 */}
        <Toast message={customToast.message} isVisible={customToast.isVisible} onClose={closeCustomToast} />
      </div>
    </PageTransition>
  )
}
