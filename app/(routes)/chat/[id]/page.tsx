'use client'

import { Suspense, use } from 'react'
import ChatDetailClient from '@/views/chat/detail'
import { ReqGetChatBot } from '@/services/hooks/DataListManager';
import type { ChrbotData } from '@/types/api';
import { NakamaProvider, useNakama } from '@/app/providers/NakamaProviders'

const serverConfig = {
  serverUrl: 'qauschat.storynation.io',
  // serverUrl: 'chat.storynation.io',
  serverPort: '443',
  useSSL: true,
  autoConnect: false,
  serverKey: 'defaultkey'
};

export default function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)

  // character 정보 가져오기
  const { data, isLoading, error } = ReqGetChatBot(Number(unwrappedParams.id));


  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  if (!data) {
    return <div>No data available</div>
  }

  const charbotData = data?.chrbot;

  return (
    <div className="flex flex-col justify-center items-center h-screen w-100vw bg-neutral-100 dark:bg-dark-background-DEFAULT">
      <div className="flex flex-col justify-center items-center h-screen max-w-[1280px] w-full bg-neutral-100 dark:bg-dark-background-DEFAULT">
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          }
        >
          <NakamaProvider {...serverConfig}>
            <ChatDetailClient characterId={unwrappedParams.id} charbotData={charbotData} />
          </NakamaProvider>
        </Suspense>
      </div>
    </div>
  )
}
