'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useStore } from '../../../../store/useStore'
import { todoAPI, Todo } from '../../../../services/api/todoApi'
import { useState } from 'react'

export default function Test1() {
  // const { c_addTodo, c_updateTodo, c_removeTodo } = useStore()
  const [newTitle, setNewTitle] = useState('')
  const queryClient = useQueryClient()
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 5

  // 페이징된 데이터 조회
  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ['s_todos', 'paginated', currentPage],
    queryFn: () => todoAPI.getPaginated(currentPage, ITEMS_PER_PAGE),
  })

  // 서버 데이터 수정
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates: s_updates }: { id: number; updates: Partial<Todo> }) => {
      return todoAPI.update(id, s_updates)
    },
    onSuccess: s_newData => {
      queryClient.invalidateQueries({
        queryKey: ['s_todos'],
      })
    },
  })

  // 새로운 Todo 생성을 위한 mutation
  const createMutation = useMutation({
    mutationFn: async (newTodo: Omit<Todo, 'id'>) => {
      return todoAPI.create(newTodo)
    },
    //성공시
    onSuccess: s_newData => {
      setNewTitle('')
      queryClient.invalidateQueries({
        queryKey: ['s_todos'],
      })
    },
  })

  // Todo 삭제를 위한 mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => todoAPI.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: ['s_todos'],
      })
    },
  })

  // 테스트 데이터 생성 mutation
  const createTestDataMutation = useMutation({
    mutationFn: () => todoAPI.createBulkTest(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['s_todos'] })
    },
  })

  // 모든 데이터 삭제 mutation
  const deleteAllMutation = useMutation({
    mutationFn: () => todoAPI.deleteAllTest(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['s_todos'] })
      setCurrentPage(1)
    },
  })
  
  // Todo 완료 상태 토글 핸들러
  const handleToggleComplete = (s_todo: Todo) => {
    if (s_todo.id) {
      updateMutation.mutate({
        id: s_todo.id,
        updates: {
          completed: !s_todo.completed,
        },
      })
    }
  }

  // 새 Todo 생성 폼 제출 핸들러
  const handleCreateTodo = (e: React.FormEvent) => {
    console.log('handleCreateTodo')
    e.preventDefault()
    createMutation.mutate({
      title: newTitle,
      completed: false,
    })
  }

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">할 일 목록</h1>

      {/* 새로운 Todo 생성 폼 섹션 */}
      <div className="p-4 bg-gray-100 rounded mb-8">
        <h2 className="text-xl font-bold mb-4">새로운 할 일 추가</h2>
        <form onSubmit={handleCreateTodo} className="space-y-4">
          <div>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="새로운 할 일을 입력하세요"
              className="w-full p-2 border rounded"
              disabled={createMutation.isPending}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={!newTitle || createMutation.isPending}
          >
            {createMutation.isPending ? '추가 중...' : '추가하기'}
          </button>
        </form>

        {createMutation.isSuccess && (
          <div className="mt-4 p-4 bg-green-100 text-green-700 rounded">할 일이 성공적으로 추가되었습니다!</div>
        )}
      </div>

      {/* 테스트 데이터 관리 섹션 */}
      <div className="p-4 bg-gray-100 rounded mb-8">
        <h2 className="text-xl font-bold mb-4">테스트 데이터 관리</h2>
        <div className="space-x-4">
          <button
            onClick={() => createTestDataMutation.mutate()}
            disabled={createTestDataMutation.isPending}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {createTestDataMutation.isPending ? '생성 중...' : '테스트 데이터 10개 생성'}
          </button>
          <button
            onClick={() => deleteAllMutation.mutate()}
            disabled={deleteAllMutation.isPending}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            {deleteAllMutation.isPending ? '삭제 중...' : '전체 삭제'}
          </button>
        </div>
      </div>

      {/* Todo 목록 (페이징 포함) */}
      <div className="p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-bold mb-4">할 일 목록</h2>
        {isLoading ? (
          <p>로딩 중...</p>
        ) : paginatedData && paginatedData.todos.length > 0 ? (
          <>
            <div className="space-y-2 mb-4">
              {paginatedData.todos.map(todo => (
                <div 
                  key={todo.id} 
                  className={`flex items-center justify-between p-3 bg-white rounded shadow ${
                    updateMutation.isPending && updateMutation.variables?.id === todo.id ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggleComplete(todo)}
                      className="w-4 h-4"
                      disabled={updateMutation.isPending}
                    />
                    <span className={todo.completed ? 'line-through text-gray-500' : ''}>{todo.title}</span>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(todo.id!)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                    disabled={deleteMutation.isPending || updateMutation.isPending}
                  >
                    {deleteMutation.isPending && deleteMutation.variables === todo.id ? '삭제 중...' : '삭제'}
                  </button>
                </div>
              ))}
            </div>
            {/* 페이지네이션 UI */}
            <div className="flex justify-center space-x-2">
              {Array.from(
                { length: Math.ceil(paginatedData.total / ITEMS_PER_PAGE) },
                (_, i) => i + 1
              ).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="text-gray-500">할 일이 없습니다</p>
        )}
      </div>
    </div>
  )
}
