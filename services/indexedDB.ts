import { openDB, IDBPDatabase } from 'idb'

const DB_NAME = 'TodoDB'
const TODO_STORE = 'todos'
const CHAT_STORE = 'chats'

let dbInstance: IDBPDatabase | null = null
let chatDBInstance: IDBPDatabase | null = null
// DB 인스턴스 초기화 및 관리
export const getDB = async () => {
  if (!dbInstance) {
    dbInstance = await openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(TODO_STORE)) {
          const store = db.createObjectStore(TODO_STORE, {
            keyPath: 'id',
            autoIncrement: true,
          })
          store.createIndex('completed', 'completed')
        }
      },
    })
  }
  return dbInstance
}
export const getChatDB = async () => {
  if (!chatDBInstance) {
    chatDBInstance = await openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(CHAT_STORE)) {
          db.createObjectStore(CHAT_STORE)
        }
      },
    })
  }
  return chatDBInstance
} 

// DB 기본 작업을 위한 헬퍼 함수들
export const dbOperations = {
  async getAll(storeName: string) {
    const db = await getDB()
    return db.getAll(storeName)
  },
  async getAllChat() {
    const db = await getChatDB()
    return db.getAll(CHAT_STORE)
  },
  async get(storeName: string, id: number) {
    const db = await getDB()
    return db.get(storeName, id)
  },

  async add(storeName: string, data: any) {
    const db = await getDB()
    return db.add(storeName, data)
  },

  async put(storeName: string, data: any) {
    const db = await getDB()
    return db.put(storeName, data)
  },

  async delete(storeName: string, id: number) {
    const db = await getDB()
    return db.delete(storeName, id)
  },
}

// Todo 타입 정의
export interface Todo {
  id?: number
  title: string
  completed: boolean
}

// 서버 상태 인터페이스
export interface ServerTodo {
  id?: number
  title: string
  completed: boolean
}

// Todo API 서비스

