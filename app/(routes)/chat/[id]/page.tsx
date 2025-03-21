'use client'

import { Suspense, use } from 'react'
import ChatDetailClient from '@/views/chat/detail'
import { NakamaProvider, useNakama } from './NakamaContext';

export default function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { isAuthenticated, session, logout, closeChat, exitChat, sendMessage, messagesList } = useNakama();
  const unwrappedParams = use(params)

  return (
    <NakamaProvider chatId={unwrappedParams.id as string} chat_mode={2}>
      <div className="flex flex-col justify-center items-center h-screen w-100vw bg-neutral-100 dark:bg-dark-background-DEFAULT">
        <div className="flex flex-col justify-center items-center h-screen max-w-[1280px] w-full bg-neutral-100 dark:bg-dark-background-DEFAULT">
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
              </div>
            }
          >
            <ChatDetailClient characterId={unwrappedParams.id} />
          </Suspense>
        </div>
      </div>
    </NakamaProvider>
  )
}
