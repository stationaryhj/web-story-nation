'use client'

import { Character, useAccountStore } from '@/store/useStoreData'
import {
  faPaperPlane,
  faArrowLeft,
  faCaretDown,
  faSync,
  faTrashAlt,
  faInfoCircle,
  faSignOutAlt,
  faAsterisk,
  faPiggyBank,
  faBookOpen,
  faFire,
  faRocket,
  faDownload,
  faEllipsisV,
  faImage,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Gift } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { FormEvent } from 'react'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useModalStore } from '@/store/useStoreModal'
import type { ChatMode } from '@/components/modal/ChatModeModal'
import { BaseButton } from '@/components/elements/button/BaseButton'
import type { ChrbotData } from '@/types/api'
import {
  bridgeCharbotDataToCharacter,
  bridgeChatModeDataToChatMode,
  getChangeNameTag,
} from '@/lib/utils/storyNationUtil'
import { useNakama } from '@/app/providers/NakamaProviders'
import { useChatModeStore } from '@/store/useStoreData'
import BaseSidebar from '@/components/elements/sidebar/BaseSidebar'
import { chatApi, createApi } from '@/services/api/storyNationApi'
import Tutorial from '@/components/tutorial/Tutorial'
import ResetChatModal from '@/components/modal/ResetChatModal'
import { toast } from 'react-toastify'

interface ChatDetailClientProps {
  characterId: string
  charbotData: ChrbotData | null
}

const defaultNames: Record<number, string> = {
  1: '가성비 모드',
  2: '스토리 모드',
  3: '짜릿모드 1.0',
  4: '짜릿모드 2.0',
}

// 채팅 모드 이름 가져오기 함수
const getChatModeName = (modeId: number) => {
  return defaultNames[modeId] || defaultNames[0]
}

const customChatModes: ChatMode[] = [
  {
    id: 1,
    name: '가성비모드',
    description: '일반적인 대화에 최적화된 모드입니다.',
    penCost: 1,
    ai: 'Gemini 1.5 Flash',
    icon: faPiggyBank,
    discount: 0,
    original_coin: 0,
    isShow: true,
  },
  {
    id: 2,
    name: '스토리모드',
    description: '이야기 생성과 연속성이 필요한 대화에 적합합니다.',
    penCost: 3,
    ai: 'Sonnet 3.5 v2',
    icon: faBookOpen,
    discount: 0,
    original_coin: 0,
    isShow: true,
  },
  {
    id: 3,
    name: '짜릿모드 1.0',
    description: '보다 자유롭고 창의적인 대화를 원할 때 사용하세요.',
    penCost: 4,
    ai: 'Gemini 1.5 Pro',
    icon: faFire,
    discount: 0,
    original_coin: 0,
    isShow: true,
  },
  {
    id: 4,
    name: '짜릿모드 2.0',
    description: '가장 높은 품질과 창의성을 제공하는 최고급 모드입니다.',
    penCost: 7,
    ai: 'Sonnet 3.5 v2',
    icon: faRocket,
    discount: 0,
    original_coin: 0,
    isShow: true,
  },
]

export default function ChatDetailClient({ characterId, charbotData }: ChatDetailClientProps) {
  const router = useRouter()

  const { data: accountData, userIsAdult } = useAccountStore(state => ({
    isLogin: state.isLogin,
    data: state.data,
    userIsAdult: state.isAdult() ? 1 : 0,
  }))

  // 주석 해제
  const first_talk = charbotData?.first_talk ? getChangeNameTag(charbotData?.first_talk, charbotData?.nick_nm) : ''

  // 튜토리얼 관련 상태를 최상위로 이동
  const [showTutorial, setShowTutorial] = useState(true)
  const chatBoxRef = useRef<HTMLDivElement>(null)

  // 튜토리얼 설정
  const tutorialConfig = {
    storageKey: 'chat-tutorial-completed',
    steps: [
      {
        id: 'chat-mode-button',
        html: `
          <p>탭하면 <span class="text-yellow-300 font-semibold">채팅모드를 선택</span>할 수 있어요!</p>
        `,
        textPosition: 'bottom' as const,
      },
      {
        id: 'message-input',
        html: `
          <div class="text-start">
            <div>
              <span class="text-yellow-300">탭하면 **</span>가 입력돼요
            </div>
            <div>
              **사이에 글을 입력해 전송하면
            </div>
            <div><span class="text-yellow-300">기울임체로 출력</span>될 거에요!</div>
          </div>
        `,
        textPosition: 'top' as const,
      },
    ],
  }

  // Nakama 컨텍스트 사용
  const nakamaContext = useNakama()
  const {
    isConnected,
    isConnecting,
    chatRoomInit,
    disconnectSocket,
    leaveChat,
    chrBotChatKey,
    channelId,
    isInitRoom,
    // 새로운 메시지 관련 필드와 메서드들
    chatMessages,

    sendChatMessage,
    refreshLastAIMessage,
    clearChatHistory,
    addChatMessage,
    updateChatMode,
    updatePromptKey,
    deleteChatMessage,
  } = nakamaContext

  const [message, setMessage] = useState('')
  const hasInitialized = useRef(false)
  const [currentModeId, setCurrentModeId] = useState(1)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isWaitingForAI, setIsWaitingForAI] = useState<boolean>(false) // AI 응답 대기 상태
  const { chatMode } = useChatModeStore()

  const { openModal, closeModal, setSelectedCharacter } = useModalStore()

  // 캐릭터 데이터 변환
  const character = bridgeCharbotDataToCharacter(charbotData as ChrbotData)

  // 연결 상태 표시 관련 상태
  const [showConnectedStatus, setShowConnectedStatus] = useState(false)

  // 먼저 새로운 모바일 이미지 보기 모달을 위한 상태를 추가합니다
  const [showImageModal, setShowImageModal] = useState(false)

  // 모바일 환경 감지
  const [isMoreSidebarOpen, setIsMoreSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // 배경 이미지 상태 추가
  const [isBackgroundEnabled, setIsBackgroundEnabled] = useState(true)

  // 나가기 플래그
  const [isExit, setIsExit] = useState(false)

  // 마운트 상태 추적용 ref
  const isMountedRef = useRef(true)

  // 채팅 초기화 모달 상태
  const [showResetChatModal, setShowResetChatModal] = useState(false)

  // 채팅 컨테이너 ref
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const toastShownRef = useRef(false)

  // 표시 이미지
  const showImage = userIsAdult && chatMessages.length > 2 ? character.imageUrlNsfw : character.imageUrl

  // 모바일 환경 감지
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // 메시지 디버깅을 위한 로깅 추가 - 무한 루프 문제 수정
  useEffect(() => {
    if (chatMessages.length > 0) {
      const lastMsg = chatMessages[chatMessages.length - 1]

      // 마지막 메시지 발신자에 따라 AI 응답 대기 상태 업데이트
      // 임시 메시지는 제외하고 실제 메시지만 고려
      if (!lastMsg.id.startsWith('temp_')) {
        setIsWaitingForAI(lastMsg.sender === 'user')
      }
    }
  }, [chatMessages]) // 의존성 배열에 chatMessages만 포함

  // 연결 상태 변화 로깅 - 타이머 클리어 추가
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isConnected) {
      setShowConnectedStatus(true)
      timer = setTimeout(() => {
        setShowConnectedStatus(false)
      }, 3000)
    } else {
      setShowConnectedStatus(false)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isConnected])

  // 서버 상태와 채널 ID에 따른 UI 처리 - 의존성 단순화
  useEffect(() => {
    if (!isConnected && !isConnecting && isInitRoom) {
      // 초기화는 됐지만 연결이 끊어진 경우
      setError('채팅 서버와의 연결이 끊어졌습니다.')
    } else if (isConnected && !channelId && isInitRoom) {
      // 연결은 됐지만 채널 ID가 없는 경우
      setError('채팅 채널 연결에 문제가 발생했습니다.')
    } else if (isConnected && channelId) {
      // 정상 상태일 때 에러 초기화
      setError(null)
    }
  }, [isConnected, isConnecting, channelId, isInitRoom])

  // 채팅방 정리 및 연결 종료를 위한 공통 함수 최적화
  const cleanupChatRoom = useCallback(async () => {
    try {
      setIsLoading(true)

      // 1. 채팅방에서 나가기
      if (channelId) {
        try {
          await leaveChat(channelId)
        } catch (error) {
          console.error('채팅방 나가기 중 오류:', error)
          // 오류가 발생해도 계속 진행
        }
      }

      // 2. 소켓 연결 종료
      try {
        await disconnectSocket()
      } catch (error) {
        console.error('소켓 연결 종료 중 오류:', error)
        // 오류가 발생해도 계속 진행
      }

      // 3. 상태 정리 (clearChatHistory 호출 제거)
      hasInitialized.current = false

      return true
    } catch (error) {
      console.error('채팅방 정리 중 오류 발생:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [channelId, leaveChat, disconnectSocket])

  // 채팅방 초기화 메서드 - useCallback으로 변경
  const initializeChatRoom = useCallback(async () => {
    // 이미 초기화 중이거나 초기화가 완료된 경우 또는 필요한 데이터가 없는 경우
    if (!character?.id || !accountData?.user_key) {
      console.log('⚠️ 초기화에 필요한 데이터가 없습니다.')
      return
    }

    if (hasInitialized.current) {
      console.log('⚠️ 이미 초기화 요청을 진행했습니다.')
      return
    }

    // 이미 초기화된 상태인지 확인
    if (isInitRoom && channelId) {
      console.log('✅ 채팅방이 이미 초기화되어 있습니다.')

      // 채팅방이 초기화되어 있고 메시지가 없으면 first_talk 추가
      if (chatMessages.length === 0 && first_talk) {
        addChatMessage({
          id: 'first-message',
          sender: 'character',
          message: first_talk,
          timestamp: new Date(),
        })
      }

      return
    }

    if (isExit) return

    try {
      setIsLoading(true)
      setError(null)
      hasInitialized.current = true

      // 사용 가능한 채팅 모드 중 첫번째 선택 (또는 기본값 2번)
      const selectedModeId = chatMode && chatMode.length > 0 ? chatMode[0].chat_mode : 2

      console.log('💬 채팅방 초기화 시작 - ID:', character.id, '모드:', selectedModeId)

      // 채팅방 초기화 (Nakama 서버 연결 및 인증, 채팅방 참여까지 모두 수행)
      const result = await chatRoomInit(accountData.user_key.toString(), characterId, selectedModeId)

      if (!result.success) {
        if (result.error === 'ALREADY_INITIALIZING') {
          console.log('⚠️ 이미 초기화 중입니다. 대기...')
          // 3초 후 초기화 상태 리셋 (이미 진행 중인 초기화 작업이 실패했을 경우 대비)
          setTimeout(() => {
            if (!isConnected || !channelId) {
              console.log('🔄 초기화 시간 초과, 상태 리셋')
              hasInitialized.current = false
            }
          }, 3000)
          return
        }

        console.error('❌ 채팅방 초기화 실패:', result.error)
        throw new Error(result.error || '채팅방 초기화에 실패했습니다. 다시 시도해주세요.')
      }

      // 현재 모드 설정 업데이트
      setCurrentModeId(selectedModeId)
      console.log('✅ 채팅방 초기화 완료:', result)
    } catch (error) {
      console.error('채팅방 초기화 실패:', error)
      setError('채팅방을 초기화하는 중 오류가 발생했습니다. 다시 시도해주세요.')
      hasInitialized.current = false
    } finally {
      setIsLoading(false)
    }
  }, [character?.id, accountData?.user_key, characterId, chatRoomInit, chatMode, isConnected, channelId, isInitRoom])

  // 실제 언마운트 시에만 정리하기 위한 로직
  useEffect(() => {
    if (isExit) return

    isMountedRef.current = true
    console.log('🌱 컴포넌트 마운트됨')

    return () => {
      isMountedRef.current = false
      console.log('💀 컴포넌트 실제 언마운트됨 - 채팅방 정리 예정')

      // 이미 언마운트된 상태에서 비동기 작업이 완료되면 의미 없음
      // 약간의 지연을 두어 불필요한 정리를 방지
      setTimeout(() => {
        // 실제 언마운트 상태인 경우에만 정리 수행
        if (!isMountedRef.current) {
          console.log('🧹 채팅방 정리 실행')
          cleanupChatRoom().catch(err => console.error('채팅방 정리 중 오류:', err))
        } else {
          console.log('⚠️ 채팅방 정리가 취소됨 - 컴포넌트가 다시 마운트됨')
        }
      }, 100)
    }
  }, [cleanupChatRoom]) // cleanupChatRoom 의존성 추가

  // 채팅방 초기화 로직 - 채팅방 초기화만 담당
  useEffect(() => {
    // 이미 초기화된 상태라면 중단하고 초기화 상태만 업데이트
    if (isInitRoom && channelId) {
      console.log('✅ 채팅방이 이미 초기화된 상태입니다:', {
        isInitRoom,
        channelId,
        hasInitialized: hasInitialized.current,
      })
      hasInitialized.current = true
      return
    }

    // 이미 초기화되었거나 필요한 데이터가 없으면 중단
    if (hasInitialized.current || !character?.id || !accountData?.user_key) {
      console.log('⏭️ 채팅방 초기화 로직 건너뜀', {
        hasInitialized: hasInitialized.current,
        hasCharacterId: !!character?.id,
        hasUserKey: !!accountData?.user_key,
      })
      return
    }

    // 이 시점에 도달하면 실제로 초기화 필요
    console.log('🚀 채팅방 초기화 로직 시작')
    initializeChatRoom().then(() => {
      console.log('✅ initializeChatRoom 함수 완료')
    })
  }, [character?.id, accountData?.user_key, isInitRoom, channelId, initializeChatRoom])

  // 채팅방 삭제 함수
  const handleDeleteChat = async () => {
    try {
      setIsExit(true)

      await cleanupChatRoom()

      // 모달 닫기
      closeModal()

      // 채팅방 삭제
      await chatApi.CloseChat(Number(chrBotChatKey))

      // 페이지 리디렉션
      router.push('/chat-list')
    } catch (error) {
      // 에러가 발생해도 페이지 이동
      router.push('/chat-list')
    }
  }

  // 메시지 전송 처리 (Provider의 메서드 사용)
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault()

    // AI 응답 대기 중이면 메시지 전송 금지
    if (isWaitingForAI) {
      console.log('⚠️ AI 응답을 기다리는 중입니다. 메시지 전송이 중단되었습니다.')
      return
    }

    // 필요한 값들이 모두 있는지 확인
    if (!message.trim()) {
      return
    }

    if (!character) {
      setError('캐릭터 정보를 불러오는 중 오류가 발생했습니다.')
      return
    }

    if (!checkCoin()) return

    // 성인 유무 판단
    if (currentModeId === 3 || currentModeId === 4) {
      if (!userIsAdult) {
        openModal('adultVerification')
        return
      }
    }

    // 입력창 초기화 (먼저 수행하여 UX 향상)
    const messageText = message.trim()
    setMessage('')

    try {
      // Provider의 메서드를 사용하여 메시지 전송
      await sendChatMessage(messageText)

      // 메시지 전송 후 AI 응답 대기 상태로 변경
      setIsWaitingForAI(true)

      // 스크롤을 최하단으로 이동
      setTimeout(scrollToBottom, 100)
    } catch (error) {
      console.error('메시지 전송 중 오류:', error)
      setError('메시지 전송에 실패했습니다. 다시 시도해주세요.')
      setIsWaitingForAI(false) // 오류 발생 시 대기 상태 해제
    }
  }

  // 날짜 포맷팅 함수
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // 모드 선택 핸들러 업데이트
  const handleModeSelect = (mode: ChatMode) => {
    // 이전 모드와 다른 경우에만 처리
    if (currentModeId !== mode.id) {
      // 재화(펜) 부족 여부 확인
      const requiredPens = mode.penCost
      const availablePens = useAccountStore.getState().getCoinSum()

      if (availablePens < requiredPens) {
        // 재화 부족 시 모달 표시
        openModal('confirmAction', {
          title: '펜 부족',
          description: `이 모드를 사용하려면 ${requiredPens}개의 펜이 필요합니다. 현재 보유한 펜: ${availablePens}개`,
          onConfirm: () => {
            // 충전 페이지로 이동하는 로직 추가 가능
            router.push('/shop-recharge')
          },
          confirmText: '충전하기',
          cancelText: '취소',
          confirmButtonClass: 'bg-primary-500 hover:bg-primary-600 text-white',
        })
        return
      }

      setCurrentModeId(mode.id)
      updateChatMode(mode.id)
    }

    // 모달 닫기
    closeModal()
  }

  // 마지막 AI 응답 새로고침 함수 (Provider의 메서드 사용)
  const handleRefreshLastAIMessage = async (chat: any) => {
    if (!checkCoin()) return

    try {
      // Provider의 메서드를 사용하여 마지막 AI 메시지 새로고침
      await refreshLastAIMessage(chat)
    } catch (error) {
      console.error('메시지 새로고침 중 오류:', error)
      setError('메시지 새로고침에 실패했습니다. 다시 시도해주세요.')
    }
  }

  // 마지막 AI 응답 삭제 함수
  const handleDeleteLastAIMessage = async (chat: any) => {
    openModal('confirmAction', {
      title: '메세지 삭제',
      description: `삭제된 채팅 내용은 복구할 수 없습니다.`,
      onConfirm: async () => {
        await deleteChatMessage(chat)
        closeModal()
      },
      confirmText: '삭제',
      cancelText: '취소',
      confirmButtonClass: 'bg-primary-500 hover:bg-primary-600 text-white',
    })
  }

  // 메시지 내용에서 상황 설명(*로 감싸진 텍스트)를 찾아 스타일을 적용하는 함수
  const formatMessageWithSituations = (message: string) => {
    // 정규식으로 *로 감싸진 텍스트 찾기
    const parts = message.split(/(\*[^*]+\*)/g)

    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        // 상황 설명 부분 (기울임체, 회색, 얇은 폰트)
        const content = part.slice(1, -1) // 별표 제거
        return (
          <span key={index} className="italic text-gray-400 font-medium">
            {content}
          </span>
        )
      }
      // 일반 대화 부분
      return <span key={index}>{part}</span>
    })
  }

  // 모드 아이콘 가져오기 함수 수정
  const getModeIcon = (modeId: number) => {
    switch (modeId) {
      case 1:
        return faPiggyBank
      case 2:
        return faBookOpen
      case 3:
        return faFire
      case 4:
        return faRocket
      default:
        return faRocket
    }
  }

  const checkCoin = () => {
    const selectModeData = chatMode.find(mode => mode.chat_mode === currentModeId)
    const currentCoin = useAccountStore.getState().getCoinSum()

    if (currentCoin < Number(selectModeData?.coin)) {
      // 재화 부족 시 모달 표시
      openModal('confirmAction', {
        title: '펜 부족',
        description: `보유한 펜이 부족해요..ㅠㅠ\n펜을 충전하러 갈까요?`,
        onConfirm: () => {
          // 충전 페이지로 이동하는 로직 추가 가능
          router.push('/shop-recharge')
          closeModal()
        },
        confirmText: '충전하러 가기',
        cancelText: '취소',
        confirmButtonClass: 'bg-primary-500 hover:bg-primary-600 text-white',
      })
      return false
    }

    return true
  }

  // 모드 코인 차감 액
  const getModePrice = (modeId: number) => {
    switch (modeId) {
      case 1:
        return 100
    }
  }

  // 이미지 저장 함수
  const handleSaveImage = () => {
    if (!character || !character.imageUrl) return

    // 이미지 URL 가져오기
    const imageUrl = showImage

    // a 태그를 생성하여 다운로드 링크로 사용
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `${character.name}-image.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 모바일에서 프로필 이미지 클릭 시 모달 표시 함수
  const handleProfileImageClick = () => {
    setShowImageModal(true)
  }

  // 모달 닫기 함수
  const handleCloseImageModal = () => {
    setShowImageModal(false)
  }

  // 채팅 초기화 모달 열기
  const handleOpenResetChatModal = () => {
    setShowResetChatModal(true)
  }

  // 채팅 초기화 모달 닫기
  const handleCloseResetChatModal = () => {
    setShowResetChatModal(false)
  }

  // 채팅 초기화 확인
  const handleConfirmResetChat = async () => {
    const responseData = await chatApi.InitChat(Number(chrBotChatKey), currentModeId, userIsAdult)
    console.log('💬 채팅 초기화 응답:', responseData.data)

    if (responseData?.data?.result?.err === 0) {
      await clearChatHistory()

      updatePromptKey(responseData.data.prompt_key)

      // 캐릭터의 첫 대화 메시지 추가
      if (first_talk) {
        addChatMessage({
          id: 'first-message',
          sender: 'character',
          message: first_talk,
          timestamp: new Date(),
        })
      }

      // 채팅 초기화 성공
      handleCloseResetChatModal()
    } else {
      // 채팅 초기화 실패
      console.error('채팅 초기화 실패:', responseData.data.result.msg)
      handleCloseResetChatModal()
    }
  }

  // 스크롤을 최하단으로 이동하는 함수
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }

  // 메시지가 추가될 때마다 스크롤을 최하단으로 이동
  useEffect(() => {
    scrollToBottom()
  }, [chatMessages, scrollToBottom])

  useEffect(() => {
    if (isInitRoom) {
      scrollToBottom()
    }
  }, [isInitRoom, scrollToBottom])

  // 메시지가 없고 채팅방이 초기화되었을 때 first_talk 표시
  useEffect(() => {
    if (isInitRoom && channelId && chatMessages.length === 0 && first_talk) {
      addChatMessage({
        id: 'first-message',
        sender: 'character',
        message: first_talk,
        timestamp: new Date(),
      })
    }
  }, [isInitRoom, channelId, chatMessages.length, first_talk, addChatMessage])

  useEffect(() => {
    console.log('characterId :: ', characterId)
    const checkCharacter = async () => {
      if (toastShownRef.current) return

      const response = await createApi.GetChatBot(Number(characterId))
      if (response.data.result.err == 0) {
        if (response.data.chrbot.block_type !== 0 && !toastShownRef.current) {
          toastShownRef.current = true
          toast.error('정책 위반 사항이 포함되어 비공개된 캐릭터입니다.', {
            toastId: 'block-error',
          })
          router.back()
          return
        }
        if (response.data.chrbot.delete_yn !== 0 && !toastShownRef.current) {
          toastShownRef.current = true
          toast.error('삭제된 캐릭터입니다.', {
            toastId: 'delete-error',
          })
          router.back()
          return
        }
      }
    }
    checkCharacter()

    return () => {
      toastShownRef.current = false
    }
  }, [characterId])

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-red-600">
          <p>{error}</p>
        </div>
        <BaseButton color="primary" onClick={() => router.refresh()}>
          다시 시도
        </BaseButton>
      </div>
    )
  }

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  const handleOnClickCharacter = () => {
    setSelectedCharacter(character as Character)
    openModal('character')
  }

  const handleOnClickShop = () => {
    router.push('/shop-recharge')
  }

  // 나머지 UI 부분은 이전과 동일하게 유지
  return (
    <div className="flex flex-col h-screen max-h-screen w-full bg-gray-50">
      {/* 상단 헤더 */}
      <header className="bg-white shadow-sm px-5 py-3 flex items-center justify-between border-b border-gray-200 z-10">
        {/* 왼쪽 그룹: 뒤로가기 + 캐릭터 프로필 */}
        <div className="flex items-center min-w-0">
          {/* 1: 뒤로가기 버튼 */}
          <button
            onClick={async () => {
              try {
                await cleanupChatRoom()

                // 채팅 목록 페이지로 이동
                router.push('/chat-list')
              } catch (error) {
                console.error('채팅방 나가기 프로세스 중 오류 발생:', error)
                // 에러가 발생해도 페이지 이동
                router.push('/chat-list')
              }
            }}
            className="mr-3"
            disabled={isLoading}
            aria-label="뒤로 가기"
          >
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center transition-colors hover:bg-gray-200">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-t-transparent border-gray-600 rounded-full animate-spin"></div>
              ) : (
                <FontAwesomeIcon icon={faArrowLeft} className="text-gray-600" />
              )}
            </div>
          </button>

          {/* 캐릭터 프로필 */}
          <div className="flex items-center min-w-0 overflow-hidden">
            {/* 캐릭터 프로필 이미지 - PC에서만 표시 */}
            <button onClick={handleOnClickCharacter} className="hidden md:block">
              <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 border border-gray-200 flex-shrink-0 hover:opacity-90 transition-opacity shadow-sm">
                <Image src={showImage || '/images/character1.jpg'} alt={character.name} fill className="object-cover" />
              </div>
            </button>

            <div className="min-w-0 overflow-hidden">
              <div className="flex items-center">
                {/* 캐릭터 이름 */}
                <h2 className="font-medium text-gray-800 truncate max-w-[100px] md:max-w-[500px]">{character.name}</h2>
                {/* 프로필 상세 버튼 - PC에서만 표시 */}
                <div onClick={handleOnClickCharacter}>
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    size="sm"
                    className="ml-1 text-violet-500 hover:text-violet-600 flex-shrink-0"
                  />
                </div>
              </div>

              {/* 해시태그 - PC에서만 표시 */}
              <div className="hidden md:flex flex-wrap gap-1 mt-0.5 overflow-hidden">
                {character.hashtags?.slice(0, 2).map((tag: string, index: number) => (
                  <span key={index} className="text-xs text-gray-500 truncate">
                    #{tag}
                  </span>
                )) || (
                  <>
                    <span className="text-xs text-gray-500">#태그</span>
                    <span className="text-xs text-gray-500">#태그</span>
                  </>
                )}
                {character.hashtags && character.hashtags.length > 2 && (
                  <span className="text-xs text-gray-500">+{character.hashtags.length - 2}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 헤더 우측 아이콘들 */}
        <div className="flex items-center gap-2">
          {/* 짜릿모드 버튼 - PC에서만 표시 */}
          <BaseButton
            id="chat-mode-button"
            color="gradient"
            size="sm"
            onClick={() =>
              openModal('chatMode', {
                currentModeId: currentModeId,
                onSelectMode: handleModeSelect,
              })
            }
            className="flex items-center hidden md:flex"
          >
            <FontAwesomeIcon icon={getModeIcon(currentModeId)} className="mr-1.5" />
            <span className="text-sm font-medium">{getChatModeName(currentModeId)}</span>
            <FontAwesomeIcon icon={faCaretDown} className="text-xs ml-1.5" />
          </BaseButton>

          {/* 무료 재화 (펜) */}
          <div className="flex items-center">
            <button
              onClick={handleOnClickShop}
              className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600"
            >
              <Gift className="text-sm md:text-base w-4 h-4 md:w-6 md:h-6" />
            </button>
            <span className="ml-1 text-sm font-semibold text-gray-700">
              {Number(accountData?.coin_free) + Number(accountData?.coin_register) || 0}
            </span>
          </div>

          {/* 유료 재화 (펜) */}
          <div className="flex items-center">
            <button
              onClick={handleOnClickShop}
              className="w-6 h-6 md:w-10 md:h-10 rounded-full bg-primary-200 flex items-center justify-center text-blue-600"
            >
              <Image
                src="/images/pen/pen_primary.svg"
                alt="pen"
                width={16}
                height={16}
                className="w-3 h-3 md:w-5 md:h-5"
              />
            </button>
            <span className="ml-1 text-sm md:text-base font-semibold text-gray-700">{accountData?.coin_user || 0}</span>
          </div>

          {/* 더보기 버튼 - 모바일에서만 표시 */}
          <button
            className="md:hidden w-2 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setIsMoreSidebarOpen(true)}
          >
            <FontAwesomeIcon icon={faEllipsisV} />
          </button>

          {/* 채팅 새로고침 버튼 */}
          <div
            className="hidden md:flex w-9 h-9 rounded-full bg-blue-50 items-center justify-center text-blue-500 cursor-pointer hover:bg-blue-100 transition-colors"
            onClick={handleOpenResetChatModal}
          >
            <FontAwesomeIcon icon={faSync} />
          </div>

          {/* 채팅방 삭제 버튼 */}
          <div
            className="hidden md:flex w-9 h-9 rounded-full bg-red-50 items-center justify-center text-red-500 cursor-pointer hover:bg-red-100 transition-colors"
            onClick={() => {
              openModal('confirmAction', {
                title: '채팅 삭제',
                description: '삭제된 채팅 내용은 복구할 수 없습니다. 그래도 삭제하시겠습니까?',
                onConfirm: handleDeleteChat,
                confirmText: '삭제',
                confirmButtonClass: 'bg-red-500 hover:bg-red-600 text-white',
              })
            }}
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
          </div>
        </div>
      </header>

      {/* 더보기 사이드바 */}
      <BaseSidebar
        isOpen={isMoreSidebarOpen}
        onClose={() => setIsMoreSidebarOpen(false)}
        title="더보기"
        side="right"
        width="100%"
      >
        <div className="p-4">
          {/* 채팅 모드 선택 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">채팅 모드 선택</h3>
            <div className="space-y-3">
              {chatMode.map((mode, index) => {
                const chatMode = bridgeChatModeDataToChatMode(mode, customChatModes[index])
                if (!chatMode.isShow) return null
                return (
                  <div
                    key={chatMode.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      currentModeId === chatMode.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      handleModeSelect(chatMode)
                      setIsMoreSidebarOpen(false)
                    }}
                  >
                    <div className="flex justify-between items-center sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center">
                        <FontAwesomeIcon
                          icon={chatMode.icon}
                          className={`mr-3 ${currentModeId === chatMode.id ? 'text-primary-500' : 'text-gray-500'}`}
                        />
                        <div>
                          <h4
                            className={`font-medium ${currentModeId === chatMode.id ? 'text-primary-700' : 'text-gray-900'}`}
                          >
                            {chatMode.name}
                          </h4>
                          <p className="text-sm text-gray-500">{chatMode.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center bg-primary-100 px-3 py-1 rounded-full self-start sm:self-auto">
                        <div className="flex text-primary-700 font-medium text-sm whitespace-nowrap">
                          <Image src="/images/pen/pen_primary.svg" alt="pen" width={11} height={11} className="mr-1" />
                          <span>{chatMode.penCost}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 배경 이미지 토글 */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">배경 설정</h3>
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faImage} className="mr-3 text-gray-500" />
                <div>
                  <h4 className="font-medium text-gray-900">배경 이미지</h4>
                  <p className="text-sm text-gray-500">채팅창 배경에 캐릭터 이미지 표시</p>
                </div>
              </div>
              <button
                onClick={() => setIsBackgroundEnabled(!isBackgroundEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isBackgroundEnabled ? 'bg-primary-500' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isBackgroundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">채팅 초기화</h3>
            <div
              onClick={handleOpenResetChatModal}
              className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center">
                <FontAwesomeIcon icon={faSync} className="mr-3 text-gray-500" />
                <div>
                  <h4 className="font-medium text-gray-900">채팅 내용 초기화</h4>
                </div>
              </div>
            </div>
          </div>

          {/* 채팅방 나가기 */}
          <div className="border-t pt-4">
            <button
              className="w-full py-3 px-4 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
              onClick={() => {
                openModal('confirmAction', {
                  title: '채팅 삭제',
                  description: '삭제된 채팅 내용은 복구할 수 없습니다. 그래도 삭제하시겠습니까?',
                  onConfirm: () => {
                    handleDeleteChat()
                    setIsMoreSidebarOpen(false)
                  },
                  confirmText: '삭제',
                  confirmButtonClass: 'bg-red-500 hover:bg-red-600 text-white',
                })
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-transparent border-red-600 rounded-full animate-spin mr-2"></div>
                  처리 중...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                  채팅방 나가기
                </>
              )}
            </button>
          </div>
        </div>
      </BaseSidebar>

      {/* 메인 채팅 영역 */}
      <main className="flex flex-1 overflow-hidden">
        {/* 왼쪽 캐릭터 이미지 영역 - 최대 너비 600px로 제한 */}
        <div className="relative hidden md:block" style={{ maxWidth: '600px', width: '40%', flexShrink: 0 }}>
          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-transparent z-10 pointer-events-none"></div>

          {/* 이미지 컨테이너 */}
          <div className="relative h-full w-full group">
            <Image
              src={showImage || '/images/character1.jpg'}
              alt={character.name}
              fill
              className="object-cover cursor-pointer"
              sizes="(max-width: 768px) 100vw, 600px"
              style={{
                objectPosition: 'center top',
              }}
              priority
              onClick={handleSaveImage}
            />

            {/* 이미지 저장 버튼 - 호버 시에만 표시 */}
            <div
              className="absolute bottom-16 right-4 bg-black/70 rounded-full p-3 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-30"
              onClick={handleSaveImage}
              title="이미지 저장하기"
            >
              <FontAwesomeIcon icon={faDownload} className="text-white text-lg" />
            </div>
          </div>

          {/* 하단 그라데이션 오버레이 */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent z-10 pointer-events-none"></div>

          {/* 캐릭터 이름 */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white drop-shadow-md text-center">
              {character.name}
            </h2>
          </div>
        </div>

        {/* 오른쪽 채팅 영역 - 남은 공간 모두 차지 */}
        <div
          className="flex-1 flex flex-col bg-gradient-to-b from-gray-50 to-white"
          style={{
            minWidth: 0,
            backgroundImage:
              isMobile && isBackgroundEnabled
                ? `linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(${character.imageUrl || '/images/character1.jpg'})`
                : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* 연결 상태 표시 */}
          {!isConnected && !isConnecting && (
            <div className="bg-red-50 p-3 border-b border-red-100 flex flex-col items-center md:flex-row md:justify-between gap-2">
              <div className="flex items-center text-center md:text-left">
                <div className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse flex-shrink-0"></div>
                <p className="text-red-700 text-sm">
                  서버 연결이 끊어졌습니다. 메시지를 보낼 수 없습니다.
                  {error && <span className="ml-1 md:ml-2 font-medium">({error})</span>}
                </p>
              </div>
              <button
                onClick={() => router.refresh()}
                className="w-full md:w-auto px-3 py-1.5 md:py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-medium transition-colors flex items-center justify-center flex-shrink-0"
                aria-label="새로고침"
              >
                <FontAwesomeIcon icon={faSync} className="mr-1.5" />
                새로고침
              </button>
            </div>
          )}

          {isConnecting && (
            <div className="bg-yellow-50 p-3 border-b border-yellow-100 flex items-center">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse"></div>
              <p className="text-yellow-700 text-sm flex items-center">
                서버에 연결 중입니다. 잠시만 기다려주세요...
                <span className="ml-2 bg-yellow-100 px-2 py-0.5 rounded-full text-xs">채팅 초기화 중</span>
              </p>
            </div>
          )}

          {showConnectedStatus && (
            <div className="bg-green-50 p-2.5 border-b border-green-100 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <p className="text-green-700 text-sm">
                  서버에 연결됨
                  {isInitRoom ? (
                    <span className="ml-2 bg-green-100 px-2 py-0.5 rounded-full text-xs">채팅방 초기화 완료</span>
                  ) : (
                    <span className="ml-2 bg-yellow-100 px-2 py-0.5 rounded-full text-xs">채팅방 초기화 필요</span>
                  )}
                </p>
              </div>
              {channelId && (
                <div className="flex items-center">
                  <p className="text-xs text-green-600">채널: {channelId.substring(0, 8)}...</p>
                  {chrBotChatKey && (
                    <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                      Chat ID: {chrBotChatKey}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 채팅 내용 */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6">
            <div ref={chatBoxRef} className="flex flex-col space-y-12 max-w-3xl mx-auto">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                  <p>메시지가 없습니다. 채팅을 시작해보세요!</p>
                </div>
              ) : (
                chatMessages.map((chat, index) => {
                  const isLastAiMessage = chatMessages.length - 1 === index
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex flex-col ${chat.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      {chat.sender === 'character' && (
                        <div
                          className="relative w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0 shadow-sm border border-gray-200 cursor-pointer md:cursor-default"
                          onClick={() => handleProfileImageClick()}
                        >
                          <Image
                            src={character.imageUrl || '/images/character1.jpg'}
                            alt={character.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className={`inline-block max-w-[85%] rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-sm ${
                          chat.sender === 'user'
                            ? 'bg-primary-500 text-white font-medium rounded-tr-none'
                            : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                        }`}
                        style={{ wordBreak: 'break-word', overflow: 'hidden' }}
                      >
                        <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed break-words">
                          {formatMessageWithSituations(chat.message)}
                        </p>
                        <p
                          className={`text-xs mt-2 text-right ${chat.sender === 'user' ? 'text-white/80' : 'text-gray-500'}`}
                        >
                          {formatTime(chat.timestamp)}
                        </p>
                      </motion.div>

                      {chat.sender === 'character' && chat.id !== 'first-message' && (
                        <div className="flex ml-2 items-center justify-start max-w-[85%] mt-2">
                          {/* 마지막 AI 메시지인 경우 새로고침/삭제 버튼 표시 */}
                          {isLastAiMessage && (
                            <button
                              onClick={handleRefreshLastAIMessage}
                              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-violet-50 flex items-center justify-center text-violet-500 hover:text-violet-600 hover:bg-violet-100 transition-colors mr-1.5 shadow-sm"
                              title="응답 새로고침"
                            >
                              <FontAwesomeIcon icon={faSync} className="text-sm sm:text-base" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteLastAIMessage(chat)}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-100 transition-colors shadow-sm"
                            title="응답 삭제"
                          >
                            <FontAwesomeIcon icon={faTrashAlt} className="text-sm sm:text-base" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )
                })
              )}
            </div>
          </div>

          {/* 메시지 입력 */}
          <div className="bg-white p-4 border-t border-gray-200 shadow-sm">
            <form onSubmit={handleSendMessage} className="flex items-center max-w-3xl mx-auto">
              {/* 상황 설명 버튼 (별표 아이콘) */}
              <button
                id="message-input"
                type="button"
                onClick={() => setMessage(prevMessage => prevMessage + '**')}
                className="w-12 h-12 flex items-center justify-center rounded-full transition-colors bg-gray-100 text-gray-500 hover:bg-gray-200 mr-2"
                disabled={isWaitingForAI}
              >
                <FontAwesomeIcon icon={faAsterisk} className="text-base" />
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder={
                    isWaitingForAI
                      ? 'AI가 응답 중입니다. 잠시만 기다려주세요...'
                      : '대화를 입력하세요. (예: 안녕! 뭐해?)'
                  }
                  className={`w-full h-12 px-4 text-sm sm:text-base bg-gray-100 text-gray-800 rounded-l-xl border-0 focus:outline-none focus:ring-0 ${
                    isWaitingForAI ? 'bg-gray-200 text-gray-500' : 'hover:bg-gray-200/80'
                  } transition-all placeholder:text-sm placeholder:text-gray-500`}
                  disabled={isWaitingForAI}
                />
                {isWaitingForAI && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="flex items-center space-x-1">
                      <div
                        className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      ></div>
                      <div
                        className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      ></div>
                      <div
                        className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* 전송 버튼 - BaseButton으로 변경 */}
              <BaseButton
                type="submit"
                color={message.trim() && !isWaitingForAI ? 'gradient' : 'secondary'}
                disabled={!message.trim() || isWaitingForAI}
                className="rounded-l-none rounded-r-xl h-12 px-4 flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faPaperPlane} className="text-base" />
              </BaseButton>
            </form>
          </div>
        </div>
      </main>

      {/* 모바일용 이미지 모달을 추가합니다 (return 문 끝에 추가) */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-md mx-auto">
            {/* 닫기 버튼 */}
            <button
              className="absolute top-0 right-0 z-10 bg-black/50 rounded-full p-2 text-white transform translate-x-3 -translate-y-3"
              onClick={handleCloseImageModal}
            >
              <FontAwesomeIcon icon={faArrowLeft} className="text-lg" />
            </button>

            {/* 이미지 */}
            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden">
              <Image
                src={character.imageUrl || '/images/character1.jpg'}
                alt={character.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* 이미지 정보 및 다운로드 버튼 */}
            <div className="bg-black/50 backdrop-blur-sm text-white p-4 rounded-b-lg">
              <h3 className="font-bold text-lg mb-1">{character.name}</h3>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {character.hashtags?.slice(0, 2).map((tag: string, index: number) => (
                    <span key={index} className="text-xs text-gray-300">
                      #{tag}
                    </span>
                  ))}
                </div>
                <button
                  className="bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded-full flex items-center text-sm"
                  onClick={() => {
                    handleSaveImage()
                    handleCloseImageModal()
                  }}
                >
                  <FontAwesomeIcon icon={faDownload} className="mr-2" />
                  저장하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 튜토리얼 컴포넌트 */}
      <Tutorial isOpen={showTutorial} onClose={() => setShowTutorial(false)} config={tutorialConfig} />

      {/* 채팅 초기화 모달 */}
      <ResetChatModal
        isOpen={showResetChatModal}
        onClose={handleCloseResetChatModal}
        onConfirm={handleConfirmResetChat}
      />
    </div>
  )
}
