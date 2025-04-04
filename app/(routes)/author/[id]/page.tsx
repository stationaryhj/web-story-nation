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
    <>
      <Header />
      <AuthorDetailPage params={params} />
    </>
  )
}
