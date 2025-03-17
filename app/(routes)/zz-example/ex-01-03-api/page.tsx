'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { chatApi } from "../../../../services/api/chatApi"

export default function Test3() {
  const { data, isLoading } = useQuery({
    queryKey: ['chats'],  
    queryFn: () => chatApi.getAll(),
  })
  return <main className="min-h-screen p-8">
    <h1 className="text-3xl font-bold mb-8">Test3ysj</h1>
    {isLoading && <p>Loading...</p>}
    {data && data.map((chat) => (
      <div key={chat.id}>
        <p>{chat.message}ㅇ</p>
      </div>
    ))}
  </main>
}

