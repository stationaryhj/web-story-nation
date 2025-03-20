'use client'

import Footer from '@/components/common/footer'
import Header from '@/components/common/header'
import PageTransition from '@/components/motion/PageTransition'
import ChatList from '@/components/chat/ChatList'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ReqGetChatList } from '@/services/hooks/DataListManager'
export default function ChatListPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  

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


  const { data, isLoading, error, refetch } = ReqGetChatList(10, 1);
  console.log('ReqGetChatList :: ', data);

  // 검색 핸들러 - 실제로는 API 호출 등으로 구현
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('검색어:', query);
    // 추후 서버 API 연동 처리
  }

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-grow">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col">
              <ChatList 
                chats={chatList} 
                onSearch={handleSearch} 
              />
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  )
}
