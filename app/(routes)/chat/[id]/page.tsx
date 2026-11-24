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
import { useAccountStore } from '@/store/useAccountStore'
import { useModalStore } from '@/store/useStoreModal'
import useNewModalStore from '@/shared/model/stores/useModalStore'


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
  const isLogin = useAccountStore(state => state.isLogin)
  const userIsAdult = useAccountStore(state => state.isAdult())
  const { openModal } = useModalStore()
  const { openModal: openNewModal } = useNewModalStore()

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

  // 로그인 전이거나, 19세 캐릭터인데 성인인증 전이면 안내 화면을 보여준다.
  // 로그인·인증은 팝업으로 진행되므로 끝나면 이 화면에서 바로 대화방으로 넘어간다.
  const needLogin = !isLogin
  const needAdult = !needLogin && chatBotData.nsfw === 1 && !userIsAdult
  if (needLogin || needAdult) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen w-full bg-neutral-100 dark:bg-dark-background-DEFAULT px-6">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-sm p-8 max-w-sm w-full text-center">
          {chatBotData.nsfw === 1 && (
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-500 text-white font-bold mb-4">19</div>
          )}
          <h1 className="text-lg font-semibold mb-2 dark:text-white">{chatBotData.title}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            {needLogin
              ? '로그인하면 바로 대화를 시작할 수 있어요.'
              : '성인 전용 캐릭터예요. 본인인증(성인 확인) 후 바로 대화할 수 있어요.'}
          </p>
          <button
            type="button"
            className="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium"
            onClick={() => (needLogin ? openNewModal({ type: 'socialLogin' }) : openModal('adultVerification'))}
          >
            {needLogin ? '로그인하고 대화하기' : '성인인증하고 대화하기'}
          </button>
          <button type="button" className="w-full py-3 mt-2 text-sm text-gray-500" onClick={() => router.push('/')}>
            홈으로
          </button>
        </div>
      </div>
    )
  }


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
            <ChatDetailClient characterId={unwrappedParams.id} />
          </NakamaProvider>
        </Suspense>
      </div>
    </div>
  )
}
