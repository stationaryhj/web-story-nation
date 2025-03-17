import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import { createJSONStorage } from 'zustand/middleware'

interface WooTodo {
  id: number
  title: string
  completed: boolean
}

interface WooTodoState {
  todos: WooTodo[]
  addTodo: (todo: WooTodo) => void
  updateTodo: (id: number, updates: Partial<WooTodo>) => void
  removeTodo: (id: number) => void
  clearTodos: () => void
}

export const useWooStore = create<WooTodoState>()(
  devtools(
    persist(
      immer((set) => ({
        todos: [],
        addTodo: (todo) => set((state) => {
          state.todos.push({
            ...todo,
            id: typeof window !== 'undefined' ? Date.now() : 0
          })
        }),
        updateTodo: (id, updates) => set((state) => {
          const todo = state.todos.find((t: WooTodo) => t.id === id)
          if (todo) {
            Object.assign(todo, updates)
          }
        }),
        removeTodo: (id) => set((state) => {
          state.todos = state.todos.filter((todo: WooTodo) => todo.id !== id)
        }),
        clearTodos: () => set((state) => {
          state.todos = []
        }),
      })),
      {
        name: 'woo-todo',
        storage: createJSONStorage(() => {
          if (typeof window !== 'undefined') {
            return localStorage
          }
          return {
            getItem: () => null,
            setItem: () => null,
            removeItem: () => null
          }
        }),
      }
    )
  )
)
        