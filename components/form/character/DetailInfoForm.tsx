'use client'

import React, { useEffect, useRef, useState } from 'react'
import { faPlus, faUser, faRobot, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { ChangeEvent } from 'react'
import { ConversationExample } from '@/store/useCreateCharacterData'
import { useAccountStore } from '@/store/useAccountStore'
import RatingSelect from './RatingSelect'
import Tutorial from '@/components/tutorial/Tutorial'
import BaseModal from '@/components/modal/BaseModal'
import { toast } from 'react-toastify'
import { exampleDatas } from '@/lib/utils/storyNationUtil'

const createCharacterScenario = {
  storageKey: 'detail-info-tutorial-completed',
  defaultMessagePosition: 'top' as const,
  steps: [
    {
      id: 'context-info-button',
      html: `
              <p>버튼을 클릭하면<span class="text-yellow-300 font-semibold">지문(**)</span>을 추가할 수 있어요!</p>
            `,
      textPosition: 'top' as const,
    },
    {
      id: 'character-name-button',
      html: `
              <p>버튼을 클릭하면<span class="text-yellow-300 font-semibold">캐릭터 이름({{char}})</span>을 추가할 수 있어요!</p>
            `,
      textPosition: 'top' as const,
    },
    {
      id: 'user-name-button',
      html: `
              <p>버튼을 클릭하면<span class="text-yellow-300 font-semibold">유저 이름({{user}})</span>을 추가할 수 있어요!</p>
            `,
      textPosition: 'top' as const,
    },
    {
      id: 'delete-chat-example',
      html: `
              <p>버튼을 클릭하면<span class="text-yellow-300 font-semibold">대화 예시</span>를 삭제할 수 있어요!</p>
            `,
      textPosition: 'top' as const,
    },
    {
      id: 'user-message-container',
      html: `
              <p>이곳에서 유저<span class="text-yellow-300 font-semibold"> 대화 예시</span>를 입력하고 수정할 수 있어요!</p>
            `,
      textPosition: 'top' as const,
    },
    {
      id: 'character-message-container',
      html: `
              <p>이곳에서 캐릭터<span class="text-yellow-300 font-semibold"> 대화 예시</span>를 입력하고 수정할 수 있어요!</p>
            `,
      textPosition: 'top' as const,
    },
  ],
}

interface DetailInfoFormProps {
  formData: any
  setFormField: (name: string, value: any) => void
  addConversationExample: () => void
  updateConversationExample: (data: exampleDatas) => void
  removeConversationExample: (id: number) => void
  updateConversationExampleTitle: (id: number, title: string) => void
  onValidationChange?: (isValid: boolean) => void
}

// 대화 예시에 title 프로퍼티가 존재하도록 TypeScript 인터페이스 타입을 지정
// 참고: 실제 ConversationExample 타입은 다른 파일에 정의되어 있으므로
// 여기서는 타입 확장(Type Assertion)으로 처리합니다
type EnhancedConversationExample = ConversationExample & {
  title?: string
}

export default function DetailInfoForm({
  formData,
  setFormField,
  addConversationExample,
  updateConversationExample,
  removeConversationExample,
  updateConversationExampleTitle,
  onValidationChange,
}: DetailInfoFormProps) {

    // 현재 선택된 입력 필드 (user 또는 character)
  const [activeField, setActiveField] = useState<{ id: number; field: 'user' | 'character' } | null>(null)
  const [showTutorial, setShowTutorial] = useState(false)
  const [totalMessageLength, setTotalMessageLength] = useState(0) // 전체 메시지 길이
  const [remainingChars, setRemainingChars] = useState(1500) // 남은 글자 수

  // 튜토리얼이 이미 표시된 적이 있는지 추적
  const tutorialShownRef = useRef(false)
  // 마지막 대화 예시 요소 참조
  const lastExampleRef = useRef<HTMLDivElement>(null)
  // toast 알림 디바운스를 위한 타임아웃 참조
  const toastDebounceRef = useRef<NodeJS.Timeout | null>(null)

  // 성인 인증 상태 확인
  const { isAdult } = useAccountStore()
  const isAdultModeEnabled = isAdult()

  // 삭제 확인 모달 상태
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState<number>(0)

  const exampleDatas = formData.conversationExamples

  // 디바운스된 토스트 알림 함수
  const showDebouncedToast = (message: string) => {
    if (toastDebounceRef.current) {
      clearTimeout(toastDebounceRef.current)
    }

    toastDebounceRef.current = setTimeout(() => {
      toast.error(message)
      toastDebounceRef.current = null
    }, 500) // 500ms 디바운스 딜레이
  }

  // 전체 메시지 길이 계산 함수
  const calculateTotalMessageLength = () => {
    let total = 0

    if(exampleDatas.length === 0) {
      return 0
    }

    exampleDatas.forEach((data: exampleDatas) => {
      total += data.textLength
    })

    return total
  }



  // 전체 메시지 길이 업데이트
  useEffect(() => {
    const total = calculateTotalMessageLength()
    setTotalMessageLength(total)
    setRemainingChars(1500 - total)
  }, [formData.conversationExamples])

  // 스크롤 후 튜토리얼 표시 함수
  const scrollAndShowTutorial = () => {
    // 스크롤 이전 위치 저장
    const startPosition = window.scrollY

    // 스크롤 대상 찾기: conversation-examples
    const conversationExamples = document.getElementById('scrollRef')
    const targetElement = conversationExamples || document.body

    // 스크롤 실행
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'end' })

    // 스크롤 완료 확인 함수
    const checkScrollComplete = () => {
      const currentPosition = window.scrollY
      const documentHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
      const viewportHeight = window.innerHeight
      const isAtBottom = currentPosition + viewportHeight >= documentHeight - 50 // 50px 오차 허용

      // 데스크탑에서는 위치 변화가 작을 수 있으므로 임계값 낮춤
      const isMobile = window.innerWidth < 768
      const scrollThreshold = isMobile ? 200 : 50

      if (isAtBottom || Math.abs(currentPosition - startPosition) > scrollThreshold) {
        // 스크롤이 완료되었거나 충분히 이동했으면 튜토리얼 표시
        setShowTutorial(true)
        tutorialShownRef.current = true
        return true
      }
      return false
    }

    // 스크롤 이벤트 핸들러 등록
    let scrollTimeout: NodeJS.Timeout
    const handleScroll = () => {
      // 이전 타임아웃 취소
      clearTimeout(scrollTimeout)

      // 0.3초 디바운싱
      scrollTimeout = setTimeout(() => {
        if (checkScrollComplete()) {
          window.removeEventListener('scroll', handleScroll)
        }
      }, 300)
    }

    window.addEventListener('scroll', handleScroll)

    // 초기 체크 (스크롤이 발생하지 않을 경우 대비)
    setTimeout(() => {
      if (checkScrollComplete()) {
        window.removeEventListener('scroll', handleScroll)
      }
    }, 300)

    // 2초 타임아웃 (최종 안전장치) - 데스크탑에서 스크롤 이벤트가 발생하지 않는 경우 대비
    setTimeout(() => {
      setShowTutorial(true)
      tutorialShownRef.current = true
      window.removeEventListener('scroll', handleScroll)
    }, 400)
  }

  // 대화 예시 추가 핸들러
  const handleAddConversationExample = () => {
    // 대화 예시 추가
    addConversationExample()

    // 약간의 지연 후 스크롤 및 튜토리얼 표시 (DOM 업데이트 대기)
    setTimeout(() => {
      const tutorialCompleted = localStorage.getItem(createCharacterScenario.storageKey) === 'true'

      if (!tutorialCompleted && !tutorialShownRef.current) {
        scrollAndShowTutorial()
      } else {
        // 자동 스크롤만 수행
        const conversationExamples = document.getElementById('conversation-examples')
        if (conversationExamples) {
          conversationExamples.scrollIntoView({ behavior: 'smooth', block: 'end' })
        }
      }
    }, 300)
  }

  // 첫 대화 예시가 추가될 때 튜토리얼 표시
  useEffect(() => {
    if (exampleDatas.length === 1 && !tutorialShownRef.current) {
      const tutorialCompleted = localStorage.getItem(createCharacterScenario.storageKey) === 'true'
      if (!tutorialCompleted) {
        scrollAndShowTutorial()
      }
    }
  }, [exampleDatas])

  // 사용자 및 캐릭터 메시지 상태 관리
  const [userMessages, setUserMessages] = useState<{ [key: string]: string }>({})
  const [characterMessages, setCharacterMessages] = useState<{ [key: string]: string }>({})
  const [titles, setTitles] = useState<{ [key: string]: string }>({})

  // 유효성 검사
  useEffect(() => {
    if (onValidationChange) {
      // 상세 정보 탭은 bioDetail만 필수
      const isValid = !!formData.bioDetail?.trim()
      onValidationChange(isValid)
    }
  }, [formData, onValidationChange])

  // 대화 예시 데이터에서 사용자 및 캐릭터 메시지 초기화 (렌더링과 별개로 처리)
  // useEffect(() => {
  //   const newUserMessages: { [key: string]: string } = { ...userMessages }
  //   const newCharacterMessages: { [key: string]: string } = { ...characterMessages }
  //   let messagesUpdated = false

  //   formData.conversationExamples.forEach((example: ConversationExample) => {
  //     if (!newUserMessages[example.id] || !newCharacterMessages[example.id]) {
  //       const { userMsg, characterMsg } = parseConversationExampleText(example.text)

  //       if (!newUserMessages[example.id]) {
  //         newUserMessages[example.id] = userMsg
  //         messagesUpdated = true
  //       }

  //       if (!newCharacterMessages[example.id]) {
  //         newCharacterMessages[example.id] = characterMsg
  //         messagesUpdated = true
  //       }

  //       if (!titles[example.id]) {
  //         titles[example.id] = (example as EnhancedConversationExample).title || ''
  //         messagesUpdated = true
  //       }
  //     }
  //   })

  //   if (messagesUpdated) {
  //     setUserMessages(newUserMessages)
  //     setCharacterMessages(newCharacterMessages)
  //     setTitles(titles)
  //   }
  // }, [formData.conversationExamples])

  // 게시 범위 선택 핸들러 (상세 설명용)
  const handleVisibilitySelect = (visibility: 'public' | 'private') => {
    setFormField('detailVisibility', visibility)
  }

  // 대화 예시 공개 여부 선택 핸들러
  const handleExamplesVisibilitySelect = (visibility: 'public' | 'private') => {
    // 대화 예시 전체의 공개 여부를 설정
    setFormField('examplesVisibility', visibility)
  }

  // 이용등급 선택 핸들러
  const handleRatingSelect = (rating: 'all' | 'adult') => {
    if (rating === 'adult' && !isAdultModeEnabled) {
      return
    }
    setFormField('rating', rating)
  }

  // 상세 설명 입력 변경 핸들러
  const handleBioDetailChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= 3500) {
      setFormField('bioDetail', value)
    }
  }

  // 대화 예시 제목 변경 핸들러
  const handleExampleTitleChange = (id: number, title: string) => {
    updateConversationExampleTitle(id, title)
  }

  // 대화 예시 텍스트 변경 핸들러 - new
  const handleMessageChange = (id: number, msg: string, isUser: boolean) => {
    let totalMsgLength = 0
    formData.conversationExamples.map((data: exampleDatas) => {
      totalMsgLength += data.userMsg.length + data.characterMsg.length
    })

    const findData = formData.conversationExamples.find((find: exampleDatas) => find.index === id)
    if(!findData) {
      return
    }

    if(isUser) {
      totalMsgLength -= findData.userMsg.length
    } else {
      totalMsgLength -= findData.characterMsg.length
    }

    if((totalMsgLength + msg.length) > 1500) {
      showDebouncedToast('전체 대화 예시는 1500자를 초과할 수 없습니다.')
      return
    }


    if(isUser) {
      findData.userMsg = msg
    } else {
      findData.characterMsg = msg
    }
    findData.textLength = findData.userMsg.length + findData.characterMsg.length
    updateConversationExample(findData)
  }


  // 커서 관련 공통 함수
  const handleSpecialTagInsert = (field: 'user' | 'character', id: number, tag: string) => {
    console.log('handleSpecialTagInsert >> ', field, id, tag)

    if (id === undefined) return

    const inputId = field === 'user' ? `user-message-${id}` : `character-message-${id}`
    const input = document.getElementById(inputId) as HTMLTextAreaElement

    console.log('inputId >> ', inputId)

    if (input) {
      const startPos = input.selectionStart || 0
      const endPos = input.selectionEnd || 0
      const newText = input.value.substring(0, startPos) + tag + input.value.substring(endPos)

      if (field === 'user') {
        handleMessageChange(id, newText, true)
      } else {
        handleMessageChange(id, newText, false)
      }

      // 커서 위치 업데이트
      setTimeout(() => {
        input.focus()
        const newCursorPos = startPos + tag.length
        input.selectionStart = input.selectionEnd = newCursorPos
      }, 0)
    }
  }

  // 상황 설명 버튼 클릭 핸들러
  const handleContextInfoClick = () => {
    console.log('handleContextInfoClick >> ', activeField?.field, activeField?.id)

    if (!activeField) return
    handleSpecialTagInsert(activeField.field, activeField.id, '**')
  }

  // 캐릭터 이름 버튼 클릭 핸들러
  const handleCharacterNameClick = () => {
    if (!activeField) return
    handleSpecialTagInsert(activeField.field, activeField.id, '{{char}}')
  }

  // 사용자 이름 버튼 클릭 핸들러
  const handleUserNameClick = () => {
    if (!activeField) return
    handleSpecialTagInsert(activeField.field, activeField.id, '{{user}}')
  }

  // 대화 예시 삭제 버튼 핸들러
  const handleDeleteExample = (id: number) => {
    setDeleteTargetId(id)
    setIsDeleteModalOpen(true)
  }

  // 대화 예시 삭제 확인
  const confirmDeleteExample = () => {
    if (deleteTargetId !== undefined) {
      removeConversationExample(deleteTargetId)

      // 모달 닫기
      setIsDeleteModalOpen(false)
      setDeleteTargetId(0)
    }
  }

  // 텍스트 길이 표시 형식
  const formatTextLength = (current: number, max: number) => {
    return `${current}/${max}`
  }


  return (
    <>
      <div className="space-y-8">
        {/* <RatingSelect rating={formData.rating} onRatingSelect={handleRatingSelect} showRequired={false} /> */}

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

          {/* 상세 설명 공개/비공개 선택 버튼 */}
          <div id="visibility-buttons" className="grid grid-cols-2 gap-4 w-full sm:w-1/2 md:w-1/3 mb-4">
            <button
              type="button"
              onClick={() => handleVisibilitySelect('private')}
              className={`w-full px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base rounded-lg text-center transition-colors ${
                formData.detailVisibility === 'private'
                  ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                  : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
              }`}
            >
              상세 설명 비공개
            </button>
            <button
              type="button"
              onClick={() => handleVisibilitySelect('public')}
              className={`w-full px-2 sm:px-3 py-1 sm:py-2 text-sm sm:text-base rounded-lg text-center transition-colors ${
                formData.detailVisibility === 'public'
                  ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                  : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
              }`}
            >
              상세 설명 공개
            </button>
          </div>

          <textarea
            id="bio-detail"
            value={formData.bioDetail}
            onChange={handleBioDetailChange}
            placeholder='예시) 유키는 차가운 첫인상을 가진 고등학교 3학년으로 공부와 운동 모두 뛰어난 완벽주의자다. 겉으로는 "귀찮게 하지마" 라며 주변을 밀어내지만 사실은 누구보다 친구들의 사소한 행동도 기억하며 배려하는 속 깊은 성격을 가졌다.'
            rows={4}
            className="w-full px-4 py-3 rounded-lg text-sm sm:text-base border border-secondary-200 dark:border-dark-secondary-200/10 bg-white dark:bg-dark-background-light focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500 dark:text-dark-secondary-400 resize-none"
            maxLength={3500}
          />
        </div>

        {/* 구분선 */}
        <hr className="border-secondary-200 dark:border-dark-secondary-200/10" />

        {/* 대화 예시 섹션 */}
        <div id="conversation-examples">
          <div className="mb-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
                  대화 예시(최대 3개)
                </h3>
                <p className="text-xs text-secondary-500 dark:text-dark-secondary-500">
                  캐릭터의 말투가 채팅에 반영될 거에요!
                </p>
              </div>
            </div>

            {/* 대화 예시 공개/비공개 선택 버튼 */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 w-full sm:w-1/2 md:w-1/3 mt-4">
              <button
                type="button"
                onClick={() => handleExamplesVisibilitySelect('private')}
                className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-center text-sm sm:text-base transition-colors ${
                  formData.examplesVisibility === 'private'
                    ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                    : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                }`}
              >
                대화 예시 비공개
              </button>
              <button
                type="button"
                onClick={() => handleExamplesVisibilitySelect('public')}
                className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-center text-sm sm:text-base transition-colors ${
                  formData.examplesVisibility === 'public'
                    ? 'bg-primary-500 text-white dark:bg-dark-primary-500'
                    : 'bg-secondary-100 text-secondary-700 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400'
                }`}
              >
                대화 예시 공개
              </button>
            </div>
          </div>

          {/* 빈 대화 예시 추가 구역 */}
          {exampleDatas.length < 3 && (
            <div
              id="button-add-chat-example"
              className="flex items-center justify-center border-2 border-dashed border-secondary-200 dark:border-dark-secondary-200/10 rounded-lg p-3 sm:p-4 mt-3 sm:mt-4 cursor-pointer hover:border-primary-300 dark:hover:border-dark-primary-500/30 transition-colors mb-4"
              onClick={handleAddConversationExample}
            >
              <div className="flex flex-col items-center text-secondary-500 dark:text-dark-secondary-500">
                <FontAwesomeIcon icon={faPlus} className="mb-1 sm:mb-2 text-lg sm:text-xl" />
                <span className="text-xs sm:text-sm">대화 예시 추가하기</span>
              </div>
            </div>
          )}

          {/* 대화 예시 목록 */}
          <div className="space-y-6">
            {exampleDatas.length === 0 ? (
              <div className="text-center py-8 text-secondary-500 dark:text-dark-secondary-500">
                대화 예시가 없습니다. 아래 버튼을 클릭하여 추가해주세요.
              </div>
            ) : (
              exampleDatas.map((data: exampleDatas) => (
                <div
                  key={data.index}
                  className="relative bg-secondary-50 dark:bg-dark-secondary-800/5 p-3 sm:p-4 rounded-lg border border-secondary-200 dark:border-dark-secondary-200/10"
                >
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <h4 className="text-xs sm:text-sm font-medium text-secondary-700 dark:text-dark-secondary-400"></h4>
                    <div className="flex space-x-1 sm:space-x-2">
                      {/* 특수 태그 버튼들 */}
                      <div className="flex gap-2">
                        <button
                          id="context-info-button"
                          type="button"
                          onClick={handleContextInfoClick}
                          className="px-1 sm:px-3 sm:py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-200 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400 text-[11px] sm:text-xs flex items-center sm:mr-0 sm:mb-0 w-auto"
                          title="상황 설명 추가"
                        >
                          상황 설명 추가(*)
                        </button>
                        <button
                          id="character-name-button"
                          type="button"
                          onClick={handleCharacterNameClick}
                          className="px-1 sm:px-3 sm:py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-200 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400 text-[11px] sm:text-xs flex items-center sm:mr-0 sm:mb-0 w-auto"
                          title="캐릭터 이름 추가"
                        >
                          캐릭터 이름
                        </button>
                        <button
                          id="user-name-button"
                          type="button"
                          onClick={handleUserNameClick}
                          className="px-1 sm:px-3 sm:py-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-200 dark:bg-dark-secondary-100/10 dark:text-dark-secondary-400 text-[11px] sm:text-xs flex items-center w-auto"
                          title="유저 이름 추가"
                        >
                          유저 이름
                        </button>
                      </div>
                      <button
                        id="delete-chat-example"
                        type="button"
                        onClick={() => handleDeleteExample(data.index)}
                        className="p-1 sm:p-1.5 text-red-500 hover:text-red-700 focus:outline-none"
                        title="대화 예시 삭제"
                      >
                        <FontAwesomeIcon icon={faTrashCan} />
                      </button>
                    </div>
                  </div>

                  {/* 대화 예시 제목 입력 필드 */}
                  <div className="mb-3 sm:mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-medium text-secondary-700 dark:text-dark-secondary-400">
                        대화 예시 제목
                      </label>
                      <span className="text-xs text-secondary-500 dark:text-dark-secondary-500">
                        {formatTextLength((data.title || '').length, 25)}
                      </span>
                    </div>
                    <input
                      type="text"
                      id={`example-title-${data.index}`}
                      value={data.title || ''}
                      onChange={e => handleExampleTitleChange(data.index, e.target.value)}
                      placeholder="대화 예시 제목을 입력하세요"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-secondary-200 dark:border-dark-secondary-200/10 bg-white dark:bg-dark-background-light focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500 dark:text-dark-secondary-400 text-sm"
                      maxLength={25}
                    />
                  </div>

                  {/* 사용자 메시지 */}
                  <div id="user-message-container" className="mb-3 sm:mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-medium text-secondary-700 dark:text-dark-secondary-400">
                        <FontAwesomeIcon icon={faUser} className="mr-1" /> 유저 메시지
                      </label>
                      <span className="text-xs text-secondary-500 dark:text-dark-secondary-500">
                        {data.userMsg?.length || 0}자
                      </span>
                    </div>
                    <textarea
                      id={`user-message-${data.index}`}
                      value={data.userMsg || ''}
                      onChange={e => handleMessageChange(data.index, e.target.value, true)}
                      onFocus={() => setActiveField({ id: data.index, field: 'user' })}
                      placeholder="유저 대화 내용을 입력하세요"
                      rows={2}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-secondary-200 dark:border-dark-secondary-200/10 bg-white dark:bg-dark-background-light focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500 dark:text-dark-secondary-400 resize-none text-sm"
                    />
                  </div>

                  {/* 캐릭터 메시지 */}
                  <div id="character-message-container">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-medium text-secondary-700 dark:text-dark-secondary-400">
                        <FontAwesomeIcon icon={faRobot} className="mr-1" /> 캐릭터 메시지
                      </label>
                      <span className="text-xs text-secondary-500 dark:text-dark-secondary-500">
                        {data.characterMsg?.length || 0}자
                      </span>
                    </div>
                    <textarea
                      id={`character-message-${data.index}`}
                      value={data.characterMsg || ''}
                      onChange={e => handleMessageChange(data.index, e.target.value, false)}
                      onFocus={() => setActiveField({ id: data.index, field: 'character' })}
                      placeholder="캐릭터 대화 내용을 입력하세요"
                      rows={2}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg border border-secondary-200 dark:border-dark-secondary-200/10 bg-white dark:bg-dark-background-light focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500 dark:text-dark-secondary-400 resize-none text-sm"
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 전체 대화 예시 글자 수 표시 */}
          <div className="mt-4 flex justify-end items-center">
            <span className="text-xs text-secondary-500 dark:text-dark-secondary-500">
              전체 대화 예시 글자 수: {totalMessageLength}/1500 (남은 글자 수: {remainingChars}자)
            </span>
          </div>
        </div>
      </div>
      <Tutorial
        isOpen={showTutorial}
        onClose={() => {
          setShowTutorial(false)
        }}
        config={createCharacterScenario}
        {...{
          beforeOpen: () => {
            // 튜토리얼이 열리기 전에 페이지 하단으로 스크롤
            const conversationExamples = document.getElementById('conversation-examples')
            if (conversationExamples) {
              conversationExamples.scrollIntoView({ behavior: 'smooth', block: 'end' })
              // 요소 위치까지 스크롤된 후 약간의 지연 시간을 두고 추가로 100px 더 스크롤
              setTimeout(() => {
                window.scrollBy({
                  top: 100,
                  behavior: 'smooth',
                })
              }, 500)
            } else {
              const docHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)
              window.scrollTo({
                top: docHeight - 200, // 약간의 여백을 두고 스크롤
                behavior: 'smooth',
              })
            }
          },
        }}
      />

      {/* 대화 예시 삭제 확인 모달 */}
      <BaseModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="대화 예시 삭제"
        size="sm"
        animation="scale"
        footerContent={
          <div className="flex justify-end gap-2 w-full">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg text-gray-700"
            >
              취소
            </button>
            <button
              onClick={confirmDeleteExample}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 transition-colors rounded-lg text-white"
            >
              삭제
            </button>
          </div>
        }
      >
        <p className="text-center my-4">정말로 이 대화 예시를 삭제하시겠습니까?</p>
        <p className="text-center text-gray-500 text-sm mb-4">삭제한 대화 예시는 복구할 수 없습니다.</p>
      </BaseModal>
    </>
  )
}
