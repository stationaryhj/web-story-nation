'use client';

import {
  faArrowLeft,
  faAsterisk,
  faBookOpen,
  faCaretDown,
  faDownload,
  faEllipsisV,
  faFire,
  faHeart,
  faImage,
  faInfoCircle,
  faPaperPlane,
  faPiggyBank,
  faRocket,
  faSignOutAlt,
  faSync,
  faTrashAlt,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useNakama } from '@/app/providers/NakamaProviders';
import { BaseButton } from '@/components/elements/button/BaseButton';
import BaseSidebar from '@/components/elements/sidebar/BaseSidebar';
import BigImageModal from '@/components/modal/BigImageModal';
import type { ChatMode } from '@/components/modal/ChatModeModal';
import ResetChatModal from '@/components/modal/ResetChatModal';
import UnlockActionModal from '@/components/modal/UnlockActionModal';
import Tutorial from '@/components/tutorial/Tutorial';
import {
  bridgeCharbotDataToCharacter,
  bridgeChatModeDataToChatMode,
  getChangeNameTag,
  getImageUri,
  getValidImageUrl,
} from '@/lib/utils/storyNationUtil';
import { chatApi, createApi } from '@/services/api/storyNationApi';
import {
  customChatModes,
  defaultNames,
  LOAD_MORE_COUNT,
  LOAD_MORE_THRESHOLD,
  MESSAGES_PER_VIEW,
  PRELOAD_BUFFER,
} from '@/services/define';
import { useChatStore } from '@/store/useChatStore';
import { useMultiImageStore } from '@/store/useMultiImageStore';
import { Character, useAccountStore, useChatModeStore } from '@/store/useStoreData';
import { useModalStore } from '@/store/useStoreModal';
import type { ChrbotData } from '@/types/api';

// 채팅 모드 이름 가져오기 함수
const getChatModeName = (modeId: number) => {
  return defaultNames[modeId] || defaultNames[0];
};

export default function ChatDetailClient({ characterId }: { characterId: string }) {
  const router = useRouter();
  const { openModal, closeModal, setSelectedCharacter } = useModalStore();
  const { chatBotData, selectedLikeability_exp, selectedLikeability_lv, chatLikeability } =
    useChatStore();
  const { chatMode } = useChatModeStore();
  const { multiImages, bgImageUrl, openImageCount, selectedMultiImageData, chageBackgroundImage } =
    useMultiImageStore();
  const { getCoinSum } = useAccountStore();

  const { data: accountData, userIsAdult } = useAccountStore((state) => ({
    isLogin: state.isLogin,
    data: state.data,
    userIsAdult: state.isAdult() ? 1 : 0,
  }));

  // 주석 해제
  const first_talk = chatBotData?.first_talk
    ? getChangeNameTag(chatBotData?.first_talk, chatBotData?.title)
    : '';

  // 모바일 환경 감지
  const [isMobile, setIsMobile] = useState(false);
  const [isBigImageModalOpen, setIsBigImageModalOpen] = useState(false);
  const [bigImageUrl, setBigImageUrl] = useState('');

  // 이미지 해금
  const [imgUnlockAction, setImgUnlockAction] = useState<boolean>(false);
  const [rewardImgUrl, setRewardImgUrl] = useState<string>('');

  // 튜토리얼 관련 상태를 최상위로 이동
  const [showTutorial, setShowTutorial] = useState(true);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // 튜토리얼 설정 - isMobile 상태에 따라 동적으로 id 설정
  const tutorialConfig = useMemo(
    () => ({
      storageKey: 'chat-tutorial-completed',
      defaultMessagePosition: 'middle' as const,
      steps: [
        {
          id: isMobile ? 'more-button' : 'chat-mode-button',
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
    }),
    [isMobile]
  );

  // Nakama 컨텍스트 사용
  const nakamaContext = useNakama();
  const {
    roomName,
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

    addChannelMessageListener,
    removeChannelMessageListener,
  } = nakamaContext;

  // 마지막으로 수동 스크롤한 위치 기록
  const lastManualScrollRef = useRef<number>(0);
  const isAutoScrollingRef = useRef<boolean>(true);

  const hasInitialized = useRef(false);
  const isMountedRef = useRef(true); // 마운트 상태 추적용 ref
  const chatContainerRef = useRef<HTMLDivElement>(null); // 채팅 컨테이너 ref
  const toastShownRef = useRef(false);

  const [message, setMessage] = useState('');
  const [currentModeId, setCurrentModeId] = useState(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isWaitingForAI, setIsWaitingForAI] = useState<boolean>(false); // AI 응답 대기 상태

  // 연결 상태 표시 관련 상태
  const [showConnectedStatus, setShowConnectedStatus] = useState(false);

  // 먼저 새로운 모바일 이미지 보기 모달을 위한 상태를 추가합니다
  const [showImageModal, setShowImageModal] = useState(false);

  // 모바일 환경 감지
  const [isMoreSidebarOpen, setIsMoreSidebarOpen] = useState(false);

  // 캐릭터 이미지
  // const [showImage, setShowImage] = useState(getValidImageUrl(character.imageUrl))
  const [showImage, setShowImage] = useState(getValidImageUrl(getImageUri(bgImageUrl)));

  // 배경 이미지 상태 추가
  const [isBackgroundEnabled, setIsBackgroundEnabled] = useState(true);

  // 나가기 플래그
  const [isExit, setIsExit] = useState(false);

  // 채팅 초기화 모달 상태
  const [showResetChatModal, setShowResetChatModal] = useState(false);

  // 캐릭터 데이터 변환
  const character = bridgeCharbotDataToCharacter(chatBotData as ChrbotData);

  // 날짜 포맷팅 함수
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // 메시지 내용에서 상황 설명(*로 감싸진 텍스트)를 찾아 스타일을 적용하는 함수
  const formatMessageWithSituations = (message: string) => {
    // 정규식으로 *로 감싸진 텍스트 찾기
    const parts = message.split(/(\*[^*]+\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        // 상황 설명 부분 (기울임체, 회색, 얇은 폰트)
        const content = part.slice(1, -1); // 별표 제거
        return (
          <span key={index} className='italic text-current/60 font-medium'>
            {content}
          </span>
        );
      }
      // 일반 대화 부분
      return <span key={index}>{part}</span>;
    });
  };

  // 모드 아이콘 가져오기 함수 수정
  const getModeIcon = (modeId: number) => {
    switch (modeId) {
      case 1:
        return faPiggyBank;
      case 2:
        return faBookOpen;
      case 3:
        return faFire;
      case 4:
        return faRocket;
      default:
        return faRocket;
    }
  };

  const checkCoin = () => {
    const selectModeData = chatMode.find((mode) => mode.chat_mode === currentModeId);
    const currentCoin = getCoinSum();

    if (currentCoin < Number(selectModeData?.coin)) {
      // 재화 부족 시 모달 표시
      openModal('confirmAction', {
        title: '펜 부족',
        description: `보유한 펜이 부족해요..ㅠㅠ\n펜을 충전하러 갈까요?`,
        onConfirm: () => {
          // 충전 페이지로 이동하는 로직 추가 가능
          router.push('/shop-recharge');
          closeModal();
        },
        confirmText: '충전하러 가기',
        cancelText: '취소',
        confirmButtonClass: 'bg-brand hover:bg-brand-hover text-text-inverse',
      });
      return false;
    }

    return true;
  };

  // 스크롤을 최하단으로 이동하는 함수
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      console.log('언마운트 >>> 시작');
      cleanupChatRoom().catch((err) => console.error('채팅방 정리 중 오류:', err));
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  useEffect(() => {
    if (channelId) {
      addChannelMessageListener(channelId as string, (message) => {
        if (message) {
          if (message.content && message.content.type === 'ai') {
            // console.log('@@@@ addChannelMessageListener 채팅방 메세지 ::: ' , message)
            // 여기서 호감도를 체크한다.

            (async () => {
              const result = await chatLikeability(roomName || '');
              if (result !== null && result.err === 0) {
                if (result.msg) {
                  setImgUnlockAction(true);
                  setRewardImgUrl(result.msg);
                }
              } else {
                toast.error(result?.msg || '호감도 판독에 실패했습니다.');
              }
            })();
          }
        }
      });
    }

    return () => {
      removeChannelMessageListener(channelId as string, (message) => {
        console.log('@@@@ removeChannelMessageListener 채팅방 메세지 ::: ', message);
      });
    };
  }, [channelId]);

  useEffect(() => {
    setShowImage(getValidImageUrl(getImageUri(bgImageUrl)));
  }, [bgImageUrl]);

  // 메시지 디버깅을 위한 로깅 추가 - 무한 루프 문제 수정
  useEffect(() => {
    if (chatMessages.length > 0) {
      const lastMsg = chatMessages[chatMessages.length - 1];

      console.log('💬 마지막 메시지:', lastMsg);

      // 마지막 메시지 발신자에 따라 AI 응답 대기 상태 업데이트
      // 임시 메시지는 제외하고 실제 메시지만 고려
      if (!lastMsg.id.startsWith('temp_')) {
        setIsWaitingForAI(lastMsg.sender === 'user');
      }

      if (lastMsg.sender === 'character') {
        console.log('💬 캐릭터 메세지 ::', lastMsg);
      }
    }
  }, [chatMessages]); // 의존성 배열에 chatMessages만 포함

  // 연결 상태 변화 로깅 - 타이머 클리어 추가
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isConnected) {
      setShowConnectedStatus(true);
      timer = setTimeout(() => {
        setShowConnectedStatus(false);
      }, 3000);
    } else {
      setShowConnectedStatus(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isConnected]);

  // 서버 상태와 채널 ID에 따른 UI 처리 - 의존성 단순화
  useEffect(() => {
    if (!isConnected && !isConnecting && isInitRoom) {
      // 초기화는 됐지만 연결이 끊어진 경우
      setError('채팅 서버와의 연결이 끊어졌습니다.');
    } else if (isConnected && !channelId && isInitRoom) {
      // 연결은 됐지만 채널 ID가 없는 경우
      setError('채팅 채널 연결에 문제가 발생했습니다.');
    } else if (isConnected && channelId) {
      // 정상 상태일 때 에러 초기화
      setError(null);
    }
  }, [isConnected, isConnecting, channelId, isInitRoom]);

  // 채팅방 정리 및 연결 종료를 위한 공통 함수 최적화
  const cleanupChatRoom = useCallback(async () => {
    try {
      setIsLoading(true);

      // 1. 채팅방에서 나가기
      if (channelId) {
        try {
          await leaveChat(channelId);
          console.log('1 :::: 채팅방 나가기 성공');
        } catch (error) {
          console.error('채팅방 나가기 중 오류:', error);
          // 오류가 발생해도 계속 진행
        }
      }

      // 2. 소켓 연결 종료
      try {
        await disconnectSocket();
        console.log('2 :::: 소켓 종료 성공');
      } catch (error) {
        console.error('소켓 연결 종료 중 오류:', error);
        // 오류가 발생해도 계속 진행
      }

      // 3. 상태 정리 (clearChatHistory 호출 제거)
      hasInitialized.current = false;
      console.log('3 :::: 상태정리 끝');
      return true;
    } catch (error) {
      console.error('채팅방 정리 중 오류 발생:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [channelId, leaveChat, disconnectSocket]);

  // 채팅방 초기화 메서드 - useCallback으로 변경
  const initializeChatRoom = useCallback(async () => {
    console.log('initializeChatRoom >>> 시작');

    // 이미 초기화 중이거나 초기화가 완료된 경우 또는 필요한 데이터가 없는 경우
    if (!character?.id || !accountData?.user_key) {
      console.log('⚠️ 초기화에 필요한 데이터가 없습니다.');
      return;
    }

    if (hasInitialized.current) {
      console.log('⚠️ 이미 초기화 요청을 진행했습니다.');
      return;
    }

    // 이미 초기화된 상태인지 확인
    if (isInitRoom && channelId) {
      console.log('✅ 채팅방이 이미 초기화되어 있습니다.');

      // 채팅방이 초기화되어 있고 메시지가 없으면 first_talk 추가
      if (chatMessages.length === 0 && first_talk) {
        addChatMessage({
          id: 'first-message',
          sender: 'character',
          message: first_talk,
          timestamp: new Date(),
        });
      }

      return;
    }

    if (isExit) return;

    try {
      setIsLoading(true);
      setError(null);
      hasInitialized.current = true;

      // 사용 가능한 채팅 모드 중 첫번째 선택 (또는 기본값 2번)
      // const selectedModeId = chatMode && chatMode.length > 0 ? chatMode[0].chat_mode : 2

      // default selectModeId 변경 ( 04.10 )
      /*
        1. 선택된 캐릭터 기준 성인전용이면 성인모드 선택 ( 4 )
        2. 성인전용이 아니면 스토리모드 선택 ( 2 )
      */
      const selectedModeId = character.isAdult ? 4 : 2;

      console.log('💬 채팅방 초기화 시작 - ID:', character.id, '모드:', selectedModeId);

      // 채팅방 초기화 (Nakama 서버 연결 및 인증, 채팅방 참여까지 모두 수행)
      const result = await chatRoomInit(
        accountData.user_key.toString(),
        characterId,
        selectedModeId
      );

      if (!result.success) {
        if (result.error === 'ALREADY_INITIALIZING') {
          console.log('⚠️ 이미 초기화 중입니다. 대기...');
          // 3초 후 초기화 상태 리셋 (이미 진행 중인 초기화 작업이 실패했을 경우 대비)
          setTimeout(() => {
            if (!isConnected || !channelId) {
              console.log('🔄 초기화 시간 초과, 상태 리셋');
              hasInitialized.current = false;
            }
          }, 3000);
          return;
        }

        console.error('❌ 채팅방 초기화 실패:', result.error);
        throw new Error(result.error || '채팅방 초기화에 실패했습니다. 다시 시도해주세요.');
      }

      // 현재 모드 설정 업데이트
      setCurrentModeId(selectedModeId);
      console.log('✅ 채팅방 초기화 완료:', result);
    } catch (error) {
      console.error('채팅방 초기화 실패:', error);
      setError('채팅방을 초기화하는 중 오류가 발생했습니다. 다시 시도해주세요.');
      hasInitialized.current = false;
    } finally {
      setIsLoading(false);
    }
  }, [
    character?.id,
    accountData?.user_key,
    characterId,
    chatRoomInit,
    chatMode,
    isConnected,
    channelId,
    isInitRoom,
  ]);

  // 채팅방 초기화 로직 - 채팅방 초기화만 담당
  useEffect(() => {
    console.log('@@@@ isInitRoom :: ', isInitRoom);
    console.log('@@@@ channelId :: ', channelId);

    // 이미 초기화된 상태라면 중단하고 초기화 상태만 업데이트
    if (isInitRoom && channelId) {
      console.log('✅ 채팅방이 이미 초기화된 상태입니다:', {
        isInitRoom,
        channelId,
        hasInitialized: hasInitialized.current,
      });
      hasInitialized.current = true;
      return;
    }

    // 이미 초기화되었거나 필요한 데이터가 없으면 중단
    if (hasInitialized.current) {
      console.log('⏭️ 채팅방 초기화 로직 건너뜀', {
        hasInitialized: hasInitialized.current,
        hasCharacterId: !!character?.id,
        hasUserKey: !!accountData?.user_key,
      });
      return;
    }

    // 이 시점에 도달하면 실제로 초기화 필요
    console.log('🚀 채팅방 초기화 로직 시작');
    initializeChatRoom().then(() => {
      console.log('✅ initializeChatRoom 함수 완료');
    });
    // }, [character?.id, accountData?.user_key, isInitRoom, channelId, initializeChatRoom])
  }, [isInitRoom, channelId]);

  // 메시지가 추가될 때마다 스크롤을 최하단으로 이동
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  useEffect(() => {
    if (isInitRoom) {
      scrollToBottom();
    }
  }, [isInitRoom, scrollToBottom]);

  // 메시지가 없고 채팅방이 초기화되었을 때 first_talk 표시
  useEffect(() => {
    if (isInitRoom && channelId && chatMessages.length === 0 && first_talk) {
      addChatMessage({
        id: 'first-message',
        sender: 'character',
        message: first_talk,
        timestamp: new Date(),
      });
    }
  }, [isInitRoom, channelId, chatMessages.length, first_talk, addChatMessage]);

  // 채팅방 초기화 및 로딩 완료 시 스크롤 최하단으로 이동
  useEffect(() => {
    if (!isLoading && isInitRoom && channelId && chatMessages.length > 0) {
      // 약간의 지연 후 스크롤 이동 (컴포넌트가 완전히 렌더링된 후)
      setTimeout(scrollToBottom, 100);
    }
  }, [isLoading, isInitRoom, channelId, chatMessages.length, scrollToBottom]);

  // useEffect(() => {
  //   console.log('characterId :: ', characterId)
  //   const checkCharacter = async () => {
  //     if (toastShownRef.current) return

  //     const response = await createApi.GetChatBot(Number(characterId))
  //     if (response.data.result.err == 0) {
  //       if (response.data.chrbot.block_type !== 0 && !toastShownRef.current) {
  //         toastShownRef.current = true
  //         toast.error('정책 위반 사항이 포함되어 비공개된 캐릭터입니다.', {
  //           toastId: 'block-error',
  //         })
  //         router.back()
  //         return
  //       }
  //       if (response.data.chrbot.delete_yn !== 0 && !toastShownRef.current) {
  //         toastShownRef.current = true
  //         toast.error('삭제된 캐릭터입니다.', {
  //           toastId: 'delete-error',
  //         })
  //         router.back()
  //         return
  //       }
  //     }
  //   }
  //   checkCharacter()

  //   return () => {
  //     toastShownRef.current = false
  //   }
  // }, [characterId])

  // 새 메시지가 추가되면 마지막 메시지가 보이도록 인덱스 조정
  useEffect(() => {
    // 자동 스크롤이 활성화된 경우에만 마지막 메시지로 스크롤
    if (isAutoScrollingRef.current) {
      if (chatMessages.length > 0) {
        setVisibleStartIndex(Math.max(0, chatMessages.length - MESSAGES_PER_VIEW));
        // 약간의 지연 후 스크롤 조정
        setTimeout(scrollToBottom, 10);
      }
    }
  }, [chatMessages.length]);

  // 현재 보여지는 메시지의 시작 인덱스
  const [visibleStartIndex, setVisibleStartIndex] = useState(0);

  // 보여질 메시지만 필터링 - 앞뒤로 더 많은 메시지 미리 로드
  const visibleMessages = chatMessages.slice(
    Math.max(0, visibleStartIndex - PRELOAD_BUFFER),
    Math.min(chatMessages.length, visibleStartIndex + MESSAGES_PER_VIEW + PRELOAD_BUFFER)
  );

  // 스크롤 이벤트 핸들러
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;

    // 맨 아래로부터의 거리가 100px 이하면 자동 스크롤 활성화
    if (scrollBottom <= 100) {
      isAutoScrollingRef.current = true;
    } else {
      // 사용자가 스크롤을 올린 경우 자동 스크롤 비활성화
      if (lastManualScrollRef.current > scrollTop + 50) {
        isAutoScrollingRef.current = false;
      }
      lastManualScrollRef.current = scrollTop;
    }

    // 스크롤이 상단에 가까워지면 이전 메시지 보여주기
    if (scrollTop < LOAD_MORE_THRESHOLD && visibleStartIndex > 0) {
      setVisibleStartIndex((prev) => Math.max(0, prev - LOAD_MORE_COUNT));
    }

    // 스크롤이 하단에 가까워지면 다음 메시지 보여주기
    if (
      scrollBottom < LOAD_MORE_THRESHOLD &&
      visibleStartIndex + MESSAGES_PER_VIEW < chatMessages.length
    ) {
      setVisibleStartIndex((prev) =>
        Math.min(chatMessages.length - MESSAGES_PER_VIEW, prev + LOAD_MORE_COUNT)
      );
    }
  };

  // 메시지가 길어질 경우를 대비한 길이 제한 함수
  const getLimitedVisibleMessages = () => {
    // 너무 긴 메시지의 경우 렌더링 최적화를 위해 일정 길이 이상인 경우만 특별 처리
    return visibleMessages.map((msg) => {
      if (msg.message.length > 1000) {
        return {
          ...msg,
          // 메시지 ID에 고유값 추가하여 리렌더링 방지
          id: `${msg.id}-visible-${visibleStartIndex}`,
        };
      }
      return msg;
    });
  };

  // 채팅방 삭제 함수
  const handleDeleteChat = async () => {
    try {
      setIsExit(true);

      await cleanupChatRoom();

      // 모달 닫기
      closeModal();

      // 채팅방 삭제
      await chatApi.CloseChat(Number(chrBotChatKey));

      // 페이지 리디렉션
      router.push('/chat-list');
    } catch (error) {
      // 에러가 발생해도 페이지 이동
      router.push('/chat-list');
    }
  };

  // 메시지 전송 처리 (Provider의 메서드 사용)
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();

    // AI 응답 대기 중이면 메시지 전송 금지
    if (isWaitingForAI) {
      console.log('⚠️ AI 응답을 기다리는 중입니다. 메시지 전송이 중단되었습니다.');
      return;
    }

    // 필요한 값들이 모두 있는지 확인
    if (!message.trim()) {
      return;
    }

    if (!character) {
      setError('캐릭터 정보를 불러오는 중 오류가 발생했습니다.');
      return;
    }

    if (!checkCoin()) return;

    // 성인 유무 판단
    if (currentModeId === 3 || currentModeId === 4) {
      if (!userIsAdult) {
        openModal('adultVerification');
        return;
      }

      setShowImage(getValidImageUrl(character.imageUrlNsfw));
    }

    // 입력창 초기화 (먼저 수행하여 UX 향상)
    const messageText = message.trim();
    setMessage('');

    try {
      // Provider의 메서드를 사용하여 메시지 전송
      await sendChatMessage(messageText);

      // 메시지 전송 후 AI 응답 대기 상태로 변경
      setIsWaitingForAI(true);

      // 스크롤을 최하단으로 이동
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('메시지 전송 중 오류:', error);
      setError('메시지 전송에 실패했습니다. 다시 시도해주세요.');
      setIsWaitingForAI(false); // 오류 발생 시 대기 상태 해제
    }
  };

  // 모드 선택 핸들러 업데이트
  const handleModeSelect = (mode: ChatMode) => {
    if (currentModeId === mode.id) {
      closeModal();
      return;
    }

    // 재화(펜) 부족 여부 확인
    const requiredPens = mode.penCost;
    const availablePens = useAccountStore.getState().getCoinSum();

    if (availablePens < requiredPens) {
      // 재화 부족 시 모달 표시
      openModal('confirmAction', {
        title: '펜 부족',
        description: `이 모드를 사용하려면 ${requiredPens}개의 펜이 필요합니다. 현재 보유한 펜: ${availablePens}개`,
        onConfirm: () => {
          // 충전 페이지로 이동하는 로직 추가 가능
          router.push('/shop-recharge');
        },
        confirmText: '충전하기',
        cancelText: '취소',
        confirmButtonClass: 'bg-brand hover:bg-brand-hover text-text-inverse',
      });
      return;
    }

    if (mode.id === 3 || mode.id === 4) {
      // user 의 성인 유무 확인
      if (!userIsAdult) return;

      // 캐릭터 성인 유무 확인
      if (chatBotData?.nsfw !== 1) {
        toast.error('성인 캐릭터는 성인 모드로만 이용할 수 있습니다.', {
          toastId: 'adult-error',
        });
        return;
      }
    }

    setCurrentModeId(mode.id);
    updateChatMode(mode.id);

    // 모달 닫기
    closeModal();
  };

  // 마지막 AI 응답 새로고침 함수 (Provider의 메서드 사용)
  const handleRefreshLastAIMessage = async (chat: any) => {
    if (!checkCoin()) return;

    try {
      // Provider의 메서드를 사용하여 마지막 AI 메시지 새로고침
      setIsWaitingForAI(true);
      await refreshLastAIMessage(chat);
      setIsWaitingForAI(false);
    } catch (error) {
      console.error('메시지 새로고침 중 오류:', error);
      setError('메시지 새로고침에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 마지막 AI 응답 삭제 함수
  const handleDeleteLastAIMessage = async (chat: any) => {
    openModal('confirmAction', {
      title: '메세지 삭제',
      description: `삭제된 채팅 내용은 복구할 수 없습니다.`,
      onConfirm: async () => {
        await deleteChatMessage(chat);
        closeModal();
      },
      confirmText: '삭제',
      cancelText: '취소',
      confirmButtonClass: 'bg-brand hover:bg-brand-hover text-text-inverse',
    });
  };

  // 이미지 저장 함수
  const handleSaveImage = () => {
    // 이미지 URL 가져오기
    const imageUrl = showImage;

    // a 태그를 생성하여 다운로드 링크로 사용
    // const link = document.createElement('a')
    // link.href = imageUrl
    // link.download = `${character.name}-image.jpg`
    // document.body.appendChild(link)
    // link.click()
    // document.body.removeChild(link)

    setIsBigImageModalOpen(true);
    setBigImageUrl(imageUrl);
  };

  // 모바일에서 프로필 이미지 클릭 시 모달 표시 함수
  const handleProfileImageClick = () => {
    setShowImageModal(true);
  };

  // 모달 닫기 함수
  const handleCloseImageModal = () => {
    setShowImageModal(false);
  };

  // 채팅 초기화 모달 열기
  const handleOpenResetChatModal = () => {
    if (isWaitingForAI) return;
    setShowResetChatModal(true);
  };

  // 채팅 초기화 모달 닫기
  const handleCloseResetChatModal = () => {
    setShowResetChatModal(false);
  };

  // 채팅 초기화 확인
  const handleConfirmResetChat = async () => {
    const responseData = await chatApi.InitChat(Number(chrBotChatKey), currentModeId, userIsAdult);
    console.log('💬 채팅 초기화 응답:', responseData.data);

    if (responseData?.data?.result?.err === 0) {
      await clearChatHistory();
      setIsMoreSidebarOpen(false);
      updatePromptKey(responseData.data.prompt_key);

      // 캐릭터의 첫 대화 메시지 추가
      if (first_talk) {
        addChatMessage({
          id: 'first-message',
          sender: 'character',
          message: first_talk,
          timestamp: new Date(),
        });
      }

      // 채팅 초기화 성공
      handleCloseResetChatModal();
      setIsMoreSidebarOpen(false);
    } else {
      // 채팅 초기화 실패
      console.error('채팅 초기화 실패:', responseData.data.result.msg);
      handleCloseResetChatModal();
    }
  };

  const handleOnClickCharacter = () => {
    setSelectedCharacter(character as Character);
    openModal('character');
  };

  const handleOnClickShop = () => {
    router.push('/shop-recharge');
  };

  const handleOpenGallery = () => {
    setSelectedCharacter(character as Character);
    openModal('charactorgallery');
  };

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand'></div>
      </div>
    );
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center p-4'>
        <div className='bg-danger/10 border border-danger/30 rounded-lg p-4 mb-4 text-danger'>
          <p>{error}</p>
        </div>

        <div className='flex gap-2'>
          <BaseButton color='primary' onClick={() => router.refresh()}>
            다시 시도
          </BaseButton>

          <BaseButton color='primary' onClick={() => router.push('/')}>
            첫 화면으로
          </BaseButton>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand'></div>
      </div>
    );
  }

  // 나머지 UI 부분은 이전과 동일하게 유지
  return (
    <div className='flex flex-col h-screen max-h-screen w-full bg-surface'>
      {/* 상단 헤더 */}
      <header className='bg-surface-elevated shadow-sm px-5 py-3 flex items-center justify-between border-b border-border-default z-10'>
        {/* 왼쪽 그룹: 뒤로가기 + 캐릭터 프로필 */}
        <div className='flex items-center min-w-0'>
          {/* 1: 뒤로가기 버튼 */}
          <button
            onClick={async () => {
              try {
                // await cleanupChatRoom()
                // 채팅 목록 페이지로 이동
                router.push('/chat-list');
              } catch (error) {
                console.error('채팅방 나가기 프로세스 중 오류 발생:', error);
                // 에러가 발생해도 페이지 이동
                router.push('/chat-list');
              }
            }}
            className='mr-3'
            disabled={isLoading}
            aria-label='뒤로 가기'
          >
            <div className='w-9 h-9 rounded-full bg-surface-elevated-hover flex items-center justify-center transition-colors hover:bg-surface-elevated'>
              {isLoading ? (
                <div className='w-4 h-4 border-2 border-t-transparent border-text-muted rounded-full animate-spin'></div>
              ) : (
                <FontAwesomeIcon icon={faArrowLeft} className='text-text-muted' />
              )}
            </div>
          </button>

          {/* 캐릭터 프로필 */}
          <div className='flex items-center min-w-0 overflow-hidden'>
            {/* 캐릭터 프로필 이미지 - PC에서만 표시 */}
            <button onClick={handleOnClickCharacter} className='hidden md:block'>
              <div className='relative w-10 h-10 rounded-full overflow-hidden mr-3 border border-border-default flex-shrink-0 hover:opacity-90 transition-opacity shadow-sm'>
                <Image
                  src={showImage || '/images/character1.jpg'}
                  alt={character.name}
                  fill
                  className='object-cover'
                />
              </div>
            </button>

            <div className='min-w-0 overflow-hidden'>
              <div className='flex items-center'>
                {/* 캐릭터 이름 */}
                <h2 className='font-medium text-text-primary truncate max-w-[100px] md:max-w-[500px]'>
                  {character.name}
                </h2>
                {/* 프로필 상세 버튼 - PC에서만 표시 */}
                <div onClick={handleOnClickCharacter}>
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    size='sm'
                    className='ml-1 text-brand hover:text-brand-hover flex-shrink-0'
                  />
                </div>
              </div>

              {/* 해시태그 - PC에서만 표시 */}
              <div className='hidden md:flex flex-wrap gap-1 mt-0.5 overflow-hidden'>
                {character.hashtags?.slice(0, 2).map((tag: string, index: number) => (
                  <span key={index} className='text-xs text-text-muted truncate'>
                    #{tag}
                  </span>
                )) || (
                  <>
                    <span className='text-xs text-text-muted'>#태그</span>
                    <span className='text-xs text-text-muted'>#태그</span>
                  </>
                )}
                {character.hashtags && character.hashtags.length > 2 && (
                  <span className='text-xs text-text-muted'>+{character.hashtags.length - 2}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 헤더 우측 아이콘들 */}
        <div className='flex items-center gap-2'>
          {/* 짜릿모드 버튼 - PC에서만 표시 */}
          <BaseButton
            id='chat-mode-button'
            color='gradient'
            size='sm'
            onClick={() =>
              openModal('chatMode', {
                currentModeId: currentModeId,
                nsfw: chatBotData?.nsfw,
                onSelectMode: handleModeSelect,
              })
            }
            className='flex items-center hidden md:flex'
          >
            <FontAwesomeIcon icon={getModeIcon(currentModeId)} className='mr-1.5' />
            <span className='text-sm font-medium'>{getChatModeName(currentModeId)}</span>
            <FontAwesomeIcon icon={faCaretDown} className='text-xs ml-1.5' />
          </BaseButton>

          {/* 무료 재화 (펜) */}
          <div className='flex items-center'>
            <button
              onClick={handleOnClickShop}
              className='w-6 h-6 md:w-10 md:h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600'
            >
              <Gift className='text-sm md:text-base w-4 h-4 md:w-6 md:h-6' />
            </button>
            <span className='ml-1 text-sm font-semibold text-text-primary'>
              {Number(accountData?.coin_free || 0) + Number(accountData?.coin_register || 0) || 0}
            </span>
          </div>

          {/* 유료 재화 (펜) */}
          <div className='flex items-center'>
            <button
              onClick={handleOnClickShop}
              className='w-6 h-6 md:w-10 md:h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand'
            >
              <Image
                src='/images/pen/pen_primary.svg'
                alt='pen'
                width={16}
                height={16}
                className='w-3 h-3 md:w-5 md:h-5'
              />
            </button>
            <span className='ml-1 text-sm md:text-base font-semibold text-text-primary'>
              {accountData?.coin_user || 0}
            </span>
          </div>

          {/* 더보기 버튼 - 모바일에서만 표시 */}
          <button
            id='more-button'
            className='md:hidden w-2 h-8 rounded-full flex items-center justify-center text-text-muted hover:bg-surface-elevated-hover transition-colors'
            onClick={() => setIsMoreSidebarOpen(true)}
          >
            <FontAwesomeIcon icon={faEllipsisV} />
          </button>

          {/* 채팅 새로고침 버튼 */}
          <div
            className='hidden md:flex w-9 h-9 rounded-full bg-brand/10 items-center justify-center text-brand cursor-pointer hover:bg-brand/20 transition-colors'
            onClick={handleOpenResetChatModal}
          >
            <FontAwesomeIcon icon={faSync} />
          </div>

          {/* 채팅방 삭제 버튼 */}
          <div
            className='hidden md:flex w-9 h-9 rounded-full bg-danger/10 items-center justify-center text-danger cursor-pointer hover:bg-danger/20 transition-colors'
            onClick={() => {
              openModal('confirmAction', {
                title: '채팅 삭제',
                description: '삭제된 채팅 내용은 복구할 수 없습니다. 그래도 삭제하시겠습니까?',
                onConfirm: handleDeleteChat,
                confirmText: '삭제',
                confirmButtonClass: 'bg-danger hover:bg-danger/90 text-text-inverse',
              });
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
        title='더보기'
        side='right'
        width='100%'
      >
        <div className='p-4'>
          {/* 채팅 모드 선택 */}
          <div className='mb-6'>
            <h3 className='text-lg font-semibold mb-4 text-text-primary'>채팅 모드 선택</h3>
            <div className='space-y-3'>
              {chatMode.map((mode, index) => {
                if (chatBotData?.nsfw !== 1) {
                  if (mode.chat_mode === 3 || mode.chat_mode === 4) return null;
                }
                const chatMode = bridgeChatModeDataToChatMode(mode, customChatModes[index]);
                if (!chatMode.isShow) return null;
                return (
                  <div
                    key={chatMode.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      currentModeId === chatMode.id
                        ? 'border-brand bg-brand/10'
                        : 'border-border-default hover:bg-surface-elevated-hover'
                    }`}
                    onClick={() => {
                      handleModeSelect(chatMode);
                      setIsMoreSidebarOpen(false);
                    }}
                  >
                    <div className='flex justify-between items-center sm:flex-row sm:items-center sm:justify-between gap-2'>
                      <div className='flex items-center'>
                        <FontAwesomeIcon
                          icon={chatMode.icon}
                          className={`mr-3 ${currentModeId === chatMode.id ? 'text-brand' : 'text-text-muted'}`}
                        />
                        <div>
                          <h4
                            className={`font-medium ${currentModeId === chatMode.id ? 'text-brand' : 'text-text-primary'}`}
                          >
                            {chatMode.name}
                          </h4>
                          <p className='text-sm text-text-muted'>{chatMode.description}</p>
                        </div>
                      </div>
                      <div className='flex items-center bg-brand/10 px-3 py-1 rounded-full self-start sm:self-auto'>
                        <div className='flex text-brand font-medium text-sm whitespace-nowrap'>
                          <Image
                            src='/images/pen/pen_primary.svg'
                            alt='pen'
                            width={11}
                            height={11}
                            className='mr-1'
                          />
                          <span>{chatMode.penCost}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 배경 이미지 토글 */}
          <div className='mb-6'>
            <h3 className='text-lg font-semibold mb-4 text-text-primary'>배경 설정</h3>
            <div className='flex items-center justify-between p-4 rounded-lg border border-border-default'>
              <div className='flex items-center'>
                <FontAwesomeIcon icon={faImage} className='mr-3 text-text-muted' />
                <div>
                  <h4 className='font-medium text-text-primary'>배경 이미지</h4>
                  <p className='text-sm text-text-muted'>채팅창 배경에 캐릭터 이미지 표시</p>
                </div>
              </div>
              <button
                onClick={() => setIsBackgroundEnabled(!isBackgroundEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isBackgroundEnabled ? 'bg-brand' : 'bg-surface-elevated-hover'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-surface transition-transform ${
                    isBackgroundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className='mb-6'>
            <h3 className='text-lg font-semibold mb-4 text-text-primary'>채팅 초기화</h3>
            <div
              onClick={handleOpenResetChatModal}
              className='flex items-center justify-between p-4 rounded-lg border border-border-default hover:bg-surface-elevated-hover transition-colors cursor-pointer'
            >
              <div className='flex items-center'>
                <FontAwesomeIcon icon={faSync} className='mr-3 text-text-muted' />
                <div>
                  <h4 className='font-medium text-text-primary'>채팅 내용 초기화</h4>
                </div>
              </div>
            </div>
          </div>

          {/* 채팅방 나가기 */}
          <div className='border-t border-border-default pt-4'>
            <button
              className='w-full py-3 px-4 bg-danger/10 text-danger rounded-lg hover:bg-danger/20 transition-colors flex items-center justify-center'
              onClick={() => {
                openModal('confirmAction', {
                  title: '채팅 삭제',
                  description: '삭제된 채팅 내용은 복구할 수 없습니다. 그래도 삭제하시겠습니까?',
                  onConfirm: () => {
                    handleDeleteChat();
                    setIsMoreSidebarOpen(false);
                  },
                  confirmText: '삭제',
                  confirmButtonClass: 'bg-danger hover:bg-danger/90 text-text-inverse',
                });
              }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className='w-4 h-4 border-2 border-t-transparent border-danger rounded-full animate-spin mr-2'></div>
                  처리 중...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSignOutAlt} className='mr-2' />
                  채팅방 나가기
                </>
              )}
            </button>
          </div>
        </div>
      </BaseSidebar>

      {/* 메인 채팅 영역 */}
      <main className='flex flex-1 overflow-hidden'>
        {/* 왼쪽 캐릭터 이미지 영역 - 최대 너비 600px로 제한 */}
        <div
          className='relative hidden md:block'
          style={{ maxWidth: '600px', width: '40%', flexShrink: 0 }}
        >
          {/* 그라데이션 오버레이 */}
          <div className='absolute inset-0 bg-gradient-to-br from-brand/20 to-transparent z-10 pointer-events-none'></div>

          {/* 이미지 컨테이너 */}
          <div className='relative h-full w-full group'>
            {/* <Image
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
            /> */}

            {/* 호감도 레벨 버튼 */}
            <div className='absolute top-2 left-2 flex items-center justify-center z-30'>
              <div className='flex flex-col items-center justify-center bg-overlay/50 rounded-lg px-3 py-1'>
                <FontAwesomeIcon
                  icon={faHeart}
                  className='text-text-inverse text-sm rounded-full bg-pink-500 p-1'
                />
                <span className='text-text-inverse text-sm font-bold'>
                  Lv.{selectedLikeability_lv || 0}
                </span>
              </div>

              <div className='flex flex-col items-center justify-center bg-overlay/50 py-2.5'></div>
            </div>

            {/* 갤러리 버튼 */}
            <div className='absolute top-2 right-2 flex items-center justify-center gap-4 z-30 bg-overlay/50 rounded-lg'>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleOpenGallery();
                }}
                className='text-text-inverse text-xs px-2 py-1 rounded-full'
              >
                <div className='flex flex-col items-center justify-center gap-2'>
                  <FontAwesomeIcon icon={faImage} className='text-[14px] md:text-[20px]' />
                  <span className='text-[14px] md:text-[14px] tracking-tight'>
                    {openImageCount}/{multiImages?.length || 0}
                  </span>
                </div>
              </button>
            </div>

            {/* 이미지 저장 버튼 - 호버 시에만 표시 */}
            <div
              className='absolute bottom-16 right-4 bg-overlay/70 rounded-full p-3 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity z-30'
              onClick={(e) => {
                e.stopPropagation();
                handleSaveImage();
              }}
              title='이미지 저장하기'
            >
              <FontAwesomeIcon icon={faDownload} className='text-text-inverse text-lg' />
            </div>
          </div>

          {/* 하단 그라데이션 오버레이 */}
          <div className='absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-overlay/50 to-transparent z-10 pointer-events-none'></div>

          {/* 캐릭터 이름 */}
          <div className='absolute bottom-0 left-0 right-0 p-4 z-20'>
            <h2 className='text-xl md:text-2xl lg:text-3xl font-bold text-text-inverse drop-shadow-md text-center'>
              {character.name}
            </h2>
          </div>
        </div>

        {/* 오른쪽 채팅 영역 - 남은 공간 모두 차지 */}
        <div
          className='flex-1 flex flex-col bg-gradient-to-b from-surface to-surface-elevated'
          style={{
            minWidth: 0,
            backgroundImage:
              isMobile && isBackgroundEnabled
                ? `url(${showImage || '/images/character1.jpg'})`
                : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* 상단 버튼 */}
          <div className='relative'>
            {/* 모바일 전용 갤러리 버튼 */}
            {isMobile && (
              <div className='absolute top-2 right-2 flex items-center justify-center gap-4 z-30 border border-border-default bg-overlay/50 rounded-lg'>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleOpenGallery();
                  }}
                  className='text-text-inverse text-xs px-2 py-1 rounded-full'
                >
                  <div className='flex flex-col items-center justify-center gap-2'>
                    <FontAwesomeIcon icon={faImage} className='text-[20px]' />
                    <span className='text-[12px] tracking-tight'>
                      {openImageCount}/{multiImages?.length || 0}
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* 연결 상태 표시 */}
          {!isConnected && !isConnecting && (
            <div className='bg-danger/10 p-3 border-b border-danger/20 flex flex-col items-center md:flex-row md:justify-between gap-2'>
              <div className='flex items-center text-center md:text-left'>
                <div className='w-2 h-2 rounded-full bg-danger mr-2 animate-pulse flex-shrink-0'></div>
                <p className='text-danger text-sm'>
                  서버 연결이 끊어졌습니다. 메시지를 보낼 수 없습니다.
                  {error && <span className='ml-1 md:ml-2 font-medium'>({error})</span>}
                </p>
              </div>
              <button
                onClick={() => router.refresh()}
                className='w-full md:w-auto px-3 py-1.5 md:py-1 bg-danger/20 text-danger hover:bg-danger/30 rounded text-xs font-medium transition-colors flex items-center justify-center flex-shrink-0'
                aria-label='새로고침'
              >
                <FontAwesomeIcon icon={faSync} className='mr-1.5' />
                새로고침
              </button>
            </div>
          )}

          {isConnecting && (
            <div className='bg-yellow-50 p-3 border-b border-yellow-100 flex items-center'>
              <div className='w-2 h-2 rounded-full bg-yellow-500 mr-2 animate-pulse'></div>
              <p className='text-yellow-700 text-sm flex items-center'>
                서버에 연결 중입니다. 잠시만 기다려주세요...
                <span className='ml-2 bg-yellow-100 px-2 py-0.5 rounded-full text-xs'>
                  채팅 초기화 중
                </span>
              </p>
            </div>
          )}

          {showConnectedStatus && (
            <div className='bg-green-50 p-2.5 border-b border-green-100 flex items-center justify-between'>
              <div className='flex items-center'>
                <div className='w-2 h-2 rounded-full bg-green-500 mr-2'></div>
                <p className='text-green-700 text-sm'>
                  서버에 연결됨
                  {isInitRoom ? (
                    <span className='ml-2 bg-green-100 px-2 py-0.5 rounded-full text-xs'>
                      채팅방 초기화 완료
                    </span>
                  ) : (
                    <span className='ml-2 bg-yellow-100 px-2 py-0.5 rounded-full text-xs'>
                      채팅방 초기화 필요
                    </span>
                  )}
                </p>
              </div>
              {channelId && (
                <div className='flex items-center'>
                  <p className='text-xs text-green-600'>채널: {channelId.substring(0, 8)}...</p>
                  {chrBotChatKey && (
                    <span className='ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded'>
                      Chat ID: {chrBotChatKey}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 채팅 내용 */}

          <div ref={chatContainerRef} className='flex-1 overflow-y-auto p-4 md:p-6'>
            <div ref={chatBoxRef} className='flex flex-col space-y-12 max-w-3xl mx-auto'>
              {chatMessages.length === 0 ? (
                <div className='text-center text-text-muted py-10'>
                  <p>메시지가 없습니다. 채팅을 시작해보세요!</p>
                </div>
              ) : (
                getLimitedVisibleMessages().map((chat, index) => {
                  // 실제 인덱스 계산 (전체 메시지 배열 내에서의 위치)
                  const actualIndex = chatMessages.findIndex((msg) => msg.id === chat.id);
                  const isLastAiMessage =
                    chatMessages.length - 1 === actualIndex && chat.sender === 'character';
                  const isLastMessage = actualIndex === chatMessages.length - 1;

                  return (
                    <div
                      key={chat.id}
                      className={`flex flex-col ${chat.sender === 'user' ? 'items-end' : 'items-start'} ${isLastMessage ? 'pb-4' : ''}`}
                    >
                      {chat.sender === 'character' && (
                        <div
                          className='relative w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0 shadow-sm border border-border-default cursor-pointer md:cursor-default'
                          onClick={() => handleProfileImageClick()}
                        >
                          <Image
                            src={showImage || '/images/character1.jpg'}
                            alt={character.name}
                            fill
                            className='object-cover'
                          />
                        </div>
                      )}

                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className={`inline-block max-w-[85%] rounded-2xl px-4 py-3 sm:px-5 sm:py-4 shadow-sm ${
                          chat.sender === 'user'
                            ? 'bg-brand text-text-inverse font-medium rounded-tr-none'
                            : 'bg-surface-elevated text-text-primary border border-border-default rounded-tl-none'
                        }`}
                        style={{ wordBreak: 'break-word', overflow: 'hidden' }}
                      >
                        <p className='text-sm sm:text-base whitespace-pre-wrap leading-relaxed break-words'>
                          {formatMessageWithSituations(chat.message)}
                        </p>
                        <p
                          className={`text-xs mt-2 text-right ${chat.sender === 'user' ? 'text-text-inverse/80' : 'text-text-muted'}`}
                        >
                          {formatTime(chat.timestamp)}
                        </p>
                      </motion.div>

                      {chat.sender === 'character' && chat.id !== 'first-message' && (
                        <div className='flex ml-2 items-center justify-start max-w-[85%] mt-2'>
                          {/* 마지막 AI 메시지인 경우 새로고침/삭제 버튼 표시 */}
                          {isLastAiMessage && (
                            <button
                              onClick={handleRefreshLastAIMessage}
                              disabled={isWaitingForAI}
                              className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand/10 flex items-center justify-center text-brand hover:text-brand-hover hover:bg-brand/20 transition-colors mr-1.5 shadow-sm'
                              title='응답 새로고침'
                            >
                              <FontAwesomeIcon icon={faSync} className='text-sm sm:text-base' />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteLastAIMessage(chat)}
                            disabled={isWaitingForAI}
                            className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-danger/10 flex items-center justify-center text-danger hover:text-danger/90 hover:bg-danger/20 transition-colors shadow-sm'
                            title='응답 삭제'
                          >
                            <FontAwesomeIcon icon={faTrashAlt} className='text-sm sm:text-base' />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 메시지 입력 */}
          <div className='bg-surface-elevated p-4 border-t border-border-default shadow-sm'>
            <form onSubmit={handleSendMessage} className='flex items-center max-w-3xl mx-auto'>
              {/* 상황 설명 버튼 (별표 아이콘) */}
              <button
                id='message-input'
                type='button'
                onClick={(e) => {
                  setMessage((prevMessage) => prevMessage + '*');
                  document.getElementById('chat-input')?.focus();
                }}
                className='w-12 h-12 flex items-center justify-center rounded-full transition-colors bg-surface-elevated-hover text-text-muted hover:bg-surface-elevated mr-2'
                disabled={isWaitingForAI}
              >
                <FontAwesomeIcon icon={faAsterisk} className='text-base' />
              </button>

              <div className='flex-1 relative'>
                <input
                  id='chat-input'
                  type='text'
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    isWaitingForAI
                      ? 'AI가 응답 중입니다. 잠시만 기다려주세요...'
                      : '대화를 입력하세요. (예: 안녕! 뭐해?)'
                  }
                  className={`w-full h-12 px-4 text-sm sm:text-base bg-surface-elevated-hover text-text-primary rounded-l-xl border-0 focus:outline-none focus:ring-0 ${
                    isWaitingForAI
                      ? 'bg-surface-elevated-hover text-text-muted'
                      : 'hover:bg-surface-elevated-hover/80'
                  } transition-all placeholder:text-sm placeholder:text-text-muted`}
                  disabled={isWaitingForAI}
                />
                {isWaitingForAI && (
                  <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                    <div className='flex items-center space-x-1'>
                      <div
                        className='w-1.5 h-1.5 bg-brand rounded-full animate-bounce'
                        style={{ animationDelay: '0ms' }}
                      ></div>
                      <div
                        className='w-1.5 h-1.5 bg-brand rounded-full animate-bounce'
                        style={{ animationDelay: '150ms' }}
                      ></div>
                      <div
                        className='w-1.5 h-1.5 bg-brand rounded-full animate-bounce'
                        style={{ animationDelay: '300ms' }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* 전송 버튼 - BaseButton으로 변경 */}
              <BaseButton
                type='submit'
                color={message.trim() && !isWaitingForAI ? 'gradient' : 'secondary'}
                disabled={!message.trim() || isWaitingForAI}
                className='rounded-l-none rounded-r-xl h-12 px-4 flex items-center justify-center'
              >
                <FontAwesomeIcon icon={faPaperPlane} className='text-base' />
              </BaseButton>
            </form>
          </div>
        </div>
      </main>

      {/* 모바일용 이미지 모달을 추가합니다 (return 문 끝에 추가) */}
      {showImageModal && (
        <div className='fixed inset-0 bg-overlay/80 z-50 flex flex-col items-center justify-center p-4'>
          <div className='relative w-full max-w-md mx-auto'>
            {/* 닫기 버튼 */}
            <button
              className='absolute top-0 right-0 z-10 bg-overlay/50 rounded-full p-2 text-text-inverse transform translate-x-3 -translate-y-3'
              onClick={handleCloseImageModal}
            >
              <FontAwesomeIcon icon={faArrowLeft} className='text-lg' />
            </button>

            {/* 이미지 */}
            <div className='relative w-full aspect-[3/4] rounded-lg overflow-hidden'>
              <Image
                src={showImage || '/images/character1.jpg'}
                alt={character.name}
                fill
                className='object-cover'
                priority
              />
            </div>

            {/* 이미지 정보 및 다운로드 버튼 */}
            <div className='bg-overlay/50 backdrop-blur-sm text-text-inverse p-4 rounded-b-lg'>
              <h3 className='font-bold text-lg mb-1'>{character.name}</h3>
              <div className='flex items-center justify-between'>
                <div className='flex flex-wrap gap-1'>
                  {character.hashtags?.slice(0, 2).map((tag: string, index: number) => (
                    <span key={index} className='text-xs text-text-inverse/70'>
                      #{tag}
                    </span>
                  ))}
                </div>
                <button
                  className='bg-brand hover:bg-brand-hover text-text-inverse py-2 px-4 rounded-full flex items-center text-sm'
                  onClick={() => {
                    handleSaveImage();
                    handleCloseImageModal();
                  }}
                >
                  <FontAwesomeIcon icon={faDownload} className='mr-2' />
                  저장하기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 튜토리얼 컴포넌트 */}
      <Tutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        config={tutorialConfig}
      />

      {/* 채팅 초기화 모달 */}
      <ResetChatModal
        isOpen={showResetChatModal}
        onClose={handleCloseResetChatModal}
        onConfirm={handleConfirmResetChat}
      />

      {isBigImageModalOpen && (
        <BigImageModal
          isOpen={isBigImageModalOpen}
          imgUrl={bigImageUrl}
          onClose={() => setIsBigImageModalOpen(false)}
        />
      )}

      <UnlockActionModal
        isOpen={imgUnlockAction}
        imgUrl={rewardImgUrl}
        onClose={() => setImgUnlockAction(false)}
        onAnimationEnd={() => {
          // background image 변경
          chageBackgroundImage(selectedMultiImageData.img_selected_key || 0);
        }}
      />
    </div>
  );
}
