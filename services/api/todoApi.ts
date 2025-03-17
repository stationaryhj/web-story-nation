import { timeUtil } from  '@/lib/utils/timeUtil'
import { dbOperations } from '../indexedDB'

// API 응답 타입
export interface Todo {
  id?: number
  title: string
  completed: boolean
}

const SLEEP_TIME = 200

// Todo API 서비스
export const todoAPI = {
  // 모든 Todo 조회
  async getAll(): Promise<Todo[]> {
    await timeUtil.sleep(SLEEP_TIME)
    const todos = await dbOperations.getAll('todos')
    return todos
  },

  // 단일 Todo 조회
  async getById(id: number): Promise<Todo | undefined> {
    await timeUtil.sleep(SLEEP_TIME)
    return dbOperations.get('todos', id)
  },

  // Todo 생성
  async create(todo: Omit<Todo, 'id'>): Promise<Todo> {
    await timeUtil.sleep(SLEEP_TIME)
    const id = await dbOperations.add('todos', todo)
    const created = await this.getById(id as number)
    console.log('created', created)
    if (!created) throw new Error('Failed to create todo')
    return created
  },

  // Todo 수정
  async update(id: number, updates: Partial<Todo>): Promise<Todo> {
    await timeUtil.sleep(SLEEP_TIME)
    const todo = await this.getById(id)
    if (!todo) throw new Error('Todo not found')

    const updatedTodo = {
      ...todo, 
      ...updates,
    }
    await dbOperations.put('todos', updatedTodo)
    return updatedTodo
  },

  // Todo 삭제
  async delete(id: number): Promise<void> {
    await timeUtil.sleep(SLEEP_TIME)
    await dbOperations.delete('todos', id)
  },

  // 페이징 처리된 Todo 목록 조회
  async getPaginated(page: number = 1, limit: number = 5): Promise<{ todos: Todo[]; total: number }> {
    await timeUtil.sleep(SLEEP_TIME)
    const allTodos = await dbOperations.getAll('todos')
    const start = (page - 1) * limit
    const paginatedTodos = allTodos.slice(start, start + limit)
    return {
      todos: paginatedTodos,
      total: allTodos.length,
    }
  },

  // 테스트용 더미 데이터 생성
  async createBulkTest(): Promise<void> {
    await timeUtil.sleep(SLEEP_TIME)
    const currentTodos = await dbOperations.getAll('todos')
    const startNumber = currentTodos.length + 1
    
    const dummyTodos = Array.from({ length: 10 }, (_, i) => ({
      title: `Test Todo ${startNumber + i}`,
      completed: Math.random() > 0.5,
    }))

    for (const todo of dummyTodos) {
      await dbOperations.add('todos', todo)
    }
  },

  // 모든 Todo 삭제
  async deleteAllTest(): Promise<void> {
    await timeUtil.sleep(SLEEP_TIME)
    const todos = await dbOperations.getAll('todos')
    for (const todo of todos) {
      await dbOperations.delete('todos', todo.id!)
    }
  },
} 