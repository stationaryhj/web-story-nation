'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';

import { useWooStore } from '../../../../store/useStore-test';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

export default function ZustandTest() {
  const { todos, addTodo, updateTodo, removeTodo, clearTodos } = useWooStore();
  const [ selectedTodo, setSelectedTodo ] = useState<number | null>(null);
  const [ editText, setEditText ] = useState('');
  const [ newTodoText, setNewTodoText ] = useState('');
  const [ showError, setShowError ] = useState(false);
  const [ showError2, setShowError2 ] = useState(false);

  const { data, isLoading } = useQuery<Array<Todo>>({
    queryKey: [ 'todos' ],
    queryFn: async() => {
      const { data } = await axios.get('https://jsonplaceholder.typicode.com/todos');
      return data;
    },
    enabled: typeof window !== 'undefined',
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { mutate: addTodoMutation } = useMutation({
    mutationFn: (todo: Todo) => {
      return axios.post('https://jsonplaceholder.typicode.com/todos', todo);
    },
    onSuccess: (response) => {
      addTodo({
        id: response.data.id,
        title: response.data.title,
        completed: response.data.completed,
      });
    },
  });

  // 체크박스 클릭시 선택된 todo의 내용을 input에 설정
  const handleSelect = (todo: { id: number; title: string }) => {
    setSelectedTodo(todo.id);
    setEditText(todo.title);
    setShowError(false);
  };

  // Update 버튼 클릭시 수정 적용
  const handleUpdate = () => {
    if (selectedTodo && editText.trim()) {
      updateTodo(selectedTodo, { title: editText });
      setSelectedTodo(null);
      setEditText('');
      setShowError(false);
    } else {
      setShowError(true);
    }
  };

  const handleAdd = () => {
    if (newTodoText.trim()) {
      addTodo({ id: Date.now(), title: newTodoText, completed: false });
      setNewTodoText('');
      setShowError2(false);
    } else {
      setShowError2(true);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('정말 모든 할 일을 삭제하시겠습니까?')) {
      clearTodos();
      setSelectedTodo(null);
      setEditText('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Zustand Todo List
        </h1>

        { /* Todo List */ }
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Todo Items</h2>
          <div className="space-y-3">
            { todos.map(todo => (
              <div key={ todo.id }
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-md border border-gray-200">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={ selectedTodo === todo.id }
                    onChange={ () => handleSelect(todo) }
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className={ `text-gray-700 ${ selectedTodo === todo.id ? 'font-semibold' : '' }` }>
                    { todo.title }
                  </span>
                </div>
              </div>
            )) }
          </div>
        </div>

        { /* Add Section */ }
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Todo</h2>
          <div className="flex space-x-4">
            <input
              type="text"
              value={ newTodoText }
              onChange={ (e) => {
                setNewTodoText(e.target.value);
                setShowError2(false);
              } }
              placeholder="Enter new todo..."
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={ handleAdd }
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md transition-colors duration-200"
            >
              Add Todo
            </button>

          </div>
          { showError2 && (
            <div className="mt-2">
              { /* input 영역이 비어있는 상태에서 add todo 버튼을 눌렀을 때 나타나는 에러 메시지 */ }
              <div className="text-red-500">title을 입력해주세요</div>
            </div>
          ) }
        </div>

        { /* Edit Section */ }
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Edit Selected Todo</h2>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <input
                type="text"
                value={ editText }
                onChange={ (e) => setEditText(e.target.value) }
                placeholder="Edit selected todo..."
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={ handleUpdate }
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-md transition-colors duration-200"
              >
                Update Todo
              </button>
            </div>
            { showError && !selectedTodo && (
              <p className="text-red-500 text-sm">선택한 todo item이 없습니다.</p>
            ) }
          </div>
        </div>

        { /* Remove Section */ }
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Remove Todo</h2>
          <div className="space-y-4">
            <button
              onClick={ () => {
                if (selectedTodo) {
                  removeTodo(selectedTodo);
                  setSelectedTodo(null);
                  setEditText('');
                }
              } }
              className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors duration-200"
            >
              Remove Selected Todo
            </button>

            { /* 전체 삭제 버튼 추가 */ }
            <button
              onClick={ handleClearAll }
              className="w-full bg-red-700 hover:bg-red-800 text-white py-2 px-4 rounded-md transition-colors duration-200"
            >
              Clear All Todos
            </button>
          </div>
        </div>
        <div className="flex justify-center bg-gray-200 p-4 rounded-lg mt-4">
          <button onClick={ () => {
            addTodoMutation({
              id: Date.now(),
              title: 'New Todo from Mutation',
              completed: false,
            });
          } }>
            React Query Mutation 테스트
          </button>
        </div>
        <div className="flex justify-center bg-gray-200 p-4 rounded-lg mt-4">
          { isLoading ? (
            <div>Loading...</div>
          ) : (
            <div>
              { data?.slice(0, 10).map((todo: Todo) => (
                <div key={ todo?.id }>{ todo?.title }</div>
              )) }
            </div>
          ) }
        </div>
      </div>
    </div>
  );
}
