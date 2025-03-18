import Header from '@/components/layout/header'
import PageTransition from '@/components/motion/PageTransition'
import { Suspense, use } from 'react'

import ChatDetailClient from '@/views/chat/detail'

export default function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params)

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-black to-black-background-light">
        <Header />
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
    </PageTransition>
  )
}
