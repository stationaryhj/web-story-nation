import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { contentApi, createApi } from '@/services/api'
import { CharbotChatData } from '@/types/api'

interface ChatListStoreData {
	isLoading: boolean
	error: Error | null
	chatList: CharbotChatData[]
	total: number
	last_page: number
	fetchChatList: (paginate: number, page: number) => Promise<void>
}


export const useChatListStore = create<ChatListStoreData>()(
	(set, get) => ({
		isLoading: false,
		error: null,
		chatList: [],
		total: 0,
		last_page: 0,
		fetchChatList: async (paginate: number, page: number) => {
			set({ isLoading: true })
			const response = await contentApi.GetChatList(paginate, page)
			set({ isLoading: false })
			if(response.data && response.data.result && response.data.result.err === 0) {
				set({ chatList: response.data.chrbot_chat.data })
				set({ total: response.data.chrbot_chat.total || 0 })
				set({ last_page: response.data.chrbot_chat.last_page || 0 })
			}
			else {
				set({ error: response.data?.result?.msg as unknown as Error })
			}
		}
	})
)