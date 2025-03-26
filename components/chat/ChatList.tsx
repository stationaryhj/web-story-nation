'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import ChatItem, { ChatItemProps } from './ChatItem'
import ChatSearchBar from './ChatSearchBar'
import ChatTabs, { ChatTabType } from './ChatTabs'

// 채팅 목록 타입 정의
export interface ChatListProps {
  chats: ChatItemProps[]
  onSearch?: (query: string) => void
}

export default function ChatList({ chats, onSearch }: ChatListProps) {
  const [activeTab, setActiveTab] = useState<ChatTabType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortNewest, setSortNewest] = useState(true)

  // 검색 핸들러
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (onSearch) {
      onSearch(query)
    }
  }

  // 정렬 토글 핸들러
  const handleSortToggle = () => {
    setSortNewest(!sortNewest)
  }

  // 탭에 따라 필터링
  const filteredChats = chats.filter(chat => {
    if (activeTab === 'all') return true
    // 즐겨찾기는 임시로 짝수 ID만 표시
    if (activeTab === 'favorites') return parseInt(chat.id) % 2 === 0
    return true
  })

  // 검색어로 필터링 (로컬 필터링)
  const searchedChats = filteredChats.filter(chat =>
    searchQuery ? chat.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
  )

  // 정렬 (최신순/과거순)
  const sortedChats = [...searchedChats].sort((a, b) => {
    // 간단한 예시 - 실제로는 날짜 기반 정렬 구현 필요
    return sortNewest ? parseInt(b.id) - parseInt(a.id) : parseInt(a.id) - parseInt(b.id)
  })

  return (
    <motion.div
      className="bg-white dark:bg-dark-background-light rounded-xl shadow-sm p-4 w-full mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-xl font-bold mb-4 text-secondary-900 dark:text-dark-secondary-700">대화</h2>

      {/* 탭 컴포넌트 */}
      <ChatTabs activeTab={activeTab} onTabChange={setActiveTab} onSortClick={handleSortToggle} />

      {/* 검색 컴포넌트 */}
      <ChatSearchBar onSearch={handleSearch} initialQuery={searchQuery} />

      {/* 채팅 목록 */}
      <div className="space-y-3">
        {sortedChats.length > 0 ? (
          sortedChats.map(chat => <ChatItem key={chat.id} {...chat} />)
        ) : (
          <div className="py-20 text-center">
            <p className="text-secondary-500 dark:text-dark-secondary-500 mb-4">
              {searchQuery ? '검색 결과가 없습니다.' : '아직 대화를 시작한 캐릭터가 없습니다.'}
            </p>
            {!searchQuery && (
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
    </motion.div>
  )
}
