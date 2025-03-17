'use client'

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { todoAPI, Todo } from '../../../../services/api/todoApi'
import { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer'

/**
 * 페이지네이션된 Todo 데이터의 응답 형식
 * @property todos - 현재 페이지의 Todo 항목 배열
 * @property total - 전체 Todo 항목의 개수
 */
interface TodoPage {
  todos: Todo[]
  total: number
}

export default function ScrollTest01() {
  // 새로운 Todo 입력을 위한 상태
  const [newTitle, setNewTitle] = useState('')
  const queryClient = useQueryClient()
  // 한 페이지당 표시할 항목 수
  const ITEMS_PER_PAGE = 5

  /**
   * Intersection Observer를 사용한 무한 스크롤 감지
   * ref: 관찰할 요소에 부착할 참조
   * inView: 요소가 뷰포트에 들어왔는지 여부
   */
  const { ref, inView } = useInView()

  /**
   * 무한 스크롤 데이터 조회를 위한 Query Hook
   * @param pageParam - 현재 페이지 번호 (기본값: 1)
   * @returns TodoPage - 페이지네이션된 Todo 데이터
   */
  const {
    data, // 페이지네이션된 데이터
    isLoading, // 초기 로딩 상태
    fetchNextPage, // 다음 페이지 데이터 요청 함수
    hasNextPage, // 다음 페이지 존재 여부
    isFetchingNextPage, // 다음 페이지 로딩 상태
  } = useInfiniteQuery<TodoPage>({
    queryKey: ['infinite_todos'],
    initialPageParam: 1,

    // 페이지 번호를 인자로 받아 페이지 데이터를 반환하는 함수
    queryFn: ({ pageParam }) => todoAPI.getPaginated(pageParam as number, ITEMS_PER_PAGE),
    
    // 다음 페이지 번호 계산
    getNextPageParam: (lastPage: TodoPage, allPages: TodoPage[]) => {
      console.log('lastPage', lastPage)
      console.log('allPages', allPages)
      const nextPage = allPages.length + 1
      // 마지막 페이지가 가득 차있으면 다음 페이지 존재
      return lastPage.todos.length === ITEMS_PER_PAGE ? nextPage : undefined
    },
  })

  /**
   * 스크롤이 감지되면 다음 페이지 데이터 로드
   * inView가 true이고, 다음 페이지가 있으며, 현재 로딩 중이 아닐 때 실행
   */
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  /**
   * Todo 생성 Mutation
   * @param newTodo - 생성할 Todo 데이터 (id 제외)
   */
  const createMutation = useMutation({
    mutationFn: async (newTodo: Omit<Todo, 'id'>) => {
      return todoAPI.create(newTodo)
    },
    onSuccess: () => {
      setNewTitle('') // 입력 필드 초기화
      queryClient.invalidateQueries({ queryKey: ['infinite_todos'] }) // 데이터 갱신
    },
  })

  /**
   * Todo 수정 Mutation
   * @param id - 수정할 Todo의 ID
   * @param updates - 업데이트할 필드와 값
   */
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Todo> }) => {
      return todoAPI.update(id, updates)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infinite_todos'] })
    },
  })

  /**
   * Todo 삭제 Mutation
   * @param id - 삭제할 Todo의 ID
   */
  const deleteMutation = useMutation({
    mutationFn: (id: number) => todoAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infinite_todos'] })
    },
  })

  /**
   * 테스트 데이터 생성 Mutation
   * 한 번에 10개의 테스트 데이터를 생성
   */
  const createTestDataMutation = useMutation({
    mutationFn: () => todoAPI.createBulkTest(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infinite_todos'] })
    },
  })

  /**
   * 모든 데이터 삭제 Mutation
   * 저장된 모든 Todo 항목을 삭제
   */
  const deleteAllMutation = useMutation({
    mutationFn: () => todoAPI.deleteAllTest(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['infinite_todos'] })
    },
  })

  /**
   * 새 Todo 생성 폼 제출 핸들러
   * @param e - 폼 이벤트 객체
   */
  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      title: newTitle,
      completed: false,
    })
  }

  /**
   * Todo 완료 상태 토글 핸들러
   * @param todo - 토글할 Todo 객체
   */
  const handleToggleComplete = (todo: Todo) => {
    if (todo.id) {
      updateMutation.mutate({
        id: todo.id,
        updates: { completed: !todo.completed },
      })
    }
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">할 일 목록 (무한 스크롤)</h1>

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

      {/* Todo 목록 (무한 스크롤) */}
      <div className="p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-bold mb-4">할 일 목록</h2>
        {isLoading ? (
          <p>로딩 중...</p>
        ) : data?.pages[0].todos.length ? (
          <div className="space-y-2">
            {data.pages.map((page, i) => (
              <div key={i} className="space-y-2">
                {page.todos.map((todo: Todo) => (
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
            ))}
            {/* 무한 스크롤 트리거 */}
            <div ref={ref} className="h-4">
              {isFetchingNextPage && <p className="text-center">로딩 중...</p>}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">할 일이 없습니다</p>
        )}
      </div>
    </div>
  )
} 