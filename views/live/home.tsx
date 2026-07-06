'use client';

import { faArrowLeft, faFlag, faPaperPlane, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import ReportModal from '@/components/modal/ReportModal';
import PageTransition from '@/components/motion/PageTransition';
import { useModalStore } from '@/store/useStoreModal';

// 임시 유저 데이터
const currentUser = {
  id: 'user1',
  name: '현재 사용자',
  profileImage: '/images/avatar1.jpg',
};

// 임시 채팅 메시지 데이터
const initialChatMessages = [
  {
    id: 'm1',
    userId: 'user2',
    userName: '김철수',
    userProfile: '/images/avatar2.jpg',
    message: '안녕하세요! 오늘 주제는 무엇인가요?',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15분 전
  },
  {
    id: 'm2',
    userId: 'user3',
    userName: '이영희',
    userProfile: '/images/avatar3.jpg',
    message: '저도 궁금합니다. 아직 정해진 주제가 없나요?',
    timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10분 전
  },
  {
    id: 'm3',
    userId: 'user1', // 현재 사용자
    userName: '현재 사용자',
    userProfile: '/images/avatar1.jpg',
    message:
      '오늘 주제는 자유롭게 대화하는 날입니다. 모두 자신의 주말 계획에 대해 이야기해보면 어떨까요?',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5분 전
  },
  {
    id: 'm4',
    userId: 'user4',
    userName: '박민수',
    userProfile: '/images/avatar4.jpg',
    message:
      '좋은 아이디어네요! 저는 이번 주말에 가족들과 함께 캠핑을 갈 예정입니다. 날씨가 좋을 것 같아서 기대되네요.',
    timestamp: new Date(Date.now() - 1000 * 60 * 3), // 3분 전
  },
  {
    id: 'm5',
    userId: 'user5',
    userName: '최지은',
    userProfile: '/images/avatar5.jpg',
    message:
      '캠핑 재밌겠네요! 저는 집에서 새로 나온 넷플릭스 시리즈를 볼 계획이에요. 추천해주실 만한 시리즈가 있을까요?',
    timestamp: new Date(Date.now() - 1000 * 60 * 1), // 1분 전
  },
];

export default function LiveChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState(initialChatMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportedUser, setReportedUser] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { openModal } = useModalStore();
  const [isMobile, setIsMobile] = useState(false);

  // 화면 크기 감지하여 모바일/PC 모드 설정
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // 초기 실행
    handleResize();

    // 리사이즈 이벤트 리스너 추가
    window.addEventListener('resize', handleResize);

    // 클린업
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 메시지 스크롤을 항상 맨 아래로
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 메시지 전송 처리
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const newMsg = {
      id: `m${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userProfile: currentUser.profileImage,
      message: newMessage.trim(),
      timestamp: new Date(),
    };

    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  // 신고 버튼 클릭 처리
  const handleReportUser = (userName: string) => {
    setReportedUser(userName);
    setIsReportModalOpen(true);
    setSubmitted(false);
  };

  // 신고 제출 처리
  const handleSubmitReport = (reason: string, description: string) => {
    if (!reason) return;

    // 여기에 신고 제출 로직 추가
    console.log('신고 제출:', { reportedUser, reason, description });
    setSubmitted(true);

    // 3초 후 모달 닫기
    setTimeout(() => {
      setSubmitted(false);
      setIsReportModalOpen(false);
    }, 3000);
  };

  // 메시지 시간 포맷
  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();

    // 하루 이내
    if (diff < 24 * 60 * 60 * 1000) {
      return timestamp.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    }

    // 하루 이상
    return timestamp.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <div className='w-full max-w-[1300px] mx-auto flex flex-col h-screen bg-surface-sunken'>
        {/* 1. 헤더: 상단 고정 */}
        <div className='fixed top-0 left-0 right-0 bg-surface-elevated shadow-sm z-20'>
          <div className='mx-auto max-w-[1300px] px-4 py-3 flex items-center border-b border-border-default'>
            <button
              onClick={() => router.back()}
              className='mr-3 w-9 h-9 rounded-full bg-surface-elevated-hover flex items-center justify-center transition-colors hover:bg-surface-elevated'
            >
              <FontAwesomeIcon icon={faArrowLeft} className='text-text-muted' />
            </button>
            <h1 className='text-xl font-bold text-text-primary'>라이브 채팅</h1>
          </div>
        </div>

        {/* 2. 채팅 콘텐츠 영역: 스크롤 가능, 헤더와 입력창 사이의 공간 */}
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'pb-36 pt-6' : 'pb-28 pt-16'}`}>
          <div className='px-4 pb-4'>
            <div className='bg-surface-elevated rounded-lg border-2 border-border-default shadow-lg p-4 mb-4'>
              <p className='text-center text-sm text-text-muted'>
                라이브 채팅방에 오신 것을 환영합니다. 예의를 지켜주세요.
              </p>
            </div>

            {/* 메시지가 없을 경우 빈 공간 채우기 */}
            {messages.length === 0 && (
              <div className='flex items-center justify-center h-64'>
                <p className='text-text-muted'>아직 메시지가 없습니다.</p>
              </div>
            )}

            {/* 채팅 메시지 목록 */}
            <div className='space-y-4 mb-6'>
              {messages.map((msg) => {
                const isCurrentUser = msg.userId === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} group`}
                  >
                    {!isCurrentUser && (
                      <div className='relative w-8 h-8 rounded-full overflow-hidden mr-2'>
                        <Image
                          src={msg.userProfile}
                          alt={msg.userName}
                          fill
                          className='object-cover'
                        />
                      </div>
                    )}

                    <div className={`max-w-[80%] relative`}>
                      {!isCurrentUser && (
                        <div className='text-sm font-medium text-text-muted mb-1'>
                          {msg.userName}
                        </div>
                      )}
                      <div className='flex items-end gap-2'>
                        <div className='relative'>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`rounded-2xl px-4 py-3 shadow-md ${
                              isCurrentUser
                                ? 'bg-brand text-text-inverse rounded-tr-none border border-brand-hover'
                                : 'bg-surface-elevated text-text-primary rounded-tl-none border border-border-default'
                            }`}
                          >
                            <p className='text-sm whitespace-pre-wrap break-words'>{msg.message}</p>
                            <div className='flex justify-end items-center mt-1'>
                              <p
                                className={`text-xs ${
                                  isCurrentUser ? 'text-text-inverse/70' : 'text-text-muted'
                                }`}
                              >
                                {formatTime(msg.timestamp)}
                              </p>
                            </div>
                          </motion.div>
                        </div>
                        {!isCurrentUser && (
                          <button
                            onClick={() => handleReportUser(msg.userName)}
                            className='text-danger opacity-0 group-hover:opacity-100 transition-opacity'
                            aria-label={`${msg.userName} 신고하기`}
                          >
                            <FontAwesomeIcon icon={faFlag} className='h-3 w-3' />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* 3. 메시지 입력 영역: 하단 고정 */}
        <div
          className={`fixed ${isMobile ? 'bottom-16' : 'bottom-0'} left-0 right-0 bg-surface-elevated shadow-lg border-t border-border-default z-20`}
        >
          <div className='mx-auto max-w-[1300px] px-4 py-3'>
            <div className='flex items-center bg-surface-elevated-hover rounded-lg px-4 py-2 border border-border-default'>
              <div className='flex-1'>
                <textarea
                  value={newMessage}
                  onChange={(e) => {
                    // 최대 400자 제한
                    if (e.target.value.length <= 400) {
                      setNewMessage(e.target.value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder='메시지를 입력하세요 (최대 400자)'
                  className='w-full border-0 bg-transparent outline-none text-text-primary resize-none py-1 h-[40px] max-h-[40px] overflow-y-auto'
                  rows={1}
                />
                <div className='text-xs text-right text-text-muted'>{newMessage.length}/400</div>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className={`ml-2 p-2 rounded-full ${
                  newMessage.trim()
                    ? 'bg-brand text-text-inverse'
                    : 'bg-surface-elevated-hover text-text-muted cursor-not-allowed'
                }`}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 신고 모달 */}
      {/* <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmit={handleSubmitReport}
        submitted={submitted}
        reportType="writer"
      /> */}
    </>
  );
}
