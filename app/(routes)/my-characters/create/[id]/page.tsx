'use client'

import CreateCharacterPage from '@/views/my-characters/create'
import Header from '@/components/common/header'

export default function Page({ params }: { params: { id: string } }) {
  return (
    <>
      <Header />
      <CreateCharacterPage />
    </>
  )
}
