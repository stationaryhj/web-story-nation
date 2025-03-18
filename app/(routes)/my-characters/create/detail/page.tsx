'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCharacterFormStore, ConversationExample } from '../../../../../store/useCharacterFormStore'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPencilAlt, faTrash, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'

export default function DetailCharacterPage() {
  const {
    formData,
    setFormField,
    addConversationExample,
    updateConversationExample,
    removeConversationExample,
    setConversationExampleEditMode,
    setConversationExampleVisibility,
  } = useCharacterFormStore()
  const router = useRouter()

  // ref 들을 생성합니다
  const exampleRefs = useRef<{ [key: string]: HTMLTextAreaElement }>({})

  // 최초 대화 예시가 없는 경우 자동으로 하나만 생성합니다
  useEffect(() => {
    if (formData.conversationExamples.length === 0) {
      addConversationExample()
    }
  }, [formData.conversationExamples.length, addConversationExample])

  // 상세 설명 입력 변경 핸들러
  const handleBioDetailChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= 3500) {
      setFormField('bioDetail', value)
    }
  }

  // 공개/비공개 변경 핸들러
  const handleVisibilitySelect = (visibility: 'public' | 'private') => {
    setFormField('visibility', visibility)
  }

  // 대화 예시 추가 버튼 핸들러
  const handleAddExample = () => {
    if (formData.conversationExamples.length < 3) {
      addConversationExample()
    }
  }

  // 대화 예시 텍스트 변경 핸들러
  const handleExampleTextChange = (id: string, text: string) => {
    if (text.length <= 1500) {
      updateConversationExample(id, text)
    }
  }

  // 대화 예시 편집 모드 설정
  const handleEditExample = (id: string) => {
    // 모든 예시를 편집 모드 해제
    formData.conversationExamples.forEach(ex => {
      if (ex.id !== id && ex.isEditing) {
        setConversationExampleEditMode(ex.id, false)

        // 빈 텍스트 자동 삭제
        if (ex.text.trim() === '') {
          removeConversationExample(ex.id)
        }
      }
    })

    setConversationExampleEditMode(id, true)
    // 편집 모드로 전환 후 해당 textarea에 포커스
    setTimeout(() => {
      if (exampleRefs.current[id]) {
        exampleRefs.current[id].focus()
      }
    }, 0)
  }

  // 대화 예시 편집 완료
  const handleCompleteEdit = (id: string) => {
    const example = formData.conversationExamples.find(ex => ex.id === id)
    // 빈 텍스트인 경우 자동 삭제
    if (example && example.text.trim() === '') {
      removeConversationExample(id)
    } else {
      setConversationExampleEditMode(id, false)
    }
  }

  // 대화 예시 삭제 버튼 핸들러
  const handleDeleteExample = (id: string) => {
    if (confirm('정말로 이 대화 예시를 삭제하시겠습니까?')) {
      removeConversationExample(id)
    }
  }

  // 대화 예시 blur 이벤트 핸들러
  const handleExampleBlur = (id: string, oldText: string) => {
    const example = formData.conversationExamples.find(ex => ex.id === id)
    if (example) {
      // 빈 텍스트인 경우 자동 삭제
      if (example.text.trim() === '') {
        removeConversationExample(id)
      }
      // 텍스트가 변경되지 않았으면 편집 모드만 종료
      else if (example.text === oldText) {
        setConversationExampleEditMode(id, false)
      }
      // 변경된 경우 저장 (최적화)
      else {
        handleCompleteEdit(id)
      }
    }
  }

  // 대화 예시 가시성 변경 핸들러
  const handleExampleVisibilityChange = (id: string, visibility: 'public' | 'private') => {
    setConversationExampleVisibility(id, visibility)
  }

  // 텍스트 길이 표시 형식
  const formatTextLength = (current: number, max: number) => {
    return `(${current}/${max})`
  }

  return (
    <div className="space-y-8">
      {/* 상세 설명 */}
      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">상세 설명</h3>
            <p className="text-xs text-secondary-500 dark:text-dark-secondary-500">
              성격, 외모, 상황 등의 정보를 알려주세요!
            </p>
          </div>
          <span className="text-xs text-secondary-500 dark:text-dark-secondary-500">
            {formatTextLength(formData.bioDetail.length, 3500)}
          </span>
        </div>

        {/* 공개/비공개 선택 버튼 */}
        <div className="grid grid-cols-2 gap-4 w-2/3 sm:w-1/3 mb-4">
          <button
            type="button"
            onClick={() => handleVisibilitySelect('private')}
            className={`w-full px-4 py-3 rounded-lg text-center transition-colors ${
              formData.visibility === 'private'
                ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
            }`}
          >
            비공개
          </button>
          <button
            type="button"
            onClick={() => handleVisibilitySelect('public')}
            className={`w-full px-4 py-3 rounded-lg text-center transition-colors ${
              formData.visibility === 'public'
                ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
            }`}
          >
            공개
          </button>
        </div>

        <textarea
          id="bioDetail"
          value={formData.bioDetail}
          onChange={handleBioDetailChange}
          placeholder='예시) 유키는 차가운 첫인상을 가진 고등학교 3학년으로 공부와 운동 모두 뛰어난 완벽주의자다. 겉으로는 "귀찮게 하지마" 라며 주변을 밀어내지만 사실은 누구보다 친구들의 사소한 행동도 기억하며 배려하는 속 깊은 성격을 가졌다.'
          rows={8}
          className="w-full px-4 py-3 rounded-lg border border-secondary-200 dark:border-dark-secondary-200/10 bg-white dark:bg-dark-background-light focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500 dark:text-dark-secondary-400 resize-none"
          maxLength={3500}
        />
      </div>

      {/* 구분선 */}
      <hr className="border-secondary-200 dark:border-dark-secondary-200/10" />

      {/* 대화 예시 섹션 */}
      <div>
        <div className="mb-4">
          <div>
            <h3 className="text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">대화 예시(최대 3개)</h3>
            <p className="text-xs text-secondary-500 dark:text-dark-secondary-500">
              캐릭터의 말투가 채팅에 반영될 거에요!
            </p>
          </div>
        </div>

        {/* 대화 예시 목록 */}
        <div className="space-y-6">
          {formData.conversationExamples.map((example, index) => (
            <div key={example.id} className="relative">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
                  대화 예시 {index + 1}
                </h4>
                <span className="text-xs text-secondary-500 dark:text-dark-secondary-500">
                  {formatTextLength(example.text.length, 1500)}
                </span>
              </div>

              {/* 공개/비공개 선택 버튼 */}
              <div className="grid grid-cols-2 gap-4 w-1/2 sm:w-1/3 mb-3">
                <button
                  type="button"
                  onClick={() => handleExampleVisibilityChange(example.id, 'private')}
                  className={`w-full px-3 py-2 rounded-lg text-center text-sm transition-colors ${
                    example.visibility === 'private'
                      ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                      : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                  }`}
                >
                  비공개
                </button>
                <button
                  type="button"
                  onClick={() => handleExampleVisibilityChange(example.id, 'public')}
                  className={`w-full px-3 py-2 rounded-lg text-center text-sm transition-colors ${
                    example.visibility === 'public'
                      ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                      : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                  }`}
                >
                  공개
                </button>
              </div>

              <div className="relative">
                {/* 텍스트 영역 */}
                <textarea
                  ref={el => {
                    if (el) exampleRefs.current[example.id] = el
                  }}
                  value={example.text}
                  onChange={e => handleExampleTextChange(example.id, e.target.value)}
                  onFocus={() => handleEditExample(example.id)}
                  onBlur={() => handleExampleBlur(example.id, example.text)}
                  placeholder="대화 예시를 입력하세요"
                  rows={4}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    example.isEditing
                      ? 'border-primary-300 dark:border-dark-primary-500/50'
                      : 'border-secondary-200 dark:border-dark-secondary-200/10'
                  } bg-white dark:bg-dark-background-light focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500 dark:text-dark-secondary-400 resize-none`}
                  maxLength={1500}
                />

                {/* 편집 모드일 때 표시되는 버튼들 */}
                {example.isEditing && (
                  <div
                    className="absolute bottom-3 right-3 flex gap-2 opacity-0 transition-opacity duration-200 animate-fadeIn"
                    style={{ opacity: 1 }}
                  >
                    <button
                      type="button"
                      onClick={() => handleCompleteEdit(example.id)}
                      className="px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30 text-xs"
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEditExample(example.id)}
                      className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded hover:bg-primary-200 dark:bg-dark-primary-900/20 dark:text-dark-primary-400 dark:hover:bg-dark-primary-900/30 text-xs"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteExample(example.id)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 text-xs"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* 빈 대화 예시 추가 구역 */}
          {formData.conversationExamples.length < 3 && (
            <div
              className="flex items-center justify-center border-2 border-dashed border-secondary-200 dark:border-dark-secondary-200/10 rounded-lg p-4 mt-4 cursor-pointer hover:border-primary-300 dark:hover:border-dark-primary-500/30 transition-colors"
              onClick={handleAddExample}
            >
              <div className="flex flex-col items-center text-secondary-500 dark:text-dark-secondary-500">
                <FontAwesomeIcon icon={faPlus} className="mb-2 text-xl" />
                <span className="text-sm">대화 예시 추가하기</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
