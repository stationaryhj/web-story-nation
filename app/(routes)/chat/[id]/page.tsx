'use client'

import React, { useEffect } from 'react'
import { Suspense, use } from 'react'
import ChatDetailClient from '@/views/chat/detail'
import { NakamaProvider } from '@/app/providers/NakamaProviders'
import { CHAT_URL } from '@/services/api/storyNationApi';
import { useChatStore } from '@/store/useChatStore'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import { ChrbotData } from '@/types/api'


const serverConfig = {
  serverUrl: CHAT_URL || '',
  serverPort: '443',
  useSSL: true,
  autoConnect: false,
  serverKey: 'defaultkey'
} as const;

const checkChatBotData = (chatBot: ChrbotData) => {
  if (chatBot.block_type !== 0) {
    toast.error('정책 위반 사항이 포함되어 비공개된 캐릭터입니다.', {
      toastId: 'block-error',
    })
    return false
  }

  if (chatBot.delete_yn !== 0) {
    toast.error('삭제된 캐릭터입니다.', {
      toastId: 'delete-error',
    })
    return false
  }

  return true
}

export default function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const unwrappedParams = use(params)
  const { isLoading, error, chatBotData, fetchChatBotData } = useChatStore()

  useEffect(() => {
    const initPage = async () => {
      await fetchChatBotData(Number(unwrappedParams.id))
      if (chatBotData && !checkChatBotData(chatBotData)) {
        router.back()
      }
    }
    initPage()
  }, [unwrappedParams.id])


  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  if(!chatBotData) {
    return <div>캐릭터 정보를 찾을 수 없습니다. {unwrappedParams.id}</div>
  }


  return (
    <div className="flex flex-col justify-center items-center h-screen w-100vw bg-surface">
      <div className="flex flex-col justify-center items-center h-screen max-w-[1280px] w-full bg-surface">
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          }
        >
          <NakamaProvider {...serverConfig}>
            <ChatDetailClient characterId={unwrappedParams.id} />
          </NakamaProvider>
        </Suspense>
      </div>
    </div>
  )
}
