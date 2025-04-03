'use client'

import React, { useEffect, useRef, useState } from 'react'
import { faPlus, faTimes, faInfoCircle, faUser, faRobot } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { ChangeEvent } from 'react'

import { RequiredLabel } from '../CharacterForm'
import { ConversationExample } from '@/store/useCreateCharacterData'

interface DetailInfoFormProps {
  formData: any
  setFormField: (name: string, value: any) => void
  addConversationExample: () => void
  updateConversationExample: (id: string, text: string) => void
  removeConversationExample: (id: string) => void
  setConversationExampleEditMode: (id: string, isEditing: boolean) => void
  setConversationExampleVisibility: (id: string, visibility: 'public' | 'private') => void
  onValidationChange?: (isValid: boolean) => void
}

// 대화 예시 인터페이스 정의
interface ChatExample {
  id: string
  title: string
  userMessage: string
  characterMessage: string
  visibility: 'public' | 'private'
  isEditing: boolean
}

export default function DetailInfoForm({
  formData,
  setFormField,
  addConversationExample,
  updateConversationExample,
  removeConversationExample,
  setConversationExampleEditMode,
  setConversationExampleVisibility,
  onValidationChange,
}: DetailInfoFormProps) {
  // 대화 예시 관련 ref 추가
  const exampleRefs = useRef<{ [key: string]: HTMLTextAreaElement }>({})

  // 현재 선택된 입력 필드 (user 또는 character)
  const [activeField, setActiveField] = useState<{ id: string; field: 'user' | 'character' } | null>(null)

  console.log('formData', formData)

  // 채팅 예시 상태 관리
  const [chatExample, setChatExample] = useState<{
    title: string
    userMessage: string
    characterMessage: string
  }>({
    title: '',
    userMessage: '',
    characterMessage: '',
  })

  // 채팅 예시 제목 상태 관리 (기존 대화 예시용)
  const [chatExampleTitles, setChatExampleTitles] = useState<{ [key: string]: string }>({})

  // 사용자 및 캐릭터 메시지 상태 관리 (기존 대화 예시용)
  const [userMessages, setUserMessages] = useState<{ [key: string]: string }>({})
  const [characterMessages, setCharacterMessages] = useState<{ [key: string]: string }>({})

  // 유효성 검사
  useEffect(() => {
    if (onValidationChange) {
      // 상세 정보 탭은 bioDetail만 필수
      const isValid = !!formData.bioDetail?.trim()
      onValidationChange(isValid)
    }
  }, [formData, onValidationChange])

  // 최초 대화 예시가 없는 경우 자동으로 하나만 생성합니다
  useEffect(() => {
    if (formData.conversationExamples.length === 0) {
      addConversationExample()
    }
  }, [formData.conversationExamples.length, addConversationExample])

  // 대화 예시 데이터에서 사용자 및 캐릭터 메시지 초기화 (렌더링과 별개로 처리)
  useEffect(() => {
    const newUserMessages: { [key: string]: string } = { ...userMessages }
    const newCharacterMessages: { [key: string]: string } = { ...characterMessages }
    let messagesUpdated = false

    formData.conversationExamples.forEach((example: ConversationExample) => {
      if (!newUserMessages[example.id] || !newCharacterMessages[example.id]) {
        const { userMsg, characterMsg } = parseConversationExampleText(example.text)

        if (!newUserMessages[example.id]) {
          newUserMessages[example.id] = userMsg
          messagesUpdated = true
        }

        if (!newCharacterMessages[example.id]) {
          newCharacterMessages[example.id] = characterMsg
          messagesUpdated = true
        }
      }
    })

    if (messagesUpdated) {
      setUserMessages(newUserMessages)
      setCharacterMessages(newCharacterMessages)
    }
  }, [formData.conversationExamples])

  // 게시 범위 선택 핸들러
  const handleVisibilitySelect = (visibility: 'public' | 'private') => {
    setFormField('visibility', visibility)
  }

  // 상세 설명 입력 변경 핸들러
  const handleBioDetailChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= 3500) {
      setFormField('bioDetail', value)
    }
  }

  // 대화 예시 텍스트 변경 핸들러 (타이틀)
  const handleChatExampleTitleChange = (id: string, title: string) => {
    if (title.length <= 25) {
      setChatExampleTitles(prev => ({ ...prev, [id]: title }))
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
    formData.conversationExamples.forEach((ex: ConversationExample) => {
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
    const example = formData.conversationExamples.find((ex: ConversationExample) => ex.id === id)
    // 빈 텍스트인 경우 자동 삭제
    if (example && example.text.trim() === '') {
      removeConversationExample(id)
    } else {
      setConversationExampleEditMode(id, false)
    }
  }

  // 대화 예시 blur 이벤트 핸들러
  const handleExampleBlur = (id: string, oldText: string) => {
    const example = formData.conversationExamples.find((ex: ConversationExample) => ex.id === id)
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

  // 대화 예시 텍스트 변경 핸들러 (사용자 메시지)
  const handleUserMessageChange = (id: string, message: string) => {
    setUserMessages(prev => ({ ...prev, [id]: message }))

    // 기존 대화 예시 형식으로 변환하여 저장
    const combinedText = `User: ${message}\nCharacter: ${characterMessages[id] || ''}`
    updateConversationExample(id, combinedText)
  }

  // 대화 예시 텍스트 변경 핸들러 (캐릭터 메시지)
  const handleCharacterMessageChange = (id: string, message: string) => {
    setCharacterMessages(prev => ({ ...prev, [id]: message }))

    // 기존 대화 예시 형식으로 변환하여 저장
    const combinedText = `User: ${userMessages[id] || ''}\nCharacter: ${message}`
    updateConversationExample(id, combinedText)
  }

  // 채팅 예시 제목 변경 핸들러
  const handleMainChatExampleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= 25) {
      // 최대 25자 제한
      setChatExample(prev => ({ ...prev, title: value }))
    }
  }

  // 채팅 예시 사용자 메시지 변경 핸들러
  const handleMainChatUserMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setChatExample(prev => ({ ...prev, userMessage: e.target.value }))
  }

  // 채팅 예시 캐릭터 메시지 변경 핸들러
  const handleMainChatCharacterMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setChatExample(prev => ({ ...prev, characterMessage: e.target.value }))
  }

  // 상황 설명 버튼 클릭 핸들러 (기존 대화 예시용)
  const handleContextInfoClick = () => {
    if (!activeField) return

    const { id, field } = activeField
    if (field === 'user') {
      const input = document.getElementById(`user-message-${id}`) as HTMLTextAreaElement
      if (input) {
        const startPos = input.selectionStart || 0
        const endPos = input.selectionEnd || 0
        const newText = input.value.substring(0, startPos) + '*' + input.value.substring(endPos)
        handleUserMessageChange(id, newText)

        // 커서 위치 업데이트
        setTimeout(() => {
          input.focus()
          input.selectionStart = input.selectionEnd = startPos + 1
        }, 0)
      }
    } else {
      const input = document.getElementById(`character-message-${id}`) as HTMLTextAreaElement
      if (input) {
        const startPos = input.selectionStart || 0
        const endPos = input.selectionEnd || 0
        const newText = input.value.substring(0, startPos) + '*' + input.value.substring(endPos)
        handleCharacterMessageChange(id, newText)

        // 커서 위치 업데이트
        setTimeout(() => {
          input.focus()
          input.selectionStart = input.selectionEnd = startPos + 1
        }, 0)
      }
    }
  }

  // 메인 채팅 예시용 상황 설명 버튼 핸들러
  const handleMainContextInfoClick = () => {
    if (!activeField) return

    if (activeField.field === 'user') {
      const input = document.getElementById('main-input-user-chat') as HTMLTextAreaElement
      if (input) {
        const startPos = input.selectionStart || 0
        const endPos = input.selectionEnd || 0
        const newText = input.value.substring(0, startPos) + '*' + input.value.substring(endPos)
        setChatExample(prev => ({ ...prev, userMessage: newText }))

        // 커서 위치 업데이트
        setTimeout(() => {
          input.focus()
          input.selectionStart = input.selectionEnd = startPos + 1
        }, 0)
      }
    } else {
      const input = document.getElementById('main-input-character-chat') as HTMLTextAreaElement
      if (input) {
        const startPos = input.selectionStart || 0
        const endPos = input.selectionEnd || 0
        const newText = input.value.substring(0, startPos) + '*' + input.value.substring(endPos)
        setChatExample(prev => ({ ...prev, characterMessage: newText }))

        // 커서 위치 업데이트
        setTimeout(() => {
          input.focus()
          input.selectionStart = input.selectionEnd = startPos + 1
        }, 0)
      }
    }
  }

  // 캐릭터 이름 버튼 클릭 핸들러 (기존 대화 예시용)
  const handleCharacterNameClick = () => {
    if (!activeField) return

    const { id, field } = activeField
    if (field === 'user') {
      const input = document.getElementById(`user-message-${id}`) as HTMLTextAreaElement
      if (input) {
        const startPos = input.selectionStart || 0
        const endPos = input.selectionEnd || 0
        const newText = input.value.substring(0, startPos) + '{{character}}' + input.value.substring(endPos)
        handleUserMessageChange(id, newText)

        // 커서 위치 업데이트
        setTimeout(() => {
          input.focus()
          input.selectionStart = input.selectionEnd = startPos + 13
        }, 0)
      }
    } else {
      const input = document.getElementById(`character-message-${id}`) as HTMLTextAreaElement
      if (input) {
        const startPos = input.selectionStart || 0
        const endPos = input.selectionEnd || 0
        const newText = input.value.substring(0, startPos) + '{{character}}' + input.value.substring(endPos)
        handleCharacterMessageChange(id, newText)

        // 커서 위치 업데이트
        setTimeout(() => {
          input.focus()
          input.selectionStart = input.selectionEnd = startPos + 13
        }, 0)
      }
    }
  }

  // 메인 채팅 예시용 캐릭터 이름 버튼 핸들러
  const handleMainCharacterNameClick = () => {
    if (!activeField) return

    if (activeField.field === 'user') {
      const input = document.getElementById('main-input-user-chat') as HTMLTextAreaElement
      if (input) {
        const startPos = input.selectionStart || 0
        const endPos = input.selectionEnd || 0
        const newText = input.value.substring(0, startPos) + '{{character}}' + input.value.substring(endPos)
        setChatExample(prev => ({ ...prev, userMessage: newText }))

        // 커서 위치 업데이트
        setTimeout(() => {
          input.focus()
          input.selectionStart = input.selectionEnd = startPos + 13
        }, 0)
      }
    } else {
      const input = document.getElementById('main-input-character-chat') as HTMLTextAreaElement
      if (input) {
        const startPos = input.selectionStart || 0
        const endPos = input.selectionEnd || 0
        const newText = input.value.substring(0, startPos) + '{{character}}' + input.value.substring(endPos)
        setChatExample(prev => ({ ...prev, characterMessage: newText }))

        // 커서 위치 업데이트
        setTimeout(() => {
          input.focus()
          input.selectionStart = input.selectionEnd = startPos + 13
        }, 0)
      }
    }
  }

  // 사용자 이름 버튼 클릭 핸들러 (기존 대화 예시용)
  const handleUserNameClick = () => {
    if (!activeField) return

    const { id, field } = activeField
    if (field === 'user') {
      const input = document.getElementById(`user-message-${id}`) as HTMLTextAreaElement
      if (input) {
        const startPos = input.selectionStart || 0
        const endPos = input.selectionEnd || 0
        const newText = input.value.substring(0, startPos) + '{{user}}' + input.value.substring(endPos)
        handleUserMessageChange(id, newText)

        // 커서 위치 업데이트
        setTimeout(() => {
          input.focus()
          input.selectionStart = input.selectionEnd = startPos + 8
        }, 0)
      }
    } else {
      const input = document.getElementById(`character-message-${id}`) as HTMLTextAreaElement
      if (input) {
        const startPos = input.selectionStart || 0
        const endPos = input.selectionEnd || 0
        const newText = input.value.substring(0, startPos) + '{{user}}' + input.value.substring(endPos)
        handleCharacterMessageChange(id, newText)

        // 커서 위치 업데이트
        setTimeout(() => {
          input.focus()
          input.selectionStart = input.selectionEnd = startPos + 8
        }, 0)
      }
    }
  }

  // 메인 채팅 예시용 사용자 이름 버튼 핸들러
  const handleMainUserNameClick = () => {
    if (!activeField) return

    if (activeField.field === 'user') {
      const input = document.getElementById('main-input-user-chat') as HTMLTextAreaElement
      if (input) {
        const startPos = input.selectionStart || 0
        const endPos = input.selectionEnd || 0
        const newText = input.value.substring(0, startPos) + '{{user}}' + input.value.substring(endPos)
        setChatExample(prev => ({ ...prev, userMessage: newText }))

        // 커서 위치 업데이트
        setTimeout(() => {
          input.focus()
          input.selectionStart = input.selectionEnd = startPos + 8
        }, 0)
      }
    } else {
      const input = document.getElementById('main-input-character-chat') as HTMLTextAreaElement
      if (input) {
        const startPos = input.selectionStart || 0
        const endPos = input.selectionEnd || 0
        const newText = input.value.substring(0, startPos) + '{{user}}' + input.value.substring(endPos)
        setChatExample(prev => ({ ...prev, characterMessage: newText }))

        // 커서 위치 업데이트
        setTimeout(() => {
          input.focus()
          input.selectionStart = input.selectionEnd = startPos + 8
        }, 0)
      }
    }
  }

  // 채팅 예시 삭제 핸들러
  const handleMainChatExampleDelete = () => {
    setChatExample({
      title: '',
      userMessage: '',
      characterMessage: '',
    })
  }

  // 대화 예시 삭제 버튼 핸들러
  const handleDeleteExample = (id: string) => {
    if (confirm('정말로 이 대화 예시를 삭제하시겠습니까?')) {
      removeConversationExample(id)

      // 로컬 상태에서도 삭제
      setChatExampleTitles(prev => {
        const newTitles = { ...prev }
        delete newTitles[id]
        return newTitles
      })

      setUserMessages(prev => {
        const newMessages = { ...prev }
        delete newMessages[id]
        return newMessages
      })

      setCharacterMessages(prev => {
        const newMessages = { ...prev }
        delete newMessages[id]
        return newMessages
      })
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

  // 대화 예시 텍스트 파싱 헬퍼 함수 (상태 변경 없음)
  const parseConversationExampleText = (text: string) => {
    let userMsg = ''
    let characterMsg = ''

    if (text) {
      const lines = text.split('\n')

      for (const line of lines) {
        if (line.startsWith('User:')) {
          userMsg = line.replace('User:', '').trim()
        } else if (line.startsWith('Character:')) {
          characterMsg = line.replace('Character:', '').trim()
        }
      }
    }

    return { userMsg, characterMsg }
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
        <div id="visibility-buttons" className="grid grid-cols-2 gap-4 w-full sm:w-1/2 md:w-1/3 mb-4">
          <button
            type="button"
            onClick={() => handleVisibilitySelect('private')}
            className={`w-full px-3 py-2 text-base rounded-lg text-center transition-colors ${
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
            className={`w-full px-3 py-2 text-base rounded-lg text-center transition-colors ${
              formData.visibility === 'public'
                ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
            }`}
          >
            공개
          </button>
        </div>

        <textarea
          id="bio-detail"
          value={formData.bioDetail}
          onChange={handleBioDetailChange}
          placeholder='예시) 유키는 차가운 첫인상을 가진 고등학교 3학년으로 공부와 운동 모두 뛰어난 완벽주의자다. 겉으로는 "귀찮게 하지마" 라며 주변을 밀어내지만 사실은 누구보다 친구들의 사소한 행동도 기억하며 배려하는 속 깊은 성격을 가졌다.'
          rows={5}
          className="w-full px-4 py-3 rounded-lg border border-secondary-200 dark:border-dark-secondary-200/10 bg-white dark:bg-dark-background-light focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500 dark:text-dark-secondary-400 resize-none"
          maxLength={3500}
        />
      </div>

      {/* 구분선 */}
      <hr className="border-secondary-200 dark:border-dark-secondary-200/10" />

      {/* 대화 예시 섹션 - 기존 코드 유지 */}
      <div id="conversation-examples">
        <div className="mb-4">
          <div>
            <h3 className="text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">대화 예시(최대 3개)</h3>
            <p className="text-xs text-secondary-500 dark:text-dark-secondary-500">
              캐릭터의 말투가 채팅에 반영될 거에요!
            </p>
          </div>
        </div>

        {/* 대화 예시 목록 - 원래 있던 UI */}
        <div className="space-y-6">
          {formData.conversationExamples.map((example: ConversationExample, index: number) => (
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
              <div className="grid grid-cols-2 gap-4 w-full sm:w-1/2 md:w-1/3 mb-4">
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
              id="button-add-chat-example"
              className="flex items-center justify-center border-2 border-dashed border-secondary-200 dark:border-dark-secondary-200/10 rounded-lg p-4 mt-4 cursor-pointer hover:border-primary-300 dark:hover:border-dark-primary-500/30 transition-colors"
              onClick={() => addConversationExample()}
            >
              <div className="flex flex-col items-center text-secondary-500 dark:text-dark-secondary-500">
                <FontAwesomeIcon icon={faPlus} className="mb-2 text-xl" />
                <span className="text-sm">대화 예시 추가하기</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 구분선 */}
      <hr className="border-secondary-200 dark:border-dark-secondary-200/10" />

      {/* 채팅 예시 섹션 - 새로운 UI */}
      <div id="chat-example" className="space-y-6">
        <div className="mb-4">
          <div>
            <h3 className="text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">채팅 예시</h3>
            <p className="text-xs text-secondary-500 dark:text-dark-secondary-500">
              캐릭터의 대화 스타일을 채팅 형식으로 작성해주세요!
            </p>
          </div>
        </div>

        {/* 채팅 예시 컨테이너 */}
        <div className="relative p-4 border border-secondary-200 dark:border-dark-secondary-200/10 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            {/* 채팅 예시 제목 입력 */}
            <div className="flex-1 mr-2">
              <input
                id="main-input-chat-example-title"
                type="text"
                value={chatExample.title}
                onChange={handleMainChatExampleTitleChange}
                placeholder="채팅 예시 제목 (최대 25자)"
                maxLength={25}
                className="w-full px-3 py-2 rounded-lg border border-secondary-200 dark:border-dark-secondary-200/10 bg-white dark:bg-dark-background-light focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500 text-sm"
              />
            </div>

            {/* 삭제 버튼 */}
            <button
              id="main-button-chat-example-delete"
              type="button"
              onClick={handleMainChatExampleDelete}
              className="p-2 text-red-500 hover:text-red-700 focus:outline-none"
              title="채팅 예시 삭제"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          {/* 상단 버튼들 */}
          <div className="flex space-x-2 mb-4">
            <button
              id="main-button-context-info"
              type="button"
              onClick={handleMainContextInfoClick}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400 text-xs flex items-center"
              title="상황 설명 추가"
            >
              <FontAwesomeIcon icon={faInfoCircle} className="mr-1" />
              상황 설명
            </button>

            <button
              id="main-button-character-name"
              type="button"
              onClick={handleMainCharacterNameClick}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400 text-xs flex items-center"
              title="캐릭터 이름 추가"
            >
              <FontAwesomeIcon icon={faRobot} className="mr-1" />
              캐릭터 이름
            </button>

            <button
              id="main-button-user-name"
              type="button"
              onClick={handleMainUserNameClick}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400 text-xs flex items-center"
              title="유저 이름 추가"
            >
              <FontAwesomeIcon icon={faUser} className="mr-1" />
              유저 이름
            </button>
          </div>

          {/* 채팅 시뮬레이션 UI */}
          <div className="space-y-4">
            {/* 유저 메시지 */}
            <div className="relative">
              <label className="block text-xs font-medium text-secondary-700 dark:text-dark-secondary-400 mb-1">
                유저 메시지
              </label>
              <textarea
                id="main-input-user-chat"
                value={chatExample.userMessage}
                onChange={handleMainChatUserMessageChange}
                onFocus={() => setActiveField({ id: 'chat', field: 'user' })}
                placeholder="유저 대화 내용을 입력하세요"
                rows={2}
                className="w-full px-4 py-3 rounded-lg border border-secondary-200 dark:border-dark-secondary-200/10 bg-white dark:bg-dark-background-light focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500 dark:text-dark-secondary-400 resize-none"
              />
            </div>

            {/* 캐릭터 메시지 */}
            <div className="relative">
              <label className="block text-xs font-medium text-secondary-700 dark:text-dark-secondary-400 mb-1">
                캐릭터 메시지
              </label>
              <textarea
                id="main-input-character-chat"
                value={chatExample.characterMessage}
                onChange={handleMainChatCharacterMessageChange}
                onFocus={() => setActiveField({ id: 'chat', field: 'character' })}
                placeholder="캐릭터 대화 내용을 입력하세요"
                rows={2}
                className="w-full px-4 py-3 rounded-lg border border-secondary-200 dark:border-dark-secondary-200/10 bg-white dark:bg-dark-background-light focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500 dark:text-dark-secondary-400 resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
