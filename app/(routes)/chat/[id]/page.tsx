import { Suspense, use } from 'react'
import ChatDetailClient from '@/views/chat/detail'
import Header from '@/components/layout/header'

export default function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)

  return (
    <>
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
    </>
  )
}
