import { create } from 'zustand'
import { devtools } from 'zustand/middleware'


interface ClientTodo {
  id: number
  title: string
  completed: boolean
}

interface AppState {
  c_todos: ClientTodo[]
  c_addTodo: (todo: ClientTodo) => void
  c_updateTodo: (id: number, updates: Partial<ClientTodo>) => void
  c_removeTodo: (id: number) => void
}

// devtools로 스토어를 감싸줍니다
export const useStore = create<AppState>()(
  devtools(
    (set) => ({
      c_todos: [],
      c_addTodo: c_todo =>
        set(
          state => ({
            c_todos: [...state.c_todos, { ...c_todo, id: Date.now() }],
          }),
          false,
          'addTodo'
        ),
      c_updateTodo: (id, c_updates) =>
        set(
          state => ({
            c_todos: state.c_todos.map(c_todo =>
              c_todo.id === id ? { ...c_todo, ...c_updates } : c_todo
            ),
          }),
          false,
          'updateTodo'
        ),
      c_removeTodo: id =>
        set(
          state => ({
            c_todos: state.c_todos.filter(c_todo => c_todo.id !== id),
          }),
          false,
          'removeTodo'
        ),
    })
  )
)
