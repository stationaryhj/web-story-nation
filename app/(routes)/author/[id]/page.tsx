'use client'

import Header from '@/components/common/header'
import AuthorDetailPage from '@/views/author/detail'

interface PageProps {
  params: {
    id: string
  }
}

export default function Page({ params }: PageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <AuthorDetailPage params={params} />
    </div>
  )
}
