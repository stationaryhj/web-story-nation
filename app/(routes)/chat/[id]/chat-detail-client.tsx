'use client';

import type { Character } from '@/store/useStoreData';
import { useStoreData } from '@/store/useStoreData';
import {
  faPaperPlane,
  faArrowLeft,
  faHeart,
  faShare,
  faDownload,
  faEllipsisVertical,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import type { FormEvent } from 'react';
import { useEffect, useState } from 'react';

interface ChatDetailClientProps {
  characterId: string;
}

export default function ChatDetailClient({ characterId }: ChatDetailClientProps) {
  const { characters } = useStoreData();
  const [ character, setCharacter ] = useState<Character | null>(null);
  const [ message, setMessage ] = useState('');
  const [ chatHistory, setChatHistory ] = useState<
    Array<{
      id: string;
      sender: 'user' | 'character';
      message: string;
      timestamp: Date;
    }>
  >([]);

  // 캐릭터 정보 로드
  useEffect(() => {
    if (characters.length > 0) {
      const foundCharacter = characters.find(char => char.id === characterId);
      if (foundCharacter) {
        setCharacter(foundCharacter);

        // 초기 메시지 설정 - 더 많은 대화 데이터 추가
        setChatHistory([
          {
            id: '1',
            sender: 'character',
            message: `안녕하세요! 저는 ${ foundCharacter.name }입니다. 당신과 대화하게 되어 기쁩니다. 어떤 이야기를 나누고 싶으신가요?`,
            timestamp: new Date(Date.now() - 3600000),
          },
          {
            id: '2',
            sender: 'user',
            message: '안녕하세요! 저는 당신이 어떤 캐릭터인지 궁금해요.',
            timestamp: new Date(Date.now() - 3500000),
          },
          {
            id: '3',
            sender: 'character',
            message: `저는 ${ foundCharacter.name }입니다. ${ foundCharacter.description || '다양한 주제에 대해 이야기할 수 있어요. 특히 제가 관심있는 분야에 대해 대화하는 것을 좋아합니다.' }`,
            timestamp: new Date(Date.now() - 3400000),
          },
          {
            id: '4',
            sender: 'user',
            message: '오늘 날씨가 정말 좋네요. 당신은 어떤 날씨를 좋아하나요?',
            timestamp: new Date(Date.now() - 3300000),
          },
          {
            id: '5',
            sender: 'character',
            message:
              '저는 비가 내리는 날을 좋아해요. 창문에 떨어지는 빗방울 소리를 들으며 책을 읽거나 음악을 듣는 것이 저의 취미입니다. 당신은 어떤 날씨를 좋아하시나요?',
            timestamp: new Date(Date.now() - 3200000),
          },
        ]);
      }
    }
  }, [ characterId, characters ]);

  // 메시지 전송 처리
  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !character) return;

    // 사용자 메시지 추가
    const userMessage = {
      id: Date.now().toString(),
      sender: 'user' as const,
      message: message.trim(),
      timestamp: new Date(),
    };

    setChatHistory(prev => [ ...prev, userMessage ]);
    setMessage('');

    // 캐릭터 응답 시뮬레이션 (실제로는 API 호출 등으로 대체)
    setTimeout(() => {
      const characterResponse = {
        id: (Date.now() + 1).toString(),
        sender: 'character' as const,
        message: `${ message.trim() }에 대한 ${ character.name }의 응답입니다. 이것은 데모용 응답입니다.`,
        timestamp: new Date(),
      };

      setChatHistory(prev => [ ...prev, characterResponse ]);
    }, 1000);
  };

  // 날짜 포맷팅 함수
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!character) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-grow container mx-auto">
      <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
        { /* 왼쪽 이미지 영역 (모바일에서는 상단에 표시) */ }
        <div className="md:w-4/10 relative h-[40vh] md:h-full order-1 md:order-1">
          <div className="absolute inset-0">
            <Image
              src={ character.imageUrl || '/images/character1.jpg' }
              alt={ character.name }
              fill
              className="object-cover object-center"
              priority
            />

            { /* 이미지 상단 네비게이션 */ }
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
              <Link href="/chat-list" className="text-white bg-black/30 p-2 rounded-full backdrop-blur-sm">
                <FontAwesomeIcon icon={ faArrowLeft }/>
              </Link>
              <div className="text-white bg-black/30 p-2 rounded-full backdrop-blur-sm">
                <FontAwesomeIcon icon={ faEllipsisVertical }/>
              </div>
            </div>

            { /* 이미지 하단 정보 */ }
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
              <h2 className="text-xl font-bold">{ character.name }</h2>
              <p className="text-sm text-white/80">{ character.isAdult ? '19+ 캐릭터' : '전체 이용가능' }</p>

              { /* 액션 버튼 */ }
              <div className="flex mt-3 space-x-4">
                <button className="text-white/90 hover:text-white">
                  <FontAwesomeIcon icon={ faHeart }/>
                </button>
                <button className="text-white/90 hover:text-white">
                  <FontAwesomeIcon icon={ faShare }/>
                </button>
                <button className="text-white/90 hover:text-white">
                  <FontAwesomeIcon icon={ faDownload }/>
                </button>
              </div>
            </div>
          </div>
        </div>

        { /* 오른쪽 채팅 영역 (모바일에서는 하단에 표시) */ }
        <div className="md:w-6/10 flex flex-col bg-white dark:bg-dark-background-DEFAULT order-2 md:order-2 h-full">
          { /* 채팅 헤더 */ }
          <div className="bg-white dark:bg-dark-background-light shadow-sm p-3 flex items-center">
            <div className="md:hidden mr-4 text-secondary-500 dark:text-dark-secondary-500">
              <FontAwesomeIcon icon={ faArrowLeft }/>
            </div>

            <div className="flex items-center">
              <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                <Image
                  src={ character.imageUrl || '/images/character1.jpg' }
                  alt={ character.name }
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="font-bold text-secondary-900 dark:text-dark-secondary-700">{ character.name }</h2>
                <p className="text-xs text-secondary-500 dark:text-dark-secondary-500">
                  { character.isAdult ? '19+ 캐릭터' : '전체 이용가능' }
                </p>
              </div>
            </div>
          </div>

          { /* 채팅 내용 */ }
          <div className="flex-grow overflow-y-auto p-4 bg-secondary-50 dark:bg-dark-background-light">
            <div className="space-y-4">
              { chatHistory.map(chat => (
                <motion.div
                  key={ chat.id }
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={ `flex ${ chat.sender === 'user' ? 'justify-end' : 'justify-start' }` }
                >
                  { chat.sender === 'character' && (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                      <Image
                        src={ character.imageUrl || '/images/character1.jpg' }
                        alt={ character.name }
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) }

                  <div
                    className={ `max-w-[70%] rounded-lg p-3 ${
                      chat.sender === 'user' ?
                        'bg-primary-500 dark:bg-dark-primary-600 text-white' :
                        'bg-white dark:bg-dark-background-light text-secondary-900 dark:text-dark-secondary-700'
                    }` }
                  >
                    <p className="text-sm">{ chat.message }</p>
                    <p
                      className={ `text-xs mt-1 ${
                        chat.sender === 'user' ?
                          'text-primary-100 dark:text-dark-primary-300' :
                          'text-secondary-500 dark:text-dark-secondary-500'
                      }` }
                    >
                      { formatTime(chat.timestamp) }
                    </p>
                  </div>
                </motion.div>
              )) }
            </div>
          </div>

          { /* 메시지 입력 */ }
          <div className="bg-white dark:bg-dark-background-light p-4 border-t border-secondary-100 dark:border-dark-secondary-200">
            <form onSubmit={ handleSendMessage } className="flex items-center">
              <input
                type="text"
                value={ message }
                onChange={ e => setMessage(e.target.value) }
                placeholder={ `${ character.name }에게 메시지 보내기...` }
                className="flex-1 py-3 px-4 bg-secondary-50 dark:bg-dark-secondary-100/10 text-secondary-900 dark:text-dark-secondary-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-dark-primary-500"
              />
              <button
                type="submit"
                className="py-3 px-4 bg-primary-500 hover:bg-primary-600 dark:bg-dark-primary-600 dark:hover:bg-dark-primary-700 text-white rounded-r-lg transition-colors"
              >
                <FontAwesomeIcon icon={ faPaperPlane }/>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
