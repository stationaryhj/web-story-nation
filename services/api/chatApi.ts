import { timeUtil } from "@/lib/utils/timeUtil"
import { dbOperations } from "../indexedDB"

export interface Chat {
  id: number
  message: string
}

const SLEEP_TIME = 200

export const chatApi = {
  //모든 채팅 조회
  async getAll(): Promise<Chat[]> {
    await timeUtil.sleep(SLEEP_TIME)
    return dbOperations.getAllChat()
  },
  // 채팅 생성
  async create(chat: Omit<Chat, 'id'>): Promise<Chat> {
    await timeUtil.sleep(SLEEP_TIME)
    const id = await dbOperations.add('chats', chat)
    const created = await this.getById(id as number)
    if (!created) throw new Error('Failed to create chat')
    return created
  },
  // 채팅 조회
  async getById(id: number): Promise<Chat> {
    await timeUtil.sleep(SLEEP_TIME)
    return dbOperations.get('chats', id)
  },
}