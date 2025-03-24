import React from 'react'
import Header from '@/components/common/header'
import LiveChatPage from '@/views/live/home'

type Props = {}

export default function page({}: Props) {
  return (
    <>
      <Header />
      <LiveChatPage />
    </>
  )
}
