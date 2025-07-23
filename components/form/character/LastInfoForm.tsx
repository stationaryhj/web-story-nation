'use client'

import React, { useEffect, useRef, useState } from 'react'
import { faPlus, faUser, faRobot, faTrashCan } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { ChangeEvent } from 'react'
import { useAccountStore } from '@/store/useAccountStore'
import { useCreateCharacterData } from '@/store/useCreateCharacterData'
import Tutorial from '@/components/tutorial/Tutorial'
import BaseModal from '@/components/modal/BaseModal'
import { toast } from 'react-toastify'
import { exampleDatas } from '@/lib/utils/storyNationUtil'

import RatingSelect from './RatingSelect'

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

interface LastInfoFormProps {
  setFormField: (name: string, value: any) => void
  addConversationExample: () => void
  updateConversationExample: (data: exampleDatas) => void
  removeConversationExample: (id: number) => void
  updateConversationExampleTitle: (id: number, title: string) => void
  onValidationChange?: (isValid: boolean) => void
}


export default function LastInfoForm({
  setFormField,
  addConversationExample,
  updateConversationExample,
  removeConversationExample,
  updateConversationExampleTitle,
  onValidationChange,
}: LastInfoFormProps) {
  const { formData } = useCreateCharacterData()

    // 현재 선택된 입력 필드 (user 또는 character)
  const [activeField, setActiveField] = useState<{ id: number; field: 'user' | 'character' } | null>(null)
  const [showTutorial, setShowTutorial] = useState(false)
  const [totalMessageLength, setTotalMessageLength] = useState(0) // 전체 메시지 길이
  const [remainingChars, setRemainingChars] = useState(1500) // 남은 글자 수

  // 튜토리얼이 이미 표시된 적이 있는지 추적
  const tutorialShownRef = useRef(false)
  // toast 알림 디바운스를 위한 타임아웃 참조
  const toastDebounceRef = useRef<NodeJS.Timeout | null>(null)

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

  // 유효성 검사
  useEffect(() => {
    if (onValidationChange) {
      // 상세 정보 탭은 bioDetail만 필수
      // const isValid = !!formData.bioDetail?.trim()
      // onValidationChange(isValid)
    }
  }, [formData, onValidationChange])


  // 대화 예시 공개 여부 선택 핸들러
  const handleExamplesVisibilitySelect = (visibility: 'public' | 'private') => {
    // 대화 예시 전체의 공개 여부를 설정
    setFormField('examplesVisibility', visibility)
  }


  // 상세 설명 입력 변경 핸들러
  const handleWriterNoteChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    // API 값 추가되고난 뒤 작업해야함
    const value = e.target.value
    if (value.length <= 3500) {
      setFormField('writer_note', value)
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
    <div className="space-y-8">
      <div className='flex flex-col gap-8'>
        {/* 이용등급 */}
        <RatingSelect rating={formData.rating} onRatingSelect={() => {}} />


        {/* 작가의 말 */}
        <div className='flex flex-col gap-4'>
          <div className="flex justify-between items-start">
            <h3 className="block text-sm font-medium text-secondary-700 dark:text-dark-secondary-400">
              작가의 말
            </h3>
            <span className="text-xs text-secondary-500 dark:text-dark-secondary-500">
              {formatTextLength(formData.writer_note.length, 3500)}
            </span>
          </div>
          <textarea
            id="writer-note"
            value={formData.writer_note}
            onChange={handleWriterNoteChange}
            placeholder='독자에게 하고싶은 말을 자유롭게 입력해 보세요!'
            rows={4}
            className="w-full px-4 py-3 rounded-lg text-sm sm:text-base border border-secondary-200 dark:border-dark-secondary-200/10 bg-white dark:bg-dark-background-light focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500 dark:text-dark-secondary-400 resize-none"
            maxLength={3500}
          />
        </div>
      </div>
    </div>
  )
}
